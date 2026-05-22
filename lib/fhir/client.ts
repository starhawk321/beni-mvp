const SMART_BASE  = 'https://r4.smarthealthit.org'
const CMS_BASE    = 'https://sandbox.bluebutton.cms.gov/v2/fhir'
const CIGNA_BASE  = 'https://fhir.cigna.com/PatientAccess/v1-devportal'
const BCBS_BASE   = 'https://preview-api.bluecrossmn.com/fhir'

// Test patient IDs with confirmed data in the SMART sandbox
export const SANDBOX_PATIENTS = {
  coverage: '3407064',
  claims:   '520049',
}

export type FHIRBundle<T> = {
  resourceType: 'Bundle'
  total: number
  entry?: Array<{ resource: T }>
}

async function fetchFHIR<T>(
  path: string,
  options: { base?: string; token?: string } = {}
): Promise<FHIRBundle<T>> {
  const base    = options.base ?? SMART_BASE
  const headers: Record<string, string> = { Accept: 'application/fhir+json' }
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`

  const res = await fetch(`${base}/${path}`, {
    headers,
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`FHIR fetch failed: ${res.status} ${path}`)
  return res.json()
}

// Open SMART sandbox (no auth)
export async function fetchCoverage(patientId: string) {
  return fetchFHIR<FHIRCoverage>(`Coverage?patient=${patientId}&_count=10`)
}

export async function fetchEOBs(patientId: string) {
  return fetchFHIR<FHIRExplanationOfBenefit>(`ExplanationOfBenefit?patient=${patientId}&_count=20`)
}

export async function fetchPatient(patientId: string) {
  const res = await fetch(`${SMART_BASE}/Patient/${patientId}`, {
    headers: { Accept: 'application/fhir+json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`FHIR patient fetch failed: ${res.status}`)
  return res.json() as Promise<FHIRPatient>
}

// CMS Blue Button (authenticated)
export async function fetchCMSCoverage(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverage>(
    `Coverage?patient=${patientId}&_count=10`,
    { base: CMS_BASE, token }
  )
}

export async function fetchCMSEOBs(patientId: string, token: string) {
  return fetchFHIR<FHIRExplanationOfBenefit>(
    `ExplanationOfBenefit?patient=${patientId}&_count=10`,
    { base: CMS_BASE, token }
  )
}

// Cigna (authenticated)
export async function fetchCignaCoverage(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverage>(
    `Coverage?patient=${patientId}&_count=10`,
    { base: CIGNA_BASE, token }
  )
}

export async function fetchCignaEOBs(patientId: string, token: string) {
  return fetchFHIR<FHIRExplanationOfBenefit>(
    `ExplanationOfBenefit?patient=${patientId}&_count=10`,
    { base: CIGNA_BASE, token }
  )
}

export async function fetchCignaPatient(patientId: string, token: string) {
  const res = await fetch(`${CIGNA_BASE}/Patient/${patientId}`, {
    headers: {
      Accept:        'application/fhir+json',
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Cigna Patient fetch failed: ${res.status}`)
  return res.json() as Promise<FHIRPatient>
}

// CMS — clinical resources
export async function fetchCMSConditions(patientId: string, token: string) {
  return fetchFHIR<FHIRCondition>(`Condition?patient=${patientId}&_count=50`, { base: CMS_BASE, token })
}

export async function fetchCMSMedications(patientId: string, token: string) {
  return fetchFHIR<FHIRMedicationRequest>(`MedicationRequest?patient=${patientId}&_count=50`, { base: CMS_BASE, token })
}

export async function fetchCMSObservations(patientId: string, token: string) {
  return fetchFHIR<FHIRObservation>(`Observation?patient=${patientId}&category=laboratory&_count=50`, { base: CMS_BASE, token })
}

export async function fetchCMSImmunizations(patientId: string, token: string) {
  return fetchFHIR<FHIRImmunization>(`Immunization?patient=${patientId}&_count=50`, { base: CMS_BASE, token })
}

// Cigna — clinical resources
export async function fetchCignaConditions(patientId: string, token: string) {
  return fetchFHIR<FHIRCondition>(`Condition?patient=${patientId}&_count=50`, { base: CIGNA_BASE, token })
}

export async function fetchCignaMedications(patientId: string, token: string) {
  return fetchFHIR<FHIRMedicationRequest>(`MedicationRequest?patient=${patientId}&_count=50`, { base: CIGNA_BASE, token })
}

export async function fetchCignaObservations(patientId: string, token: string) {
  return fetchFHIR<FHIRObservation>(`Observation?patient=${patientId}&category=laboratory&_count=50`, { base: CIGNA_BASE, token })
}

export async function fetchCignaImmunizations(patientId: string, token: string) {
  return fetchFHIR<FHIRImmunization>(`Immunization?patient=${patientId}&_count=50`, { base: CIGNA_BASE, token })
}

// ── BCBS Minnesota ────────────────────────────────────────────────────────────

export async function fetchBCBSCoverage(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverage>(`Coverage?patient=${patientId}&_count=10`, { base: BCBS_BASE, token })
}

export async function fetchBCBSEOBs(patientId: string, token: string) {
  return fetchFHIR<FHIRExplanationOfBenefit>(`ExplanationOfBenefit?patient=${patientId}&_count=10`, { base: BCBS_BASE, token })
}

export async function fetchBCBSConditions(patientId: string, token: string) {
  return fetchFHIR<FHIRCondition>(`Condition?patient=${patientId}&_count=50`, { base: BCBS_BASE, token })
}

export async function fetchBCBSMedications(patientId: string, token: string) {
  return fetchFHIR<FHIRMedicationRequest>(`MedicationRequest?patient=${patientId}&_count=50`, { base: BCBS_BASE, token })
}

export async function fetchBCBSObservations(patientId: string, token: string) {
  return fetchFHIR<FHIRObservation>(`Observation?patient=${patientId}&category=laboratory&_count=50`, { base: BCBS_BASE, token })
}

export async function fetchBCBSImmunizations(patientId: string, token: string) {
  return fetchFHIR<FHIRImmunization>(`Immunization?patient=${patientId}&_count=50`, { base: BCBS_BASE, token })
}

// ── CoverageEligibilityResponse ──────────────────────────────────────────────

export async function fetchCMSEligibility(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverageEligibilityResponse>(`CoverageEligibilityResponse?patient=${patientId}&_count=10`, { base: CMS_BASE, token })
}

export async function fetchCignaEligibility(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverageEligibilityResponse>(`CoverageEligibilityResponse?patient=${patientId}&_count=10`, { base: CIGNA_BASE, token })
}

export async function fetchBCBSEligibility(patientId: string, token: string) {
  return fetchFHIR<FHIRCoverageEligibilityResponse>(`CoverageEligibilityResponse?patient=${patientId}&_count=10`, { base: BCBS_BASE, token })
}

export async function fetchCMSPatient(patientId: string, token: string) {
  const res = await fetch(`${CMS_BASE}/Patient/${patientId}`, {
    headers: {
      Accept:        'application/fhir+json',
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`CMS Patient fetch failed: ${res.status}`)
  return res.json() as Promise<FHIRPatient>
}

// ── FHIR R4 Types ────────────────────────────────────────────────────────────

export type FHIRCoverage = {
  resourceType: 'Coverage'
  id: string
  status: string
  type?: { text?: string; coding?: Array<{ code: string; display?: string }> }
  subscriberId?: string
  beneficiary?: { reference: string }
  period?: { start?: string; end?: string }
  payor?: Array<{ reference?: string; display?: string; identifier?: { value?: string } }>
  class?: Array<{ type: { coding: Array<{ code: string }> }; value: string; name?: string }>
}

export type FHIRAdjudication = {
  category: { coding: Array<{ code: string; display?: string }> }
  amount?: { value: number; currency: string }
}

export type FHIRItem = {
  sequence: number
  productOrService?: { coding?: Array<{ code: string; display?: string }> }
  servicedDate?: string
  servicedPeriod?: { start?: string; end?: string }
  net?: { value: number; currency: string }
  adjudication?: FHIRAdjudication[]
}

export type FHIRContainedResource = {
  resourceType: string
  id: string
  type?: { text?: string }
  payor?: Array<{ display?: string }>
  name?: string | Array<{ family?: string; given?: string[]; text?: string }>
  alias?: string[]
}

export type FHIRExplanationOfBenefit = {
  resourceType: 'ExplanationOfBenefit'
  id: string
  status: string
  type?: { coding?: Array<{ code: string; display?: string }> }
  use?: string
  patient?: { reference: string }
  billablePeriod?: { start?: string; end?: string }
  created?: string
  insurer?: { reference?: string; display?: string; identifier?: { value?: string } }
  provider?: { reference?: string; display?: string; identifier?: { value?: string } }
  facility?: { reference?: string; display?: string }
  careTeam?: Array<{ sequence: number; provider: { reference?: string; display?: string }; role?: { coding?: Array<{ code?: string; display?: string }> } }>
  outcome?: string
  contained?: FHIRContainedResource[]
  insurance?: Array<{ focal: boolean; coverage: { reference: string; display?: string } }>
  item?: FHIRItem[]
  total?: Array<{ category: { coding: Array<{ code: string; display?: string }> }; amount: { value: number; currency: string } }>
  payment?: { amount?: { value: number; currency: string } }
  benefitBalance?: Array<{
    category?: { coding?: Array<{ code?: string }> }
    financial?: Array<{
      type: { coding: Array<{ code: string }> }
      usedMoney?:    { value: number; currency: string }
      allowedMoney?: { value: number; currency: string }
      usedUnsignedInt?:    number
      allowedUnsignedInt?: number
    }>
  }>
}

export type FHIRPatient = {
  resourceType: 'Patient'
  id: string
  name?: Array<{ family?: string; given?: string[] }>
  birthDate?: string
  gender?: string
}

export type FHIRCondition = {
  resourceType: 'Condition'
  id: string
  clinicalStatus?: { coding?: Array<{ code: string }> }
  verificationStatus?: { coding?: Array<{ code: string }> }
  code?: { coding?: Array<{ code: string; display?: string; system?: string }>; text?: string }
  onsetDateTime?: string
  onsetPeriod?: { start?: string }
  recordedDate?: string
}

export type FHIRMedicationRequest = {
  resourceType: 'MedicationRequest'
  id: string
  status: string
  medicationCodeableConcept?: { coding?: Array<{ code: string; display?: string }>; text?: string }
  medicationReference?: { display?: string }
  authoredOn?: string
  dosageInstruction?: Array<{ text?: string }>
}

export type FHIRObservation = {
  resourceType: 'Observation'
  id: string
  status: string
  category?: Array<{ coding?: Array<{ code: string }> }>
  code?: { coding?: Array<{ code: string; display?: string }>; text?: string }
  effectiveDateTime?: string
  effectivePeriod?: { start?: string }
  valueQuantity?: { value: number; unit?: string }
  valueString?: string
  valueCodeableConcept?: { text?: string }
  interpretation?: Array<{ coding?: Array<{ code: string; display?: string }> }>
}

export type FHIRImmunization = {
  resourceType: 'Immunization'
  id: string
  status: string
  vaccineCode?: { coding?: Array<{ code: string; display?: string }>; text?: string }
  occurrenceDateTime?: string
  occurrenceString?: string
}

export type FHIRCoverageEligibilityResponse = {
  resourceType: 'CoverageEligibilityResponse'
  id: string
  status: string
  outcome?: string
  disposition?: string
  servicedDate?: string
  servicedPeriod?: { start?: string; end?: string }
  created?: string
  insurer?: { display?: string; reference?: string }
  insurance?: Array<{
    coverage?: { display?: string; reference?: string }
    inforce?: boolean
    benefitPeriod?: { start?: string; end?: string }
    item?: Array<{
      category?:    { coding?: Array<{ code?: string; display?: string }>; text?: string }
      productOrService?: { coding?: Array<{ code?: string; display?: string }>; text?: string }
      network?:     { coding?: Array<{ code?: string; display?: string }> }
      unit?:        { coding?: Array<{ code?: string; display?: string }> }
      term?:        { coding?: Array<{ code?: string; display?: string }> }
      benefit?: Array<{
        type?:           { coding?: Array<{ code?: string; display?: string }> }
        allowedMoney?:   { value: number; currency: string }
        allowedString?:  string
        usedMoney?:      { value: number; currency: string }
      }>
    }>
  }>
}
