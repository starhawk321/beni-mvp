import { createClient } from '@/lib/supabase/server'
import ClaimsClient, { type ClaimEntry } from '@/components/ClaimsClient'
import { fetchAllPayersData, type PayerData } from '@/lib/fhir/multi-payer'
import { MOCK_PAYERS } from '@/lib/mock-data'

const PAYER_TONE: Record<string, 'cyan' | 'peach'> = { cms: 'cyan', cigna: 'peach', bcbs: 'cyan' }

const CLAIM_DETAIL: Record<string, string> = {
  institutional: 'Hospital / facility',
  professional:  'Office visit',
  pharmacy:      'Prescription',
  oral:          'Dental',
  vision:        'Vision',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function monthKeyLabel(iso: string | null): { key: string; label: string } {
  if (!iso) return { key: '0000-00', label: 'Undated' }
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { key: '0000-00', label: 'Undated' }
  const y = d.getFullYear()
  const m = d.getMonth()
  return { key: `${y}-${String(m + 1).padStart(2, '0')}`, label: `${MONTHS[m]} ${y}` }
}

function toEntries(payers: PayerData[]): ClaimEntry[] {
  return payers.flatMap(d =>
    d.claims.map(c => {
      const { key, label } = monthKeyLabel(c.serviceDate)
      return {
        eobId:     c.eobId,
        provider:  c.provider,
        detail:    CLAIM_DETAIL[c.claimType] ?? 'Claim',
        payer:     d.displayName,
        payerKey:  d.payer,
        payerTone: PAYER_TONE[d.payer] ?? 'cyan',
        date:      c.serviceDate,
        monthKey:  key,
        monthLabel: label,
        insPaid:   c.amountPaid,
        oop:       c.amountPatient,
        status:    (c.amountPatient > 0 ? 'you-paid' : 'processed') as ClaimEntry['status'],
      }
    })
  )
}

export default async function ClaimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('connection_skipped')
    .eq('id', user!.id)
    .single()

  const payers = profile?.connection_skipped === true
    ? MOCK_PAYERS
    : await fetchAllPayersData(supabase, user!.id)

  const entries = toEntries(payers).sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
  const claims  = payers.flatMap(d => d.claims)
  const rawEobs = payers.flatMap(d => d.rawEobs)
  const planYear = String(new Date().getFullYear())

  return <ClaimsClient entries={entries} claims={claims} rawEobs={rawEobs} planYear={planYear} />
}
