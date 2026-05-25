import { createClient } from '@/lib/supabase/server'
import DashboardInteractive from '@/components/DashboardInteractive'
import { calculateSpending } from '@/lib/fhir/parsers'
import { fetchAllPayersData, aggregateBenefitBalances } from '@/lib/fhir/multi-payer'
import { fmt } from '@/lib/utils/format'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''

  const [{ data: profile }, payersData] = await Promise.all([
    supabase.from('profiles').select('selected_insurer, first_name').eq('id', user!.id).single(),
    fetchAllPayersData(supabase, user!.id),
  ])

  const isConnected = payersData.length > 0 || !!profile?.selected_insurer

  // Merge claims + EOBs across all connected payers
  const claims         = payersData.flatMap(d => d.claims).sort((a, b) => {
    if (!a.serviceDate) return 1
    if (!b.serviceDate) return -1
    return b.serviceDate.localeCompare(a.serviceDate)
  })
  const rawEobs        = payersData.flatMap(d => d.rawEobs)
  const benefitBalance = aggregateBenefitBalances(payersData)

  const hasFHIRData = payersData.some(d => d.coverage !== null) || claims.length > 0
  const greeting    = profile?.first_name ?? email.split('@')[0]

  const { totalPatient } = calculateSpending(claims)

  // Use first connected payer for plan summary (sidebar)
  const primary     = payersData[0]
  const planName    = primary?.coverage?.planName    ?? 'Your plan'
  const planType    = primary?.coverage?.planType    ?? '—'
  const insurerName = primary?.coverage?.insurerName ?? profile?.selected_insurer ?? 'Your insurer'

  const deductibleTotal = benefitBalance.deductibleTotal
  const oopTotal        = benefitBalance.oopTotal
  const deductibleMet   = benefitBalance.deductibleMet ?? (deductibleTotal != null ? Math.min(totalPatient, deductibleTotal) : null)
  const oopMet          = benefitBalance.oopMet        ?? (oopTotal        != null ? Math.min(totalPatient, oopTotal)        : null)

  // One account card per connected insurer
  const PAYER_COLORS: Record<string, string> = { cms: '#B8D0E8', cigna: '#FFC4BE', bcbs: '#C7E5F2' }
  const accountCards = payersData.length > 0
    ? payersData.map(d => {
        const payerTotal = d.claims.reduce((s, c) => s + c.amountPatient, 0)
        return {
          label:   d.displayName,
          color:   PAYER_COLORS[d.payer] ?? '#D8CDF2',
          balance: fmt(payerTotal),
          sub:     `${d.coverage?.planType ?? 'Health plan'} · ${d.claims.length} claim${d.claims.length !== 1 ? 's' : ''}`,
        }
      })
    : [
        { label: 'Medical', color: '#B8D0E8', balance: '—', sub: 'Connect an insurer to see data' },
      ]

  return (
    <div>
      <DashboardInteractive
        greeting={greeting}
        claims={claims}
        rawEobs={rawEobs}
        hasFHIRData={hasFHIRData}
        isConnected={isConnected}
        totalPatient={totalPatient}
        benefitBalance={benefitBalance}
        deductibleMet={deductibleMet}
        deductibleTotal={deductibleTotal}
        oopMet={oopMet}
        oopTotal={oopTotal}
        planName={planName}
        planType={planType}
        insurerName={insurerName}
        accountCards={accountCards}
      />
    </div>
  )
}
