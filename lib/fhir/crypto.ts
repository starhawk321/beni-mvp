import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES   = 12
const TAG_BYTES  = 16

function getKey(): Buffer {
  const raw = process.env.FHIR_TOKEN_ENCRYPTION_KEY
  if (!raw) throw new Error('FHIR_TOKEN_ENCRYPTION_KEY is not set')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error('FHIR_TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded)')
  return key
}

// Returns "iv:authTag:ciphertext" — all base64
export function encryptToken(plaintext: string): string {
  const key    = getKey()
  const iv     = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag    = cipher.getAuthTag()

  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':')
}

// Returns original plaintext, or null if decryption fails
export function decryptToken(encrypted: string): string | null {
  try {
    const [ivB64, tagB64, ctB64] = encrypted.split(':')
    if (!ivB64 || !tagB64 || !ctB64) return null

    const key      = getKey()
    const iv       = Buffer.from(ivB64,  'base64')
    const authTag  = Buffer.from(tagB64, 'base64')
    const ct       = Buffer.from(ctB64,  'base64')
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    return decipher.update(ct) + decipher.final('utf8')
  } catch {
    return null
  }
}
