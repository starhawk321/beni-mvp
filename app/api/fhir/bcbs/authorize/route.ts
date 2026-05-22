import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

const BCBS_AUTH_URL = 'https://preview-api.bluecrossmn.com/fhir/authorize'

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const state = base64url(randomBytes(12))

  await supabase.from('bcbs_oauth_state').upsert({
    user_id:    user.id,
    state,
    created_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  const redirectUrl = `${BCBS_AUTH_URL}?${new URLSearchParams({
    client_id:     process.env.FHIR_BCBS_CLIENT_ID!,
    redirect_uri:  process.env.FHIR_BCBS_REDIRECT_URI!,
    response_type: 'code',
    scope:         'openid fhirUser patient/*.read offline_access',
    state,
  })}`

  return NextResponse.redirect(redirectUrl)
}
