import type { ParsedPatient } from './parsers'

export type ProfileData = {
  first_name:    string | null
  last_name:     string | null
  date_of_birth: string | null
  gender:        string | null
}

export type ConflictField = 'firstName' | 'lastName' | 'dateOfBirth' | 'gender'

export type Conflict = {
  field:       ConflictField
  label:       string
  userValue:   string
  fhirValue:   string
}

const FIELD_LABELS: Record<ConflictField, string> = {
  firstName:   'First name',
  lastName:    'Last name',
  dateOfBirth: 'Date of birth',
  gender:      'Gender',
}

function normalize(val: string | null | undefined): string {
  return (val ?? '').trim().toLowerCase()
}

export function detectConflicts(profile: ProfileData, fhir: ParsedPatient): Conflict[] {
  const checks: Array<{
    field:     ConflictField
    profile:   string | null
    fhir:      string | null
  }> = [
    { field: 'firstName',   profile: profile.first_name,    fhir: fhir.firstName   },
    { field: 'lastName',    profile: profile.last_name,     fhir: fhir.lastName    },
    { field: 'dateOfBirth', profile: profile.date_of_birth, fhir: fhir.dateOfBirth },
    { field: 'gender',      profile: profile.gender,        fhir: fhir.gender      },
  ]

  const conflicts: Conflict[] = []

  for (const { field, profile: profileVal, fhir: fhirVal } of checks) {
    // Only a conflict if BOTH sides have a value AND they differ
    if (!profileVal || !fhirVal) continue
    if (normalize(profileVal) === normalize(fhirVal)) continue

    conflicts.push({
      field,
      label:     FIELD_LABELS[field],
      userValue: profileVal,
      fhirValue: fhirVal,
    })
  }

  return conflicts
}

// Fields FHIR has that the profile is missing — auto-fill, no conflict needed
export function detectAutoFills(profile: ProfileData, fhir: ParsedPatient): Partial<ProfileData> {
  const fills: Partial<ProfileData> = {}

  if (!profile.first_name    && fhir.firstName)   fills.first_name    = fhir.firstName
  if (!profile.last_name     && fhir.lastName)    fills.last_name     = fhir.lastName
  if (!profile.date_of_birth && fhir.dateOfBirth) fills.date_of_birth = fhir.dateOfBirth
  if (!profile.gender        && fhir.gender)      fills.gender        = fhir.gender

  return fills
}
