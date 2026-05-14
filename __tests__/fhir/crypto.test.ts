import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { encryptToken, decryptToken } from '@/lib/fhir/crypto'

const TEST_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' // 32 zero bytes base64

beforeEach(() => {
  process.env.FHIR_TOKEN_ENCRYPTION_KEY = TEST_KEY
})

afterEach(() => {
  delete process.env.FHIR_TOKEN_ENCRYPTION_KEY
})

describe('encryptToken', () => {
  it('returns a colon-separated base64 string with 3 parts', () => {
    const result = encryptToken('my-secret-token')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    parts.forEach(p => expect(p.length).toBeGreaterThan(0))
  })

  it('produces different output each call (random IV)', () => {
    const a = encryptToken('same-input')
    const b = encryptToken('same-input')
    expect(a).not.toBe(b)
  })

  it('throws when encryption key is missing', () => {
    delete process.env.FHIR_TOKEN_ENCRYPTION_KEY
    expect(() => encryptToken('token')).toThrow('FHIR_TOKEN_ENCRYPTION_KEY is not set')
  })

  it('throws when key is wrong length', () => {
    process.env.FHIR_TOKEN_ENCRYPTION_KEY = Buffer.from('tooshort').toString('base64')
    expect(() => encryptToken('token')).toThrow('32 bytes')
  })
})

describe('decryptToken', () => {
  it('round-trips a token correctly', () => {
    const original  = 'cWPD7NfH-my-real-refresh-token'
    const encrypted = encryptToken(original)
    expect(decryptToken(encrypted)).toBe(original)
  })

  it('round-trips a long token', () => {
    const original  = 'a'.repeat(512)
    expect(decryptToken(encryptToken(original))).toBe(original)
  })

  it('returns null for tampered ciphertext', () => {
    const encrypted = encryptToken('token')
    const parts     = encrypted.split(':')
    parts[2]        = Buffer.from('tampered').toString('base64')
    expect(decryptToken(parts.join(':'))).toBeNull()
  })

  it('returns null for tampered auth tag', () => {
    const encrypted = encryptToken('token')
    const parts     = encrypted.split(':')
    parts[1]        = Buffer.from('badbadbadbadbadb').toString('base64')
    expect(decryptToken(parts.join(':'))).toBeNull()
  })

  it('returns null for malformed input (missing parts)', () => {
    expect(decryptToken('notvalid')).toBeNull()
    expect(decryptToken('only:two')).toBeNull()
  })

  it('returns null when key is missing', () => {
    const encrypted = encryptToken('token')
    delete process.env.FHIR_TOKEN_ENCRYPTION_KEY
    expect(decryptToken(encrypted)).toBeNull()
  })
})
