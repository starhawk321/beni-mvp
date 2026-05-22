'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type ConnectedInsurer = {
  payer: 'cms' | 'cigna' | 'bcbs'
  displayName: string
  color: string
  initials: string
}

interface Props {
  insurers: ConnectedInsurer[]
}

export default function ConnectedInsurers({ insurers }: Props) {
  const router = useRouter()
  const [confirmingPayer, setConfirmingPayer] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDisconnect(payer: string) {
    setDisconnecting(payer)
    setError('')
    try {
      const res = await fetch('/api/fhir/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to disconnect')
        setDisconnecting(null)
        return
      }
      if (data.remaining === 0) {
        router.push('/onboarding')
      } else {
        router.refresh()
        setConfirmingPayer(null)
        setDisconnecting(null)
      }
    } catch {
      setError('Network error. Please try again.')
      setDisconnecting(null)
    }
  }

  if (insurers.length === 0) {
    return (
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>No insurers connected</p>
          <p className="t-body-s" style={{ color: 'var(--fg-3)' }}>Connect one to start seeing your plan data.</p>
        </div>
        <Link href="/onboarding" style={{
          height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
          background: 'var(--action-primary)', color: '#ffe9cf',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
          display: 'flex', alignItems: 'center',
          fontFamily: 'var(--font-manrope), sans-serif', whiteSpace: 'nowrap',
        }}>
          Connect
        </Link>
      </div>
    )
  }

  return (
    <>
      {insurers.map((ins, i) => (
        <div key={ins.payer} style={{
          padding: '16px 20px',
          borderBottom: i < insurers.length - 1 || true ? 'var(--border-hairline)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-3)',
                background: ins.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {ins.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{ins.displayName}</p>
                <span className="badge badge-positive" style={{ marginTop: 4 }}>Active</span>
              </div>
            </div>
            {confirmingPayer !== ins.payer && (
              <button
                onClick={() => setConfirmingPayer(ins.payer)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
                  border: 'var(--border-hairline)', background: 'transparent',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: 'var(--fg-2)', fontFamily: 'var(--font-manrope), sans-serif',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                Disconnect
              </button>
            )}
          </div>

          {confirmingPayer === ins.payer && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 'var(--r-3)' }}>
              <p className="t-body-s" style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
                Remove {ins.displayName} connection? Your data will stop updating. You can reconnect anytime.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setConfirmingPayer(null); setError('') }}
                  disabled={disconnecting === ins.payer}
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
                  onClick={() => handleDisconnect(ins.payer)}
                  disabled={disconnecting === ins.payer}
                  style={{
                    height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
                    background: 'var(--status-critical)', border: 'none',
                    cursor: disconnecting === ins.payer ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#fff',
                    fontFamily: 'var(--font-manrope), sans-serif',
                    opacity: disconnecting === ins.payer ? 0.6 : 1, whiteSpace: 'nowrap',
                  }}
                >
                  {disconnecting === ins.payer ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
              {error && <p className="t-caption" style={{ color: 'var(--status-critical)', marginTop: 8 }}>{error}</p>}
            </div>
          )}
        </div>
      ))}

      <div style={{ padding: '16px 20px' }}>
        <Link href="/onboarding?add=true" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--beni-sky)', textDecoration: 'none',
          fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-manrope), sans-serif',
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          Add another insurer
        </Link>
      </div>
    </>
  )
}
