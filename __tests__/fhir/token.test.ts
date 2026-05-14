import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getValidAccessToken, refreshCMSToken } from '@/lib/fhir/token'
import { encryptToken } from '@/lib/fhir/crypto'

const TEST_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

const FUTURE = new Date(Date.now() + 3600_000).toISOString()
const PAST   = new Date(Date.now() - 3600_000).toISOString()
const SOON   = new Date(Date.now() + 30_000).toISOString() // within 60s buffer

beforeEach(() => {
  process.env.FHIR_TOKEN_ENCRYPTION_KEY = TEST_KEY
  vi.restoreAllMocks()
})

afterEach(() => {
  delete process.env.FHIR_TOKEN_ENCRYPTION_KEY
})

describe('getValidAccessToken', () => {
  it('decrypts and returns the stored token when not expired', async () => {
    const result = await getValidAccessToken({
      access_token:  encryptToken('valid-token'),
      refresh_token: encryptToken('refresh-token'),
      expires_at:    FUTURE,
    })
    expect(result).toBe('valid-token')
  })

  it('decrypts and returns the stored token when expires_at is null', async () => {
    const result = await getValidAccessToken({
      access_token:  encryptToken('valid-token'),
      refresh_token: null,
      expires_at:    null,
    })
    expect(result).toBe('valid-token')
  })

  it('returns null when decryption fails (corrupted token)', async () => {
    const result = await getValidAccessToken({
      access_token:  'not-encrypted',
      refresh_token: null,
      expires_at:    FUTURE,
    })
    expect(result).toBeNull()
  })

  it('returns null when expired and no refresh token', async () => {
    const result = await getValidAccessToken({
      access_token:  encryptToken('expired-token'),
      refresh_token: null,
      expires_at:    PAST,
    })
    expect(result).toBeNull()
  })

  it('treats token expiring within 60s as expired and refreshes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'new-token', expires_in: 3600 }), { status: 200 })
    )
    const result = await getValidAccessToken({
      access_token:  encryptToken('almost-expired'),
      refresh_token: encryptToken('refresh-token'),
      expires_at:    SOON,
    })
    expect(result).toBe('new-token')
  })

  it('calls CMS token endpoint with decrypted refresh_token when expired', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'refreshed', expires_in: 3600 }), { status: 200 })
    )
    await getValidAccessToken({
      access_token:  encryptToken('old-token'),
      refresh_token: encryptToken('my-refresh-token'),
      expires_at:    PAST,
    })
    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams
    expect(body.get('grant_type')).toBe('refresh_token')
    expect(body.get('refresh_token')).toBe('my-refresh-token')
  })

  it('returns refreshed access token when refresh succeeds', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'brand-new', expires_in: 3600 }), { status: 200 })
    )
    const result = await getValidAccessToken({
      access_token:  encryptToken('old-token'),
      refresh_token: encryptToken('refresh-token'),
      expires_at:    PAST,
    })
    expect(result).toBe('brand-new')
  })

  it('returns null when refresh endpoint returns non-200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 })
    )
    const result = await getValidAccessToken({
      access_token:  encryptToken('old-token'),
      refresh_token: encryptToken('bad-refresh-token'),
      expires_at:    PAST,
    })
    expect(result).toBeNull()
  })
})

describe('refreshCMSToken', () => {
  it('returns null on non-200 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('error', { status: 400 })
    )
    expect(await refreshCMSToken('bad-token')).toBeNull()
  })

  it('returns token data on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'abc', expires_in: 3600 }), { status: 200 })
    )
    const result = await refreshCMSToken('good-token')
    expect(result).toEqual({ access_token: 'abc', expires_in: 3600 })
  })
})
