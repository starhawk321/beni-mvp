import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''
  const initials = email.slice(0, 1).toUpperCase()
  const greeting = email.split('@')[0]

  const accounts = [
    { label: 'Medical', color: '#B8D0E8', balance: '$0',      sub: 'Aetna PPO · Active',    href: '/plan' },
    { label: 'Dental',  color: '#C7E5F2', balance: '$0',      sub: 'Aetna Dental · Active',  href: '/plan' },
    { label: 'FSA',     color: '#FFC4BE', balance: '$842.50', sub: 'Expires Dec 31',          href: '/plan' },
    { label: 'Vision',  color: '#D8CDF2', balance: '$150.00', sub: 'Annual benefit',          href: '/plan' },
  ]

  const claims = [
    { provider: 'Primary Care Visit',  date: 'Apr 28', amount: '-$30.00',  badge: 'Processed' },
    { provider: 'Lab Work — Quest',    date: 'Apr 15', amount: '-$0.00',   badge: 'Covered'   },
    { provider: 'Specialist Consult',  date: 'Mar 30', amount: '-$60.00',  badge: 'Processed' },
    { provider: 'Pharmacy — CVS',      date: 'Mar 18', amount: '-$12.50',  badge: 'Processed' },
  ]

  const navTabs = [
    { label: 'Overview', href: '/dashboard', active: true  },
    { label: 'Plan',     href: '/plan',      active: false },
    { label: 'Terms',    href: '/terms',     active: false },
    { label: 'Settings', href: '/settings',  active: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(251,246,238,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />

        <nav style={{
          display: 'flex', gap: 2,
          background: 'var(--bg-sunken)', borderRadius: 'var(--r-pill)',
          padding: 3,
        }}>
          {navTabs.map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              height: 32, padding: '0 16px', borderRadius: 'var(--r-pill)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
              background: tab.active ? 'var(--beni-ink)' : 'transparent',
              color: tab.active ? '#fff' : 'var(--fg-3)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center',
              transition: 'background 150ms',
            }}>
              {tab.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--beni-navy)', color: 'var(--fg-on-navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 13,
          }}>
            {initials}
          </div>
          <SignOutButton />
        </div>
      </header>

      <main style={{ maxWidth: 'var(--container-web)', margin: '0 auto', padding: '40px 28px' }}>
        <h1 className="t-display-l" style={{ color: 'var(--fg-1)', marginBottom: 28 }}>
          Hello, {greeting}.
        </h1>

        {/* Hero balance card */}
        <div style={{
          background: 'var(--beni-navy)', borderRadius: 'var(--r-6)',
          padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: 80, width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,161,153,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, right: -20, width: 240, height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,153,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p className="t-overline" style={{ color: 'rgba(244,236,222,0.6)', marginBottom: 8 }}>
            Total benefits value
          </p>
          <p style={{
            fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700,
            fontSize: 64, color: '#fff', fontVariantNumeric: 'tabular-nums', marginBottom: 24,
          }}>
            $8,450.00
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Deductible met', value: '$1,200 / $3,000' },
              { label: 'Out-of-pocket',  value: '$1,800 / $6,000' },
              { label: 'FSA balance',    value: '$842.50'          },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,231,194,.18)', backdropFilter: 'blur(4px)',
                borderRadius: 'var(--r-pill)', padding: '8px 16px',
              }}>
                <span className="t-caption" style={{ color: 'rgba(244,236,222,0.7)', display: 'block', marginBottom: 2 }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontWeight: 700, fontSize: 15, color: '#fff', fontVariantNumeric: 'tabular-nums',
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main + sidebar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Account cards */}
            <div>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Your accounts</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {accounts.map((acct) => (
                  <Link key={acct.label} href={acct.href} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 22, borderLeft: `6px solid ${acct.color}`, cursor: 'pointer' }}>
                      <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>{acct.label}</p>
                      <p className="t-numeric-l" style={{ color: 'var(--fg-1)', marginBottom: 4 }}>{acct.balance}</p>
                      <p className="t-caption" style={{ color: 'var(--fg-4)' }}>{acct.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Claims feed */}
            <div>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Recent activity</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {claims.map((claim) => (
                  <div key={claim.provider} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bg-surface)', border: 'var(--border-hairline)',
                    borderRadius: 'var(--r-4)', padding: '14px 16px',
                    boxShadow: 'var(--shadow-1)',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--r-3)',
                      background: 'var(--beni-navy-12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>🏥</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{claim.provider}</p>
                      <p className="t-caption" style={{ color: 'var(--fg-4)' }}>{claim.date}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontFamily: 'var(--font-manrope), sans-serif',
                        fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums',
                      }}>
                        {claim.amount}
                      </p>
                      <span className="badge badge-positive" style={{ marginTop: 4 }}>{claim.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Today card */}
            <div style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--r-5)', padding: 22 }}>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Today</p>
              <p className="t-display-m" style={{ color: 'var(--fg-1)', marginBottom: 16, fontSize: 22 }}>
                Three things are ready for you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { text: 'FSA deadline in 7 months — $842 to use', color: 'var(--beni-coral)' },
                  { text: 'Annual eye exam benefit available',       color: 'var(--beni-peach)' },
                  { text: 'Deductible 40% met — on track',          color: 'var(--beni-sun)'   },
                ].map((item) => (
                  <div key={item.text} style={{
                    paddingLeft: 12, borderLeft: `4px solid ${item.color}`,
                  }}>
                    <p className="t-body-s" style={{ color: 'var(--fg-2)' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan card */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="t-overline" style={{ color: 'var(--fg-3)' }}>Your plan</p>
                <Link href="/plan" className="t-caption" style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>
                  View details →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Plan',       value: 'Aetna Choice POS II' },
                  { label: 'Type',       value: 'PPO'                 },
                  { label: 'Deductible', value: '$3,000 individual'   },
                  { label: 'OOP max',    value: '$6,000 individual'   },
                  { label: 'PCP copay',  value: '$30'                 },
                  { label: 'Specialist', value: '$60'                 },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingBottom: 10, borderBottom: 'var(--border-hairline)',
                  }}>
                    <span className="t-body-s" style={{ color: 'var(--fg-3)' }}>{row.label}</span>
                    <span className="t-body-s" style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
