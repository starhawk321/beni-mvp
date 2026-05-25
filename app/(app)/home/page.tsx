import { createClient } from '@/lib/supabase/server'
import DashboardHome, { type PlanCardData, type ActivityItem, type ForYouItem } from '@/components/DashboardHome'
import { fetchAllPayersData, type PayerData } from '@/lib/fhir/multi-payer'
import type { ParsedClaim } from '@/lib/fhir/parsers'
import {
  MOCK_PAYERS, MOCK_FOR_YOU_ITEMS, MOCK_USER_FIRST_NAME,
} from '@/lib/mock-data'

const PAYER_TONE: Record<string, 'cyan' | 'peach'> = { cms: 'cyan', cigna: 'peach', bcbs: 'cyan' }

const CLAIM_DETAIL: Record<string, string> = {
  institutional: 'Hospital / facility',
  professional:  'Office visit',
  pharmacy:      'Prescription',
  oral:          'Dental',
  vision:        'Vision',
}

function sum(claims: ParsedClaim[], key: 'amountPaid' | 'amountPatient'): number {
  return claims.reduce((s, c) => s + c[key], 0)
}

function toPlanCard(d: PayerData): PlanCardData {
  const b = d.benefitBalance
  return {
    payer:    d.payer,
    carrier:  d.coverage?.insurerName ?? d.displayName,
    plan:     d.coverage?.planName ?? d.displayName,
    memberId: d.coverage?.subscriberId ?? '—',
    insPaid:  sum(d.claims, 'amountPaid'),
    oop:      sum(d.claims, 'amountPatient'),
    claims:   d.claims.length,
    deductible: (b.deductibleTotal != null)
      ? { used: b.deductibleMet ?? 0, total: b.deductibleTotal, met: (b.deductibleMet ?? 0) >= b.deductibleTotal }
      : null,
    oopMax: (b.oopTotal != null)
      ? { used: b.oopMet ?? 0, total: b.oopTotal }
      : null,
  }
}

function toActivity(d: PayerData): ActivityItem[] {
  return d.claims.map(c => ({
    eobId:     c.eobId,
    provider:  c.provider,
    detail:    CLAIM_DETAIL[c.claimType] ?? 'Claim',
    payer:     d.displayName,
    payerTone: PAYER_TONE[d.payer] ?? 'cyan',
    date:      c.serviceDate,
    insPaid:   c.amountPaid,
    oop:       c.amountPatient,
  }))
}

// Derive a couple of simple "For you" insights from real data (analytics layer is minimal for now)
function deriveForYou(payers: PayerData[]): ForYouItem[] {
  const items: ForYouItem[] = []
  for (const d of payers) {
    const b = d.benefitBalance
    if (b.deductibleTotal != null && (b.deductibleMet ?? 0) >= b.deductibleTotal) {
      items.push({
        title: `Your ${d.displayName} deductible is met.`,
        body:  'Preventive visits and most covered services run at 100% for the rest of the plan year.',
        cta:   "See what's covered",
        ctaHref: `/plans?payer=${d.payer}`,
      })
    }
  }
  return items.slice(0, 2)
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, connection_skipped')
    .eq('id', user!.id)
    .single()

  const skipped = profile?.connection_skipped === true

  // Mock dataset for skip-mode users; real FHIR data otherwise
  let payers: PayerData[]
  let greeting: string
  let forYou: ForYouItem[]

  if (skipped) {
    payers   = MOCK_PAYERS
    greeting = MOCK_USER_FIRST_NAME
    forYou   = MOCK_FOR_YOU_ITEMS.map(it => ({ title: it.title, body: it.body, cta: it.cta, ctaHref: it.ctaHref }))
  } else {
    payers   = await fetchAllPayersData(supabase, user!.id)
    greeting = profile?.first_name ?? email.split('@')[0]
    forYou   = deriveForYou(payers)
  }

  const isConnected = payers.length > 0
  const allClaims = payers.flatMap(d => d.claims).sort((a, b) => {
    if (!a.serviceDate) return 1
    if (!b.serviceDate) return -1
    return b.serviceDate.localeCompare(a.serviceDate)
  })
  const rawEobs = payers.flatMap(d => d.rawEobs)

  const totals = {
    insPaid: sum(allClaims, 'amountPaid'),
    oop:     sum(allClaims, 'amountPatient'),
    claims:  allClaims.length,
  }

  const plans = payers.map(toPlanCard)

  // Activity tagged by payer, merged + most recent first, top 4 on the dashboard
  const activity = payers
    .flatMap(toActivity)
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
    .slice(0, 4)

  return (
    <DashboardHome
      greeting={greeting}
      isConnected={isConnected}
      totals={totals}
      plans={plans}
      forYou={forYou}
      activity={activity}
      claims={allClaims}
      rawEobs={rawEobs}
    />
  )
}
