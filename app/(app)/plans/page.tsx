import { createClient } from '@/lib/supabase/server'
import PlansClient, { type PlanDetail } from '@/components/PlansClient'
import { fetchAllPayersData, type PayerData } from '@/lib/fhir/multi-payer'
import { MOCK_PAYERS, MOCK_PLAN_EXTRAS } from '@/lib/mock-data'

function realPlanDetail(d: PayerData): PlanDetail {
  const b = d.benefitBalance
  return {
    payer:    d.payer,
    carrier:  d.coverage?.insurerName ?? d.displayName,
    plan:     d.coverage?.planName ?? d.displayName,
    planType: d.coverage?.planType ?? null,
    memberId: d.coverage?.subscriberId ?? '—',
    group:    null,
    effective: d.coverage?.periodStart ?? null,
    coverageEnd: d.coverage?.periodEnd ?? null,
    network:  null,
    deductible: b.deductibleTotal != null
      ? { used: b.deductibleMet ?? 0, total: b.deductibleTotal, met: (b.deductibleMet ?? 0) >= b.deductibleTotal }
      : null,
    oopMax: b.oopTotal != null ? { used: b.oopMet ?? 0, total: b.oopTotal } : null,
    benefits: [], // not available from FHIR — client shows a "not reported" note
  }
}

function mockPlanDetail(d: PayerData): PlanDetail {
  const extra = MOCK_PLAN_EXTRAS[d.payer]
  const b = d.benefitBalance
  return {
    payer:    d.payer,
    carrier:  d.coverage?.insurerName ?? d.displayName,
    plan:     d.coverage?.planName ?? d.displayName,
    planType: extra?.type ?? d.coverage?.planType ?? null,
    memberId: d.coverage?.subscriberId ?? '—',
    group:    extra?.group ?? null,
    effective: extra?.effective ?? null,
    coverageEnd: extra?.coverageEnd ?? d.coverage?.periodEnd ?? null,
    network:  extra?.network ?? null,
    deductible: b.deductibleTotal != null
      ? { used: b.deductibleMet ?? 0, total: b.deductibleTotal, met: (b.deductibleMet ?? 0) >= b.deductibleTotal }
      : null,
    oopMax: b.oopTotal != null ? { used: b.oopMet ?? 0, total: b.oopTotal } : null,
    benefits: extra?.benefits ?? [],
  }
}

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ payer?: string }> }) {
  const { payer } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('connection_skipped')
    .eq('id', user!.id)
    .single()

  const skipped = profile?.connection_skipped === true

  const plans: PlanDetail[] = skipped
    ? MOCK_PAYERS.map(mockPlanDetail)
    : (await fetchAllPayersData(supabase, user!.id)).map(realPlanDetail)

  return <PlansClient plans={plans} initialPayer={payer} />
}
