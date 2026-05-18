'use client'

import { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(122,231,255,0.4)',
        borderRadius: 999,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'linear-gradient(110deg,#7AE7FF,#9B5BFF,#E55BB8)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#07101C', fontWeight: 800, fontSize: 13,
        }}>✓</span>
        <span style={{ color: '#F1EDE2', fontSize: 15, fontWeight: 500 }}>
          You're on the list. We'll be in touch.
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 8px 8px 18px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 999, maxWidth: 480,
        backdropFilter: 'blur(8px)',
        transition: 'border-color 200ms',
      }}>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            flex: 1, minWidth: 0, height: 44,
            background: 'transparent', border: 0, outline: 0,
            color: '#F1EDE2', fontSize: 15, fontWeight: 500,
            fontFamily: 'var(--font-manrope), sans-serif',
            letterSpacing: '-0.01em',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44, padding: '0 22px', borderRadius: 999, border: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 700,
            color: '#07101C',
            background: 'linear-gradient(110deg, #7AE7FF 0%, #5BA8FF 38%, #9B5BFF 72%, #E55BB8 100%)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            opacity: loading ? 0.7 : 1,
            fontFamily: 'var(--font-manrope), sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Requesting…' : 'Request access'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#E55BB8' }}>{error}</p>
      )}
    </form>
  )
}
