import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchCoverage, fetchEOBs, SANDBOX_PATIENTS } from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending } from '@/lib/fhir/parsers'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch Coverage
    const coverageBundle = await fetchCoverage(SANDBOX_PATIENTS.coverage)
    const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
    const coverage = coverageResources[0] ? parseCoverage(coverageResources[0]) : null

    // Fetch EOBs
    const eobBundle = await fetchEOBs(SANDBOX_PATIENTS.claims)
    const eobResources = eobBundle.entry?.map(e => e.resource) ?? []
    const claims = parseEOBs(eobResources)
    const spending = calculateSpending(claims)

    // Upsert coverage into Supabase
    if (coverage) {
      await supabase.from('fhir_coverage').upsert({
        user_id:       user.id,
        insurer_name:  coverage.insurerName,
        plan_name:     coverage.planName,
        plan_type:     coverage.planType,
        subscriber_id: coverage.subscriberId,
        period_start:  coverage.periodStart,
        period_end:    coverage.periodEnd,
        status:        coverage.status,
        raw:           coverageResources[0],
        synced_at:     new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    // Insert claims (delete old ones first to avoid duplicates)
    if (claims.length > 0) {
      await supabase.from('fhir_claims').delete().eq('user_id', user.id)
      await supabase.from('fhir_claims').insert(
        claims.map(c => ({
          user_id:        user.id,
          eob_id:         c.eobId,
          insurer_name:   c.insurerName,
          claim_type:     c.claimType,
          service_date:   c.serviceDate,
          provider:       c.provider,
          amount_charged: c.amountCharged,
          amount_paid:    c.amountPaid,
          amount_patient: c.amountPatient,
          status:         c.status,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      coverage: coverage ? {
        planName:    coverage.planName,
        planType:    coverage.planType,
        insurerName: coverage.insurerName,
      } : null,
      spending,
    })
  } catch (err) {
    console.error('FHIR sync error:', err)
    return NextResponse.json({ error: 'Sync failed', detail: String(err) }, { status: 500 })
  }
}
