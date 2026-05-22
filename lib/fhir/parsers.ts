import type {
  FHIRCoverage, FHIRExplanationOfBenefit, FHIRPatient,
  FHIRCondition, FHIRMedicationRequest, FHIRObservation, FHIRImmunization,
  FHIRCoverageEligibilityResponse,
} from './client'

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

function normalizeInsurerName(raw: string): string {
  if (/centers for medicare|^cms$/i.test(raw)) return 'Medicare'
  return raw
}

export function parseCoverage(resource: FHIRCoverage): ParsedCoverage {
  // CMS uses payor[0].identifier.value; standard FHIR uses payor[0].display
  const insurerName = normalizeInsurerName(
    resource.payor?.[0]?.display ??
    resource.payor?.[0]?.identifier?.value ??
    'Your insurer'
  )

  // CMS Coverage.class has "group" (e.g. "Medicare") and "plan" (e.g. "Part A")
  const planClass  = resource.class?.find(c => c.type?.coding?.[0]?.code === 'plan')
  const groupClass = resource.class?.find(c => c.type?.coding?.[0]?.code === 'group')

  const planType = planClass?.value ?? resource.type?.text ?? resource.type?.coding?.[0]?.display ?? 'Health'
  const groupName = groupClass?.value ?? insurerName
  const planName  = planClass?.name ?? `${groupName} ${planType}`

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
  // CMS uses insurer.identifier.value; standard FHIR uses insurer.display
  const insurerName = normalizeInsurerName(
    resource.insurer?.display ??
    resource.insurer?.identifier?.value ??
    resource.insurance?.[0]?.coverage?.display ??
    resolveContainedCoverage(resource) ??
    'Medicare'
  )

  // CMS EOBs have multiple type codings — pick the standard claim-type code
  const CLAIM_TYPES = new Set(['institutional', 'professional', 'oral', 'pharmacy', 'vision'])
  const claimType =
    resource.type?.coding?.find(c => CLAIM_TYPES.has(c.code ?? ''))?.code ??
    resource.type?.coding?.[0]?.code ??
    'unknown'

  // Service date from billablePeriod or created
  const rawDate = resource.billablePeriod?.start ?? resource.created ?? null
  const serviceDate = rawDate ? rawDate.split('T')[0] : null

  const provider = resolveProvider(resource) ?? insurerName

  // Amounts — try multiple category codes since CMS and standard FHIR differ
  const totalCode = (t: { category?: { coding?: Array<{ code?: string }> } }) =>
    t.category?.coding?.[0]?.code ?? ''
  const amountCharged =
    resource.total?.find(t => /submitted|eligible|clm_tot_chrg_amt/.test(totalCode(t)))?.amount?.value ??
    resource.item?.reduce((sum, item) => sum + (item.net?.value ?? 0), 0) ??
    0

  const amountPaid =
    resource.payment?.amount?.value ??
    resource.total?.find(t => /^benefit$|clm_pmt_amt|prpayamt/.test(totalCode(t)))?.amount?.value ??
    0

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

export type BenefitBalanceSummary = {
  deductibleMet:   number | null
  deductibleTotal: number | null
  oopMet:          number | null
  oopTotal:        number | null
}

const DEDUCTIBLE_CODES = new Set(['deductible', 'medicaldeductible', 'medDeductible'])
const OOP_CODES        = new Set(['out-of-pocket-maximum', 'out-of-pocket', 'maxOutOfPocket', 'annualOopMax'])

export function parseBenefitBalance(eobs: FHIRExplanationOfBenefit[]): BenefitBalanceSummary {
  let deductibleMet:   number | null = null
  let deductibleTotal: number | null = null
  let oopMet:          number | null = null
  let oopTotal:        number | null = null

  for (const eob of eobs) {
    for (const bb of eob.benefitBalance ?? []) {
      for (const fin of bb.financial ?? []) {
        const code = fin.type?.coding?.[0]?.code ?? ''
        if (DEDUCTIBLE_CODES.has(code)) {
          if (fin.usedMoney?.value    != null) deductibleMet   = fin.usedMoney.value
          if (fin.allowedMoney?.value != null) deductibleTotal = fin.allowedMoney.value
        }
        if (OOP_CODES.has(code)) {
          if (fin.usedMoney?.value    != null) oopMet   = fin.usedMoney.value
          if (fin.allowedMoney?.value != null) oopTotal = fin.allowedMoney.value
        }
      }
    }
  }

  return { deductibleMet, deductibleTotal, oopMet, oopTotal }
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

function formatContainedName(contained: NonNullable<FHIRExplanationOfBenefit['contained']>[number]): string | null {
  if (!contained.name) return null
  if (typeof contained.name === 'string') return contained.name
  const first = contained.name[0]
  if (!first) return null
  if (first.text) return first.text
  const given = first.given?.join(' ') ?? ''
  return [given, first.family].filter(Boolean).join(' ').trim() || null
}

function resolveContainedRef(eob: FHIRExplanationOfBenefit, ref: string | undefined): string | null {
  if (!ref?.startsWith('#')) return null
  const containedId = ref.slice(1)
  const contained = eob.contained?.find(c => c.id === containedId)
  if (!contained) return null
  return formatContainedName(contained)
}

function resolveProvider(eob: FHIRExplanationOfBenefit): string | null {
  // 1. EOB.provider — typically a Practitioner or Organization reference
  if (eob.provider?.display) return eob.provider.display
  if (eob.provider?.reference) {
    const name = resolveContainedRef(eob, eob.provider.reference)
    if (name) return name
  }

  // 2. EOB.facility — often the hospital/clinic
  if (eob.facility?.display) return eob.facility.display
  if (eob.facility?.reference) {
    const name = resolveContainedRef(eob, eob.facility.reference)
    if (name) return name
  }

  // 3. EOB.careTeam[] — first member with a display name
  for (const member of eob.careTeam ?? []) {
    if (member.provider?.display) return member.provider.display
    if (member.provider?.reference) {
      const name = resolveContainedRef(eob, member.provider.reference)
      if (name) return name
    }
  }

  // 4. Any contained Practitioner or Organization as last resort
  const containedProvider = eob.contained?.find(c =>
    c.resourceType === 'Practitioner' || c.resourceType === 'Organization'
  )
  if (containedProvider) return formatContainedName(containedProvider)

  return null
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

  return {
    firstName:   name?.given?.[0] ?? null,
    lastName:    name?.family ?? null,
    dateOfBirth: resource.birthDate ?? null,
    gender,
    memberId:    resource.id ?? null,
  }
}

// ── Health resource parsers ───────────────────────────────────────────────────

export type ParsedCondition = {
  id: string
  display: string
  status: string
  onsetDate: string | null
}

export function parseConditions(resources: FHIRCondition[]): ParsedCondition[] {
  return resources
    .filter(r => r.clinicalStatus?.coding?.[0]?.code !== 'inactive')
    .map(r => ({
      id:        r.id,
      display:   r.code?.text ?? r.code?.coding?.[0]?.display ?? 'Unknown condition',
      status:    r.clinicalStatus?.coding?.[0]?.code ?? 'unknown',
      onsetDate: r.onsetDateTime ?? r.onsetPeriod?.start ?? r.recordedDate ?? null,
    }))
}

export type ParsedMedication = {
  id: string
  name: string
  dosage: string | null
  status: string
  authoredOn: string | null
}

export function parseMedications(resources: FHIRMedicationRequest[]): ParsedMedication[] {
  return resources
    .filter(r => r.status === 'active' || r.status === 'completed')
    .map(r => ({
      id:         r.id,
      name:       r.medicationCodeableConcept?.text
                  ?? r.medicationCodeableConcept?.coding?.[0]?.display
                  ?? r.medicationReference?.display
                  ?? 'Unknown medication',
      dosage:     r.dosageInstruction?.[0]?.text ?? null,
      status:     r.status,
      authoredOn: r.authoredOn ?? null,
    }))
}

export type ParsedObservation = {
  id: string
  name: string
  value: string
  unit: string | null
  date: string | null
  category: string
  interpretation: string | null
}

export function parseObservations(resources: FHIRObservation[]): ParsedObservation[] {
  return resources
    .filter(r => r.status === 'final' || r.status === 'amended')
    .map(r => {
      let value = '—'
      if (r.valueQuantity?.value != null) {
        value = String(r.valueQuantity.value)
      } else if (r.valueString) {
        value = r.valueString
      } else if (r.valueCodeableConcept?.text) {
        value = r.valueCodeableConcept.text
      }

      return {
        id:             r.id,
        name:           r.code?.text ?? r.code?.coding?.[0]?.display ?? 'Unknown observation',
        value,
        unit:           r.valueQuantity?.unit ?? null,
        date:           r.effectiveDateTime ?? r.effectivePeriod?.start ?? null,
        category:       r.category?.[0]?.coding?.[0]?.code ?? 'laboratory',
        interpretation: r.interpretation?.[0]?.coding?.[0]?.display ?? null,
      }
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
}

export type ParsedImmunization = {
  id: string
  vaccine: string
  date: string | null
  status: string
}

export function parseImmunizations(resources: FHIRImmunization[]): ParsedImmunization[] {
  return resources
    .filter(r => r.status === 'completed')
    .map(r => ({
      id:      r.id,
      vaccine: r.vaccineCode?.text ?? r.vaccineCode?.coding?.[0]?.display ?? 'Unknown vaccine',
      date:    r.occurrenceDateTime ?? r.occurrenceString ?? null,
      status:  r.status,
    }))
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
}

export type ParsedEligibility = {
  id: string
  inforce: boolean
  outcome: string
  servicedDate: string | null
  periodStart: string | null
  periodEnd: string | null
  benefits: Array<{
    category: string
    network: string | null
    allowed: string | null
    used:    string | null
  }>
}

export function parseEligibility(resources: FHIRCoverageEligibilityResponse[]): ParsedEligibility | null {
  if (!resources.length) return null
  const sorted = [...resources].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))
  const r = sorted[0]
  const ins = r.insurance?.[0]

  const benefits: ParsedEligibility['benefits'] = []
  for (const item of ins?.item ?? []) {
    const category = item.category?.text ?? item.category?.coding?.[0]?.display ?? item.productOrService?.text ?? 'Benefit'
    const network  = item.network?.coding?.[0]?.display ?? null
    for (const b of item.benefit ?? []) {
      const allowed = b.allowedMoney
        ? `$${b.allowedMoney.value.toLocaleString()}`
        : b.allowedString ?? null
      const used = b.usedMoney ? `$${b.usedMoney.value.toLocaleString()}` : null
      benefits.push({ category, network, allowed, used })
    }
  }

  return {
    id:           r.id,
    inforce:      ins?.inforce ?? r.outcome === 'complete',
    outcome:      r.outcome ?? r.disposition ?? 'unknown',
    servicedDate: r.servicedDate ?? r.servicedPeriod?.start ?? null,
    periodStart:  ins?.benefitPeriod?.start ?? null,
    periodEnd:    ins?.benefitPeriod?.end ?? null,
    benefits,
  }
}
