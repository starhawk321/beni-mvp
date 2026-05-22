'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/Logo'

const insurers = [
  { payer: 'cms',   name: 'Medicare (CMS)',          color: '#1565C0', initials: 'Mc', recommended: true,  oauthPath: '/api/fhir/cms/authorize'   },
  { payer: 'cigna', name: 'Cigna',                   color: '#FF7A00', initials: 'Ci', recommended: true,  oauthPath: '/api/fhir/cigna/authorize' },
  { payer: 'bcbs',  name: 'BlueCross BlueShield MN', color: '#005EB8', initials: 'BC', recommended: true,  oauthPath: '/api/fhir/bcbs/authorize'  },
  { payer: null,    name: 'Aetna',                   color: '#7B2D8E', initials: 'Ae', recommended: true,  oauthPath: null },
  { payer: null,    name: 'UnitedHealthcare',        color: '#002677', initials: 'U',  recommended: false, oauthPath: null },
  { payer: null,    name: 'Humana',                  color: '#5C9A1B', initials: 'H',  recommended: false, oauthPath: null },
]

function OnboardingInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isAdding     = searchParams.get('add') === 'true'
  const [connectedPayers, setConnectedPayers] = useState<string[]>([])

  useEffect(() => {
    if (!isAdding) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('fhir_tokens').select('payer').eq('user_id', user.id).then(({ data }) => {
        setConnectedPayers((data ?? []).map(r => r.payer))
      })
    })
  }, [isAdding])

  function handleSelect(insurer: typeof insurers[0]) {
    if (insurer.oauthPath) {
      window.location.href = insurer.oauthPath
    } else {
      router.push(`/onboarding/connecting?insurer=${encodeURIComponent(insurer.name)}`)
    }
  }

  const filtered = isAdding
    ? insurers.filter(i => !i.payer || !connectedPayers.includes(i.payer))
    : insurers

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
        {isAdding ? (
          <Link href="/settings" style={{
            fontSize: 13, fontWeight: 600,
            color: 'var(--fg-3)', textDecoration: 'none',
            fontFamily: 'var(--font-manrope), sans-serif',
          }}>
            ← Back to settings
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-caption" style={{ color: 'var(--fg-3)' }}>Step 1 of 3</span>
            <div style={{ width: 80, height: 4, background: 'var(--beni-line)', borderRadius: 999 }}>
              <div style={{ width: '33%', height: '100%', background: 'var(--beni-sky)', borderRadius: 999 }} />
            </div>
          </div>
        )}
      </header>

      <main className="beni-main">
        <h1 className="t-display-l" style={{ color: 'var(--fg-1)', marginBottom: 12, maxWidth: 600 }}>
          {isAdding ? 'Add another insurer.' : "Pick your insurer. We'll do the rest."}
        </h1>
        <p className="t-body" style={{ color: 'var(--fg-3)', marginBottom: 40 }}>
          {isAdding
            ? 'Connect any additional plans you have. Béni will show data from all of them together.'
            : 'We use read-only access to fetch your plan details and spending history.'}
        </p>

        <div style={{
          background: 'var(--beni-sky-12)', borderRadius: 'var(--r-4)',
          padding: '12px 16px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 10,
          maxWidth: 520,
        }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span className="t-body-s" style={{ color: 'var(--beni-sky)' }}>
            Your health records stay with your insurer. We only read them, never copy them.
          </span>
        </div>

        <div className="beni-insurer-grid">
          {filtered.map((ins) => (
            <button
              key={ins.name}
              onClick={() => handleSelect(ins)}
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

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  )
}
