import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'

const BCBS_TOKEN_URL = 'https://interop-preview.bluecrossmn.com/fhir/token'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/home?error=missing_params', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Verify CSRF state
  const { data: oauthState } = await supabase
    .from('bcbs_oauth_state')
    .select('state')
    .eq('user_id', user.id)
    .single()

  if (!oauthState || oauthState.state !== state) {
    return NextResponse.redirect(new URL('/home?error=invalid_state', request.url))
  }

  const credentials = Buffer.from(
    `${process.env.FHIR_BCBS_CLIENT_ID}:${process.env.FHIR_BCBS_CLIENT_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch(BCBS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: process.env.FHIR_BCBS_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    console.error('BCBS token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/home?error=token_exchange_failed', request.url))
  }

  const token = await tokenRes.json()

  const patientId: string = token.patient ?? ''

  if (!patientId) {
    console.error('BCBS: could not determine patient ID', token)
    return NextResponse.redirect(new URL('/home?error=no_patient_id', request.url))
  }

  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         'bcbs',
    access_token:  encryptToken(token.access_token),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token) : null,
    patient_id:    encryptToken(patientId),
    expires_at:    new Date(Date.now() + ((token.expires_in as number) ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    selected_insurer:    'BlueCross BlueShield MN',
  }, { onConflict: 'id' })

  await supabase.from('bcbs_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL('/home', request.url))
}
