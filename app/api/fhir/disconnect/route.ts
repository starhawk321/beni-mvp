import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/fhir/crypto'
import https from 'node:https'

const CMS_REVOKE_URL   = 'https://sandbox.bluebutton.cms.gov/v2/o/revoke/'
const CIGNA_REVOKE_HOST = 'r-hi2.cigna.com'
const CIGNA_REVOKE_PATH = '/mga/sps/oauth/oauth20/revoke'
const BCBS_REVOKE_URL  = 'https://bluecrossmn3.okta.com/oauth2/ausb48v7sRjhrmr4V4h6/v1/revoke'

type Payer = 'cms' | 'cigna' | 'bcbs' | 'aetna'

// Cigna uses malformed HTTP headers — needs insecureHTTPParser
function revokeCigna(token: string): Promise<boolean> {
  return new Promise((resolve) => {
    const credentials = Buffer.from(
      `${process.env.FHIR_CIGNA_CLIENT_ID}:${process.env.FHIR_CIGNA_CLIENT_SECRET}`
    ).toString('base64')
    const body = new URLSearchParams({ token, token_type_hint: 'refresh_token' }).toString()
    const req = https.request({
      hostname: CIGNA_REVOKE_HOST,
      path:     CIGNA_REVOKE_PATH,
      method:   'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Authorization':  `Basic ${credentials}`,
        'Content-Length': Buffer.byteLength(body),
      },
      insecureHTTPParser: true,
    }, (res) => { res.on('data', () => {}); res.on('end', () => resolve(res.statusCode! < 400)) })
    req.on('error', () => resolve(false))
    req.write(body)
    req.end()
  })
}

async function revokeWithPayer(payer: Payer, refreshToken: string): Promise<boolean> {
  try {
    if (payer === 'cigna') return await revokeCigna(refreshToken)
    // Aetna sandbox issues no refresh token and documents no revoke endpoint —
    // deleting the local token row is sufficient.
    if (payer === 'aetna') return true

    const url = payer === 'bcbs' ? BCBS_REVOKE_URL : CMS_REVOKE_URL
    const clientId     = payer === 'bcbs' ? process.env.FHIR_BCBS_CLIENT_ID!     : process.env.FHIR_CMS_CLIENT_ID!
    const clientSecret = payer === 'bcbs' ? process.env.FHIR_BCBS_CLIENT_SECRET! : process.env.FHIR_CMS_CLIENT_SECRET!
    const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({ token: refreshToken, token_type_hint: 'refresh_token' }),
    })
    return res.ok
  } catch (err) {
    console.error(`Token revocation failed for ${payer}:`, err)
    return false
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { payer } = await request.json() as { payer: Payer }
  if (!payer || !['cms', 'cigna', 'bcbs', 'aetna'].includes(payer)) {
    return NextResponse.json({ error: 'Invalid payer' }, { status: 400 })
  }

  // Fetch token row to get refresh token for revocation
  const { data: tokenRow } = await supabase
    .from('fhir_tokens')
    .select('refresh_token')
    .eq('user_id', user.id)
    .eq('payer', payer)
    .single()

  // Best-effort revocation — don't fail disconnection if revocation fails
  if (tokenRow?.refresh_token) {
    const refreshToken = decryptToken(tokenRow.refresh_token)
    if (refreshToken) await revokeWithPayer(payer, refreshToken)
  }

  // Delete the token row regardless
  const { error: deleteError } = await supabase
    .from('fhir_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('payer', payer)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  // If no more tokens, clear selected_insurer from profile
  const { count } = await supabase
    .from('fhir_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count === 0) {
    await supabase
      .from('profiles')
      .update({ selected_insurer: null, onboarding_complete: false })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true, remaining: count ?? 0 })
}
