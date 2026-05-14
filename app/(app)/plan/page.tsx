import Link from 'next/link'
import Logo from '@/components/Logo'
import HamburgerMenu from '@/components/HamburgerMenu'
import { createClient } from '@/lib/supabase/server'
import { fetchCMSCoverage, fetchCMSEOBs } from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending, parseBenefitBalance } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'

const navTabs = [
  { label: 'Overview', href: '/dashboard', active: false },
  { label: 'Plan',     href: '/plan',      active: true  },
  { label: 'Terms',    href: '/terms',     active: false },
  { label: 'Settings', href: '/settings',  active: false },
]

const benefits = [
  {
    category: 'Medical',
    color: '#B8D0E8',
    items: [
      { name: 'Primary care visit',    value: '$30 copay',       detail: 'Per visit, after deductible is met' },
      { name: 'Specialist visit',      value: '$60 copay',       detail: 'Referral may be required' },
      { name: 'Urgent care',           value: '$75 copay',       detail: 'Lower cost than ER for non-emergencies' },
      { name: 'Emergency room',        value: '$350 copay',      detail: 'Waived if admitted to hospital' },
      { name: 'Preventive care',       value: '$0',              detail: 'Covered 100% in-network' },
      { name: 'Lab work',              value: '$0 – $50',        detail: 'Depends on test type and lab' },
      { name: 'Imaging (X-ray, MRI)',  value: '20% coinsurance', detail: 'After deductible' },
      { name: 'Inpatient hospital',    value: '20% coinsurance', detail: 'After deductible' },
    ],
  },
  {
    category: 'Dental',
    color: '#C7E5F2',
    items: [
      { name: 'Preventive (cleanings)', value: '$0',              detail: '2 visits per year covered 100%' },
      { name: 'Basic restorative',      value: '20% coinsurance', detail: 'Fillings, extractions' },
      { name: 'Major restorative',      value: '50% coinsurance', detail: 'Crowns, bridges, dentures' },
      { name: 'Annual maximum',         value: '$1,500',          detail: 'Per person per year' },
    ],
  },
  {
    category: 'Vision',
    color: '#D8CDF2',
    items: [
      { name: 'Eye exam', value: '$0',         detail: '1 per year, in-network' },
      { name: 'Frames',   value: 'Up to $150', detail: 'Every 24 months'        },
      { name: 'Lenses',   value: '$20 copay',  detail: 'Per pair per year'      },
      { name: 'Contacts', value: 'Up to $150', detail: 'In lieu of glasses'     },
    ],
  },
  {
    category: 'FSA',
    color: '#FFC4BE',
    items: [
      { name: 'Annual election',   value: '$2,850',  detail: 'Max IRS limit 2026'            },
      { name: 'Current balance',   value: '$842.50', detail: 'Available to spend'            },
      { name: 'Deadline',          value: 'Dec 31',  detail: 'Use it or lose it'             },
      { name: 'Eligible expenses', value: 'See list',detail: 'Medical, dental, vision costs' },
    ],
  },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtProgress(met: number | null, total: number | null): { met: string; total: string; pct: number | null } {
  return {
    met:   met   != null ? fmt(met)   : '—',
    total: total != null ? fmt(total) : '—',
    pct:   met != null && total != null && total > 0 ? Math.round((met / total) * 100) : null,
  }
}

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tokenRow }, { data: profile }] = await Promise.all([
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'cms').single(),
    supabase.from('profiles').select('selected_insurer').eq('id', user!.id).single(),
  ])

  let coverage = null
  let claims: ReturnType<typeof parseEOBs> = []
  let benefitBalance: ReturnType<typeof parseBenefitBalance> = {
    deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null,
  }

  if (tokenRow) {
    try {
      const accessToken = await getValidAccessToken(tokenRow)
      const patientId   = decryptToken(tokenRow.patient_id)
      if (accessToken && patientId) {
        const [coverageBundle, eobBundle] = await Promise.all([
          fetchCMSCoverage(patientId, accessToken),
          fetchCMSEOBs(patientId, accessToken),
        ])
        const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
        const eobResources      = eobBundle.entry?.map(e => e.resource) ?? []
        coverage       = coverageResources[0] ? parseCoverage(coverageResources[0]) : null
        claims         = parseEOBs(eobResources)
        benefitBalance = parseBenefitBalance(eobResources)
      }
    } catch (err) {
      console.error('Plan page FHIR fetch failed:', err)
    }
  }

  const { totalPatient } = calculateSpending(claims)

  const planName    = coverage?.planName    ?? profile?.selected_insurer ?? 'Your plan'
  const planType    = coverage?.planType    ?? null
  const insurerName = coverage?.insurerName ?? profile?.selected_insurer ?? null

  const deductibleTotal = benefitBalance.deductibleTotal
  const oopTotal        = benefitBalance.oopTotal
  const deductibleMet   = benefitBalance.deductibleMet ?? (deductibleTotal != null ? Math.min(totalPatient, deductibleTotal) : null)
  const oopMet          = benefitBalance.oopMet        ?? (oopTotal        != null ? Math.min(totalPatient, oopTotal)        : null)

  const deductible = fmtProgress(deductibleMet, deductibleTotal)
  const oop        = fmtProgress(oopMet, oopTotal)

  const subtitle = [planName, planType, 'Effective Jan 1, 2026'].filter(Boolean).join(' · ')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HamburgerMenu />
        </div>
      </header>

      <main style={{ maxWidth: 'var(--container-web)', margin: '0 auto', padding: '40px 28px' }}>
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 6 }}>Plan details</h1>
        <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 36 }}>{subtitle}</p>

        {/* Progress bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Deductible',      ...deductible, color: 'var(--beni-sky)' },
            { label: 'Out-of-pocket max', ...oop,      color: '#9B5BFF'         },
          ].map((bar) => (
            <div key={bar.label} className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="t-overline" style={{ color: 'var(--fg-3)' }}>{bar.label}</span>
                <span className="t-caption" style={{ color: 'var(--fg-3)' }}>
                  {bar.pct != null ? `${bar.pct}% met` : 'Not reported'}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--beni-line)', borderRadius: 999, marginBottom: 10 }}>
                <div style={{
                  width: `${bar.pct ?? 0}%`, height: '100%',
                  borderRadius: 999, background: bar.color, transition: 'width 600ms',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {bar.met}
                </span>
                <span className="t-body-s" style={{ color: 'var(--fg-4)' }}>of {bar.total}</span>
              </div>
            </div>
          ))}
        </div>

        {deductibleTotal == null && tokenRow && (
          <div style={{ marginBottom: 32, padding: '12px 16px', background: 'var(--bg-sunken)', borderRadius: 'var(--r-4)' }}>
            <p className="t-caption" style={{ color: 'var(--fg-3)' }}>
              Deductible and out-of-pocket limits aren't reported by your insurer via this connection. Check your plan documents or insurer portal for exact limits.
            </p>
          </div>
        )}

        {/* Benefit categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {benefits.map((section) => (
            <div key={section.category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: section.color }} />
                <p className="t-overline" style={{ color: 'var(--fg-3)' }}>{section.category}</p>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {section.items.map((item, i) => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '14px 20px', gap: 16,
                    borderBottom: i < section.items.length - 1 ? 'var(--border-hairline)' : 'none',
                  }}>
                    <div>
                      <p className="t-body-strong" style={{ color: 'var(--fg-1)', marginBottom: 2 }}>{item.name}</p>
                      <p className="t-caption" style={{ color: 'var(--fg-4)' }}>{item.detail}</p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontWeight: 700, fontSize: 14, color: 'var(--fg-1)',
                      fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--beni-sky-12)', borderRadius: 'var(--r-4)' }}>
          <p className="t-body-s" style={{ color: 'var(--beni-sky)' }}>
            Unsure what these terms mean?{' '}
            <Link href="/terms" style={{ fontWeight: 700, color: 'var(--beni-sky)' }}>Read plain-English explanations →</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
