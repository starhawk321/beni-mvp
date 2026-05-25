import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'

const BCBS_TOKEN_URL = 'https://interop-preview.bluecrossmn.com/fhir/token'

const PAYER = 'bcbs'

function errorUrl(request: NextRequest, reason: string, flow: string) {
  return new URL(`/onboarding/connection-error?reason=${reason}&payer=${PAYER}&flow=${flow}`, request.url)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: oauthState } = await supabase
    .from('bcbs_oauth_state')
    .select('state, flow_intent')
    .eq('user_id', user.id)
    .single()

  const flow = oauthState?.flow_intent ?? 'first'

  if (oauthError || !code || !state) {
    return NextResponse.redirect(errorUrl(request, 'cancelled', flow))
  }
  if (!oauthState || oauthState.state !== state) {
    return NextResponse.redirect(errorUrl(request, 'invalid_state', flow))
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
    console.error('BCBS token exchange failed:', { reason: 'token_exchange_failed', payer: PAYER, user_id: user.id, body: await tokenRes.text() })
    return NextResponse.redirect(errorUrl(request, 'token_exchange_failed', flow))
  }

  const token = await tokenRes.json()
  const patientId: string = token.patient ?? ''

  if (!token.access_token || !patientId) {
    console.error('BCBS missing fields:', { reason: 'missing_fields', payer: PAYER, user_id: user.id })
    return NextResponse.redirect(errorUrl(request, 'missing_fields', flow))
  }

  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         PAYER,
    access_token:  encryptToken(token.access_token),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token) : null,
    patient_id:    encryptToken(patientId),
    expires_at:    new Date(Date.now() + ((token.expires_in as number) ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    connection_skipped:  false,
    selected_insurer:    'BlueCross BlueShield MN',
  }, { onConflict: 'id' })

  await supabase.from('bcbs_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL(`/onboarding/connected?payer=${PAYER}&flow=${flow}`, request.url))
}
