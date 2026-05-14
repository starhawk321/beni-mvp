import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'
import HamburgerMenu from '@/components/HamburgerMenu'
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'
import {
  fetchCMSCoverage, fetchCMSEOBs,
} from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending, parseBenefitBalance } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { encryptToken } from '@/lib/fhir/crypto'

const navTabs = [
  { label: 'Overview', href: '/dashboard', active: true  },
  { label: 'Plan',     href: '/plan',      active: false },
  { label: 'Terms',    href: '/terms',     active: false },
  { label: 'Settings', href: '/settings',  active: false },
]

const CLAIM_ICONS: Record<string, string> = {
  institutional: '🏥',
  professional:  '👨‍⚕️',
  oral:          '🦷',
  pharmacy:      '💊',
  vision:        '👁',
}

const CLAIM_LABELS: Record<string, string> = {
  institutional: 'Hospital / Facility',
  professional:  'Doctor Visit',
  oral:          'Dental',
  pharmacy:      'Prescription',
  vision:        'Vision',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''

  const [{ data: tokenRow }, { data: profile }] = await Promise.all([
    supabase
      .from('fhir_tokens')
      .select('access_token, refresh_token, patient_id, expires_at')
      .eq('user_id', user!.id)
      .eq('payer', 'cms')
      .single(),
    supabase
      .from('profiles')
      .select('selected_insurer, first_name')
      .eq('id', user!.id)
      .single(),
  ])

  const isConnected = !!tokenRow || !!profile?.selected_insurer

  // Live FHIR fetch — no PHI stored in DB
  let coverage      = null
  let claims: ReturnType<typeof parseEOBs> = []
  let benefitBalance: ReturnType<typeof parseBenefitBalance> = {
    deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null,
  }

  if (tokenRow) {
    try {
      const accessToken = await getValidAccessToken(tokenRow)
      if (accessToken) {
        // Persist refreshed token encrypted if it changed
        if (accessToken !== tokenRow.access_token) {
          await supabase.from('fhir_tokens').update({
            access_token: encryptToken(accessToken),
            expires_at:   new Date(Date.now() + 3600_000).toISOString(),
          }).eq('user_id', user!.id).eq('payer', 'cms')
        }

        const [coverageBundle, eobBundle] = await Promise.all([
          fetchCMSCoverage(tokenRow.patient_id, accessToken),
          fetchCMSEOBs(tokenRow.patient_id, accessToken),
        ])

        const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
        const eobResources      = eobBundle.entry?.map(e => e.resource) ?? []
        coverage = coverageResources[0] ? parseCoverage(coverageResources[0]) : null
        claims   = parseEOBs(eobResources)
        benefitBalance = parseBenefitBalance(eobResources)
      }
    } catch (err) {
      console.error('Live FHIR fetch failed:', err)
    }
  }

  const hasFHIRData = !!coverage || claims.length > 0

  // Greeting
  const greeting = profile?.first_name ?? email.split('@')[0]
  const initials  = (profile?.first_name ?? email).slice(0, 1).toUpperCase()

  const { totalPatient } = calculateSpending(claims)

  const planName    = coverage?.planName    ?? 'Your plan'
  const planType    = coverage?.planType    ?? '—'
  const insurerName = coverage?.insurerName ?? profile?.selected_insurer ?? 'Your insurer'

  // Use real benefitBalance values when available, fall back to estimates
  const deductibleTotal = benefitBalance.deductibleTotal ?? 3000
  const oopTotal        = benefitBalance.oopTotal        ?? 6000
  const deductibleMet   = benefitBalance.deductibleMet   ?? Math.min(totalPatient, deductibleTotal)
  const oopMet          = benefitBalance.oopMet          ?? Math.min(totalPatient, oopTotal)

  const accountCards = [
    { label: 'Medical', color: '#B8D0E8', balance: fmt(totalPatient), sub: `${insurerName} ${planType} · Active` },
    { label: 'Dental',  color: '#C7E5F2', balance: '$0.00',           sub: `${insurerName} Dental · Active` },
    { label: 'FSA',     color: '#FFC4BE', balance: '$842.50',         sub: 'Expires Dec 31' },
    { label: 'Vision',  color: '#D8CDF2', balance: '$150.00',         sub: 'Annual benefit' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <nav className="beni-nav-pills" style={{ gap: 2, background: 'var(--bg-sunken)', borderRadius: 'var(--r-pill)', padding: 3 }}>
          {navTabs.map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              height: 32, padding: '0 16px', borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
              background: tab.active ? 'var(--beni-ink)' : 'transparent',
              color: tab.active ? '#fff' : 'var(--fg-3)',
              textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--beni-navy)', color: 'var(--fg-on-navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 13,
          }}>
            {initials}
          </div>
          <SignOutButton />
          <HamburgerMenu />
        </div>
      </header>

      <main className="beni-main">
        <h1 className="t-display-l" style={{ color: 'var(--fg-1)', marginBottom: 28 }}>
          Hello, {greeting}.
        </h1>

        {/* Hero balance card */}
        <div style={{
          background: 'var(--beni-navy)', borderRadius: 'var(--r-6)',
          padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,161,153,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: -20, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,153,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <p className="t-overline" style={{ color: 'rgba(244,236,222,0.6)', marginBottom: 8 }}>
            {hasFHIRData ? 'Total out-of-pocket this year' : isConnected ? 'Connected — fetching your data…' : 'No insurer connected'}
          </p>
          <p className="beni-hero-number" style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 64, color: '#fff', fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
            {hasFHIRData ? fmt(totalPatient) : '—'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Deductible met', value: `${fmt(deductibleMet)} / ${fmt(deductibleTotal)}` },
              { label: 'Out-of-pocket',  value: `${fmt(oopMet)} / ${fmt(oopTotal)}`               },
              { label: 'Claims paid',    value: isConnected ? String(claims.length) : '—'          },
            ].map((item) => (
              <div key={item.label} style={{ background: 'rgba(255,231,194,.18)', backdropFilter: 'blur(4px)', borderRadius: 'var(--r-pill)', padding: '8px 16px' }}>
                <span className="t-caption" style={{ color: 'rgba(244,236,222,0.7)', display: 'block', marginBottom: 2 }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="beni-dashboard-grid">
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Account cards */}
            <div>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Your accounts</p>
              {isConnected ? (
                <div className="beni-accounts-grid">
                  {accountCards.map((acct) => (
                    <Link key={acct.label} href="/plan" style={{ textDecoration: 'none' }}>
                      <div className="card" style={{ padding: 22, borderLeft: `6px solid ${acct.color}`, cursor: 'pointer' }}>
                        <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>{acct.label}</p>
                        <p className="t-numeric-l" style={{ color: 'var(--fg-1)', marginBottom: 4 }}>{acct.balance}</p>
                        <p className="t-caption" style={{ color: 'var(--fg-4)' }}>{acct.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                  borderRadius: 'var(--r-5)', padding: '36px 24px',
                  textAlign: 'center', boxShadow: 'var(--shadow-1)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--r-3)',
                    background: 'var(--beni-navy-12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, margin: '0 auto 16px',
                  }}>🔗</div>
                  <p className="t-body-strong" style={{ color: 'var(--fg-1)', marginBottom: 6 }}>No accounts synced</p>
                  <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 20 }}>
                    Connect your insurer to see your plan details, deductible, and spending.
                  </p>
                  <Link href="/onboarding" style={{
                    display: 'inline-flex', alignItems: 'center',
                    height: 36, padding: '0 18px', borderRadius: 'var(--r-pill)',
                    background: 'var(--action-primary)', color: '#ffe9cf',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    fontFamily: 'var(--font-manrope), sans-serif',
                  }}>
                    Connect insurer
                  </Link>
                </div>
              )}
            </div>

            {/* Claims feed */}
            <div>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Recent activity</p>
              {claims.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {claims.slice(0, 6).map((claim) => (
                    <div key={claim.eobId} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                      borderRadius: 'var(--r-4)', padding: '14px 16px', boxShadow: 'var(--shadow-1)',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--r-3)',
                        background: 'var(--beni-navy-12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        {CLAIM_ICONS[claim.claimType] ?? '🏥'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>
                          {CLAIM_LABELS[claim.claimType] ?? 'Medical Claim'}
                        </p>
                        <p className="t-caption" style={{ color: 'var(--fg-4)' }}>{formatDate(claim.serviceDate)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
                          {fmt(claim.amountPatient)}
                        </p>
                        <span className="badge badge-positive" style={{ marginTop: 4 }}>Processed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                  borderRadius: 'var(--r-4)', padding: '32px 24px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 28, marginBottom: 10 }}>🏥</p>
                  <p className="t-body-strong" style={{ color: 'var(--fg-2)', marginBottom: 4 }}>No claims yet</p>
                  <p className="t-body-s" style={{ color: 'var(--fg-4)' }}>Claims will appear here once your insurer reports them.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Today card */}
            <div style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--r-5)', padding: 22 }}>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Today</p>
              <p className="t-display-m" style={{ color: 'var(--fg-1)', marginBottom: 16, fontSize: 22 }}>
                Three things are ready for you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { text: 'FSA deadline in 7 months — $842 to use', color: 'var(--beni-coral)' },
                  { text: 'Annual eye exam benefit available',       color: 'var(--beni-peach)' },
                  { text: 'Deductible tracking started',            color: 'var(--beni-sun)'   },
                ].map((item) => (
                  <div key={item.text} style={{ paddingLeft: 12, borderLeft: `4px solid ${item.color}` }}>
                    <p className="t-body-s" style={{ color: 'var(--fg-2)' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan card */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="t-overline" style={{ color: 'var(--fg-3)' }}>Your plan</p>
                <Link href="/plan" className="t-caption" style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>View details →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Plan',       value: planName            },
                  { label: 'Type',       value: planType            },
                  { label: 'Insurer',    value: insurerName         },
                  { label: 'Deductible', value: fmt(deductibleTotal) },
                  { label: 'OOP max',    value: fmt(oopTotal)       },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 10, borderBottom: 'var(--border-hairline)' }}>
                    <span className="t-body-s" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>{row.label}</span>
                    <span className="t-body-s" style={{ color: 'var(--fg-1)', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
