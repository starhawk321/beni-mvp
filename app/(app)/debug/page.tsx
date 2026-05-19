import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from '@/lib/fhir/token'
import { decryptToken } from '@/lib/fhir/crypto'
import {
  fetchCMSCoverage, fetchCMSEOBs, fetchCMSPatient,
  fetchCignaCoverage, fetchCignaEOBs, fetchCignaPatient,
} from '@/lib/fhir/client'
import {
  parseCoverage, parseEOBs, parsePatient, parseBenefitBalance, calculateSpending,
} from '@/lib/fhir/parsers'

// ⚠️ Dev only — never accessible in production
export default async function DebugPage() {
  // Only available when DEBUG_ENABLED=true (set in Vercel Preview env, never Production)
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_ENABLED) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: cmsToken }, { data: cignaToken }] = await Promise.all([
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user.id).eq('payer', 'cms').single(),
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user.id).eq('payer', 'cigna').single(),
  ])

  async function fetchPayer(tokenRow: typeof cmsToken, payer: 'cms' | 'cigna') {
    if (!tokenRow) return null
    try {
      const accessToken = await getValidAccessToken(tokenRow, payer)
      const patientId   = decryptToken(tokenRow.patient_id)
      if (!accessToken || !patientId) return { error: 'Could not decrypt token or patient ID' }

      const isCigna = payer === 'cigna'
      const [coverageBundle, eobBundle, patientResource] = await Promise.all([
        isCigna ? fetchCignaCoverage(patientId, accessToken) : fetchCMSCoverage(patientId, accessToken),
        isCigna ? fetchCignaEOBs(patientId, accessToken)    : fetchCMSEOBs(patientId, accessToken),
        (isCigna ? fetchCignaPatient(patientId, accessToken) : fetchCMSPatient(patientId, accessToken)).catch(() => null),
      ])

      const eobResources      = eobBundle.entry?.map(e => e.resource) ?? []
      const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []

      return {
        tokenPrefix: accessToken.slice(0, 16) + '...',
        patientId,
        expiresAt: tokenRow.expires_at,
        raw: {
          coverage: coverageBundle,
          eob:      eobBundle,
          patient:  patientResource,
        },
        parsed: {
          coverage:      coverageResources[0] ? parseCoverage(coverageResources[0]) : null,
          claims:        parseEOBs(eobResources),
          spending:      calculateSpending(parseEOBs(eobResources)),
          benefitBalance: parseBenefitBalance(eobResources),
          patient:       patientResource ? parsePatient(patientResource) : null,
        },
      }
    } catch (err) {
      return { error: String(err) }
    }
  }

  const [cmsData, cignaData] = await Promise.all([
    fetchPayer(cmsToken, 'cms'),
    fetchPayer(cignaToken, 'cigna'),
  ])

  const sections = [
    { label: 'CMS (Medicare)', data: cmsData, connected: !!cmsToken },
    { label: 'Cigna',          data: cignaData, connected: !!cignaToken },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', padding: '32px 28px', fontFamily: 'var(--font-manrope), sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 className="t-h1" style={{ color: 'var(--fg-1)', margin: 0 }}>FHIR Debug Inspector</h1>
          <span style={{ background: '#FF7A00', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em' }}>DEV ONLY</span>
        </div>
        <p className="t-body-s" style={{ color: 'var(--fg-3)', marginBottom: 32 }}>
          Raw FHIR data and parsed output for all connected payers. Not available in production.
        </p>

        {sections.map(({ label, data, connected }) => (
          <details key={label} open style={{ marginBottom: 24 }}>
            <summary style={{
              cursor: 'pointer', padding: '14px 18px',
              background: 'var(--bg-surface)', border: 'var(--border-hairline)',
              borderRadius: 'var(--r-4)', marginBottom: 2,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 15, fontWeight: 700, color: 'var(--fg-1)',
              listStyle: 'none',
            }}>
              {label}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                background: connected ? 'var(--status-positive-bg)' : 'var(--bg-sunken)',
                color: connected ? 'var(--status-positive)' : 'var(--fg-4)',
              }}>
                {connected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </summary>

            {!connected && (
              <div style={{ padding: '16px 18px', background: 'var(--bg-sunken)', borderRadius: 'var(--r-3)', color: 'var(--fg-4)' }}>
                No token found for this payer.
              </div>
            )}

            {connected && data && 'error' in data && (
              <div style={{ padding: '16px 18px', background: 'var(--status-critical-bg)', borderRadius: 'var(--r-3)', color: 'var(--status-critical)' }}>
                Error: {(data as { error: string }).error}
              </div>
            )}

            {connected && data && !('error' in data) && (() => {
              const d = data as Exclude<typeof data, null | { error: string }>
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                  {/* Token info */}
                  <JsonBlock title="Token" data={{ tokenPrefix: d.tokenPrefix, patientId: d.patientId, expiresAt: d.expiresAt }} />

                  {/* Parsed output */}
                  <JsonBlock title="Parsed — Coverage" data={d.parsed.coverage} />
                  <JsonBlock title="Parsed — Spending" data={d.parsed.spending} />
                  <JsonBlock title="Parsed — Benefit Balance" data={d.parsed.benefitBalance} />
                  <JsonBlock title={`Parsed — Claims (${d.parsed.claims.length})`} data={d.parsed.claims} />
                  <JsonBlock title="Parsed — Patient" data={d.parsed.patient} />

                  {/* Raw FHIR */}
                  <JsonBlock title={`Raw — Coverage (total: ${d.raw.coverage.total})`} data={d.raw.coverage} collapsed />
                  <JsonBlock title={`Raw — EOBs (total: ${d.raw.eob.total})`} data={d.raw.eob} collapsed />
                  <JsonBlock title="Raw — Patient" data={d.raw.patient} collapsed />
                </div>
              )
            })()}
          </details>
        ))}
      </div>
    </div>
  )
}

function JsonBlock({ title, data, collapsed = false }: { title: string; data: unknown; collapsed?: boolean }) {
  return (
    <details open={!collapsed} style={{ background: 'var(--bg-surface)', border: 'var(--border-hairline)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
      <summary style={{
        cursor: 'pointer', padding: '10px 16px',
        fontSize: 12, fontWeight: 600, color: 'var(--fg-3)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        listStyle: 'none', borderBottom: 'var(--border-hairline)',
      }}>
        {title}
      </summary>
      <pre style={{
        margin: 0, padding: '14px 16px',
        fontSize: 12, lineHeight: 1.6,
        color: 'var(--fg-2)',
        overflowX: 'auto',
        maxHeight: 400,
        overflowY: 'auto',
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  )
}
