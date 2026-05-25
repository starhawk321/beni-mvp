'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BRAND_GRADIENT = 'linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)'

// FHIR-capable plans we can actually connect right now — only suggest these.
const SUGGESTIONS = [
  'Medicare supplement (Medigap)',
  'Part D prescription plan',
  "Spouse's employer plan",
]

interface Props {
  justConnected: string
  connected: string[]
  flow: 'first' | 'add'
  connectedCount: number
}

export default function ConnectedInterstitial({ justConnected, connected, flow, connectedCount }: Props) {
  const router = useRouter()
  const doneHref = flow === 'add' ? '/settings' : '/home'

  // After the 3rd connection, stop prompting and move on automatically.
  const capReached = connectedCount >= 3
  useEffect(() => {
    if (!capReached) return
    const t = setTimeout(() => router.push(doneHref), 2000)
    return () => clearTimeout(t)
  }, [capReached, doneHref, router])

  return (
    <main className="beni-main" style={{ maxWidth: 560, paddingTop: 48, paddingBottom: 96 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: BRAND_GRADIENT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 24,
      }}>✓</div>

      <h1 style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 20 }}>
        {justConnected} connected.
      </h1>

      {/* Connected list */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-4)', padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 10 }}>You&apos;ve connected</div>
        {connected.map(name => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink)', padding: '4px 0' }}>
            <span style={{ color: 'var(--accent-sky)' }}>✓</span> {name}
          </div>
        ))}
      </div>

      {capReached ? (
        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)' }}>
          Taking you to your {flow === 'add' ? 'settings' : 'dashboard'}…
        </p>
      ) : (
        <>
          {connectedCount <= 1 ? (
            <>
              <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 8 }}>
                Most people also have:
              </p>
              <ul style={{ margin: '0 0 20px', paddingLeft: 20 }}>
                {SUGGESTIONS.map(s => (
                  <li key={s} style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7 }}>{s}</li>
                ))}
              </ul>
              <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>
                If any apply, connect them now to see your full coverage in one place.
              </p>
            </>
          ) : (
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>
              Anything else? You can always add more later in Settings.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/onboarding?add=true" style={{
              height: 48, padding: '0 22px', borderRadius: 999, background: BRAND_GRADIENT, color: '#0F1A2C',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15,
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}>Add another insurer</Link>
            <Link href={doneHref} style={{
              height: 48, padding: '0 22px', borderRadius: 999, border: '1px solid var(--btn-ghost-border)', background: 'transparent', color: 'var(--ink)',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 15,
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}>{connectedCount <= 1 ? "I'm all set" : "I'm done"}</Link>
          </div>
        </>
      )}
    </main>
  )
}
