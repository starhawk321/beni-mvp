import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'

const AETNA_AUTH_URL = 'https://vteapif1.aetna.com/fhirdemo/v1/fhirserver_auth/oauth2/authorize'
const AETNA_AUD      = 'https://vteapif1.aetna.com/fhirdemo'

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // PKCE — Aetna's "Token Generation Process Using PKCE" doc adds code_challenge +
  // code_verifier to the standard flow. Worth trying because the non-PKCE flow's
  // login step returns 400/null sandbox-wide; PKCE may route through a different
  // identity path. Confidential client (we still send client_secret on token).
  const codeVerifier  = base64url(randomBytes(32))
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest())

  const state = base64url(randomBytes(12))
  const flowIntent = new URL(request.url).searchParams.get('add') === 'true' ? 'add' : 'first'

  await supabase.from('aetna_oauth_state').upsert({
    user_id:       user.id,
    state,
    code_verifier: codeVerifier,
    flow_intent:   flowIntent,
    created_at:    new Date().toISOString(),
  }, { onConflict: 'user_id' })

  const redirectUrl = `${AETNA_AUTH_URL}?${new URLSearchParams({
    client_id:             process.env.FHIR_AETNA_CLIENT_ID!,
    redirect_uri:          process.env.FHIR_AETNA_REDIRECT_URI!,
    response_type:         'code',
    scope:                 'launch/patient patient/*.read',
    state,
    aud:                   AETNA_AUD,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })}`

  return NextResponse.redirect(redirectUrl)
}
