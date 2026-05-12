const SMART_BASE = 'https://r4.smarthealthit.org'
const CMS_BASE   = 'https://sandbox.bluebutton.cms.gov/v2/fhir'

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
  payor?: Array<{ reference?: string; display?: string }>
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

export type FHIRExplanationOfBenefit = {
  resourceType: 'ExplanationOfBenefit'
  id: string
  status: string
  type?: { coding?: Array<{ code: string }> }
  use?: string
  patient?: { reference: string }
  billablePeriod?: { start?: string; end?: string }
  created?: string
  insurer?: { reference?: string; display?: string }
  outcome?: string
  contained?: Array<{ resourceType: string; id: string; type?: { text?: string }; payor?: Array<{ display?: string }> }>
  insurance?: Array<{ focal: boolean; coverage: { reference: string; display?: string } }>
  item?: FHIRItem[]
  total?: Array<{ category: { coding: Array<{ code: string; display?: string }> }; amount: { value: number; currency: string } }>
  payment?: { amount?: { value: number; currency: string } }
  benefitBalance?: unknown[]
}

export type FHIRPatient = {
  resourceType: 'Patient'
  id: string
  name?: Array<{ family?: string; given?: string[] }>
  birthDate?: string
  gender?: string
}
