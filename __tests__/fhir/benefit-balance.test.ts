import { describe, it, expect } from 'vitest'
import { parseBenefitBalance } from '@/lib/fhir/parsers'
import type { FHIRExplanationOfBenefit } from '@/lib/fhir/client'

function makeEOB(financials: Array<{ code: string; used?: number; allowed?: number }>): FHIRExplanationOfBenefit {
  return {
    resourceType: 'ExplanationOfBenefit',
    id: 'test-eob',
    status: 'active',
    benefitBalance: [{
      financial: financials.map(f => ({
        type: { coding: [{ code: f.code }] },
        ...(f.used    != null ? { usedMoney:    { value: f.used,    currency: 'USD' } } : {}),
        ...(f.allowed != null ? { allowedMoney: { value: f.allowed, currency: 'USD' } } : {}),
      }))
    }]
  }
}

describe('parseBenefitBalance', () => {
  it('returns nulls when no EOBs provided', () => {
    const result = parseBenefitBalance([])
    expect(result).toEqual({ deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null })
  })

  it('returns nulls when EOBs have no benefitBalance', () => {
    const eob: FHIRExplanationOfBenefit = { resourceType: 'ExplanationOfBenefit', id: '1', status: 'active' }
    expect(parseBenefitBalance([eob])).toEqual({ deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null })
  })

  it('extracts deductible used and allowed', () => {
    const result = parseBenefitBalance([makeEOB([{ code: 'deductible', used: 450, allowed: 1500 }])])
    expect(result.deductibleMet).toBe(450)
    expect(result.deductibleTotal).toBe(1500)
  })

  it('extracts out-of-pocket used and allowed', () => {
    const result = parseBenefitBalance([makeEOB([{ code: 'out-of-pocket-maximum', used: 900, allowed: 6000 }])])
    expect(result.oopMet).toBe(900)
    expect(result.oopTotal).toBe(6000)
  })

  it('extracts both deductible and OOP from same EOB', () => {
    const result = parseBenefitBalance([makeEOB([
      { code: 'deductible',          used: 300, allowed: 1500 },
      { code: 'out-of-pocket-maximum', used: 300, allowed: 6000 },
    ])])
    expect(result.deductibleMet).toBe(300)
    expect(result.deductibleTotal).toBe(1500)
    expect(result.oopMet).toBe(300)
    expect(result.oopTotal).toBe(6000)
  })

  it('uses last seen value when multiple EOBs have benefitBalance', () => {
    const eob1 = makeEOB([{ code: 'deductible', used: 100, allowed: 1500 }])
    const eob2 = makeEOB([{ code: 'deductible', used: 450, allowed: 1500 }])
    const result = parseBenefitBalance([eob1, eob2])
    expect(result.deductibleMet).toBe(450)
  })

  it('handles missing usedMoney gracefully', () => {
    const result = parseBenefitBalance([makeEOB([{ code: 'deductible', allowed: 1500 }])])
    expect(result.deductibleMet).toBeNull()
    expect(result.deductibleTotal).toBe(1500)
  })

  it('handles missing allowedMoney gracefully', () => {
    const result = parseBenefitBalance([makeEOB([{ code: 'deductible', used: 300 }])])
    expect(result.deductibleMet).toBe(300)
    expect(result.deductibleTotal).toBeNull()
  })

  it('ignores unrecognised financial codes', () => {
    const result = parseBenefitBalance([makeEOB([{ code: 'copay', used: 50, allowed: 999 }])])
    expect(result).toEqual({ deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null })
  })
})
