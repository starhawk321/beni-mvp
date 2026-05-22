'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/account/delete', { method: 'POST' })
    if (res.ok) {
      router.push('/login?deleted=true')
    } else {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
          border: '1px solid var(--status-critical)',
          background: 'transparent', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--status-critical)',
          fontFamily: 'var(--font-manrope), sans-serif', whiteSpace: 'nowrap',
        }}
      >
        Delete account
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <p className="t-caption" style={{ color: 'var(--status-critical)' }}>
        This will delete all your data and cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          style={{
            height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
            border: 'var(--border-hairline)', background: 'transparent',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: 'var(--fg-3)', fontFamily: 'var(--font-manrope), sans-serif',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
            background: 'var(--status-critical)', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, color: '#fff',
            fontFamily: 'var(--font-manrope), sans-serif',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Deleting…' : 'Yes, delete my account'}
        </button>
      </div>
      {error && <p className="t-caption" style={{ color: 'var(--status-critical)' }}>{error}</p>}
    </div>
  )
}
