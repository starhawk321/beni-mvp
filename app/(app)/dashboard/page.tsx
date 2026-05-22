import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'
import HamburgerMenu from '@/components/HamburgerMenu'
import Link from 'next/link'
import DashboardInteractive from '@/components/DashboardInteractive'
import {
  fetchCMSCoverage, fetchCMSEOBs,
  fetchCignaCoverage, fetchCignaEOBs,
  fetchBCBSCoverage, fetchBCBSEOBs,
} from '@/lib/fhir/client'
import { parseCoverage, parseEOBs, calculateSpending, parseBenefitBalance } from '@/lib/fhir/parsers'
import { getValidAccessToken } from '@/lib/fhir/token'
import { encryptToken, decryptToken } from '@/lib/fhir/crypto'
import { fmt } from '@/lib/utils/format'

const navTabs = [
  { label: 'Overview', href: '/dashboard', active: true  },
  { label: 'Plan',     href: '/plan',      active: false },
  { label: 'Health',   href: '/health',    active: false },
  { label: 'Terms',    href: '/terms',     active: false },
  { label: 'Settings', href: '/settings',  active: false },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''

  const [{ data: cmsToken }, { data: cignaToken }, { data: bcbsToken }, { data: profile }] = await Promise.all([
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'cms').single(),
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'cigna').single(),
    supabase.from('fhir_tokens').select('access_token, refresh_token, patient_id, expires_at').eq('user_id', user!.id).eq('payer', 'bcbs').single(),
    supabase.from('profiles').select('selected_insurer, first_name').eq('id', user!.id).single(),
  ])

  const tokenRow   = cmsToken ?? cignaToken ?? bcbsToken
  const activePayer = cmsToken ? 'cms' : cignaToken ? 'cigna' : bcbsToken ? 'bcbs' : null
  const isConnected = !!activePayer || !!profile?.selected_insurer

  let coverage      = null
  let claims: ReturnType<typeof parseEOBs> = []
  let rawEobs: ReturnType<typeof Array<any>> = []
  let benefitBalance: ReturnType<typeof parseBenefitBalance> = {
    deductibleMet: null, deductibleTotal: null, oopMet: null, oopTotal: null,
  }

  if (tokenRow) {
    try {
      const accessToken = await getValidAccessToken(tokenRow, activePayer as 'cms' | 'cigna')
      if (accessToken) {
        if (accessToken !== tokenRow.access_token) {
          await supabase.from('fhir_tokens').update({
            access_token: encryptToken(accessToken),
            expires_at:   new Date(Date.now() + 3600_000).toISOString(),
          }).eq('user_id', user!.id).eq('payer', activePayer!)
        }

        const patientId = decryptToken(tokenRow.patient_id)
        if (!patientId) throw new Error('Failed to decrypt patient_id')

        const [coverageBundle, eobBundle] = await Promise.all(
          activePayer === 'cigna'
            ? [fetchCignaCoverage(patientId, accessToken), fetchCignaEOBs(patientId, accessToken)]
            : activePayer === 'bcbs'
              ? [fetchBCBSCoverage(patientId, accessToken), fetchBCBSEOBs(patientId, accessToken)]
              : [fetchCMSCoverage(patientId, accessToken),  fetchCMSEOBs(patientId, accessToken)]
        )

        const coverageResources = coverageBundle.entry?.map(e => e.resource) ?? []
        const eobResources      = eobBundle.entry?.map(e => e.resource) ?? []
        coverage       = coverageResources[0] ? parseCoverage(coverageResources[0]) : null
        claims         = parseEOBs(eobResources)
        rawEobs        = eobResources  // pass raw EOBs for line item drill-down
        benefitBalance = parseBenefitBalance(eobResources)
      }
    } catch (err) {
      console.error('Live FHIR fetch failed:', err)
    }
  }

  const hasFHIRData = !!coverage || claims.length > 0
  const greeting    = profile?.first_name ?? email.split('@')[0]

  const { totalPatient } = calculateSpending(claims)

  const planName    = coverage?.planName    ?? 'Your plan'
  const planType    = coverage?.planType    ?? '—'
  const insurerName = coverage?.insurerName ?? profile?.selected_insurer ?? 'Your insurer'

  const deductibleTotal = benefitBalance.deductibleTotal
  const oopTotal        = benefitBalance.oopTotal
  const deductibleMet   = benefitBalance.deductibleMet ?? (deductibleTotal != null ? Math.min(totalPatient, deductibleTotal) : null)
  const oopMet          = benefitBalance.oopMet        ?? (oopTotal        != null ? Math.min(totalPatient, oopTotal)        : null)

  const accountCards = [
    { label: 'Medical', color: '#B8D0E8', balance: fmt(totalPatient), sub: `${insurerName} ${planType} · Active` },
    { label: 'Dental',  color: '#C7E5F2', balance: '$0.00',           sub: `${insurerName} Dental · Active` },
    { label: 'FSA',     color: '#FFC4BE', balance: '$842.50',         sub: 'Expires Dec 31' },
    { label: 'Vision',  color: '#D8CDF2', balance: '$150.00',         sub: 'Annual benefit' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <nav className="beni-nav-pills" style={{ gap: 2, background: 'var(--bg-sunken)', borderRadius: 'var(--r-pill)', padding: 3 }}>
          {navTabs.map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              height: 32, padding: '0 16px', borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
              background: tab.active ? 'var(--beni-ink)' : 'transparent',
              color: tab.active ? '#fff' : 'var(--fg-3)',
              textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HamburgerMenu />
        </div>
      </header>

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
