'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { Suspense } from 'react'

const STEPS = [
  'Connecting to your insurer',
  'Verifying your membership',
  'Fetching plan details',
  'Syncing coverage data',
]

const INSURER_COLORS: Record<string, string> = {
  'Aetna':               '#7B2D8E',
  'Cigna':               '#FF7A00',
  'UnitedHealthcare':    '#002677',
  'Anthem / Blue Cross': '#005EB8',
  'Humana':              '#5C9A1B',
}

function ConnectingScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const insurer = searchParams.get('insurer') ?? 'your insurer'
  const color = INSURER_COLORS[insurer] ?? 'var(--beni-navy)'

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    let cancelled = false

    function runStep(index: number, delay: number) {
      const t1 = setTimeout(() => {
        if (cancelled) return
        if (index >= STEPS.length) {
          setDone(true)
          markComplete()
          return
        }
        setCurrentStep(index)
        const t2 = setTimeout(() => {
          if (cancelled) return
          setCompletedSteps(prev => [...prev, index])
          runStep(index + 1, 300)
        }, 900)
        timeouts.push(t2)
      }, delay)
      timeouts.push(t1)
    }

    runStep(0, 400)

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [])

  async function markComplete() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save selected insurer and mark onboarding complete
    await supabase
      .from('profiles')
      .update({ onboarding_complete: true, selected_insurer: insurer })
      .eq('id', user.id)

    // Trigger FHIR sync — check for conflicts in response
    let destination = '/dashboard'
    try {
      const res  = await fetch('/api/fhir/sync', { method: 'POST' })
      const data = await res.json()
      if (data.hasConflicts) destination = '/onboarding/verify'
    } catch {
      // Sync failure is non-blocking — fall through to dashboard
    }

    setTimeout(() => {
      router.push(destination)
      router.refresh()
    }, 2200)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-canvas)',
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center',
        borderBottom: 'var(--border-hairline)',
      }}>
        <Logo height={26} />
      </header>

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px',
      }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

          {!done ? (
            <>
              {/* Animated ring */}
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 32px' }}>
                <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <circle cx="44" cy="44" r="38" fill="none" stroke="var(--beni-line)" strokeWidth="4" />
                  <circle
                    cx="44" cy="44" r="38"
                    fill="none" stroke={color} strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="238"
                    strokeDashoffset="60"
                    style={{
                      transformOrigin: '44px 44px',
                      animation: 'spin 1.2s linear infinite',
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: color,
                  margin: 10,
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontWeight: 700, fontSize: 18, color: '#fff',
                }}>
                  {insurer.slice(0, 2)}
                </div>
              </div>

              <h1 className="t-h2" style={{ color: 'var(--fg-1)', marginBottom: 8 }}>
                Connecting to {insurer}
              </h1>
              <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 40 }}>
                This takes just a moment. Don't close this tab.
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                {STEPS.map((step, i) => {
                  const isComplete = completedSteps.includes(i)
                  const isActive = currentStep === i && !isComplete
                  return (
                    <div key={step} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px',
                      background: isActive ? 'var(--bg-surface)' : 'transparent',
                      borderRadius: 'var(--r-3)',
                      border: isActive ? 'var(--border-hairline)' : '1px solid transparent',
                      boxShadow: isActive ? 'var(--shadow-1)' : 'none',
                      transition: 'all 300ms',
                      opacity: i > currentStep && !isComplete ? 0.35 : 1,
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isComplete ? 'var(--status-positive-bg)' : isActive ? color : 'var(--beni-line)',
                        transition: 'background 300ms',
                      }}>
                        {isComplete ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--status-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : isActive ? (
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#fff',
                            animation: 'pulse 800ms ease-in-out infinite',
                          }} />
                        ) : null}
                      </div>
                      <span className="t-body-s" style={{
                        color: isComplete ? 'var(--status-positive)' : isActive ? 'var(--fg-1)' : 'var(--fg-4)',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'color 300ms',
                      }}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* Success state */
            <div style={{ animation: 'fadeUp 500ms var(--ease-emphasis) both' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--status-positive-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M7 18l8 8 14-14" stroke="var(--status-positive)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 10 }}>
                Connection established
              </h1>
              <p className="t-body" style={{ color: 'var(--fg-3)', marginBottom: 6 }}>
                Your {insurer} plan is connected.
              </p>
              <p className="t-body-s" style={{ color: 'var(--fg-4)' }}>
                Taking you to your dashboard…
              </p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function ConnectingPage() {
  return (
    <Suspense>
      <ConnectingScreen />
    </Suspense>
  )
}
