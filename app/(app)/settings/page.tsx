import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import ThemeToggle from '@/components/ThemeToggle'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import ConnectedInsurers, { type ConnectedInsurer } from '@/components/ConnectedInsurers'
import Link from 'next/link'

const INSURER_META: Record<string, Omit<ConnectedInsurer, 'payer'>> = {
  cms:   { displayName: 'Medicare (CMS)',          color: '#1565C0', initials: 'Mc' },
  cigna: { displayName: 'Cigna',                   color: '#FF7A00', initials: 'Ci' },
  bcbs:  { displayName: 'BlueCross BlueShield MN', color: '#005EB8', initials: 'BC' },
  aetna: { displayName: 'Aetna',                   color: '#7B2D8E', initials: 'Ae' },
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 20, overflow: 'hidden' }}>
      <header style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--hair)' }}>
        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{title}</div>
        {sub && <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>{sub}</div>}
      </header>
      <div>{children}</div>
    </section>
  )
}

function Row({ label, value, action, last }: { label: string; value?: string; action?: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: 16, borderBottom: last ? 'none' : '1px solid var(--hair)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>{label}</div>
        {value && <div style={{ marginTop: 4, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>{value}</div>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: fhirTokens }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('fhir_tokens').select('payer').eq('user_id', user!.id),
  ])

  const connectedInsurers: ConnectedInsurer[] = (fhirTokens ?? [])
    .filter(t => INSURER_META[t.payer])
    .map(t => ({ payer: t.payer as ConnectedInsurer['payer'], ...INSURER_META[t.payer] }))

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  return (
    <main className="beni-main" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 96 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>Account</div>
        <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--ink)' }} className="beni-hero-title">Settings</h1>
      </div>

      <Card title="Profile">
        {fullName && <Row label="Name" value={fullName} />}
        <Row label="Email" value={user?.email ?? ''} />
        <Row label="Member since" value={memberSince} last />
      </Card>

      <Card title="Connected insurers" sub={`${connectedInsurers.length} active · synced fresh every hour`}>
        <ConnectedInsurers insurers={connectedInsurers} />
      </Card>

      <Card title="Appearance" sub="Béni's two faces — pick whichever matches the time of day.">
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>Theme</div>
            <div style={{ marginTop: 2, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>Switch between light and dark</div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card title="Legal & privacy">
        <Row label="Privacy policy" value="What we read, what we never store." action={
          <Link href="/privacy" style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--accent-sky)', textDecoration: 'none' }}>View →</Link>
        } last />
      </Card>

      <Card title="Session">
        <Row label="Signed in as" value={user?.email ?? ''} action={<SignOutButton />} last />
      </Card>

      {/* Danger zone */}
      <section style={{ background: 'var(--surface-2)', border: '1px solid rgba(229,91,184,0.30)', borderRadius: 20, overflow: 'hidden' }}>
        <header style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--hair)' }}>
          <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 16, color: '#E55BB8', letterSpacing: '-0.005em' }}>Danger zone</div>
        </header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>Delete account</div>
            <div style={{ marginTop: 2, fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13, color: 'var(--ink-dim)' }}>Permanently deletes your account and disconnects all insurers</div>
          </div>
          <DeleteAccountButton />
        </div>
      </section>
    </main>
  )
}
