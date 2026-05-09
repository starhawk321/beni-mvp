'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const insurers = [
  { name: 'Aetna',               color: '#7B2D8E', initials: 'Ae', recommended: true  },
  { name: 'Cigna',               color: '#FF7A00', initials: 'Ci', recommended: true  },
  { name: 'UnitedHealthcare',    color: '#002677', initials: 'U',  recommended: false },
  { name: 'Anthem / Blue Cross', color: '#005EB8', initials: 'An', recommended: false },
  { name: 'Humana',              color: '#5C9A1B', initials: 'H',  recommended: false },
]

export default function OnboardingPage() {
  const router = useRouter()

  function handleSelect(insurerName: string) {
    router.push(`/onboarding/connecting?insurer=${encodeURIComponent(insurerName)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="t-caption" style={{ color: 'var(--fg-3)' }}>Step 1 of 3</span>
          <div style={{ width: 80, height: 4, background: 'var(--beni-line)', borderRadius: 999 }}>
            <div style={{ width: '33%', height: '100%', background: 'var(--beni-sky)', borderRadius: 999 }} />
          </div>
        </div>
      </header>

      <main className="beni-main">
        <h1 className="t-display-l" style={{ color: 'var(--fg-1)', marginBottom: 12, maxWidth: 600 }}>
          Pick your insurer. We'll do the rest.
        </h1>
        <p className="t-body" style={{ color: 'var(--fg-3)', marginBottom: 40 }}>
          We use read-only access to fetch your plan details and spending history.
        </p>

        <div style={{
          background: 'var(--beni-sky-12)', borderRadius: 'var(--r-4)',
          padding: '12px 16px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 10,
          maxWidth: 520,
        }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span className="t-body-s" style={{ color: 'var(--beni-sky)' }}>
            Read-only access. We never store your insurer credentials.
          </span>
        </div>

        <div className="beni-insurer-grid">
          {insurers.map((ins) => (
            <button
              key={ins.name}
              onClick={() => handleSelect(ins.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                borderRadius: 'var(--r-5)', padding: '18px 20px',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: 'var(--shadow-1)',
                transition: 'box-shadow 200ms, border-color 200ms',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-2)'
                e.currentTarget.style.borderColor = 'var(--beni-line-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-1)'
                e.currentTarget.style.borderColor = 'var(--beni-line)'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-3)',
                background: ins.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}>
                {ins.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{ins.name}</span>
                  {ins.recommended && (
                    <span className="badge badge-info">Recommended</span>
                  )}
                </div>
                <span className="t-caption" style={{ color: 'var(--fg-4)' }}>FHIR · SMART on FHIR</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
