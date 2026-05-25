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

const BRAND_GRADIENT = 'linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)'

function OnboardingInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isAdding     = searchParams.get('add') === 'true'
  const [connectedPayers, setConnectedPayers] = useState<string[]>([])
  const [skipping, setSkipping] = useState(false)

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
      window.location.href = isAdding ? `${insurer.oauthPath}?add=true` : insurer.oauthPath
    } else {
      router.push(`/onboarding/connecting?insurer=${encodeURIComponent(insurer.name)}`)
    }
  }

  async function handleSkip() {
    setSkipping(true)
    await fetch('/api/onboarding/skip', { method: 'POST' })
    router.push('/home')
    router.refresh()
  }

  const filtered = isAdding
    ? insurers.filter(i => !i.payer || !connectedPayers.includes(i.payer))
    : insurers

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <header style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo height={26} />
        {isAdding && (
          <Link href="/settings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-dim)', textDecoration: 'none', fontFamily: 'var(--font-manrope), sans-serif' }}>
            ← Back to settings
          </Link>
        )}
      </header>

      <main className="beni-main" style={{ paddingBottom: 96 }}>
        <h1 style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 12, maxWidth: 600 }} className="beni-hero-title">
          {isAdding ? 'Add another insurer.' : "Pick your insurer. We'll do the rest."}
        </h1>
        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 16, color: 'var(--ink-soft)', marginBottom: 32, maxWidth: 560 }}>
          {isAdding
            ? 'Connect any additional plans you have. Béni will show data from all of them together.'
            : 'We use read-only access to fetch your plan details and spending history.'}
        </p>

        <div className="beni-insurer-grid">
          {filtered.map((ins) => (
            <button
              key={ins.name}
              onClick={() => handleSelect(ins)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--surface-2)', border: '1px solid var(--hair)',
                borderRadius: 'var(--r-5)', padding: '18px 20px',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-3)',
                background: ins.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15, flexShrink: 0,
                fontFamily: 'var(--font-manrope), sans-serif',
              }}>
                {ins.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{ins.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, color: 'var(--ink-dim)' }}>
                  {ins.oauthPath ? 'SMART on FHIR' : 'Coming soon'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {!isAdding && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--hair)' }}>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, color: 'var(--ink-soft)', marginBottom: 12 }}>
              Don&apos;t see your insurer, or not ready to connect?
            </p>
            <button onClick={handleSkip} disabled={skipping} style={{
              height: 44, padding: '0 20px', borderRadius: 999,
              border: '1px solid var(--btn-ghost-border)', background: 'transparent',
              color: 'var(--ink)', cursor: skipping ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 6, opacity: skipping ? 0.6 : 1,
            }}>
              {skipping ? 'Loading sample…' : 'See a sample dashboard first →'}
            </button>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, color: 'var(--ink-dim)', marginTop: 10 }}>
              Explore Béni with example data. Connect your real insurer anytime.
            </p>
          </div>
        )}
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
