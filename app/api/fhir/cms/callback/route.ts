import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'

const CMS_TOKEN_URL = 'https://sandbox.bluebutton.cms.gov/v2/o/token/'

const PAYER = 'cms'

function errorUrl(request: NextRequest, reason: string, flow: string) {
  return new URL(`/onboarding/connection-error?reason=${reason}&payer=${PAYER}&flow=${flow}`, request.url)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error') // e.g. access_denied if user cancelled

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Read stored state, verifier, and flow intent
  const { data: oauthState } = await supabase
    .from('cms_oauth_state')
    .select('state, code_verifier, flow_intent')
    .eq('user_id', user.id)
    .single()

  const flow = oauthState?.flow_intent ?? 'first'

  if (oauthError) {
    return NextResponse.redirect(errorUrl(request, 'cancelled', flow))
  }
  if (!code || !state) {
    return NextResponse.redirect(errorUrl(request, 'cancelled', flow))
  }
  if (!oauthState || oauthState.state !== state) {
    return NextResponse.redirect(errorUrl(request, 'invalid_state', flow))
  }

  // Exchange code for access token
  const tokenRes = await fetch(CMS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.FHIR_CMS_REDIRECT_URI!,
      client_id:     process.env.FHIR_CMS_CLIENT_ID!,
      client_secret: process.env.FHIR_CMS_CLIENT_SECRET!,
      code_verifier: oauthState.code_verifier,
    }),
  })

  if (!tokenRes.ok) {
    console.error('CMS token exchange failed:', { reason: 'token_exchange_failed', payer: PAYER, user_id: user.id, body: await tokenRes.text() })
    return NextResponse.redirect(errorUrl(request, 'token_exchange_failed', flow))
  }

  const token = await tokenRes.json()

  if (!token.access_token || !token.patient) {
    console.error('CMS token response missing fields:', { reason: 'missing_fields', payer: PAYER, user_id: user.id, keys: Object.keys(token) })
    return NextResponse.redirect(errorUrl(request, 'missing_fields', flow))
  }

  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         PAYER,
    access_token:  encryptToken(token.access_token),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token) : null,
    patient_id:    encryptToken(token.patient),
    expires_at:    new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  // Mark onboarding complete + clear any prior skip flag (they connected for real)
  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    connection_skipped:  false,
    selected_insurer:    'Medicare (CMS)',
  }, { onConflict: 'id' })

  await supabase.from('cms_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL(`/onboarding/connected?payer=${PAYER}&flow=${flow}`, request.url))
}
