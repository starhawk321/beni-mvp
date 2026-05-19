'use client'

import { useState } from 'react'
import Drawer from './Drawer'
import ClaimDetailDrawer from './ClaimDetailDrawer'
import type { ParsedClaim } from '@/lib/fhir/parsers'
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

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  claims: ParsedClaim[]
  rawEobs?: FHIRExplanationOfBenefit[]
}

export default function ClaimsDrawer({ open, onClose, title, subtitle, claims, rawEobs = [] }: Props) {
  const [selectedClaim, setSelectedClaim] = useState<ParsedClaim | null>(null)

  const total = claims.reduce((s, c) => s + c.amountPatient, 0)

  return (
    <>
      <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle}>
        {/* Total */}
        {claims.length > 0 && (
          <div style={{
            background: 'var(--beni-navy)', borderRadius: 'var(--r-4)',
            padding: '16px', marginBottom: 20,
          }}>
            <p className="t-caption" style={{ color: 'rgba(244,236,222,0.6)', marginBottom: 4 }}>Your total</p>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 28, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(total)}
            </p>
            <p className="t-caption" style={{ color: 'rgba(244,236,222,0.5)', marginTop: 4 }}>
              {claims.length} claim{claims.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🏥</p>
            <p className="t-body-strong" style={{ color: 'var(--fg-2)' }}>No claims found</p>
            <p className="t-body-s" style={{ color: 'var(--fg-4)' }}>Claims will appear here once your insurer reports them.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {claims.map((claim) => {
              const rawEob = rawEobs.find(e => e.id === claim.eobId)
              return (
                <button
                  key={claim.eobId}
                  onClick={() => setSelectedClaim(claim)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                    borderRadius: 'var(--r-4)', padding: '12px 14px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    boxShadow: 'var(--shadow-1)',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-sunken)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-3)',
                    background: 'var(--beni-navy-12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
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
                    <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
                      {fmt(claim.amountPatient)}
                    </p>
                    <p className="t-caption" style={{ color: 'var(--fg-4)', margin: 0 }}>›</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Drawer>

      <ClaimDetailDrawer
        claim={selectedClaim}
        rawEob={selectedClaim ? rawEobs.find(e => e.id === selectedClaim.eobId) : undefined}
        open={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </>
  )
}
