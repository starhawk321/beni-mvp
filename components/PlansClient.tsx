'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '@/lib/utils/format'

export type BenefitRow = { label: string; sub: string; cost: string }
export type BenefitSection = { section: string; rows: BenefitRow[] }

export type PlanDetail = {
  payer: string
  carrier: string
  plan: string
  planType: string | null
  memberId: string
  group: string | null
  effective: string | null
  coverageEnd: string | null
  network: string | null
  deductible: { used: number; total: number; met: boolean } | null
  oopMax: { used: number; total: number } | null
  benefits: BenefitSection[]
}

const PLAN_THEME: Record<string, { bg: string; ink: string; accent: string }> = {
  cms:   { bg: '#C7E5F2', ink: '#0B2A3D', accent: '#5BA8FF' },
  cigna: { bg: '#FFC4BE', ink: '#3D1612', accent: '#E55BB8' },
  bcbs:  { bg: '#B8D0E8', ink: '#0B2A3D', accent: '#5BA8FF' },
  aetna: { bg: '#D8CDF2', ink: '#1A0E2E', accent: '#9B5BFF' },
}
const DEFAULT_THEME = { bg: '#D8CDF2', ink: '#1A0E2E', accent: '#9B5BFF' }

function fmtDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function BigMeter({ ink, accent, label, big, remaining, pct, cleared }: {
  ink: string; accent: string; label: string; big: string; remaining: string; pct: number; cleared?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 12.5, color: ink, opacity: 0.72, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        {cleared && <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontSize: 15, color: accent, letterSpacing: '-0.01em' }}>cleared</span>}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', color: ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{big}</div>
      <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: ink, opacity: 0.6 }}>{remaining}</div>
      <div style={{ marginTop: 14, height: 6, background: 'rgba(0,0,0,0.10)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: accent, borderRadius: 999 }} />
      </div>
    </div>
  )
}

export default function PlansClient({ plans, initialPayer }: { plans: PlanDetail[]; initialPayer?: string }) {
  const [selectedId, setSelectedId] = useState(
    plans.find(p => p.payer === initialPayer)?.payer ?? plans[0]?.payer ?? '',
  )
  const p = plans.find(x => x.payer === selectedId) ?? plans[0]

  if (!p) {
    return (
      <main className="beni-main" style={{ paddingBottom: 96 }}>
        <h1 className="t-h1" style={{ color: 'var(--ink)', marginBottom: 8 }}>What&apos;s covered</h1>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No plans connected</p>
          <Link href="/onboarding" style={{ color: 'var(--accent-sky)', textDecoration: 'none', fontWeight: 600 }}>Connect an insurer →</Link>
        </div>
      </main>
    )
  }

  const theme = PLAN_THEME[p.payer] ?? DEFAULT_THEME
  const dedPct = p.deductible ? (p.deductible.met ? 100 : Math.round((p.deductible.used / Math.max(1, p.deductible.total)) * 100)) : 0
  const oopPct = p.oopMax ? Math.round((p.oopMax.used / Math.max(1, p.oopMax.total)) * 100) : 0

  return (
    <main className="beni-main" style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 96 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>Plan details</div>
        <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)' }} className="beni-hero-title">What&apos;s covered</h1>
        <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)' }}>Each plan, on its own terms. Switch carriers to see how the rules change.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4, borderBottom: '1px solid var(--hair)' }}>
        {plans.map(pl => {
          const active = pl.payer === selectedId
          const t = PLAN_THEME[pl.payer] ?? DEFAULT_THEME
          return (
            <button key={pl.payer} onClick={() => setSelectedId(pl.payer)} style={{
              position: 'relative', padding: '14px 18px 16px', background: 'transparent', border: 0, cursor: 'pointer',
              fontFamily: 'var(--font-manrope), sans-serif', textAlign: 'left',
              color: active ? 'var(--ink)' : 'var(--ink-dim)', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: active ? 0.65 : 0.5 }}>{pl.carrier}</span>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>{pl.plan}</span>
              {active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, background: t.accent, borderRadius: 999 }} />}
            </button>
          )
        })}
      </div>

      {/* Coverage status pill */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: -8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 10px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 999 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: theme.accent, boxShadow: `0 0 0 4px ${theme.accent}22` }} />
          <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Coverage active</span>
          {p.coverageEnd && <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>through {fmtDate(p.coverageEnd)}</span>}
        </div>
        <div style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: 'var(--ink-dim)' }}>
          Member · {p.memberId}{p.group ? ` · ${p.group}` : ''}
        </div>
      </div>

      {/* Progress panel */}
      <article style={{ background: theme.bg, color: theme.ink, borderRadius: 24, padding: '32px 32px 28px', overflow: 'hidden' }}>
        <header className="beni-plan-panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.ink, opacity: 0.55 }}>{p.carrier}{p.planType ? ` · ${p.planType}` : ''}</div>
            <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: theme.ink, lineHeight: 1.1 }}>{p.plan}</h2>
            {p.effective && <div style={{ marginTop: 6, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: theme.ink, opacity: 0.6 }}>Effective {p.effective}</div>}
          </div>
          {p.network && (
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: theme.ink, opacity: 0.65, lineHeight: 1.4, maxWidth: 280, textAlign: 'right' }}>
              <strong style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 4 }}>Network</strong>
              {p.network}
            </div>
          )}
        </header>

        {(p.deductible || p.oopMax) ? (
          <div className="beni-plan-meters" style={{ marginTop: 30, background: 'rgba(255,255,255,0.46)', borderRadius: 18, padding: '26px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {p.deductible && (
              <BigMeter ink={theme.ink} accent={theme.accent} label="Deductible"
                big={p.deductible.met ? 'Met' : `${fmt(p.deductible.used)} of ${fmt(p.deductible.total)}`}
                remaining={p.deductible.met ? `${fmt(p.deductible.total)} cleared` : `${fmt(p.deductible.total - p.deductible.used)} to go`}
                pct={dedPct} cleared={p.deductible.met} />
            )}
            {p.oopMax && (
              <BigMeter ink={theme.ink} accent={theme.accent} label="Out-of-pocket max"
                big={`${fmt(p.oopMax.used)} of ${fmt(p.oopMax.total)}`}
                remaining={`${fmt(p.oopMax.total - p.oopMax.used)} remaining`}
                pct={oopPct} />
            )}
          </div>
        ) : (
          <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.46)', borderRadius: 18, padding: '18px 22px' }}>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: theme.ink, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
              Deductible and out-of-pocket limits aren&apos;t reported by your insurer via this connection. Check your plan documents for exact limits.
            </p>
          </div>
        )}
      </article>

      {/* Benefits table */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Covered benefits</h2>
            <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>Specific to this plan</span>
          </div>
        </div>
        {p.benefits.length > 0 ? (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 20, overflow: 'hidden' }}>
            {p.benefits.map((sect, si) => (
              <div key={sect.section} style={{ borderTop: si === 0 ? 'none' : '1px solid var(--hair)' }}>
                <div style={{ padding: '18px 26px 10px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{sect.section}</span>
                  <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, color: 'var(--ink-dim)' }}>{sect.rows.length} {sect.rows.length === 1 ? 'benefit' : 'benefits'}</span>
                </div>
                {sect.rows.map((row, ri) => (
                  <div key={ri} className="beni-benefit-row" style={{ padding: '16px 26px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center', borderTop: '1px solid var(--hair)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{row.label}</div>
                      <div style={{ marginTop: 2, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, color: 'var(--ink-dim)' }}>{row.sub}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.005em', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{row.cost}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 20, padding: '24px 26px' }}>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, color: 'var(--ink-dim)', margin: 0, lineHeight: 1.5 }}>
              Benefit detail isn&apos;t reported by your insurer via this connection. See your plan documents (SBC) for copays, coinsurance, and covered services.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
