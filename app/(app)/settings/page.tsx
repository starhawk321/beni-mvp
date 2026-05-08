import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'

const navTabs = [
  { label: 'Overview', href: '/dashboard', active: false },
  { label: 'Plan',     href: '/plan',      active: false },
  { label: 'Terms',    href: '/terms',     active: false },
  { label: 'Settings', href: '/settings',  active: true  },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(251,246,238,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <nav style={{ display: 'flex', gap: 2, background: 'var(--bg-sunken)', borderRadius: 'var(--r-pill)', padding: 3 }}>
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
        <SignOutButton />
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 28px' }}>
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 32 }}>Settings</h1>

        {/* Account section */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Account</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            <div style={{ padding: '16px 20px' }}>
              <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Account ID</p>
              <p className="t-mono" style={{ color: 'var(--fg-3)', fontSize: 12 }}>{user?.id}</p>
            </div>
          </div>
        </section>

        {/* Connected insurer section */}
        <section style={{ marginBottom: 28 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Insurance connection</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: 'var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Connected insurer</p>
                <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Aetna</p>
              </div>
              <span className="badge badge-positive">Active</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="t-caption" style={{ color: 'var(--fg-4)', marginBottom: 4 }}>Access type</p>
                <p className="t-body-s" style={{ color: 'var(--fg-2)' }}>Read-only · FHIR Patient Access API</p>
              </div>
              <Link href="/onboarding" style={{
                height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
                border: 'var(--border-strong)', background: 'transparent',
                fontSize: 13, fontWeight: 600, color: 'var(--fg-2)',
                display: 'flex', alignItems: 'center', textDecoration: 'none',
                fontFamily: 'var(--font-manrope), sans-serif',
              }}>
                Reconnect
              </Link>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Session</p>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>Sign out</p>
              <p className="t-caption" style={{ color: 'var(--fg-4)' }}>You can sign back in any time</p>
            </div>
            <SignOutButton />
          </div>
        </section>
      </main>
    </div>
  )
}
