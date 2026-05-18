import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'

const CIGNA_TOKEN_URL = 'https://r-hi2.cigna.com/mga/sps/oauth/oauth20/token'

// Decode JWT payload without verifying signature (we trust Cigna's HTTPS)
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard?error=missing_params', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Verify CSRF state
  const { data: oauthState } = await supabase
    .from('cigna_oauth_state')
    .select('state')
    .eq('user_id', user.id)
    .single()

  if (!oauthState || oauthState.state !== state) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_state', request.url))
  }

  // Exchange code for tokens using Basic Auth (Cigna Standard OAuth)
  const credentials = Buffer.from(
    `${process.env.FHIR_CIGNA_CLIENT_ID}:${process.env.FHIR_CIGNA_CLIENT_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch(CIGNA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: process.env.FHIR_CIGNA_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    console.error('Cigna token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url))
  }

  const token = await tokenRes.json()

  // Extract patient ID from token response or ID token JWT
  const patientId: string =
    token.patient ??
    decodeJwtPayload(token.id_token ?? '').sub ??
    decodeJwtPayload(token.access_token ?? '').sub ??
    ''

  if (!patientId) {
    console.error('Cigna: could not determine patient ID from token response', token)
    return NextResponse.redirect(new URL('/dashboard?error=no_patient_id', request.url))
  }

  // Store tokens encrypted
  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         'cigna',
    access_token:  encryptToken(token.access_token),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token) : null,
    patient_id:    encryptToken(patientId),
    expires_at:    new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    selected_insurer:    'Cigna',
  }, { onConflict: 'id' })

  await supabase.from('cigna_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
