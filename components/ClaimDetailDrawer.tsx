'use client'

import Drawer from './Drawer'
import type { ParsedClaim } from '@/lib/fhir/parsers'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import { fmt, formatDate } from '@/lib/utils/format'

const CLAIM_LABELS: Record<string, string> = {
  institutional: 'Hospital / Facility',
  professional:  'Doctor Visit',
  oral:          'Dental',
  pharmacy:      'Prescription',
  vision:        'Vision',
}

const CLAIM_ICONS: Record<string, string> = {
  institutional: '🏥',
  professional:  '👨‍⚕️',
  oral:          '🦷',
  pharmacy:      '💊',
  vision:        '👁',
}

interface Props {
  claim: ParsedClaim | null
  rawEob?: FHIRExplanationOfBenefit
  open: boolean
  onClose: () => void
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: 'var(--border-hairline)' }}>
      <span className="t-body-s" style={{ color: 'var(--fg-3)' }}>{label}</span>
      <span className="t-body-s" style={{ color: 'var(--fg-1)', fontWeight: bold ? 700 : 500, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

export default function ClaimDetailDrawer({ claim, rawEob, open, onClose }: Props) {
  if (!claim) return null

  const label = CLAIM_LABELS[claim.claimType] ?? 'Medical Claim'
  const icon  = CLAIM_ICONS[claim.claimType] ?? '🏥'

  // Extract line items from raw EOB if available
  const lineItems = rawEob?.item?.filter(item =>
    item.productOrService?.coding?.[0]?.display || item.net?.value
  ) ?? []

  return (
    <Drawer open={open} onClose={onClose} title={`${icon} ${label}`} subtitle={formatDate(claim.serviceDate)}>
      {/* Summary */}
      <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
        <Row label="Date"        value={formatDate(claim.serviceDate)} />
        <Row label="Provider"    value={claim.provider} />
        <Row label="Type"        value={label} />
        <Row label="Status"      value={claim.status.charAt(0).toUpperCase() + claim.status.slice(1)} />
        <Row label="Total charged" value={fmt(claim.amountCharged)} />
        <Row label="Insurer paid"  value={fmt(claim.amountPaid)} />
        <Row label="Your share"    value={fmt(claim.amountPatient)} bold />
      </div>

      {/* Line items */}
      {lineItems.length > 0 && (
        <>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 10 }}>Service line items</p>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: 20 }}>
            {lineItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < lineItems.length - 1 ? 'var(--border-hairline)' : 'none',
              }}>
                <span className="t-body-s" style={{ color: 'var(--fg-2)' }}>
                  {item.productOrService?.coding?.[0]?.display ?? `Service ${i + 1}`}
                </span>
                <span className="t-body-s" style={{ color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {item.net?.value != null ? fmt(item.net.value) : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Privacy note */}
      <div style={{ padding: '12px', background: 'var(--beni-sky-12)', borderRadius: 'var(--r-3)' }}>
        <p className="t-caption" style={{ color: 'var(--beni-sky)', margin: 0 }}>
          This data comes directly from your insurer. Beni never stores it.
        </p>
      </div>
    </Drawer>
  )
}
