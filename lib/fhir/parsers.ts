import type { FHIRCoverage, FHIRExplanationOfBenefit, FHIRPatient } from './client'

export type ParsedCoverage = {
  id: string
  insurerName: string
  planName: string
  planType: string
  subscriberId: string
  periodStart: string | null
  periodEnd: string | null
  status: string
}

export type ParsedClaim = {
  eobId: string
  insurerName: string
  claimType: string
  serviceDate: string | null
  provider: string
  amountCharged: number
  amountPaid: number
  amountPatient: number
  status: string
}

export function parseCoverage(resource: FHIRCoverage): ParsedCoverage {
  const planType =
    resource.type?.text ??
    resource.type?.coding?.[0]?.display ??
    resource.type?.coding?.[0]?.code ??
    'Health'

  const insurerName =
    resource.payor?.[0]?.display ??
    'Your insurer'

  const planClass = resource.class?.find(
    c => c.type?.coding?.[0]?.code === 'plan'
  )
  const planName = planClass?.name ?? planClass?.value ?? `${insurerName} ${planType} Plan`

  return {
    id:           resource.id,
    insurerName,
    planName,
    planType,
    subscriberId: resource.subscriberId ?? '—',
    periodStart:  resource.period?.start ?? null,
    periodEnd:    resource.period?.end ?? null,
    status:       resource.status,
  }
}

export function parseEOB(resource: FHIRExplanationOfBenefit): ParsedClaim {
  // Insurer name — most reliable from insurer.display
  const insurerName =
    resource.insurer?.display ??
    resource.insurance?.[0]?.coverage?.display ??
    resolveContainedCoverage(resource) ??
    'Insurer'

  // Claim type
  const claimType = resource.type?.coding?.[0]?.code ?? 'unknown'

  // Service date from billablePeriod or created
  const rawDate = resource.billablePeriod?.start ?? resource.created ?? null
  const serviceDate = rawDate ? rawDate.split('T')[0] : null

  // Provider — use insurer display as fallback since practitioner is a reference
  const provider = insurerName

  // Amounts
  const amountCharged =
    resource.total?.find(t => t.category?.coding?.[0]?.code?.includes('submitted'))?.amount?.value ??
    resource.item?.reduce((sum, item) => sum + (item.net?.value ?? 0), 0) ??
    0

  const amountPaid = resource.payment?.amount?.value ?? 0

  // Patient responsibility = charged - paid (simplified)
  const amountPatient = Math.max(0, amountCharged - amountPaid)

  return {
    eobId:         resource.id,
    insurerName,
    claimType,
    serviceDate,
    provider,
    amountCharged: round2(amountCharged),
    amountPaid:    round2(amountPaid),
    amountPatient: round2(amountPatient),
    status:        resource.status,
  }
}

export function parseEOBs(resources: FHIRExplanationOfBenefit[]): ParsedClaim[] {
  return resources
    .filter(r => r.status === 'active')
    .map(parseEOB)
    .sort((a, b) => {
      if (!a.serviceDate) return 1
      if (!b.serviceDate) return -1
      return b.serviceDate.localeCompare(a.serviceDate)
    })
}

export function calculateSpending(claims: ParsedClaim[]) {
  const totalPaid     = claims.reduce((s, c) => s + c.amountPaid, 0)
  const totalCharged  = claims.reduce((s, c) => s + c.amountCharged, 0)
  const totalPatient  = claims.reduce((s, c) => s + c.amountPatient, 0)
  return {
    totalPaid:    round2(totalPaid),
    totalCharged: round2(totalCharged),
    totalPatient: round2(totalPatient),
    claimCount:   claims.length,
  }
}

function resolveContainedCoverage(eob: FHIRExplanationOfBenefit): string | null {
  const ref = eob.insurance?.[0]?.coverage?.reference
  if (!ref?.startsWith('#')) return null
  const containedId = ref.slice(1)
  const contained = eob.contained?.find(c => c.id === containedId)
  return contained?.payor?.[0]?.display ?? contained?.type?.text ?? null
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Patient parser ────────────────────────────────────────────────────────────

export type ParsedPatient = {
  firstName: string | null
  lastName: string | null
  dateOfBirth: string | null
  gender: string | null
  memberId: string | null
}

export function parsePatient(resource: FHIRPatient): ParsedPatient {
  const name = resource.name?.[0]

  const rawGender = resource.gender ?? null
  const gender = rawGender
    ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1)
    : null

  const memberId =
    resource.id ?? null

  return {
    firstName:   name?.given?.[0] ?? null,
    lastName:    name?.family ?? null,
    dateOfBirth: resource.birthDate ?? null,
    gender,
    memberId,
  }
}
