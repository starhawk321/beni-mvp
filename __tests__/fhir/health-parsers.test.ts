import { describe, it, expect } from 'vitest'
import {
  parseConditions, parseMedications, parseObservations, parseImmunizations,
} from '@/lib/fhir/parsers'
import type {
  FHIRCondition, FHIRMedicationRequest, FHIRObservation, FHIRImmunization,
} from '@/lib/fhir/client'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const activeCondition: FHIRCondition = {
  resourceType: 'Condition',
  id: 'cond-1',
  clinicalStatus: { coding: [{ code: 'active' }] },
  code: { text: 'Type 2 Diabetes', coding: [{ code: 'E11', display: 'Type 2 Diabetes' }] },
  onsetDateTime: '2020-03-15',
}

const inactiveCondition: FHIRCondition = {
  resourceType: 'Condition',
  id: 'cond-2',
  clinicalStatus: { coding: [{ code: 'inactive' }] },
  code: { text: 'Sprained ankle' },
}

const activeMedication: FHIRMedicationRequest = {
  resourceType: 'MedicationRequest',
  id: 'med-1',
  status: 'active',
  medicationCodeableConcept: { text: 'Metformin 500mg', coding: [{ code: '860975', display: 'Metformin 500mg' }] },
  authoredOn: '2024-01-10',
  dosageInstruction: [{ text: 'Take twice daily with meals' }],
}

const stoppedMedication: FHIRMedicationRequest = {
  resourceType: 'MedicationRequest',
  id: 'med-2',
  status: 'stopped',
  medicationCodeableConcept: { text: 'Ibuprofen' },
}

const labObservation: FHIRObservation = {
  resourceType: 'Observation',
  id: 'obs-1',
  status: 'final',
  category: [{ coding: [{ code: 'laboratory' }] }],
  code: { text: 'HbA1c', coding: [{ code: '4548-4', display: 'HbA1c' }] },
  effectiveDateTime: '2024-06-01',
  valueQuantity: { value: 7.2, unit: '%' },
  interpretation: [{ coding: [{ code: 'H', display: 'High' }] }],
}

const enteredInErrorObs: FHIRObservation = {
  resourceType: 'Observation',
  id: 'obs-2',
  status: 'entered-in-error',
  code: { text: 'Glucose' },
}

const immunization: FHIRImmunization = {
  resourceType: 'Immunization',
  id: 'imm-1',
  status: 'completed',
  vaccineCode: { text: 'Influenza vaccine', coding: [{ code: '140', display: 'Influenza vaccine' }] },
  occurrenceDateTime: '2025-10-15',
}

const notDoneImmunization: FHIRImmunization = {
  resourceType: 'Immunization',
  id: 'imm-2',
  status: 'not-done',
  vaccineCode: { text: 'COVID-19 vaccine' },
}

// ── Condition parser ──────────────────────────────────────────────────────────

describe('parseConditions', () => {
  it('returns empty array for no input', () => {
    expect(parseConditions([])).toEqual([])
  })

  it('parses display from code.text', () => {
    const result = parseConditions([activeCondition])
    expect(result[0].display).toBe('Type 2 Diabetes')
  })

  it('filters out inactive conditions', () => {
    const result = parseConditions([activeCondition, inactiveCondition])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('cond-1')
  })

  it('extracts onset date', () => {
    const result = parseConditions([activeCondition])
    expect(result[0].onsetDate).toBe('2020-03-15')
  })

  it('handles missing code gracefully', () => {
    const cond: FHIRCondition = { resourceType: 'Condition', id: 'x', clinicalStatus: { coding: [{ code: 'active' }] } }
    expect(parseConditions([cond])[0].display).toBe('Unknown condition')
  })
})

// ── Medication parser ─────────────────────────────────────────────────────────

describe('parseMedications', () => {
  it('returns empty array for no input', () => {
    expect(parseMedications([])).toEqual([])
  })

  it('parses medication name from text', () => {
    const result = parseMedications([activeMedication])
    expect(result[0].name).toBe('Metformin 500mg')
  })

  it('filters out stopped medications', () => {
    const result = parseMedications([activeMedication, stoppedMedication])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('med-1')
  })

  it('includes completed medications', () => {
    const completed: FHIRMedicationRequest = { ...activeMedication, id: 'med-3', status: 'completed' }
    expect(parseMedications([completed])).toHaveLength(1)
  })

  it('extracts dosage instruction', () => {
    const result = parseMedications([activeMedication])
    expect(result[0].dosage).toBe('Take twice daily with meals')
  })
})

// ── Observation parser ────────────────────────────────────────────────────────

describe('parseObservations', () => {
  it('returns empty array for no input', () => {
    expect(parseObservations([])).toEqual([])
  })

  it('parses lab name and value', () => {
    const result = parseObservations([labObservation])
    expect(result[0].name).toBe('HbA1c')
    expect(result[0].value).toBe('7.2')
    expect(result[0].unit).toBe('%')
  })

  it('filters out entered-in-error observations', () => {
    const result = parseObservations([labObservation, enteredInErrorObs])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('obs-1')
  })

  it('parses interpretation', () => {
    const result = parseObservations([labObservation])
    expect(result[0].interpretation).toBe('High')
  })

  it('handles string value', () => {
    const obs: FHIRObservation = { ...labObservation, id: 'obs-3', valueQuantity: undefined, valueString: 'Positive' }
    expect(parseObservations([obs])[0].value).toBe('Positive')
  })

  it('sorts by date descending', () => {
    const older: FHIRObservation = { ...labObservation, id: 'older', effectiveDateTime: '2023-01-01' }
    const newer: FHIRObservation = { ...labObservation, id: 'newer', effectiveDateTime: '2024-06-01' }
    const result = parseObservations([older, newer])
    expect(result[0].id).toBe('newer')
  })
})

// ── Immunization parser ───────────────────────────────────────────────────────

describe('parseImmunizations', () => {
  it('returns empty array for no input', () => {
    expect(parseImmunizations([])).toEqual([])
  })

  it('parses vaccine name', () => {
    const result = parseImmunizations([immunization])
    expect(result[0].vaccine).toBe('Influenza vaccine')
  })

  it('filters out not-done immunizations', () => {
    const result = parseImmunizations([immunization, notDoneImmunization])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('imm-1')
  })

  it('extracts occurrence date', () => {
    const result = parseImmunizations([immunization])
    expect(result[0].date).toBe('2025-10-15')
  })

  it('handles missing vaccine code gracefully', () => {
    const imm: FHIRImmunization = { resourceType: 'Immunization', id: 'x', status: 'completed' }
    expect(parseImmunizations([imm])[0].vaccine).toBe('Unknown vaccine')
  })
})
