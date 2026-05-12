import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'

const CMS_AUTH_URL  = 'https://sandbox.bluebutton.cms.gov/v2/o/authorize/'
const SCOPES = 'patient/Coverage.read patient/ExplanationOfBenefit.read patient/Patient.read'

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Generate PKCE code_verifier + code_challenge
  const codeVerifier  = base64url(randomBytes(32))
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest())

  // Generate state for CSRF
  const state = base64url(randomBytes(12))

  // Store verifier + state in Supabase for the callback to retrieve
  await supabase.from('cms_oauth_state').upsert({
    user_id:       user.id,
    state,
    code_verifier: codeVerifier,
    created_at:    new Date().toISOString(),
  }, { onConflict: 'user_id' })

  const params = new URLSearchParams({
    client_id:             process.env.FHIR_CMS_CLIENT_ID!,
    redirect_uri:          process.env.FHIR_CMS_REDIRECT_URI!,
    response_type:         'code',
    scope:                 SCOPES,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  return NextResponse.redirect(`${CMS_AUTH_URL}?${params}`)
}
