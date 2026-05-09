import { describe, it, expect } from 'vitest'
import { parseCoverage, parseEOB, parseEOBs, calculateSpending } from '@/lib/fhir/parsers'
import type { FHIRCoverage, FHIRExplanationOfBenefit } from '@/lib/fhir/client'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const coverageWithText: FHIRCoverage = {
  resourceType: 'Coverage',
  id: '3407068',
  status: 'active',
  type: { text: 'Dental' },
  subscriberId: 'SUB654321',
  beneficiary: { reference: 'Patient/3407064' },
  period: { start: '2025-06-01', end: '2027-05-31' },
  payor: [{ reference: 'Organization/3407065' }],
}

const coverageWithPayorDisplay: FHIRCoverage = {
  ...coverageWithText,
  payor: [{ display: 'Aetna Health' }],
}

const coverageWithClass: FHIRCoverage = {
  ...coverageWithText,
  class: [
    {
      type: { coding: [{ code: 'plan' }] },
      value: 'PLAN001',
      name: 'Aetna Choice POS II',
    },
  ],
}

const basicEOB: FHIRExplanationOfBenefit = {
  resourceType: 'ExplanationOfBenefit',
  id: '520146',
  status: 'active',
  type: { coding: [{ code: 'institutional' }] },
  billablePeriod: { start: '2024-03-15T10:00:00-04:00' },
  insurer: { display: 'Cigna Health' },
  total: [
    {
      category: { coding: [{ code: 'submitted', display: 'Submitted Amount' }] },
      amount: { value: 516.65, currency: 'USD' },
    },
  ],
  payment: { amount: { value: 413.32, currency: 'USD' } },
}

const cancelledEOB: FHIRExplanationOfBenefit = {
  ...basicEOB,
  id: 'cancelled-1',
  status: 'cancelled',
}

const eobWithContainedCoverage: FHIRExplanationOfBenefit = {
  ...basicEOB,
  id: 'contained-1',
  insurer: undefined,
  contained: [
    {
      resourceType: 'Coverage',
      id: 'coverage',
      type: { text: 'Health' },
      payor: [{ display: 'UnitedHealthcare' }],
    },
  ],
  insurance: [{ focal: true, coverage: { reference: '#coverage' } }],
}

// ── Coverage parser tests ─────────────────────────────────────────────────────

describe('parseCoverage', () => {
  it('parses plan type from type.text', () => {
    const result = parseCoverage(coverageWithText)
    expect(result.planType).toBe('Dental')
  })

  it('returns subscriber ID', () => {
    const result = parseCoverage(coverageWithText)
    expect(result.subscriberId).toBe('SUB654321')
  })

  it('parses period start and end', () => {
    const result = parseCoverage(coverageWithText)
    expect(result.periodStart).toBe('2025-06-01')
    expect(result.periodEnd).toBe('2027-05-31')
  })

  it('uses payor display name when present', () => {
    const result = parseCoverage(coverageWithPayorDisplay)
    expect(result.insurerName).toBe('Aetna Health')
  })

  it('falls back to "Your insurer" when payor has no display', () => {
    const result = parseCoverage(coverageWithText)
    expect(result.insurerName).toBe('Your insurer')
  })

  it('uses class name for plan name when present', () => {
    const result = parseCoverage(coverageWithClass)
    expect(result.planName).toBe('Aetna Choice POS II')
  })

  it('builds fallback plan name when class is absent', () => {
    const result = parseCoverage(coverageWithText)
    expect(result.planName).toContain('Dental')
  })

  it('handles missing period gracefully', () => {
    const result = parseCoverage({ ...coverageWithText, period: undefined })
    expect(result.periodStart).toBeNull()
    expect(result.periodEnd).toBeNull()
  })

  it('handles missing subscriberId gracefully', () => {
    const result = parseCoverage({ ...coverageWithText, subscriberId: undefined })
    expect(result.subscriberId).toBe('—')
  })
})

// ── EOB parser tests ──────────────────────────────────────────────────────────

describe('parseEOB', () => {
  it('parses insurer name from insurer.display', () => {
    const result = parseEOB(basicEOB)
    expect(result.insurerName).toBe('Cigna Health')
  })

  it('resolves insurer name from contained coverage', () => {
    const result = parseEOB(eobWithContainedCoverage)
    expect(result.insurerName).toBe('UnitedHealthcare')
  })

  it('parses claim type', () => {
    const result = parseEOB(basicEOB)
    expect(result.claimType).toBe('institutional')
  })

  it('strips time from service date', () => {
    const result = parseEOB(basicEOB)
    expect(result.serviceDate).toBe('2024-03-15')
  })

  it('parses payment amount', () => {
    const result = parseEOB(basicEOB)
    expect(result.amountPaid).toBe(413.32)
  })

  it('parses charged amount from total[submitted]', () => {
    const result = parseEOB(basicEOB)
    expect(result.amountCharged).toBe(516.65)
  })

  it('calculates patient responsibility as charged - paid', () => {
    const result = parseEOB(basicEOB)
    expect(result.amountPatient).toBe(103.33)
  })

  it('handles missing payment gracefully', () => {
    const result = parseEOB({ ...basicEOB, payment: undefined })
    expect(result.amountPaid).toBe(0)
    expect(result.amountPatient).toBeGreaterThanOrEqual(0)
  })

  it('handles missing total gracefully', () => {
    const result = parseEOB({ ...basicEOB, total: undefined })
    expect(result.amountCharged).toBe(0)
  })
})

// ── parseEOBs (collection) tests ──────────────────────────────────────────────

describe('parseEOBs', () => {
  it('filters out cancelled EOBs', () => {
    const results = parseEOBs([basicEOB, cancelledEOB])
    expect(results).toHaveLength(1)
    expect(results[0].eobId).toBe('520146')
  })

  it('sorts by service date descending', () => {
    const older: FHIRExplanationOfBenefit = {
      ...basicEOB,
      id: 'older',
      billablePeriod: { start: '2023-01-01T00:00:00-04:00' },
    }
    const newer: FHIRExplanationOfBenefit = {
      ...basicEOB,
      id: 'newer',
      billablePeriod: { start: '2024-06-01T00:00:00-04:00' },
    }
    const results = parseEOBs([older, newer])
    expect(results[0].eobId).toBe('newer')
    expect(results[1].eobId).toBe('older')
  })

  it('handles empty array', () => {
    expect(parseEOBs([])).toEqual([])
  })
})

// ── calculateSpending tests ───────────────────────────────────────────────────

describe('calculateSpending', () => {
  it('sums paid amounts across claims', () => {
    const claims = parseEOBs([basicEOB])
    const result = calculateSpending(claims)
    expect(result.totalPaid).toBe(413.32)
  })

  it('sums patient amounts across claims', () => {
    const claims = parseEOBs([basicEOB])
    const result = calculateSpending(claims)
    expect(result.totalPatient).toBeCloseTo(103.33, 1)
  })

  it('counts claims', () => {
    const claims = parseEOBs([basicEOB, { ...basicEOB, id: 'second' }])
    const result = calculateSpending(claims)
    expect(result.claimCount).toBe(2)
  })

  it('returns zeros for empty claims', () => {
    const result = calculateSpending([])
    expect(result.totalPaid).toBe(0)
    expect(result.totalPatient).toBe(0)
    expect(result.claimCount).toBe(0)
  })
})
