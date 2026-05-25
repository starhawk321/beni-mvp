import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/fhir/crypto'
import https from 'node:https'

const CIGNA_TOKEN_HOST = 'r-hi2.cigna.com'
const CIGNA_TOKEN_PATH = '/mga/sps/oauth/oauth20/token'

// Decode JWT payload without verifying signature (we trust Cigna's HTTPS)
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
  } catch {
    return {}
  }
}

// Cigna's token endpoint returns malformed HTTP headers — use insecureHTTPParser
function cignaTokenExchange(body: string, authHeader: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: CIGNA_TOKEN_HOST,
        path:     CIGNA_TOKEN_PATH,
        method:   'POST',
        headers: {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Authorization':  authHeader,
          'Content-Length': Buffer.byteLength(body),
        },
        insecureHTTPParser: true,
      },
      (res) => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          try { resolve(JSON.parse(data)) }
          catch { reject(new Error(`Failed to parse Cigna token response: ${data}`)) }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const PAYER = 'cigna'

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
    .from('cigna_oauth_state')
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
    `${process.env.FHIR_CIGNA_CLIENT_ID}:${process.env.FHIR_CIGNA_CLIENT_SECRET}`
  ).toString('base64')

  const body = new URLSearchParams({
    grant_type:   'authorization_code',
    code,
    redirect_uri: process.env.FHIR_CIGNA_REDIRECT_URI!,
  }).toString()

  let token: Record<string, unknown>
  try {
    token = await cignaTokenExchange(body, `Basic ${credentials}`)
  } catch (err) {
    console.error('Cigna token exchange failed:', { reason: 'token_exchange_failed', payer: PAYER, user_id: user.id, err })
    return NextResponse.redirect(errorUrl(request, 'token_exchange_failed', flow))
  }

  const patientId: string =
    (token.patient as string) ??
    (decodeJwtPayload(token.id_token as string ?? '').sub as string) ??
    (decodeJwtPayload(token.access_token as string ?? '').sub as string) ??
    ''

  if (!token.access_token || !patientId) {
    console.error('Cigna missing fields:', { reason: 'missing_fields', payer: PAYER, user_id: user.id })
    return NextResponse.redirect(errorUrl(request, 'missing_fields', flow))
  }

  await supabase.from('fhir_tokens').upsert({
    user_id:       user.id,
    payer:         PAYER,
    access_token:  encryptToken(token.access_token as string),
    refresh_token: token.refresh_token ? encryptToken(token.refresh_token as string) : null,
    patient_id:    encryptToken(patientId),
    expires_at:    new Date(Date.now() + ((token.expires_in as number) ?? 3600) * 1000).toISOString(),
  }, { onConflict: 'user_id,payer' })

  await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    connection_skipped:  false,
    selected_insurer:    'Cigna',
  }, { onConflict: 'id' })

  await supabase.from('cigna_oauth_state').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL(`/onboarding/connected?payer=${PAYER}&flow=${flow}`, request.url))
}
