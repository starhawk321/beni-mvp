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

  return (
    <div>
      <main className="beni-main" style={{ maxWidth: 640 }}>
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 32 }}>Settings</h1>

        {/* Account section */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Account</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {(profile?.first_name || profile?.last_name) && (
              <div style={{ padding: '16px 20px', borderBottom: 'var(--border-hairline)' }}>
                <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Name</p>
                <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>
                  {[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
                </p>
              </div>
            )}
            <div style={{ padding: '16px 20px', borderBottom: 'var(--border-hairline)' }}>
              <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Email</p>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{user?.email}</p>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: 'var(--border-hairline)' }}>
              <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Member since</p>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Connected insurers */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Connected insurers</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ConnectedInsurers insurers={connectedInsurers} />
          </div>
        </section>

        {/* Appearance */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Appearance</p>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Theme</p>
              <p className="t-caption" style={{ color: 'var(--fg-4)' }}>Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Session */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Session</p>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Sign out</p>
              <p className="t-caption" style={{ color: 'var(--fg-4)' }}>You can sign back in any time</p>
            </div>
            <SignOutButton />
          </div>
        </section>

        {/* Legal */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Legal</p>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Privacy Policy</p>
            <Link href="/privacy" style={{ fontSize: 13, fontWeight: 600, color: 'var(--beni-sky)', textDecoration: 'none', fontFamily: 'var(--font-manrope), sans-serif' }}>
              View →
            </Link>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <p className="t-overline" style={{ color: 'var(--status-critical)', marginBottom: 12 }}>Danger zone</p>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--status-critical-bg)' }}>
            <div>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Delete account</p>
              <p className="t-caption" style={{ color: 'var(--fg-4)' }}>Permanently deletes your account and disconnects all insurers</p>
            </div>
            <DeleteAccountButton />
          </div>
        </section>
      </main>
    </div>
  )
}
