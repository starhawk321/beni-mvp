'use client'

import { useState } from 'react'
import Link from 'next/link'
import ClaimsDrawer from './ClaimsDrawer'
import ClaimDetailDrawer from './ClaimDetailDrawer'
import type { ParsedClaim, BenefitBalanceSummary } from '@/lib/fhir/parsers'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import { fmt, formatDateShort } from '@/lib/utils/format'

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

function fmtProgress(met: number | null, total: number | null): string {
  if (met == null && total == null) return '—'
  if (total == null) return `${fmt(met!)} / —`
  if (met == null)   return `— / ${fmt(total)}`
  return `${fmt(met)} / ${fmt(total)}`
}

interface AccountCard { label: string; color: string; balance: string; sub: string }

interface Props {
  greeting: string
  claims: ParsedClaim[]
  rawEobs: FHIRExplanationOfBenefit[]
  hasFHIRData: boolean
  isConnected: boolean
  totalPatient: number
  benefitBalance: BenefitBalanceSummary
  deductibleMet: number | null
  deductibleTotal: number | null
  oopMet: number | null
  oopTotal: number | null
  planName: string
  planType: string
  insurerName: string
  accountCards: AccountCard[]
}

type DrawerType = 'oop' | 'deductible' | 'claims' | null

export default function DashboardInteractive({
  greeting, claims, rawEobs, hasFHIRData, isConnected,
  totalPatient, benefitBalance,
  deductibleMet, deductibleTotal, oopMet, oopTotal,
  planName, planType, insurerName, accountCards,
}: Props) {
  const [openDrawer, setOpenDrawer]     = useState<DrawerType>(null)
  const [selectedClaim, setSelectedClaim] = useState<ParsedClaim | null>(null)

  return (
    <>
      <main className="beni-main">
        <h1 className="t-display-l" style={{ color: 'var(--fg-1)', marginBottom: 28 }}>
          Hello, {greeting}.
        </h1>

        {/* Hero balance card */}
        <div className="beni-hero-card" style={{
          background: 'var(--beni-navy)', borderRadius: 'var(--r-6)',
          padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,161,153,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: -20, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,153,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <p className="t-overline" style={{ color: 'rgba(244,236,222,0.6)', marginBottom: 8 }}>
            {hasFHIRData ? 'Total out-of-pocket this year' : isConnected ? 'Connected — fetching your data…' : 'No insurer connected'}
          </p>
          <button
            onClick={() => hasFHIRData && setOpenDrawer('oop')}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: hasFHIRData ? 'pointer' : 'default',
              display: 'block', marginBottom: 24,
            }}
          >
            <p className="beni-hero-number" style={{
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 64,
              color: '#fff', fontVariantNumeric: 'tabular-nums', margin: 0,
              textDecoration: hasFHIRData ? 'underline' : 'none',
              textDecorationStyle: 'dotted', textDecorationColor: 'rgba(255,255,255,0.3)',
              textUnderlineOffset: 6,
            }}>
              {hasFHIRData ? fmt(totalPatient) : '—'}
            </p>
          </button>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              {
                label: 'Deductible met',
                value: fmtProgress(deductibleMet, deductibleTotal),
                drawer: 'deductible' as DrawerType,
                clickable: hasFHIRData,
              },
              {
                label: 'Out-of-pocket',
                value: fmtProgress(oopMet, oopTotal),
                drawer: 'oop' as DrawerType,
                clickable: hasFHIRData,
              },
              {
                label: 'Claims paid',
                value: isConnected ? String(claims.length) : '—',
                drawer: 'claims' as DrawerType,
                clickable: isConnected && claims.length > 0,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.clickable && setOpenDrawer(item.drawer)}
                style={{
                  background: 'rgba(255,231,194,.18)', backdropFilter: 'blur(4px)',
                  borderRadius: 'var(--r-pill)', padding: '8px 16px',
                  border: 'none', cursor: item.clickable ? 'pointer' : 'default',
                  textAlign: 'left',
                  outline: 'none',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { if (item.clickable) e.currentTarget.style.background = 'rgba(255,231,194,.28)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,231,194,.18)' }}
              >
                <span className="t-caption" style={{ color: 'rgba(244,236,222,0.7)', display: 'block', marginBottom: 2 }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                  {item.value}
                  {item.clickable && <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>›</span>}
                </span>
              </button>
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
                    <Link key={acct.label} href="/plans" style={{ textDecoration: 'none' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="t-overline" style={{ color: 'var(--fg-3)' }}>Recent activity</p>
                {claims.length > 6 && (
                  <button
                    onClick={() => setOpenDrawer('claims')}
                    className="t-caption"
                    style={{ color: 'var(--beni-sky)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    See all →
                  </button>
                )}
              </div>
              {claims.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {claims.slice(0, 6).map((claim) => (
                    <button
                      key={claim.eobId}
                      onClick={() => setSelectedClaim(claim)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                        borderRadius: 'var(--r-4)', padding: '14px 16px', boxShadow: 'var(--shadow-1)',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-sunken)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--r-3)',
                        background: 'var(--beni-navy-12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        {CLAIM_ICONS[claim.claimType] ?? '🏥'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="t-body-strong" style={{ color: 'var(--fg-1)', margin: 0 }}>
                          {CLAIM_LABELS[claim.claimType] ?? 'Medical Claim'}
                        </p>
                        <p className="t-caption" style={{ color: 'var(--fg-4)', margin: 0 }}>{formatDateShort(claim.serviceDate)}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
                          {fmt(claim.amountPatient)}
                        </p>
                        <span className="badge badge-positive" style={{ marginTop: 4 }}>Processed</span>
                      </div>
                    </button>
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
                <Link href="/plans" className="t-caption" style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>View details →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Plan',       value: planName    },
                  { label: 'Type',       value: planType    },
                  { label: 'Insurer',    value: insurerName },
                  { label: 'Deductible', value: deductibleTotal != null ? fmt(deductibleTotal) : '—' },
                  { label: 'OOP max',    value: oopTotal    != null ? fmt(oopTotal)        : '—' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 10, borderBottom: 'var(--border-hairline)' }}>
                    <span className="t-body-s" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>{row.label}</span>
                    <span className="t-body-s" style={{ color: 'var(--fg-1)', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {deductibleTotal == null && isConnected && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--bg-sunken)', borderRadius: 'var(--r-3)' }}>
                  <p className="t-caption" style={{ color: 'var(--fg-3)' }}>
                    Deductible limits aren't reported by your insurer via this connection. Check your plan documents or insurer portal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Drawers */}
      <ClaimsDrawer
        open={openDrawer === 'oop'}
        onClose={() => setOpenDrawer(null)}
        title="Out-of-pocket breakdown"
        subtitle="Claims that count toward your out-of-pocket maximum"
        claims={claims}
        rawEobs={rawEobs}
      />
      <ClaimsDrawer
        open={openDrawer === 'deductible'}
        onClose={() => setOpenDrawer(null)}
        title="Deductible breakdown"
        subtitle="Claims that count toward your deductible"
        claims={claims}
        rawEobs={rawEobs}
      />
      <ClaimsDrawer
        open={openDrawer === 'claims'}
        onClose={() => setOpenDrawer(null)}
        title="All claims"
        subtitle={`${claims.length} processed claim${claims.length !== 1 ? 's' : ''}`}
        claims={claims}
        rawEobs={rawEobs}
      />
      <ClaimDetailDrawer
        claim={selectedClaim}
        rawEob={selectedClaim ? rawEobs.find(e => e.id === selectedClaim.eobId) : undefined}
        open={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </>
  )
}
