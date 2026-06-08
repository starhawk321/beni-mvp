import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import type { Payer } from '@/lib/fhir/multi-payer'

// The inbox is the daily-use surface for the billing-focused MVP.
// EOBs and (later) provider bills land in it as `InboxItem`s with a
// unified shape so the UI, audit engine, and reconciliation logic can
// treat them uniformly. See docs/strategy.md.

export type InboxItemKind = 'eob' // 'bill' added by #88/#89

export type InboxEOBAmounts = {
  charged: number  // what the provider billed
  paid:    number  // what the payer paid
  patient: number  // what the patient owes
}

export type InboxEOBDenial = {
  // Cheap signal for the inbox to surface "we may have a finding".
  // Full CARC code extraction comes with the audit engine (#91).
  hasDenial:       boolean  // amountPaid === 0 && amountCharged > 0
  fullyDenied:     boolean  // every line denied
  partiallyDenied: boolean  // some lines paid, some denied (best-effort)
}

// Reconciliation key for matching against provider bills landing later
// via photo OCR (#88) or email forwarding (#89). Computed up-front so
// matching is a constant-time hash lookup instead of a join.
export type InboxReconciliationKey = {
  serviceDate:  string | null  // ISO YYYY-MM-DD
  providerNorm: string         // lowercased + alphanumeric only
  amountCents:  number         // patient responsibility in cents (integer)
}

export type InboxEOB = {
  kind: 'eob'

  // Stable cross-payer ID — payer-namespaced so two payers can't collide.
  // Used as React key, URL slug, and reconciliation join key.
  id:        string  // format: `${payer}:${eobId}`
  payer:     Payer
  payerName: string
  eobId:     string  // source EOB id within that payer

  // Display
  serviceDate: string | null
  provider:    string
  claimType:   string

  // Money
  amounts: InboxEOBAmounts

  // Adjudication state
  status:  string         // FHIR status: 'active' | 'cancelled' | 'draft'
  outcome: string | null  // FHIR outcome: 'complete' | 'partial' | 'queued' | 'error'

  // Denial signal — used by audit engine entry + inbox badge
  denial: InboxEOBDenial

  // Source pointer for the audit engine (#91/#92) and the detail page
  rawResource: FHIRExplanationOfBenefit

  // Live-fetch context — surface in UI as "Refreshed N minutes ago"
  fetchedAt: string  // ISO timestamp

  // Pre-computed reconciliation key for #90
  reconciliationKey: InboxReconciliationKey
}

export type InboxItem = InboxEOB  // will become InboxEOB | InboxBill in #88/#89
