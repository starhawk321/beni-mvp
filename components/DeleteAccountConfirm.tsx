'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DeleteAccountConfirm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/account/delete', { method: 'POST' })
    if (res.ok) {
      router.push('/login?deleted=true')
    } else {
      setError('Something went wrong. Please try again or email hello@benihealth.app.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          height: 48, borderRadius: 'var(--r-pill)',
          background: 'var(--status-critical)', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff',
          fontFamily: 'var(--font-manrope), sans-serif',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Deleting your account…' : 'Yes, delete my account'}
      </button>

      <Link href="/settings" style={{
        height: 48, borderRadius: 'var(--r-pill)',
        border: 'var(--border-hairline)', background: 'transparent',
        fontSize: 15, fontWeight: 600, color: 'var(--fg-2)',
        fontFamily: 'var(--font-manrope), sans-serif',
        textDecoration: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        Cancel
      </Link>

      {error && (
        <p className="t-body-s" style={{
          color: 'var(--status-critical)',
          textAlign: 'center', marginTop: 8,
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
