import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'

const CMS_BASE = 'https://sandbox.bluebutton.cms.gov/v2/fhir'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tokenRow } = await supabase
    .from('fhir_tokens')
    .select('access_token, refresh_token, patient_id, expires_at')
    .eq('user_id', user.id)
    .eq('payer', 'cms')
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'No CMS token found' })

  const accessToken = await getValidAccessToken(tokenRow, 'cms')
  const patientId   = decryptToken(tokenRow.patient_id)

  if (!accessToken || !patientId) {
    return NextResponse.json({ error: 'Could not decrypt token or patient ID' })
  }

  const headers = {
    Accept: 'application/fhir+json',
    Authorization: `Bearer ${accessToken}`,
  }

  const [coverageRes, eobRes, patientRes] = await Promise.all([
    fetch(`${CMS_BASE}/Coverage?patient=${patientId}&_count=10`, { headers }),
    fetch(`${CMS_BASE}/ExplanationOfBenefit?patient=${patientId}&_count=5`, { headers }),
    fetch(`${CMS_BASE}/Patient/${patientId}`, { headers }),
  ])

  const [coverage, eob, patient] = await Promise.all([
    coverageRes.json(),
    eobRes.json(),
    patientRes.json(),
  ])

  return NextResponse.json({
    patientId,
    tokenPrefix: accessToken.slice(0, 12) + '...',
    coverage: { status: coverageRes.status, total: coverage.total, entry: coverage.entry },
    eob:      { status: eobRes.status,      total: eob.total,      entry: eob.entry      },
    patient:  { status: patientRes.status,  body:  patient                               },
  })
}
