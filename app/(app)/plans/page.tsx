import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  fetchCMSCoverage, fetchCMSEOBs,
  fetchCMSEligibility, fetchCignaEligibility, fetchBCBSEligibility,
} from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending, parseBenefitBalance, parseEligibility } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'

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

  const [{ data: tokenRows }, { data: profile }] = await Promise.all([
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at, payer').eq('user_id', user!.id),
    supabase.from('profiles').select('selected_insurer').eq('id', user!.id).single(),
  ])

  // Use first available token for plan details (CMS preferred for backward compat)
  const tokenRow = tokenRows?.find(t => t.payer === 'cms')
                 ?? tokenRows?.find(t => t.payer === 'cigna')
                 ?? tokenRows?.find(t => t.payer === 'bcbs')
                 ?? null
  const activePayer = (tokenRow?.payer ?? null) as 'cms' | 'cigna' | 'bcbs' | null

  let coverage = null
  let claims: ReturnType<typeof parseEOBs> = []
  let benefitBalance: ReturnType<typeof parseBenefitBalance> = {
    deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null,
  }
  let eligibility: ReturnType<typeof parseEligibility> = null

  if (tokenRow && activePayer) {
    try {
      const accessToken = await getValidAccessToken(tokenRow, activePayer)
      const patientId   = decryptToken(tokenRow.patient_id)
      if (accessToken && patientId) {
        const eligibilityFetch =
          activePayer === 'cigna' ? fetchCignaEligibility(patientId, accessToken) :
          activePayer === 'bcbs'  ? fetchBCBSEligibility(patientId, accessToken)  :
                                    fetchCMSEligibility(patientId, accessToken)

        const [coverageBundle, eobBundle, eligibilityResult] = await Promise.allSettled([
          fetchCMSCoverage(patientId, accessToken),
          fetchCMSEOBs(patientId, accessToken),
          eligibilityFetch,
        ])

        if (coverageBundle.status === 'fulfilled') {
          const coverageResources = coverageBundle.value.entry?.map(e => e.resource) ?? []
          coverage = coverageResources[0] ? parseCoverage(coverageResources[0]) : null
        }
        if (eobBundle.status === 'fulfilled') {
          const eobResources = eobBundle.value.entry?.map(e => e.resource) ?? []
          claims         = parseEOBs(eobResources)
          benefitBalance = parseBenefitBalance(eobResources)
        }
        if (eligibilityResult.status === 'fulfilled') {
          const eligResources = eligibilityResult.value.entry?.map(e => e.resource) ?? []
          eligibility = parseEligibility(eligResources)
        }
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
    <div>
      <main className="beni-main">
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 6 }}>Plan details</h1>
        <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 24 }}>{subtitle}</p>

        {eligibility && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 'var(--r-pill)',
            background: eligibility.inforce ? 'var(--status-positive-bg)' : 'var(--bg-sunken)',
            color: eligibility.inforce ? 'var(--status-positive)' : 'var(--fg-3)',
            marginBottom: 28, alignSelf: 'flex-start', width: 'fit-content',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: eligibility.inforce ? 'var(--status-positive)' : 'var(--fg-4)',
            }} />
            <span className="t-caption" style={{ fontWeight: 600 }}>
              {eligibility.inforce ? 'Coverage active' : `Coverage ${eligibility.outcome}`}
              {eligibility.periodEnd && ` · through ${new Date(eligibility.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>
          </div>
        )}

        {/* Progress bars */}
        <div className="beni-progress-grid" style={{ marginBottom: 40 }}>
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
