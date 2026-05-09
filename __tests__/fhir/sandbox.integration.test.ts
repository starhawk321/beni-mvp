import { describe, it, expect } from 'vitest'
import { fetchCoverage, fetchEOBs, SANDBOX_PATIENTS } from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending } from '@/lib/fhir/parsers'

// These tests hit the real SMART Health IT sandbox — requires internet access.
// Run with: npm test

describe('SMART sandbox — Coverage', () => {
  it('fetches at least one Coverage resource', async () => {
    const bundle = await fetchCoverage(SANDBOX_PATIENTS.coverage)
    expect(bundle.resourceType).toBe('Bundle')
    expect(bundle.total).toBeGreaterThan(0)
    expect(bundle.entry).toBeDefined()
    expect(bundle.entry!.length).toBeGreaterThan(0)
  }, 15000)

  it('parses Coverage without throwing', async () => {
    const bundle = await fetchCoverage(SANDBOX_PATIENTS.coverage)
    const resource = bundle.entry![0].resource
    expect(() => parseCoverage(resource)).not.toThrow()
  }, 15000)

  it('parsed Coverage has required fields', async () => {
    const bundle = await fetchCoverage(SANDBOX_PATIENTS.coverage)
    const parsed = parseCoverage(bundle.entry![0].resource)
    expect(parsed.id).toBeTruthy()
    expect(parsed.status).toBeTruthy()
    expect(parsed.planType).toBeTruthy()
  }, 15000)
})

describe('SMART sandbox — ExplanationOfBenefit', () => {
  it('fetches at least one EOB resource', async () => {
    const bundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    expect(bundle.resourceType).toBe('Bundle')
    expect(bundle.total).toBeGreaterThan(0)
    expect(bundle.entry).toBeDefined()
    expect(bundle.entry!.length).toBeGreaterThan(0)
  }, 15000)

  it('parses EOBs without throwing', async () => {
    const bundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    const resources = bundle.entry!.map(e => e.resource)
    expect(() => parseEOBs(resources)).not.toThrow()
  }, 15000)

  it('parsed EOBs have service dates and amounts', async () => {
    const bundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    const claims = parseEOBs(bundle.entry!.map(e => e.resource))

    expect(claims.length).toBeGreaterThan(0)
    claims.forEach(claim => {
      expect(claim.eobId).toBeTruthy()
      expect(claim.status).toBe('active')
      expect(claim.amountPaid).toBeGreaterThanOrEqual(0)
      expect(claim.amountCharged).toBeGreaterThanOrEqual(0)
      expect(claim.amountPatient).toBeGreaterThanOrEqual(0)
    })
  }, 15000)

  it('calculateSpending returns non-negative totals', async () => {
    const bundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    const claims = parseEOBs(bundle.entry!.map(e => e.resource))
    const spending = calculateSpending(claims)

    expect(spending.totalPaid).toBeGreaterThanOrEqual(0)
    expect(spending.totalPatient).toBeGreaterThanOrEqual(0)
    expect(spending.claimCount).toBe(claims.length)
  }, 15000)

  it('EOBs are sorted newest first', async () => {
    const bundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    const claims = parseEOBs(bundle.entry!.map(e => e.resource))

    const datesWithValues = claims
      .map(c => c.serviceDate)
      .filter((d): d is string => d !== null)

    for (let i = 0; i < datesWithValues.length - 1; i++) {
      expect(datesWithValues[i] >= datesWithValues[i + 1]).toBe(true)
    }
  }, 15000)
})
