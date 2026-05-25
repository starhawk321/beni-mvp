import { createClient } from '@/lib/supabase/server'
import RecordsClient, {
  type RecordsData, type Tone,
  type ConditionItem, type MedicationItem, type LabItem, type ImmunizationItem,
} from '@/components/RecordsClient'
import {
  fetchCMSConditions, fetchCMSMedications, fetchCMSObservations, fetchCMSImmunizations,
  fetchCignaConditions, fetchCignaMedications, fetchCignaObservations, fetchCignaImmunizations,
  fetchBCBSConditions, fetchBCBSMedications, fetchBCBSObservations, fetchBCBSImmunizations,
} from '@/lib/fhir/client'
import { parseConditions, parseMedications, parseObservations, parseImmunizations } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'
import {
  MOCK_CONDITIONS, MOCK_MEDICATIONS, MOCK_OBSERVATIONS, MOCK_IMMUNIZATIONS,
} from '@/lib/mock-data'

type Payer = 'cms' | 'cigna' | 'bcbs'
const TONE: Record<Payer, Tone> = { cms: 'cyan', cigna: 'peach', bcbs: 'cyan' }
const LABEL: Record<Payer, string> = { cms: 'Medicare', cigna: 'Cigna', bcbs: 'BlueCross BlueShield MN' }

const FETCHERS: Record<Payer, [typeof fetchCMSConditions, typeof fetchCMSMedications, typeof fetchCMSObservations, typeof fetchCMSImmunizations]> = {
  cms:   [fetchCMSConditions, fetchCMSMedications, fetchCMSObservations, fetchCMSImmunizations],
  cigna: [fetchCignaConditions, fetchCignaMedications, fetchCignaObservations, fetchCignaImmunizations],
  bcbs:  [fetchBCBSConditions, fetchBCBSMedications, fetchBCBSObservations, fetchBCBSImmunizations],
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

async function fetchPayerRecords(payer: Payer, accessToken: string, patientId: string): Promise<RecordsData> {
  const [fc, fm, fo, fi] = FETCHERS[payer]
  const tone = TONE[payer]
  const [cond, med, obs, imm] = await Promise.allSettled([
    fc(patientId, accessToken), fm(patientId, accessToken), fo(patientId, accessToken), fi(patientId, accessToken),
  ])
  return {
    conditions: cond.status === 'fulfilled'
      ? parseConditions(cond.value.entry?.map(e => e.resource) ?? []).map(c => ({ name: c.display, code: null, onset: c.onsetDate, status: cap(c.status), sources: [tone] }))
      : [],
    medications: med.status === 'fulfilled'
      ? parseMedications(med.value.entry?.map(e => e.resource) ?? []).map(m => ({ name: m.name, dose: m.dosage, prescriber: null, started: m.authoredOn, sources: [tone] }))
      : [],
    labs: obs.status === 'fulfilled'
      ? parseObservations(obs.value.entry?.map(e => e.resource) ?? []).map(o => ({ name: o.name, value: `${o.value}${o.unit ? ` ${o.unit}` : ''}`, range: null, interp: o.interpretation, date: o.date, sources: [tone] }))
      : [],
    immunizations: imm.status === 'fulfilled'
      ? parseImmunizations(imm.value.entry?.map(e => e.resource) ?? []).map(v => ({ name: v.vaccine, date: v.date, sources: [tone] }))
      : [],
  }
}

export default async function RecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('connection_skipped')
    .eq('id', user!.id)
    .single()

  // Mock mode
  if (profile?.connection_skipped === true) {
    const data: RecordsData = {
      conditions:    MOCK_CONDITIONS.map((c, i) => ({ name: c.display, code: null, onset: c.onsetDate, status: cap(c.status), sources: [i === 2 ? 'peach' : 'cyan'] as Tone[] })),
      medications:   MOCK_MEDICATIONS.map(m => ({ name: m.name, dose: m.dosage, prescriber: 'Dr. Patel', started: m.authoredOn, sources: ['cyan'] as Tone[] })),
      labs:          MOCK_OBSERVATIONS.map(o => ({ name: o.name, value: `${o.value}${o.unit ? ` ${o.unit}` : ''}`, range: null, interp: o.interpretation, date: o.date, sources: ['peach'] as Tone[] })),
      immunizations: MOCK_IMMUNIZATIONS.map(v => ({ name: v.vaccine, date: v.date, sources: ['cyan'] as Tone[] })),
    }
    return <RecordsClient data={data} sources={[{ tone: 'cyan', label: 'Medicare' }, { tone: 'peach', label: 'Cigna Medigap Plan G' }]} isConnected />
  }

  // Real data — fetch + merge across all connected payers
  const { data: tokens } = await supabase
    .from('fhir_tokens')
    .select('access_token, refresh_token, patient_id, expires_at, payer')
    .eq('user_id', user!.id)

  const payerRows = (tokens ?? []).filter(t => ['cms', 'cigna', 'bcbs'].includes(t.payer))

  const merged: RecordsData = { conditions: [], medications: [], labs: [], immunizations: [] }
  const sources: { tone: Tone; label: string }[] = []

  await Promise.all(payerRows.map(async (row) => {
    const payer = row.payer as Payer
    try {
      const accessToken = await getValidAccessToken(row, payer)
      const patientId   = accessToken ? decryptToken(row.patient_id) : null
      if (!accessToken || !patientId) return
      const data = await fetchPayerRecords(payer, accessToken, patientId)
      merged.conditions.push(...data.conditions)
      merged.medications.push(...data.medications)
      merged.labs.push(...data.labs)
      merged.immunizations.push(...data.immunizations)
      if (!sources.some(s => s.label === LABEL[payer])) sources.push({ tone: TONE[payer], label: LABEL[payer] })
    } catch (err) {
      console.error(`Records fetch failed for ${payer}:`, err)
    }
  }))

  return <RecordsClient data={merged} sources={sources} isConnected={payerRows.length > 0} />
}
