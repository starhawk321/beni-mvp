import {
  fetchCMSCoverage, fetchCMSEOBs,
  fetchCignaCoverage, fetchCignaEOBs,
  fetchBCBSCoverage, fetchBCBSEOBs,
  fetchAetnaCoverage, fetchAetnaEOBs,
  type FHIRExplanationOfBenefit,
} from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, parseBenefitBalance } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { encryptToken, decryptToken } from '@/lib/fhir/crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Payer = 'cms' | 'cigna' | 'bcbs' | 'aetna'

export type PayerData = {
  payer: Payer
  displayName: string
  coverage: ReturnType<typeof parseCoverage> | null
  claims:   ReturnType<typeof parseEOBs>
  rawEobs:  FHIRExplanationOfBenefit[]
  benefitBalance: ReturnType<typeof parseBenefitBalance>
}

const PAYER_NAMES: Record<Payer, string> = {
  cms:   'Medicare',
  cigna: 'Cigna',
  bcbs:  'BlueCross BlueShield MN',
  aetna: 'Aetna',
}

type TokenRow = {
  access_token: string
  refresh_token: string | null
  patient_id: string
  expires_at: string | null
  payer: Payer
}

async function fetchPayerData(supabase: SupabaseClient, userId: string, tokenRow: TokenRow): Promise<PayerData | null> {
  try {
    const accessToken = await getValidAccessToken(tokenRow, tokenRow.payer)
    if (!accessToken) return null

    if (accessToken !== tokenRow.access_token) {
      await supabase.from('fhir_tokens').update({
        access_token: encryptToken(accessToken),
        expires_at:   new Date(Date.now() + 3600_000).toISOString(),
      }).eq('user_id', userId).eq('payer', tokenRow.payer)
    }

    const patientId = decryptToken(tokenRow.patient_id)
    if (!patientId) return null

    const [coverageBundle, eobBundle] = await Promise.all(
      tokenRow.payer === 'cigna'
        ? [fetchCignaCoverage(patientId, accessToken), fetchCignaEOBs(patientId, accessToken)]
        : tokenRow.payer === 'bcbs'
          ? [fetchBCBSCoverage(patientId, accessToken), fetchBCBSEOBs(patientId, accessToken)]
          : tokenRow.payer === 'aetna'
            ? [fetchAetnaCoverage(patientId, accessToken), fetchAetnaEOBs(patientId, accessToken)]
            : [fetchCMSCoverage(patientId, accessToken),  fetchCMSEOBs(patientId, accessToken)]
    )

    const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
    const eobResources      = eobBundle.entry?.map(e => e.resource) ?? []

    return {
      payer:          tokenRow.payer,
      displayName:    PAYER_NAMES[tokenRow.payer],
      coverage:       coverageResources[0] ? parseCoverage(coverageResources[0]) : null,
      claims:         parseEOBs(eobResources),
      rawEobs:        eobResources,
      benefitBalance: parseBenefitBalance(eobResources),
    }
  } catch (err) {
    console.error(`Failed to fetch ${tokenRow.payer} data:`, err)
    return null
  }
}

export async function fetchAllPayersData(supabase: SupabaseClient, userId: string): Promise<PayerData[]> {
  const { data: tokens } = await supabase
    .from('fhir_tokens')
    .select('access_token, refresh_token, patient_id, expires_at, payer')
    .eq('user_id', userId)

  if (!tokens?.length) return []

  const results = await Promise.all(
    (tokens as TokenRow[])
      .filter(t => ['cms', 'cigna', 'bcbs', 'aetna'].includes(t.payer))
      .map(t => fetchPayerData(supabase, userId, t))
  )

  return results.filter((d): d is PayerData => d !== null)
}

export function aggregateBenefitBalances(payerData: PayerData[]): ReturnType<typeof parseBenefitBalance> {
  const result: ReturnType<typeof parseBenefitBalance> = {
    deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null,
  }
  for (const d of payerData) {
    const b = d.benefitBalance
    if (b.deductibleMet   != null) result.deductibleMet   = (result.deductibleMet   ?? 0) + b.deductibleMet
    if (b.deductibleTotal != null) result.deductibleTotal = (result.deductibleTotal ?? 0) + b.deductibleTotal
    if (b.oopMet          != null) result.oopMet          = (result.oopMet          ?? 0) + b.oopMet
    if (b.oopTotal        != null) result.oopTotal        = (result.oopTotal        ?? 0) + b.oopTotal
  }
  return result
}
