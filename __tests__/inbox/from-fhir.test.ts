import { describe, it, expect } from 'vitest'
import { toInboxEOB, toInboxEOBs, aggregateInboxItems } from '@/lib/inbox/from-fhir'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'
import type { PayerData } from '@/lib/fhir/multi-payer'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FETCHED_AT = '2026-06-07T12:00:00.000Z'

function makeEOB(overrides: Partial<FHIRExplanationOfBenefit> = {}): FHIRExplanationOfBenefit {
  return {
    resourceType: 'ExplanationOfBenefit',
    id: 'eob-001',
    status: 'active',
    type: { coding: [{ code: 'professional' }] },
    billablePeriod: { start: '2026-03-15' },
    insurer: { display: 'Aetna' },
    total: [
      { category: { coding: [{ code: 'submitted' }] }, amount: { value: 500, currency: 'USD' } },
      { category: { coding: [{ code: 'benefit'   }] }, amount: { value: 400, currency: 'USD' } },
    ],
    payment: { amount: { value: 400, currency: 'USD' } },
    ...overrides,
  }
}

// ── id + payerName ────────────────────────────────────────────────────────────

describe('toInboxEOB — identity', () => {
  it('namespaces id by payer to prevent cross-payer collision', () => {
    const eob = makeEOB({ id: 'shared-id' })
    expect(toInboxEOB(eob, 'aetna', FETCHED_AT).id).toBe('aetna:shared-id')
    expect(toInboxEOB(eob, 'cigna', FETCHED_AT).id).toBe('cigna:shared-id')
  })

  it('sets payerName from the payer enum', () => {
    expect(toInboxEOB(makeEOB(), 'cms',   FETCHED_AT).payerName).toBe('Medicare')
    expect(toInboxEOB(makeEOB(), 'aetna', FETCHED_AT).payerName).toBe('Aetna')
    expect(toInboxEOB(makeEOB(), 'cigna', FETCHED_AT).payerName).toBe('Cigna')
  })

  it('preserves source eobId separately from the namespaced id', () => {
    const item = toInboxEOB(makeEOB({ id: 'eob-xyz' }), 'aetna', FETCHED_AT)
    expect(item.eobId).toBe('eob-xyz')
    expect(item.id).toBe('aetna:eob-xyz')
  })

  it('stamps fetchedAt for "refreshed N min ago" UI', () => {
    expect(toInboxEOB(makeEOB(), 'cms', FETCHED_AT).fetchedAt).toBe(FETCHED_AT)
  })
})

// ── Denial signal ─────────────────────────────────────────────────────────────

describe('toInboxEOB — denial signal', () => {
  it('flags hasDenial when nothing was paid against a charge', () => {
    const eob = makeEOB({
      total: [
        { category: { coding: [{ code: 'submitted' }] }, amount: { value: 500, currency: 'USD' } },
        { category: { coding: [{ code: 'benefit'   }] }, amount: { value: 0,   currency: 'USD' } },
      ],
      payment: { amount: { value: 0, currency: 'USD' } },
    })
    expect(toInboxEOB(eob, 'aetna', FETCHED_AT).denial.hasDenial).toBe(true)
  })

  it('does not flag hasDenial when payer paid anything', () => {
    expect(toInboxEOB(makeEOB(), 'aetna', FETCHED_AT).denial.hasDenial).toBe(false)
  })

  it('does not flag hasDenial when there was nothing to charge', () => {
    const eob = makeEOB({
      total: [],
      payment: { amount: { value: 0, currency: 'USD' } },
    })
    expect(toInboxEOB(eob, 'aetna', FETCHED_AT).denial.hasDenial).toBe(false)
  })

  it('marks partiallyDenied when outcome is partial', () => {
    const eob = makeEOB({
      outcome: 'partial',
      total: [
        { category: { coding: [{ code: 'submitted' }] }, amount: { value: 500, currency: 'USD' } },
        { category: { coding: [{ code: 'benefit'   }] }, amount: { value: 0,   currency: 'USD' } },
      ],
      payment: { amount: { value: 0, currency: 'USD' } },
    })
    const item = toInboxEOB(eob, 'aetna', FETCHED_AT)
    expect(item.denial.partiallyDenied).toBe(true)
    expect(item.denial.fullyDenied).toBe(false)
  })
})

// ── Reconciliation key ────────────────────────────────────────────────────────

describe('toInboxEOB — reconciliation key', () => {
  it('rounds patient amount to integer cents', () => {
    const eob = makeEOB({
      total: [
        { category: { coding: [{ code: 'submitted' }] }, amount: { value: 100.50, currency: 'USD' } },
        { category: { coding: [{ code: 'benefit'   }] }, amount: { value: 50.25,  currency: 'USD' } },
      ],
      payment: { amount: { value: 50.25, currency: 'USD' } },
    })
    // patient = 100.50 - 50.25 = 50.25 → 5025 cents
    expect(toInboxEOB(eob, 'cms', FETCHED_AT).reconciliationKey.amountCents).toBe(5025)
  })

  it('normalizes provider to lowercase alphanumeric with single spaces', () => {
    const item = toInboxEOB(makeEOB(), 'aetna', FETCHED_AT)
    // provider falls back to insurer "Aetna" → "aetna"
    expect(item.reconciliationKey.providerNorm).toBe('aetna')
  })

  it('strips punctuation in provider names', () => {
    const eob = makeEOB({ insurer: { display: 'St. Joseph’s Hosp. — South Wing' } })
    const item = toInboxEOB(eob, 'cms', FETCHED_AT)
    expect(item.reconciliationKey.providerNorm).toBe('st joseph s hosp south wing')
  })

  it('passes serviceDate through as-is for date-based matching', () => {
    const eob = makeEOB({ billablePeriod: { start: '2026-03-15T10:00:00-04:00' } })
    expect(toInboxEOB(eob, 'aetna', FETCHED_AT).reconciliationKey.serviceDate).toBe('2026-03-15')
  })
})

// ── Batch transforms ──────────────────────────────────────────────────────────

describe('toInboxEOBs — batch', () => {
  it('filters out cancelled / draft EOBs', () => {
    const eobs = [
      makeEOB({ id: 'active-1',   status: 'active'    }),
      makeEOB({ id: 'cancelled',  status: 'cancelled' }),
      makeEOB({ id: 'draft',      status: 'draft'     }),
      makeEOB({ id: 'active-2',   status: 'active'    }),
    ]
    const items = toInboxEOBs(eobs, 'aetna', FETCHED_AT)
    expect(items.map(i => i.eobId)).toEqual(['active-1', 'active-2'])
  })

  it('sorts by serviceDate descending (most recent first)', () => {
    const eobs = [
      makeEOB({ id: 'old',    billablePeriod: { start: '2025-01-01' } }),
      makeEOB({ id: 'newest', billablePeriod: { start: '2026-05-01' } }),
      makeEOB({ id: 'middle', billablePeriod: { start: '2026-01-15' } }),
    ]
    const items = toInboxEOBs(eobs, 'cms', FETCHED_AT)
    expect(items.map(i => i.eobId)).toEqual(['newest', 'middle', 'old'])
  })

  it('puts EOBs with null serviceDate at the end', () => {
    const eobs = [
      makeEOB({ id: 'dated',   billablePeriod: { start: '2026-01-15' } }),
      makeEOB({ id: 'undated', billablePeriod: undefined, created: undefined }),
    ]
    const items = toInboxEOBs(eobs, 'cms', FETCHED_AT)
    expect(items[items.length - 1].eobId).toBe('undated')
  })
})

// ── Cross-payer aggregation ───────────────────────────────────────────────────

describe('aggregateInboxItems', () => {
  function makePayerData(payer: PayerData['payer'], rawEobs: FHIRExplanationOfBenefit[]): PayerData {
    return {
      payer,
      displayName: 'unused',
      coverage: null,
      claims: [],
      rawEobs,
      benefitBalance: { deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null },
    }
  }

  it('flattens and chronologically sorts across multiple payers', () => {
    const payerData: PayerData[] = [
      makePayerData('aetna', [makeEOB({ id: 'a-recent',  billablePeriod: { start: '2026-04-01' } })]),
      makePayerData('cms',   [makeEOB({ id: 'c-oldest',  billablePeriod: { start: '2025-12-01' } })]),
      makePayerData('cigna', [makeEOB({ id: 'g-newest',  billablePeriod: { start: '2026-05-01' } })]),
    ]
    const items = aggregateInboxItems(payerData, FETCHED_AT)
    expect(items.map(i => i.eobId)).toEqual(['g-newest', 'a-recent', 'c-oldest'])
  })

  it('preserves per-item payer identity through aggregation', () => {
    const payerData: PayerData[] = [
      makePayerData('aetna', [makeEOB({ id: 'aetna-1' })]),
      makePayerData('cigna', [makeEOB({ id: 'cigna-1' })]),
    ]
    const items = aggregateInboxItems(payerData, FETCHED_AT)
    const payers = items.map(i => i.payer)
    expect(payers).toContain('aetna')
    expect(payers).toContain('cigna')
  })
})
