'use client'

import { useState, useMemo } from 'react'
import ClaimDetailDrawer from './ClaimDetailDrawer'
import type { ParsedClaim } from '@/lib/fhir/parsers'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import { fmt, formatDateShort } from '@/lib/utils/format'

export type ClaimEntry = {
  eobId: string
  provider: string
  detail: string
  payer: string
  payerKey: string
  payerTone: 'cyan' | 'peach'
  date: string | null
  monthKey: string
  monthLabel: string
  insPaid: number
  oop: number
  status: 'processed' | 'you-paid'
}

interface Props {
  entries: ClaimEntry[]
  claims: ParsedClaim[]
  rawEobs: FHIRExplanationOfBenefit[]
  planYear: string
}

function Chip({ active, tone, onClick, children }: {
  active: boolean; tone?: 'cyan' | 'peach'; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 14px', borderRadius: 999,
      fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
      border: `1px solid ${active ? 'var(--ink)' : 'var(--hair)'}`,
      background: active ? 'var(--surface-2)' : 'transparent',
      color: active ? 'var(--ink)' : 'var(--ink-dim)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      {tone && <span style={{ width: 6, height: 6, borderRadius: 999, background: `var(--tag-${tone}-dot)` }} />}
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: ClaimEntry['status'] }) {
  const map = {
    'processed': { fg: 'var(--ink-soft)', bg: 'var(--surface-1)', label: 'Processed' },
    'you-paid':  { fg: '#E55BB8', bg: 'rgba(229,91,184,0.12)', label: 'You paid' },
  }
  const s = map[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', borderRadius: 6,
      background: s.bg, color: s.fg, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.02em',
    }}>{s.label}</span>
  )
}

function PayerTag({ tone, children }: { tone: 'cyan' | 'peach'; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 9px', borderRadius: 999,
      background: `var(--tag-${tone}-bg)`, color: `var(--tag-${tone}-fg)`,
      fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.02em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: `var(--tag-${tone}-dot)` }} />
      {children}
    </span>
  )
}

export default function ClaimsClient({ entries, claims, rawEobs, planYear }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [selectedClaim, setSelectedClaim] = useState<ParsedClaim | null>(null)

  // Build filter options (All + one per payer present)
  const payerFilters = useMemo(() => {
    const byKey = new Map<string, { key: string; label: string; tone: 'cyan' | 'peach'; count: number }>()
    for (const e of entries) {
      const existing = byKey.get(e.payerKey)
      if (existing) existing.count++
      else byKey.set(e.payerKey, { key: e.payerKey, label: e.payer, tone: e.payerTone, count: 1 })
    }
    return [...byKey.values()]
  }, [entries])

  const filtered = filter === 'all' ? entries : entries.filter(e => e.payerKey === filter)

  const totalIns = filtered.reduce((s, e) => s + e.insPaid, 0)
  const totalOop = filtered.reduce((s, e) => s + e.oop, 0)
  const payerLabel = filter === 'all' ? 'all plans' : (payerFilters.find(f => f.key === filter)?.label ?? 'all plans')

  // Group filtered by month, newest first
  const months = useMemo(() => {
    const groups = new Map<string, { label: string; items: ClaimEntry[] }>()
    for (const e of filtered) {
      const g = groups.get(e.monthKey)
      if (g) g.items.push(e)
      else groups.set(e.monthKey, { label: e.monthLabel, items: [e] })
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([, g]) => g)
  }, [filtered])

  return (
    <>
      <main className="beni-main" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 96 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>{entries.length} claims · plan year {planYear}</div>
          <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)' }} className="beni-hero-title">Activity</h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', maxWidth: 640 }}>Every charge across every plan, newest first. Filter by payer to focus on one.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All · {entries.length}</Chip>
          {payerFilters.map(f => (
            <Chip key={f.key} tone={f.tone} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} · {f.count}
            </Chip>
          ))}
        </div>

        {/* Spending strip */}
        <article style={{ background: '#0F1A2C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, padding: '28px 32px', position: 'relative', overflow: 'hidden', color: '#F4ECDE' }}>
          <div aria-hidden style={{ position: 'absolute', right: -100, top: -120, width: 360, height: 360, borderRadius: 999, background: 'radial-gradient(circle, rgba(122,231,255,0.22) 0%, rgba(155,91,255,0.10) 40%, transparent 70%)' }} />
          <div style={{ position: 'relative', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,236,222,0.55)' }}>Spending so far · {payerLabel}</div>
          <div className="beni-hero-stats" style={{ position: 'relative', marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: 'Insurance paid', value: fmt(totalIns), first: true },
              { label: 'You paid', value: fmt(totalOop) },
              { label: 'Claims', value: String(filtered.length) },
            ].map((s, i) => (
              <div key={s.label} style={{ paddingLeft: i === 0 ? 0 : 32, borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(244,236,222,0.55)', letterSpacing: '0.02em' }}>{s.label}</div>
                <div style={{ marginTop: 6, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 38, letterSpacing: '-0.025em', color: '#FBF6EE', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </article>

        {/* Feed grouped by month */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {months.map(group => (
            <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '4px 0' }}>
                <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{group.label}</span>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{group.items.length} {group.items.length === 1 ? 'claim' : 'claims'}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--hair)' }} />
              </div>
              {group.items.map(c => {
                const claim = claims.find(cl => cl.eobId === c.eobId) ?? null
                return (
                  <button key={c.eobId} onClick={() => claim && setSelectedClaim(claim)} style={{
                    background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 16,
                    padding: '18px 22px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 110px 110px 110px 36px',
                    gap: 22, alignItems: 'center', cursor: 'pointer', textAlign: 'left', width: '100%',
                  }} className="beni-claim-row">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{c.provider}</span>
                        <PayerTag tone={c.payerTone}>{c.payer}</PayerTag>
                      </div>
                      <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{c.detail} · {formatDateShort(c.date)}</div>
                    </div>
                    {[
                      { label: 'Ins. paid', value: c.insPaid === 0 ? '—' : fmt(c.insPaid), dim: c.insPaid === 0, accent: false },
                      { label: 'You paid', value: c.oop === 0 ? '—' : fmt(c.oop), dim: c.oop === 0, accent: c.oop > 0 },
                    ].map(f => (
                      <div key={f.label} className="beni-claim-fig" style={{ textAlign: 'right', minWidth: 86 }}>
                        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', color: 'var(--ink-dim)' }}>{f.label}</div>
                        <div style={{ marginTop: 3, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: f.dim ? 'var(--ink-dim)' : (f.accent ? '#E55BB8' : 'var(--ink)') }}>{f.value}</div>
                      </div>
                    ))}
                    <div className="beni-claim-status" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <StatusBadge status={c.status} />
                    </div>
                    <span aria-hidden className="beni-claim-arrow" style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--hair)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', fontSize: 16 }}>→</span>
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 18, color: 'var(--ink-dim)', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14 }}>
              No claims matching this filter.
            </div>
          )}
        </div>
      </main>

      <ClaimDetailDrawer
        claim={selectedClaim}
        rawEob={selectedClaim ? rawEobs.find(e => e.id === selectedClaim.eobId) : undefined}
        open={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </>
  )
}
