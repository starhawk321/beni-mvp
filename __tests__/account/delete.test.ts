import { describe, it, expect, vi, beforeEach } from 'vitest'
import { encryptToken } from '@/lib/fhir/crypto'

const TEST_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

// Mock Supabase clients
const mockGetUser      = vi.fn()
const mockSelect       = vi.fn()
const mockDeleteTokens = vi.fn()
const mockDeleteProfile = vi.fn()
const mockDeleteUser   = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => ({
      select: () => ({ eq: () => ({ single: mockSelect }) }),
      delete: () => ({ eq: mockTable(table) }),
    }),
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: { admin: { deleteUser: mockDeleteUser } },
  }),
}))

function mockTable(table: string) {
  return table === 'fhir_tokens' ? mockDeleteTokens : mockDeleteProfile
}

beforeEach(() => {
  process.env.FHIR_TOKEN_ENCRYPTION_KEY = TEST_KEY
  process.env.FHIR_CMS_CLIENT_ID        = 'test-client-id'
  process.env.FHIR_CMS_CLIENT_SECRET    = 'test-client-secret'
  vi.restoreAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
  mockDeleteUser.mockResolvedValue({ error: null })
  mockDeleteTokens.mockResolvedValue({})
  mockDeleteProfile.mockResolvedValue({})
})

describe('DELETE /api/account/delete', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('@/app/api/account/delete/route')
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('calls CMS revocation when refresh token exists', async () => {
    const encryptedToken = encryptToken('real-refresh-token')
    mockSelect.mockResolvedValueOnce({ data: { refresh_token: encryptedToken } })

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 200 })
    )

    const { POST } = await import('@/app/api/account/delete/route')
    await POST()

    const [url, opts] = fetchSpy.mock.calls[0]
    expect(url).toContain('revoke')
    const body = opts?.body as URLSearchParams
    expect(body.get('token')).toBe('real-refresh-token')
  })

  it('proceeds with deletion even if CMS revocation fails', async () => {
    const encryptedToken = encryptToken('real-refresh-token')
    mockSelect.mockResolvedValueOnce({ data: { refresh_token: encryptedToken } })
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('CMS unreachable'))

    const { POST } = await import('@/app/api/account/delete/route')
    const res = await POST()
    expect(res.status).toBe(200)
  })

  it('proceeds with deletion when no fhir_tokens row exists', async () => {
    mockSelect.mockResolvedValueOnce({ data: null })

    const { POST } = await import('@/app/api/account/delete/route')
    const res = await POST()
    expect(res.status).toBe(200)
  })

  it('returns 500 when auth user deletion fails', async () => {
    mockSelect.mockResolvedValueOnce({ data: null })
    mockDeleteUser.mockResolvedValueOnce({ error: { message: 'DB error' } })

    const { POST } = await import('@/app/api/account/delete/route')
    const res = await POST()
    expect(res.status).toBe(500)
  })

  it('returns 200 on full success', async () => {
    mockSelect.mockResolvedValueOnce({ data: null })

    const { POST } = await import('@/app/api/account/delete/route')
    const res = await POST()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
