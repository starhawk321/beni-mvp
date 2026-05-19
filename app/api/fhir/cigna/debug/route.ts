import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'

const CIGNA_BASE = 'https://fhir.cigna.com/PatientAccess/v1-devportal'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tokenRow } = await supabase
    .from('fhir_tokens')
    .select('access_token, refresh_token, patient_id, expires_at')
    .eq('user_id', user.id)
    .eq('payer', 'cigna')
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'No Cigna token found' })

  const accessToken = await getValidAccessToken(tokenRow, 'cigna')
  const patientId   = decryptToken(tokenRow.patient_id)

  if (!accessToken || !patientId) {
    return NextResponse.json({
      error: 'Could not decrypt token or patient ID',
      debug: {
        accessTokenDecrypted: !!decryptToken(tokenRow.access_token),
        patientIdDecrypted:   !!patientId,
        hasRefreshToken:      !!tokenRow.refresh_token,
        expiresAt:            tokenRow.expires_at,
        isExpired:            tokenRow.expires_at ? new Date(tokenRow.expires_at) <= new Date() : null,
      }
    })
  }

  const headers = {
    Accept:        'application/fhir+json',
    Authorization: `Bearer ${accessToken}`,
  }

  const [coverageRes, eobRes] = await Promise.all([
    fetch(`${CIGNA_BASE}/Coverage?patient=${patientId}&_count=5`, { headers }),
    fetch(`${CIGNA_BASE}/ExplanationOfBenefit?patient=${patientId}&_count=3`, { headers }),
  ])

  return NextResponse.json({
    patientId,
    tokenPrefix: accessToken.slice(0, 12) + '...',
    coverage: { status: coverageRes.status, body: await coverageRes.json().catch(() => coverageRes.text()) },
    eob:      { status: eobRes.status,      body: await eobRes.json().catch(() => eobRes.text()) },
  })
}
