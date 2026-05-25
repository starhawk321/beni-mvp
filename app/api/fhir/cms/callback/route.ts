import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'

const CMS_TOKEN_URL = 'https://sandbox.bluebutton.cms.gov/v2/o/token/'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/home?error=missing_params', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Retrieve stored state + code_verifier
  const { data: oauthState } = await supabase
    .from('cms_oauth_state')
    .select('state, code_verifier')
    .eq('user_id', user.id)
    .single()

  if (!oauthState || oauthState.state !== state) {
    return NextResponse.redirect(new URL('/home?error=invalid_state', request.url))
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
    console.error('CMS token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/home?error=token_exchange_failed', request.url))
  }

  const token = await tokenRes.json()

  if (!token.access_token || !token.patient) {
    console.error('CMS token response missing required fields:', {
      hasAccessToken: !!token.access_token,
      hasPatient:     !!token.patient,
      keys:           Object.keys(token),
    })
    return NextResponse.redirect(new URL('/home?error=cms_missing_fields', request.url))
  }

  // Store tokens and patient_id encrypted — patient_id is a healthcare identifier
  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         'cms',
    access_token:  encryptToken(token.access_token),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token) : null,
    patient_id:    encryptToken(token.patient),
    expires_at:    new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  // Mark onboarding complete
  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    selected_insurer:    'Medicare (CMS)',
  }, { onConflict: 'id' })

  // Clean up oauth state
  await supabase.from('cms_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL('/home', request.url))
}
