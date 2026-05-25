import Link from 'next/link'
import { formatDate } from '@/lib/utils/format'

export type Tone = 'cyan' | 'peach'

export type ConditionItem    = { name: string; code: string | null; onset: string | null; status: string; sources: Tone[] }
export type MedicationItem   = { name: string; dose: string | null; prescriber: string | null; started: string | null; sources: Tone[] }
export type LabItem          = { name: string; value: string; range: string | null; interp: string | null; date: string | null; sources: Tone[] }
export type ImmunizationItem = { name: string; date: string | null; sources: Tone[] }

export type RecordsData = {
  conditions: ConditionItem[]
  medications: MedicationItem[]
  labs: LabItem[]
  immunizations: ImmunizationItem[]
}

function SourceDots({ sources }: { sources: Tone[] }) {
  if (!sources.length) return null
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {sources.map((s, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: `var(--tag-${s}-dot)` }} />
      ))}
    </span>
  )
}

function SectionCard({ title, sub, empty, children }: { title: string; sub?: string; empty?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{title}</h2>
        {sub && <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{sub}</span>}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 20, overflow: 'hidden' }}>
        {empty
          ? <div style={{ padding: 24, color: 'var(--ink-dim)', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14 }}>Not reported by your insurer via this connection.</div>
          : children}
      </div>
    </section>
  )
}

function Divided({ index, children }: { index: number; children: React.ReactNode }) {
  return <div style={{ borderTop: index === 0 ? 'none' : '1px solid var(--hair)' }}>{children}</div>
}

const NAME = { fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.005em' } as const
const META = { fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-soft)' } as const

export default function RecordsClient({ data, sources, isConnected }: {
  data: RecordsData
  sources: { tone: Tone; label: string }[]
  isConnected: boolean
}) {
  if (!isConnected) {
    return (
      <main className="beni-main" style={{ paddingBottom: 96 }}>
        <h1 className="t-h1" style={{ color: 'var(--ink)', marginBottom: 8 }}>Health records</h1>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No insurer connected</p>
          <Link href="/onboarding" style={{ color: 'var(--accent-sky)', textDecoration: 'none', fontWeight: 600 }}>Connect an insurer →</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="beni-main" style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 96 }}>
      {/* Title + privacy badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>Your record</div>
          <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)' }} className="beni-hero-title">Health records</h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', maxWidth: 560 }}>Pulled directly from your insurers. Béni reads — never stores — your clinical data.</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 999 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'linear-gradient(135deg, #7AE7FF 0%, #9B5BFF 60%, #E55BB8 100%)' }} />
          <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Never stored</span>
          <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, color: 'var(--ink-dim)' }}>· read fresh</span>
        </div>
      </div>

      {/* Sources legend */}
      {sources.length > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, color: 'var(--ink-dim)', alignItems: 'center' }}>
          <span>Reported by</span>
          {sources.map(s => (
            <span key={s.tone} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: `var(--tag-${s.tone}-dot)` }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* Conditions */}
      <SectionCard title="Conditions" sub={`${data.conditions.length} on record`} empty={data.conditions.length === 0}>
        {data.conditions.map((c, i) => {
          const resolved = /resolved|inactive/i.test(c.status)
          return (
            <Divided key={i} index={i}>
              <div className="beni-record-row" style={{ padding: '18px 26px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 110px', gap: 24, alignItems: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ ...NAME, opacity: resolved ? 0.55 : 1, textDecoration: resolved ? 'line-through' : 'none' }}>{c.name}</span>
                    <SourceDots sources={c.sources} />
                  </div>
                  {c.code && <div style={{ marginTop: 3, fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11.5, color: 'var(--ink-dim)' }}>{c.code}</div>}
                </div>
                <div style={META}>{c.onset ? `Onset ${formatDate(c.onset)}` : '—'}</div>
                <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 12.5, letterSpacing: '0.02em', color: resolved ? 'var(--ink-dim)' : 'var(--ink)', textAlign: 'right' }}>{c.status}</div>
              </div>
            </Divided>
          )
        })}
      </SectionCard>

      {/* Medications */}
      <SectionCard title="Medications" sub={`${data.medications.length} active`} empty={data.medications.length === 0}>
        {data.medications.map((m, i) => (
          <Divided key={i} index={i}>
            <div className="beni-record-row" style={{ padding: '18px 26px', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) 140px', gap: 24, alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={NAME}>{m.name}</span>
                  <SourceDots sources={m.sources} />
                </div>
                {m.dose && <div style={{ marginTop: 3, ...META }}>{m.dose}</div>}
              </div>
              <div style={META}>{m.prescriber ? <><span style={{ color: 'var(--ink-dim)' }}>Prescribed by </span>{m.prescriber}</> : ''}</div>
              <div style={{ ...META, textAlign: 'right' }}>{m.started ? `Started ${formatDate(m.started)}` : ''}</div>
            </div>
          </Divided>
        ))}
      </SectionCard>

      {/* Lab results */}
      <SectionCard title="Lab results" sub={data.labs.length ? `${data.labs.length} recorded` : undefined} empty={data.labs.length === 0}>
        {data.labs.map((l, i) => (
          <Divided key={i} index={i}>
            <div className="beni-record-row" style={{ padding: '18px 26px', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) 140px 160px 100px', gap: 20, alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={NAME}>{l.name}</span>
                  <SourceDots sources={l.sources} />
                </div>
                {l.range && <div style={{ marginTop: 3, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 12.5, color: 'var(--ink-dim)' }}>Reference range · {l.range}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums' }}>{l.value}</div>
              <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', letterSpacing: '-0.01em' }}>{l.interp ?? ''}</div>
              <div style={{ ...META, textAlign: 'right' }}>{l.date ? formatDate(l.date) : ''}</div>
            </div>
          </Divided>
        ))}
      </SectionCard>

      {/* Immunizations */}
      <SectionCard title="Immunizations" sub={`${data.immunizations.length} on record`} empty={data.immunizations.length === 0}>
        {data.immunizations.map((v, i) => (
          <Divided key={i} index={i}>
            <div className="beni-record-row" style={{ padding: '18px 26px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 20, alignItems: 'center' }}>
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{v.name}</span>
                <SourceDots sources={v.sources} />
              </div>
              <div style={{ ...META, textAlign: 'right' }}>{v.date ? formatDate(v.date) : ''}</div>
            </div>
          </Divided>
        ))}
      </SectionCard>
    </main>
  )
}
