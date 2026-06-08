import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import type { Payer, PayerData } from '@/lib/fhir/multi-payer'
import { parseEOB } from '@/lib/fhir/parsers'
import type { InboxEOB, InboxReconciliationKey } from './types'

const PAYER_NAMES: Record<Payer, string> = {
  cms:   'Medicare',
  cigna: 'Cigna',
  bcbs:  'BlueCross BlueShield MN',
  aetna: 'Aetna',
}

// Convert a single FHIR EOB to an InboxEOB. Reuses the existing parser
// for the basic fields and adds inbox-specific shape: cross-payer ID,
// denial signal, reconciliation key, raw resource pointer.
export function toInboxEOB(
  eob: FHIRExplanationOfBenefit,
  payer: Payer,
  fetchedAt: string,
): InboxEOB {
  const parsed = parseEOB(eob)

  // Cheap denial heuristic — paid $0 of something charged. The audit
  // engine (#91) will replace this with proper CARC code analysis.
  const hasDenial   = parsed.amountCharged > 0 && parsed.amountPaid === 0
  const fullyDenied = hasDenial && eob.outcome !== 'partial'

  return {
    kind:        'eob',
    id:          `${payer}:${parsed.eobId}`,
    payer,
    payerName:   PAYER_NAMES[payer],
    eobId:       parsed.eobId,
    serviceDate: parsed.serviceDate,
    provider:    parsed.provider,
    claimType:   parsed.claimType,
    amounts: {
      charged: parsed.amountCharged,
      paid:    parsed.amountPaid,
      patient: parsed.amountPatient,
    },
    status:  parsed.status,
    outcome: eob.outcome ?? null,
    denial: {
      hasDenial,
      fullyDenied,
      partiallyDenied: hasDenial && eob.outcome === 'partial',
    },
    rawResource: eob,
    fetchedAt,
    reconciliationKey: buildReconciliationKey(parsed.serviceDate, parsed.provider, parsed.amountPatient),
  }
}

// Convert a batch of EOBs and sort by service date descending (most
// recent first). Filters out cancelled/draft EOBs the same way
// parseEOBs does for legacy claim views.
export function toInboxEOBs(
  eobs: FHIRExplanationOfBenefit[],
  payer: Payer,
  fetchedAt: string = new Date().toISOString(),
): InboxEOB[] {
  return eobs
    .filter(e => e.status === 'active')
    .map(e => toInboxEOB(e, payer, fetchedAt))
    .sort(byServiceDateDesc)
}

function byServiceDateDesc(a: InboxEOB, b: InboxEOB): number {
  if (!a.serviceDate) return 1
  if (!b.serviceDate) return -1
  return b.serviceDate.localeCompare(a.serviceDate)
}

function buildReconciliationKey(
  serviceDate: string | null,
  provider: string,
  amountPatient: number,
): InboxReconciliationKey {
  return {
    serviceDate,
    providerNorm: normalizeProvider(provider),
    amountCents:  Math.round(amountPatient * 100),
  }
}

function normalizeProvider(provider: string): string {
  return provider.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Cross-payer aggregation entry point for the inbox page (#87). Takes the
// existing PayerData[] from fetchAllPayersData() and produces a flat,
// chronologically-sorted feed of InboxEOBs ready for the UI.
export function aggregateInboxItems(
  payerData: PayerData[],
  fetchedAt: string = new Date().toISOString(),
): InboxEOB[] {
  return payerData
    .flatMap(d => toInboxEOBs(d.rawEobs, d.payer, fetchedAt))
    .sort(byServiceDateDesc)
}
