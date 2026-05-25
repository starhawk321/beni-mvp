import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  fetchCMSConditions, fetchCMSMedications, fetchCMSObservations, fetchCMSImmunizations,
  fetchCignaConditions, fetchCignaMedications, fetchCignaObservations, fetchCignaImmunizations,
  fetchBCBSConditions, fetchBCBSMedications, fetchBCBSObservations, fetchBCBSImmunizations,
} from '@/lib/fhir/client'
import {
  parseConditions, parseMedications, parseObservations, parseImmunizations,
} from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'
import { formatDate } from '@/lib/utils/format'

function EmptySection({ label }: { label: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: 'var(--border-hairline)',
      borderRadius: 'var(--r-4)', padding: '24px', textAlign: 'center',
    }}>
      <p className="t-body-s" style={{ color: 'var(--fg-4)' }}>
        {label} not reported by your insurer via this connection.
      </p>
    </div>
  )
}

export default async function HealthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: cmsToken }, { data: cignaToken }, { data: bcbsToken }] = await Promise.all([
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'cms').single(),
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'cigna').single(),
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'bcbs').single(),
  ])

  const tokenRow    = cmsToken ?? cignaToken ?? bcbsToken
  const activePayer = cmsToken ? 'cms' : cignaToken ? 'cigna' : bcbsToken ? 'bcbs' : null

  let conditions    = parseConditions([])
  let medications   = parseMedications([])
  let observations  = parseObservations([])
  let immunizations = parseImmunizations([])

  if (tokenRow && activePayer) {
    try {
      const accessToken = await getValidAccessToken(tokenRow, activePayer as 'cms' | 'cigna')
      const patientId   = accessToken ? decryptToken(tokenRow.patient_id) : null

      if (accessToken && patientId) {
        const [condBundle, medBundle, obsBundle, immBundle] = await Promise.allSettled(
          activePayer === 'cigna'
            ? [fetchCignaConditions(patientId, accessToken), fetchCignaMedications(patientId, accessToken), fetchCignaObservations(patientId, accessToken), fetchCignaImmunizations(patientId, accessToken)]
            : activePayer === 'bcbs'
              ? [fetchBCBSConditions(patientId, accessToken), fetchBCBSMedications(patientId, accessToken), fetchBCBSObservations(patientId, accessToken), fetchBCBSImmunizations(patientId, accessToken)]
              : [fetchCMSConditions(patientId, accessToken), fetchCMSMedications(patientId, accessToken), fetchCMSObservations(patientId, accessToken), fetchCMSImmunizations(patientId, accessToken)]
        )

        if (condBundle.status === 'fulfilled') conditions   = parseConditions(condBundle.value.entry?.map(e => e.resource) ?? [])
        if (medBundle.status  === 'fulfilled') medications  = parseMedications(medBundle.value.entry?.map(e => e.resource) ?? [])
        if (obsBundle.status  === 'fulfilled') observations = parseObservations(obsBundle.value.entry?.map(e => e.resource) ?? [])
        if (immBundle.status  === 'fulfilled') immunizations = parseImmunizations(immBundle.value.entry?.map(e => e.resource) ?? [])
      }
    } catch (err) {
      console.error('Health page FHIR fetch failed:', err)
    }
  }

  return (
    <div>
      <main className="beni-main">
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 6 }}>Health records</h1>
        <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>
          Pulled directly from your insurer. Beni never stores this data.
        </p>

        {!tokenRow && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p className="t-body-strong" style={{ color: 'var(--fg-2)', marginBottom: 8 }}>No insurer connected</p>
            <Link href="/onboarding" style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>Connect an insurer →</Link>
          </div>
        )}

        {tokenRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

            {/* Conditions */}
            <section>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Conditions</p>
              {conditions.length === 0 ? <EmptySection label="Conditions" /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {conditions.map((c, i) => (
                    <div key={c.id} style={{
                      padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: i < conditions.length - 1 ? 'var(--border-hairline)' : 'none',
                    }}>
                      <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{c.display}</p>
                      <span className="t-caption" style={{ color: 'var(--fg-4)' }}>{formatDate(c.onsetDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Medications */}
            <section>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Medications</p>
              {medications.length === 0 ? <EmptySection label="Medications" /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {medications.map((m, i) => (
                    <div key={m.id} style={{
                      padding: '14px 20px',
                      borderBottom: i < medications.length - 1 ? 'var(--border-hairline)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p className="t-body-strong" style={{ color: 'var(--fg-1)', marginBottom: 2 }}>{m.name}</p>
                        <span className="t-caption" style={{ color: 'var(--fg-4)', flexShrink: 0, marginLeft: 12 }}>{formatDate(m.authoredOn)}</span>
                      </div>
                      {m.dosage && <p className="t-caption" style={{ color: 'var(--fg-3)' }}>{m.dosage}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Lab Results */}
            <section>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Lab results</p>
              {observations.length === 0 ? <EmptySection label="Lab results" /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {observations.map((o, i) => (
                    <div key={o.id} style={{
                      padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: i < observations.length - 1 ? 'var(--border-hairline)' : 'none',
                    }}>
                      <div>
                        <p className="t-body-strong" style={{ color: 'var(--fg-1)', marginBottom: 2 }}>{o.name}</p>
                        <span className="t-caption" style={{ color: 'var(--fg-4)' }}>{formatDate(o.date)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', margin: 0 }}>
                          {o.value}{o.unit ? ` ${o.unit}` : ''}
                        </p>
                        {o.interpretation && (
                          <span className="t-caption" style={{ color: 'var(--fg-4)' }}>{o.interpretation}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Immunizations */}
            <section>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Immunizations</p>
              {immunizations.length === 0 ? <EmptySection label="Immunizations" /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {immunizations.map((imm, i) => (
                    <div key={imm.id} style={{
                      padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: i < immunizations.length - 1 ? 'var(--border-hairline)' : 'none',
                    }}>
                      <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{imm.vaccine}</p>
                      <span className="t-caption" style={{ color: 'var(--fg-4)' }}>{formatDate(imm.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  )
}
