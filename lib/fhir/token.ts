import { decryptToken } from '@/lib/fhir/crypto'

const CMS_TOKEN_URL = 'https://sandbox.bluebutton.cms.gov/v2/o/token/'

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

// Returns a valid access token — decrypts, refreshes silently if expired.
// Returns null if decryption fails, refresh fails, or no refresh token available.
export async function getValidAccessToken(tokenRow: StoredToken): Promise<string | null> {
  const isExpired = tokenRow.expires_at
    ? new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000)
    : false

  const accessToken = decryptToken(tokenRow.access_token)
  if (!accessToken) return null

  if (!isExpired) return accessToken

  if (!tokenRow.refresh_token) return null
  const refreshToken = decryptToken(tokenRow.refresh_token)
  if (!refreshToken) return null

  const refreshed = await refreshCMSToken(refreshToken)
  return refreshed?.access_token ?? null
}
