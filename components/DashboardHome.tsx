'use client'

import { useState } from 'react'
import Link from 'next/link'
import ClaimDetailDrawer from './ClaimDetailDrawer'
import type { ParsedClaim } from '@/lib/fhir/parsers'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import { fmt, formatDateShort } from '@/lib/utils/format'
import TermTooltip from './TermTooltip'

const BRAND_GRADIENT = 'linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)'

export type PlanCardData = {
  payer: string
  carrier: string
  plan: string
  memberId: string
  insPaid: number
  oop: number
  claims: number
  deductible: { used: number; total: number; met: boolean } | null
  oopMax: { used: number; total: number } | null
}

export type ActivityItem = {
  eobId: string
  provider: string
  detail: string
  payer: string
  payerTone: 'cyan' | 'peach'
  date: string | null
  insPaid: number
  oop: number
}

export type ForYouItem = { title: string; body: string; cta: string; ctaHref: string }

interface Props {
  greeting: string
  isConnected: boolean
  totals: { insPaid: number; oop: number; claims: number }
  plans: PlanCardData[]
  forYou: ForYouItem[]
  activity: ActivityItem[]
  claims: ParsedClaim[]
  rawEobs: FHIRExplanationOfBenefit[]
}

// Per-payer pastel theming for plan cards
const PLAN_THEME: Record<string, { bg: string; ink: string; accent: string }> = {
  cms:   { bg: '#C7E5F2', ink: '#0B2A3D', accent: '#5BA8FF' },
  cigna: { bg: '#FFC4BE', ink: '#3D1612', accent: '#E55BB8' },
  bcbs:  { bg: '#B8D0E8', ink: '#0B2A3D', accent: '#5BA8FF' },
  aetna: { bg: '#D8CDF2', ink: '#1A0E2E', accent: '#9B5BFF' },
}
const DEFAULT_THEME = { bg: '#D8CDF2', ink: '#1A0E2E', accent: '#9B5BFF' }

function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text',
      color: 'transparent', fontStyle: 'italic',
      fontFamily: 'var(--font-instrument-serif), serif', fontWeight: 400,
    }}>{children}</span>
  )
}

function SectionHeader({ title, sub, actionLabel, actionHref }: {
  title: string; sub?: string; actionLabel?: string; actionHref?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{title}</h2>
        {sub && <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{sub}</span>}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--accent-sky)', textDecoration: 'none', flexShrink: 0 }}>
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}

function PayerTag({ tone, children }: { tone: 'cyan' | 'peach'; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 22, padding: '0 9px', borderRadius: 999,
      background: `var(--tag-${tone}-bg)`, color: `var(--tag-${tone}-fg)`,
      fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.02em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: `var(--tag-${tone}-dot)` }} />
      {children}
    </span>
  )
}

function PlanMeter({ ink, accent, label, right, pct, met }: {
  ink: string; accent: string; label: React.ReactNode; right: string; pct: number; met?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5 }}>
        <span style={{ color: ink, opacity: 0.72, fontWeight: 600 }}>{label}</span>
        <span style={{ color: ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {met && <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />}
          {right}
        </span>
      </div>
      <div style={{ marginTop: 8, height: 4, background: 'rgba(0,0,0,0.10)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: accent, borderRadius: 999 }} />
      </div>
    </div>
  )
}

function PlanCard({ p }: { p: PlanCardData }) {
  const theme = PLAN_THEME[p.payer] ?? DEFAULT_THEME
  const dedPct = p.deductible ? (p.deductible.met ? 100 : Math.round((p.deductible.used / Math.max(1, p.deductible.total)) * 100)) : 0
  const oopPct = p.oopMax ? Math.round((p.oopMax.used / Math.max(1, p.oopMax.total)) * 100) : 0
  return (
    <article style={{ background: theme.bg, color: theme.ink, borderRadius: 22, padding: '26px 26px 22px', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.ink, opacity: 0.55 }}>{p.carrier}</div>
          <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 21, letterSpacing: '-0.01em', color: theme.ink }}>{p.plan}</h3>
        </div>
        <div style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11, color: theme.ink, opacity: 0.55, marginTop: 6 }}>{p.memberId}</div>
      </header>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Ins. paid', value: fmt(p.insPaid) },
          { label: 'OOP', value: fmt(p.oop) },
          { label: 'Claims', value: String(p.claims) },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', color: theme.ink, opacity: 0.6 }}>{s.label}</div>
            <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '-0.015em', color: theme.ink, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {(p.deductible || p.oopMax) && (
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.deductible && (
            <PlanMeter ink={theme.ink} accent={theme.accent} label={<TermTooltip term="deductible">Deductible</TermTooltip>}
              right={p.deductible.met ? 'Met' : `${fmt(p.deductible.used)} of ${fmt(p.deductible.total)}`}
              pct={dedPct} met={p.deductible.met} />
          )}
          {p.oopMax && (
            <PlanMeter ink={theme.ink} accent={theme.accent} label={<TermTooltip term="oop-max">Out-of-pocket max</TermTooltip>}
              right={`${fmt(p.oopMax.used)} of ${fmt(p.oopMax.total)}`} pct={oopPct} />
          )}
        </div>
      )}
    </article>
  )
}

export default function DashboardHome({ greeting, isConnected, totals, plans, forYou, activity, claims, rawEobs }: Props) {
  const [selectedClaim, setSelectedClaim] = useState<ParsedClaim | null>(null)

  const oopPct = totals.insPaid + totals.oop > 0
    ? Math.round((totals.oop / (totals.insPaid + totals.oop)) * 100)
    : 0

  return (
    <>
      <main className="beni-main" style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 96 }}>

        {/* Hero */}
        <section style={{
          position: 'relative', background: '#0F1A2C',
          borderRadius: 28, padding: '36px 40px 32px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div aria-hidden style={{ position: 'absolute', right: -80, top: -200, width: 520, height: 520, borderRadius: 999, background: 'radial-gradient(circle, rgba(155,91,255,0.55) 0%, rgba(229,91,184,0.32) 35%, transparent 70%)', filter: 'blur(2px)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', left: -40, bottom: -180, width: 380, height: 380, borderRadius: 999, background: 'radial-gradient(circle, rgba(122,231,255,0.34) 0%, rgba(91,168,255,0.18) 40%, transparent 72%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Plan year so far · 2026</div>
            <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#F4ECDE' }} className="beni-hero-title">
              Hello, {greeting}. Here&apos;s where your <GradientWord>coverage</GradientWord> stands.
            </h1>
            <div className="beni-hero-stats" style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 36 }}>
              {([
                { key: 'ins',    label: <>Insurance paid</>,                                                              value: fmt(totals.insPaid),     sub: `across ${plans.length} plan${plans.length !== 1 ? 's' : ''}` },
                { key: 'oop',    label: <TermTooltip term="oop-max">Out of pocket</TermTooltip>,                          value: fmt(totals.oop),         sub: `${oopPct}% of total cost` },
                { key: 'claims', label: <>Claims</>,                                                                      value: String(totals.claims),   sub: 'this plan year' },
              ] as const).map((s, i) => (
                <div key={s.key} style={{
                  paddingLeft: i === 0 ? 0 : 36,
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.10)',
                }}>
                  <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' }}>{s.label}</div>
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 46, letterSpacing: '-0.025em', color: '#FBF6EE', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For you */}
        {forYou.length > 0 && (
          <section>
            <SectionHeader title="For you" sub={`${forYou.length} worth a look`} />
            <div className="beni-accounts-grid">
              {forYou.map((it, i) => (
                <article key={i} style={{ background: i % 2 === 0 ? '#D8CDF2' : '#FFC4BE', borderRadius: 20, padding: '22px 24px 20px', color: '#1A0E2E', overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 18.5, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{it.title}</div>
                  <div style={{ marginTop: 10, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, lineHeight: 1.45, color: 'rgba(26,14,46,0.78)' }}>{it.body}</div>
                  <Link href={it.ctaHref} style={{ marginTop: 16, height: 34, padding: '0 14px', borderRadius: 999, border: '1px solid rgba(26,14,46,0.18)', background: 'rgba(255,255,255,0.55)', color: '#1A0E2E', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                    {it.cta} <span aria-hidden style={{ fontSize: 14 }}>→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Your plans */}
        <section>
          <SectionHeader title="Your plans" sub={isConnected ? `${plans.length} connected` : undefined} actionLabel="Add a plan" actionHref="/onboarding?add=true" />
          {plans.length > 0 ? (
            <div className="beni-accounts-grid">
              {plans.map(p => <PlanCard key={p.payer} p={p} />)}
            </div>
          ) : (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 22, padding: '36px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>No plans connected yet</p>
              <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, color: 'var(--ink-dim)', marginBottom: 20 }}>Connect your insurer to see coverage, claims, and spending.</p>
              <Link href="/onboarding" style={{ display: 'inline-flex', height: 40, padding: '0 18px', borderRadius: 999, background: BRAND_GRADIENT, color: '#0F1A2C', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 13, alignItems: 'center', textDecoration: 'none' }}>Connect insurer</Link>
            </div>
          )}
        </section>

        {/* Spending power placeholder */}
        <section>
          <SectionHeader title="Spending power" sub="HSA · FSA" />
          <article style={{ background: 'var(--surface-2)', border: '1px dashed rgba(155,91,255,0.45)', borderRadius: 22, padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 24, color: 'var(--ink)', position: 'relative', overflow: 'hidden' }} className="beni-spending-power">
            <div aria-hidden style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: 999, background: 'radial-gradient(circle, rgba(155,91,255,0.30) 0%, transparent 70%)' }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontSize: 26, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Soon — your HSA and FSA balances, side by side with your bills.
              </div>
              <p style={{ margin: '10px 0 0', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, maxWidth: 520 }}>
                We&apos;ll surface what&apos;s eligible, what&apos;s expiring, and which account to spend from. Connect an account to get on the early list.
              </p>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{ height: 40, padding: '0 18px', borderRadius: 999, border: 0, background: BRAND_GRADIENT, color: '#0F1A2C', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Connect HSA</button>
              <button style={{ height: 40, padding: '0 18px', borderRadius: 999, border: '1px solid var(--btn-ghost-border)', background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add FSA manually</button>
            </div>
          </article>
        </section>

        {/* Recent activity */}
        {activity.length > 0 && (
          <section>
            <SectionHeader title="Recent activity" sub={`${activity.length} of ${totals.claims} claims`} actionLabel="See all claims" actionHref="/claims" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activity.map(c => {
                const claim = claims.find(cl => cl.eobId === c.eobId) ?? null
                return (
                  <button key={c.eobId} onClick={() => claim && setSelectedClaim(claim)} style={{
                    background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 18,
                    padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 28,
                    alignItems: 'center', cursor: 'pointer', textAlign: 'left', width: '100%',
                  }} className="beni-activity-row">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{c.provider}</span>
                        <PayerTag tone={c.payerTone}>{c.payer}</PayerTag>
                      </div>
                      <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{c.detail} · {formatDateShort(c.date)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 28 }}>
                      {[
                        { label: 'Ins. paid', value: c.insPaid === 0 ? '—' : fmt(c.insPaid), dim: c.insPaid === 0, accent: false },
                        { label: 'OOP', value: c.oop === 0 ? '—' : fmt(c.oop), dim: c.oop === 0, accent: c.oop > 0 },
                      ].map(f => (
                        <div key={f.label} style={{ textAlign: 'right', minWidth: 86 }}>
                          <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', color: 'var(--ink-dim)' }}>{f.label}</div>
                          <div style={{ marginTop: 3, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: f.dim ? 'var(--ink-dim)' : (f.accent ? '#E55BB8' : 'var(--ink)') }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                    <span aria-hidden style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--hair)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', fontSize: 16 }}>→</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Claim detail drawer */}
      <ClaimDetailDrawer
        claim={selectedClaim}
        rawEob={selectedClaim ? rawEobs.find(e => e.id === selectedClaim.eobId) : undefined}
        open={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </>
  )
}
