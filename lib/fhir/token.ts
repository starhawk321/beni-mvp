import { decryptToken } from '@/lib/fhir/crypto'
import https from 'node:https'

const CMS_TOKEN_URL   = 'https://sandbox.bluebutton.cms.gov/v2/o/token/'
const CIGNA_TOKEN_HOST = 'r-hi2.cigna.com'
const CIGNA_TOKEN_PATH = '/mga/sps/oauth/oauth20/token'
const BCBS_TOKEN_URL  = 'https://interop-preview.bluecrossmn.com/fhir/token'

export type StoredToken = {
  access_token: string
  refresh_token: string | null
  expires_at: string | null
}

export type RefreshedToken = {
  access_token: string
  expires_in: number
}

export async function refreshCMSToken(refreshToken: string): Promise<RefreshedToken | null> {
  const res = await fetch(CMS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.FHIR_CMS_CLIENT_ID!,
      client_secret: process.env.FHIR_CMS_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 }
}

// Cigna returns malformed HTTP headers — must use insecureHTTPParser
export function refreshCignaToken(refreshToken: string): Promise<RefreshedToken | null> {
  return new Promise((resolve) => {
    const credentials = Buffer.from(
      `${process.env.FHIR_CIGNA_CLIENT_ID}:${process.env.FHIR_CIGNA_CLIENT_SECRET}`
    ).toString('base64')

    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }).toString()

    const req = https.request(
      {
        hostname: CIGNA_TOKEN_HOST,
        path:     CIGNA_TOKEN_PATH,
        method:   'POST',
        headers: {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Authorization':  `Basic ${credentials}`,
          'Content-Length': Buffer.byteLength(body),
        },
        insecureHTTPParser: true,
      },
      (res) => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            if (!parsed.access_token) { resolve(null); return }
            resolve({ access_token: parsed.access_token, expires_in: parsed.expires_in ?? 3600 })
          } catch {
            resolve(null)
          }
        })
      }
    )
    req.on('error', () => resolve(null))
    req.write(body)
    req.end()
  })
}

export async function refreshBCBSToken(refreshToken: string): Promise<RefreshedToken | null> {
  const credentials = Buffer.from(
    `${process.env.FHIR_BCBS_CLIENT_ID}:${process.env.FHIR_BCBS_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(BCBS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 }
}

// Returns a valid access token — decrypts, refreshes silently if expired.
export async function getValidAccessToken(
  tokenRow: StoredToken,
  payer: 'cms' | 'cigna' | 'bcbs' = 'cms'
): Promise<string | null> {
  const isExpired = tokenRow.expires_at
    ? new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000)
    : false

  const accessToken = decryptToken(tokenRow.access_token)
  if (!accessToken) return null

  if (!isExpired) return accessToken

  if (!tokenRow.refresh_token) return null
  const refreshToken = decryptToken(tokenRow.refresh_token)
  if (!refreshToken) return null

  const refreshed = payer === 'cigna'
    ? await refreshCignaToken(refreshToken)
    : payer === 'bcbs'
      ? await refreshBCBSToken(refreshToken)
      : await refreshCMSToken(refreshToken)

  return refreshed?.access_token ?? null
}
