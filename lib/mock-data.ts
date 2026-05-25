// Mock dataset for the skip-path / "see a sample dashboard" experience.
// Same shape as real parser output so pages can swap data sources cleanly
// based on profile.connection_skipped.
//
// Persona: 60-year-old with Medicare Part A+B + Cigna Medigap Plan G.
// Designed to demonstrate multi-payer value cleanly. Numbers are realistic
// for someone with moderate engagement (a few claims, met deductible,
// chronic-condition health profile).

import type {
  PayerData,
} from '@/lib/fhir/multi-payer'
import type {
  ParsedClaim,
  ParsedCondition,
  ParsedMedication,
  ParsedObservation,
  ParsedImmunization,
} from '@/lib/fhir/parsers'

// ── Plan year claims (10 items, sorted desc by service date) ──────────────────

const MEDICARE_CLAIMS: ParsedClaim[] = [
  {
    eobId:         'mock-mc-001',
    insurerName:   'Medicare',
    claimType:     'institutional',
    serviceDate:   '2026-09-12',
    provider:      'Memorial Hospital',
    amountCharged: 2340,
    amountPaid:    2340,
    amountPatient: 0,
    status:        'active',
  },
  {
    eobId:         'mock-mc-002',
    insurerName:   'Medicare',
    claimType:     'professional',
    serviceDate:   '2026-09-05',
    provider:      'Dr. Patel Cardiology',
    amountCharged: 385,
    amountPaid:    385,
    amountPatient: 0,
    status:        'active',
  },
  {
    eobId:         'mock-mc-003',
    insurerName:   'Medicare',
    claimType:     'pharmacy',
    serviceDate:   '2026-08-28',
    provider:      'CVS Pharmacy',
    amountCharged: 40,
    amountPaid:    32,
    amountPatient: 8,
    status:        'active',
  },
  {
    eobId:         'mock-mc-004',
    insurerName:   'Medicare',
    claimType:     'institutional',
    serviceDate:   '2026-08-05',
    provider:      'Baptist Health Imaging',
    amountCharged: 2050,
    amountPaid:    1820,
    amountPatient: 230,
    status:        'active',
  },
  {
    eobId:         'mock-mc-005',
    insurerName:   'Medicare',
    claimType:     'professional',
    serviceDate:   '2026-07-08',
    provider:      'Dr. Patel Cardiology',
    amountCharged: 215,
    amountPaid:    215,
    amountPatient: 0,
    status:        'active',
  },
  {
    eobId:         'mock-mc-006',
    insurerName:   'Medicare',
    claimType:     'institutional',
    serviceDate:   '2026-05-14',
    provider:      'Memorial Hospital ER',
    amountCharged: 1600,
    amountPaid:    1420,
    amountPatient: 180,
    status:        'active',
  },
]

const CIGNA_CLAIMS: ParsedClaim[] = [
  {
    eobId:         'mock-cg-001',
    insurerName:   'Cigna Medigap Plan G',
    claimType:     'professional',
    serviceDate:   '2026-08-24',
    provider:      'Dr. Sarah Chen, MD',
    amountCharged: 135,
    amountPaid:    0,
    amountPatient: 135,
    status:        'active',
  },
  {
    eobId:         'mock-cg-002',
    insurerName:   'Cigna Medigap Plan G',
    claimType:     'professional',
    serviceDate:   '2026-08-18',
    provider:      'Quest Diagnostics',
    amountCharged: 137,
    amountPaid:    95,
    amountPatient: 42,
    status:        'active',
  },
  {
    eobId:         'mock-cg-003',
    insurerName:   'Cigna Medigap Plan G',
    claimType:     'pharmacy',
    serviceDate:   '2026-07-22',
    provider:      'Walgreens',
    amountCharged: 22,
    amountPaid:    18,
    amountPatient: 4,
    status:        'active',
  },
  {
    eobId:         'mock-cg-004',
    insurerName:   'Cigna Medigap Plan G',
    claimType:     'professional',
    serviceDate:   '2026-06-30',
    provider:      'LabCorp',
    amountCharged: 90,
    amountPaid:    72,
    amountPatient: 18,
    status:        'active',
  },
]

// ── Payer-level data shaped like fetchAllPayersData output ────────────────────

export const MOCK_PAYERS: PayerData[] = [
  {
    payer:       'cms',
    displayName: 'Medicare',
    coverage: {
      id:           'mock-coverage-cms',
      insurerName:  'Medicare',
      planName:     'Medicare Part A + Part B',
      planType:     'Original Medicare',
      subscriberId: '1EG4-TE5-MK72',
      periodStart:  '2026-01-01',
      periodEnd:    '2026-12-31',
      status:       'active',
    },
    claims:  MEDICARE_CLAIMS,
    rawEobs: [],
    benefitBalance: {
      deductibleMet:   240,
      deductibleTotal: 240,   // Medicare Part B deductible cleared
      oopMet:          480,
      oopTotal:        6700,  // Note: Original Medicare has no annual OOP cap;
                              // figure shown is Medigap's. In real data we'd flag this.
    },
  },
  {
    payer:       'cigna',
    displayName: 'Cigna Medigap Plan G',
    coverage: {
      id:           'mock-coverage-cigna',
      insurerName:  'Cigna',
      planName:     'Cigna Medigap Plan G',
      planType:     'Medigap Supplement',
      subscriberId: 'U7244-81902-01',
      periodStart:  '2026-01-01',
      periodEnd:    '2026-12-31',
      status:       'active',
    },
    claims:  CIGNA_CLAIMS,
    rawEobs: [],
    benefitBalance: {
      deductibleMet:   233,
      deductibleTotal: 250,    // $17 from being met
      oopMet:          233,
      oopTotal:        233,    // Plan G covers everything past deductible
    },
  },
]

// ── Health records (merged across both payers, deduplicated) ──────────────────

export const MOCK_CONDITIONS: ParsedCondition[] = [
  {
    id:        'mock-cond-001',
    display:   'Hypertension',
    status:    'active',
    onsetDate: '2018-09-15',
  },
  {
    id:        'mock-cond-002',
    display:   'Type 2 diabetes mellitus',
    status:    'active',
    onsetDate: '2020-04-22',
  },
  {
    id:        'mock-cond-003',
    display:   'Lumbar disc herniation',
    status:    'active',
    onsetDate: '2024-03-10',
  },
]

export const MOCK_MEDICATIONS: ParsedMedication[] = [
  {
    id:         'mock-med-001',
    name:       'Metformin 500mg',
    dosage:     'Take 1 tablet by mouth twice daily',
    status:     'active',
    authoredOn: '2020-04-22',
  },
  {
    id:         'mock-med-002',
    name:       'Lisinopril 10mg',
    dosage:     'Take 1 tablet by mouth once daily',
    status:     'active',
    authoredOn: '2018-09-15',
  },
  {
    id:         'mock-med-003',
    name:       'Atorvastatin 20mg',
    dosage:     'Take 1 tablet by mouth at bedtime',
    status:     'active',
    authoredOn: '2021-02-08',
  },
]

export const MOCK_OBSERVATIONS: ParsedObservation[] = [
  {
    id:             'mock-obs-001',
    name:           'Hemoglobin A1c',
    value:          '6.8',
    unit:           '%',
    date:           '2026-08-18',
    category:       'laboratory',
    interpretation: 'Above target',
  },
  {
    id:             'mock-obs-002',
    name:           'LDL Cholesterol',
    value:          '118',
    unit:           'mg/dL',
    date:           '2026-08-18',
    category:       'laboratory',
    interpretation: 'Near optimal',
  },
  {
    id:             'mock-obs-003',
    name:           'HDL Cholesterol',
    value:          '52',
    unit:           'mg/dL',
    date:           '2026-08-18',
    category:       'laboratory',
    interpretation: 'Normal',
  },
  {
    id:             'mock-obs-004',
    name:           'Blood pressure',
    value:          '128/82',
    unit:           'mmHg',
    date:           '2026-08-24',
    category:       'vital-signs',
    interpretation: null,
  },
]

export const MOCK_IMMUNIZATIONS: ParsedImmunization[] = [
  {
    id:      'mock-imm-001',
    vaccine: 'Influenza vaccine',
    date:    '2025-10-12',
    status:  'completed',
  },
  {
    id:      'mock-imm-002',
    vaccine: 'COVID-19 booster',
    date:    '2024-09-28',
    status:  'completed',
  },
  {
    id:      'mock-imm-003',
    vaccine: 'Pneumococcal',
    date:    '2023-08-04',
    status:  'completed',
  },
  {
    id:      'mock-imm-004',
    vaccine: 'Shingles (recombinant)',
    date:    '2022-01-19',
    status:  'completed',
  },
]

// ── "For You" actionable items (drives the For You section) ───────────────────

export type MockForYouItem = {
  id: string
  kind: 'deductible-met' | 'claim-action' | 'preventive-due' | 'fsa-deadline'
  title: string
  body: string
  cta: string
  ctaHref: string
}

export const MOCK_FOR_YOU_ITEMS: MockForYouItem[] = [
  {
    id:    'mock-fy-001',
    kind:  'deductible-met',
    title: 'Your Medicare deductible is met.',
    body:  'Preventive visits and most covered services run at 100% for the rest of the plan year.',
    cta:   "See what's free now",
    ctaHref: '/plans?payer=cms',
  },
  {
    id:    'mock-fy-002',
    kind:  'claim-action',
    title: 'Dr. Sarah Chen wants $135.',
    body:  'Cigna processed it as patient responsibility on Aug 24. We can walk you through whether to dispute.',
    cta:   'Review claim',
    ctaHref: '/claims',
  },
]

// ── Greeting name for the mock dataset ────────────────────────────────────────

export const MOCK_USER_FIRST_NAME = 'Sarthak'
