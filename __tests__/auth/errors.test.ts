import { describe, it, expect } from 'vitest'
import { friendlyAuthError } from '@/lib/auth/errors'

describe('friendlyAuthError', () => {
  it('maps invalid credentials', () => {
    expect(friendlyAuthError('Invalid login credentials')).toBe('Incorrect email or password.')
  })

  it('maps email already exists', () => {
    expect(friendlyAuthError('User already registered')).toBe('An account with this email already exists. Try logging in.')
  })

  it('maps weak password', () => {
    expect(friendlyAuthError('Password should be at least 8 characters')).toBe('Password must be at least 8 characters.')
  })

  it('maps unconfirmed email', () => {
    expect(friendlyAuthError('Email not confirmed')).toBe('Please check your email and click the confirmation link first.')
  })

  it('maps rate limit', () => {
    expect(friendlyAuthError('over_email_send_rate_limit')).toBe('Too many attempts. Please wait a few minutes and try again.')
  })

  it('maps network error', () => {
    expect(friendlyAuthError('Failed to fetch')).toBe('Connection error. Check your internet and try again.')
  })

  it('capitalises unknown errors', () => {
    expect(friendlyAuthError('something went wrong')).toBe('Something went wrong')
  })
})
