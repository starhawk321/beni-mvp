import { describe, it, expect } from 'vitest'
import { parsePatient } from '@/lib/fhir/parsers'
import { detectConflicts, detectAutoFills } from '@/lib/fhir/conflicts'
import type { FHIRPatient } from '@/lib/fhir/client'
import type { ProfileData } from '@/lib/fhir/conflicts'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const fullPatient: FHIRPatient = {
  resourceType: 'Patient',
  id: 'patient-123',
  name: [{ given: ['Sarah', 'Jane'], family: 'Johnson' }],
  birthDate: '1990-01-05',
  gender: 'female',
}

const partialPatient: FHIRPatient = {
  resourceType: 'Patient',
  id: 'patient-456',
  name: [{ given: ['Alex'] }],
  birthDate: '1985-07-20',
}

const emptyPatient: FHIRPatient = {
  resourceType: 'Patient',
  id: 'patient-789',
}

// ── parsePatient tests ────────────────────────────────────────────────────────

describe('parsePatient', () => {
  it('parses first name from given[0]', () => {
    expect(parsePatient(fullPatient).firstName).toBe('Sarah')
  })

  it('parses last name from family', () => {
    expect(parsePatient(fullPatient).lastName).toBe('Johnson')
  })

  it('parses date of birth', () => {
    expect(parsePatient(fullPatient).dateOfBirth).toBe('1990-01-05')
  })

  it('capitalises gender', () => {
    expect(parsePatient(fullPatient).gender).toBe('Female')
  })

  it('returns null for missing last name', () => {
    expect(parsePatient(partialPatient).lastName).toBeNull()
  })

  it('returns null for missing gender', () => {
    expect(parsePatient(partialPatient).gender).toBeNull()
  })

  it('handles completely empty patient', () => {
    const result = parsePatient(emptyPatient)
    expect(result.firstName).toBeNull()
    expect(result.lastName).toBeNull()
    expect(result.dateOfBirth).toBeNull()
    expect(result.gender).toBeNull()
  })
})

// ── detectConflicts tests ─────────────────────────────────────────────────────

describe('detectConflicts', () => {
  const fhirPatient = parsePatient(fullPatient)

  it('returns empty array when all values match', () => {
    const profile: ProfileData = {
      first_name:    'Sarah',
      last_name:     'Johnson',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    expect(detectConflicts(profile, fhirPatient)).toHaveLength(0)
  })

  it('detects first name conflict', () => {
    const profile: ProfileData = {
      first_name:    'Sara',
      last_name:     'Johnson',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    const conflicts = detectConflicts(profile, fhirPatient)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].field).toBe('firstName')
    expect(conflicts[0].userValue).toBe('Sara')
    expect(conflicts[0].fhirValue).toBe('Sarah')
  })

  it('detects multiple conflicts', () => {
    const profile: ProfileData = {
      first_name:    'Sara',
      last_name:     'Smith',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    const conflicts = detectConflicts(profile, fhirPatient)
    expect(conflicts).toHaveLength(2)
    expect(conflicts.map(c => c.field)).toContain('firstName')
    expect(conflicts.map(c => c.field)).toContain('lastName')
  })

  it('ignores case differences', () => {
    const profile: ProfileData = {
      first_name:    'SARAH',
      last_name:     'johnson',
      date_of_birth: '1990-01-05',
      gender:        'female',
    }
    expect(detectConflicts(profile, fhirPatient)).toHaveLength(0)
  })

  it('does not flag conflict when profile field is empty', () => {
    const profile: ProfileData = {
      first_name:    null,
      last_name:     null,
      date_of_birth: null,
      gender:        null,
    }
    expect(detectConflicts(profile, fhirPatient)).toHaveLength(0)
  })

  it('does not flag conflict when fhir field is empty', () => {
    const profile: ProfileData = {
      first_name:    'Sarah',
      last_name:     'Johnson',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    const fhirNoGender = parsePatient(partialPatient)
    const conflicts = detectConflicts(profile, fhirNoGender)
    expect(conflicts.find(c => c.field === 'gender')).toBeUndefined()
  })
})

// ── detectAutoFills tests ─────────────────────────────────────────────────────

describe('detectAutoFills', () => {
  const fhirPatient = parsePatient(fullPatient)

  it('returns fields that are empty in profile but present in FHIR', () => {
    const profile: ProfileData = {
      first_name:    null,
      last_name:     null,
      date_of_birth: null,
      gender:        null,
    }
    const fills = detectAutoFills(profile, fhirPatient)
    expect(fills.first_name).toBe('Sarah')
    expect(fills.last_name).toBe('Johnson')
    expect(fills.date_of_birth).toBe('1990-01-05')
    expect(fills.gender).toBe('Female')
  })

  it('does not overwrite existing profile values', () => {
    const profile: ProfileData = {
      first_name:    'Sara',
      last_name:     'Johnson',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    const fills = detectAutoFills(profile, fhirPatient)
    expect(Object.keys(fills)).toHaveLength(0)
  })

  it('only fills empty fields', () => {
    const profile: ProfileData = {
      first_name:    'Sara',
      last_name:     null,
      date_of_birth: null,
      gender:        'Female',
    }
    const fills = detectAutoFills(profile, fhirPatient)
    expect(fills.last_name).toBe('Johnson')
    expect(fills.first_name).toBeUndefined()
    expect(fills.gender).toBeUndefined()
  })

  it('returns empty object when profile is fully filled', () => {
    const profile: ProfileData = {
      first_name:    'Sarah',
      last_name:     'Johnson',
      date_of_birth: '1990-01-05',
      gender:        'Female',
    }
    expect(Object.keys(detectAutoFills(profile, fhirPatient))).toHaveLength(0)
  })
})
