import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchCoverage, fetchEOBs, fetchPatient, fetchCMSCoverage, fetchCMSEOBs, fetchCMSPatient, SANDBOX_PATIENTS } from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, parsePatient, calculateSpending } from '@/lib/fhir/parsers'
import { detectConflicts, detectAutoFills } from '@/lib/fhir/conflicts'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user has a CMS token
    const { data: cmsToken } = await supabase
      .from('fhir_tokens')
      .select('access_token, patient_id')
      .eq('user_id', user.id)
      .eq('payer', 'cms')
      .single()

    // Use CMS Blue Button if token exists, otherwise fall back to SMART sandbox
    const useCMS = !!cmsToken?.access_token && !!cmsToken?.patient_id

    const [coverageBundle, eobBundle, patientResource] = await Promise.all(
      useCMS
        ? [
            fetchCMSCoverage(cmsToken.patient_id, cmsToken.access_token),
            fetchCMSEOBs(cmsToken.patient_id, cmsToken.access_token),
            fetchCMSPatient(cmsToken.patient_id, cmsToken.access_token),
          ]
        : [
            fetchCoverage(SANDBOX_PATIENTS.coverage),
            fetchEOBs(SANDBOX_PATIENTS.claims),
            fetchPatient(SANDBOX_PATIENTS.coverage),
          ]
    )

    // Parse
    const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
    const coverage  = coverageResources[0] ? parseCoverage(coverageResources[0]) : null
    const claims    = parseEOBs(eobBundle.entry?.map(e => e.resource) ?? [])
    const spending  = calculateSpending(claims)
    const patient   = parsePatient(patientResource)

    // Store coverage
    if (coverage) {
      await supabase.from('fhir_coverage').delete().eq('user_id', user.id)
      await supabase.from('fhir_coverage').insert({
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
      })
    }

    // Store claims
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

    // Fetch current profile to check for conflicts
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, date_of_birth, gender')
      .eq('id', user.id)
      .single()

    let conflicts: ReturnType<typeof detectConflicts> = []
    let hasConflicts = false

    if (profile) {
      // Auto-fill empty profile fields from FHIR (no conflict — just fill)
      const autoFills = detectAutoFills(profile, patient)
      if (Object.keys(autoFills).length > 0) {
        await supabase.from('profiles').update(autoFills).eq('id', user.id)
      }

      // Detect real conflicts (both sides have values that differ)
      conflicts = detectConflicts(profile, patient)
      hasConflicts = conflicts.length > 0

      // Store pending conflicts in profiles for the resolution screen
      if (hasConflicts) {
        await supabase.from('profiles')
          .update({ pending_conflicts: conflicts })
          .eq('id', user.id)
      }
    }

    return NextResponse.json({
      success: true,
      coverage: coverage ? {
        planName:    coverage.planName,
        planType:    coverage.planType,
        insurerName: coverage.insurerName,
      } : null,
      patient,
      spending,
      hasConflicts,
      conflicts,
    })
  } catch (err) {
    console.error('FHIR sync error:', err)
    return NextResponse.json({ error: 'Sync failed', detail: String(err) }, { status: 500 })
  }
}
