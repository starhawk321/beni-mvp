import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LandingPage() {
  const features = [
    {
      icon: '📋',
      title: 'Your plan, plain English',
      body: 'See exactly what your insurance covers — deductibles, copays, coinsurance — without the jargon.',
    },
    {
      icon: '📊',
      title: 'Track your spending',
      body: 'Watch your deductible and out-of-pocket max fill up in real time as claims come in.',
    },
    {
      icon: '🔗',
      title: 'Connected, not copied',
      body: 'We fetch directly from your insurer using secure, read-only access. Nothing to upload.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <header style={{
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: 'var(--border-hairline)',
        background: 'rgba(251,246,238,0.9)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Logo height={28} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{
            height: 36, padding: '0 18px', borderRadius: 'var(--r-pill)',
            border: 'var(--border-strong)', background: 'transparent',
            fontSize: 13, fontWeight: 600, color: 'var(--fg-2)',
            display: 'flex', alignItems: 'center', textDecoration: 'none',
            fontFamily: 'var(--font-manrope), sans-serif',
          }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            height: 36, padding: '0 18px', borderRadius: 'var(--r-pill)',
            background: 'var(--action-primary)', color: '#ffe9cf',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', textDecoration: 'none',
            fontFamily: 'var(--font-manrope), sans-serif',
          }}>
            Get started
          </Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{
          maxWidth: 'var(--container-web)', margin: '0 auto',
          padding: '96px 28px 80px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 40 }}>
            <Logo height={72} />
          </div>

          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--beni-sky-12)', borderRadius: 'var(--r-pill)',
            padding: '6px 14px', marginBottom: 32,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--beni-sky)', display: 'inline-block',
            }} />
            <span className="t-caption" style={{ color: 'var(--beni-sky)' }}>
              Now supporting Aetna, Cigna, UHC, Anthem &amp; Humana
            </span>
          </div>

          <h1 className="t-display-xl" style={{
            color: 'var(--fg-1)', maxWidth: 720, marginBottom: 24,
          }}>
            Understand your health insurance, finally.
          </h1>

          <p className="t-body" style={{
            color: 'var(--fg-3)', maxWidth: 480, marginBottom: 48, fontSize: 18, lineHeight: 1.6,
          }}>
            Béni connects to your insurer and shows your plan details, deductible progress, and healthcare spending — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/signup" style={{
              height: 52, padding: '0 32px', borderRadius: 'var(--r-pill)',
              background: 'var(--action-primary)', color: '#ffe9cf',
              fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', textDecoration: 'none',
              fontFamily: 'var(--font-manrope), sans-serif',
              boxShadow: 'var(--shadow-2)',
            }}>
              Get started for free
            </Link>
            <Link href="/login" style={{
              height: 52, padding: '0 32px', borderRadius: 'var(--r-pill)',
              background: 'var(--bg-surface)', color: 'var(--fg-1)',
              border: 'var(--border-strong)',
              fontSize: 16, fontWeight: 600,
              display: 'flex', alignItems: 'center', textDecoration: 'none',
              fontFamily: 'var(--font-manrope), sans-serif',
            }}>
              Log in
            </Link>
          </div>
        </section>

        {/* Mock dashboard preview */}
        <section style={{
          maxWidth: 900, margin: '0 auto 80px', padding: '0 28px',
        }}>
          <div style={{
            background: 'var(--beni-navy)', borderRadius: 'var(--r-6)',
            padding: '28px 32px', position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-4)',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: 60, width: 200, height: 200,
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
            <p className="t-overline" style={{ color: 'rgba(244,236,222,0.6)', marginBottom: 6 }}>Deductible progress</p>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 48, color: '#fff', fontVariantNumeric: 'tabular-nums', marginBottom: 16 }}>$1,200 <span style={{ fontSize: 22, opacity: 0.5 }}>/ $3,000</span></p>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, maxWidth: 500 }}>
              <div style={{ width: '40%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #7AE7FF, #9B5BFF)' }} />
            </div>
            <p className="t-caption" style={{ color: 'rgba(244,236,222,0.5)', marginTop: 10 }}>40% met · $1,800 remaining until full coverage</p>
          </div>
        </section>

        {/* Features */}
        <section style={{
          maxWidth: 'var(--container-web)', margin: '0 auto',
          padding: '0 28px 96px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ padding: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--r-3)',
                background: 'var(--beni-navy-12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 className="t-h3" style={{ color: 'var(--fg-1)', marginBottom: 10 }}>{f.title}</h3>
              <p className="t-body-s" style={{ color: 'var(--fg-3)', lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: 'var(--border-hairline)', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={22} />
        <p className="t-caption" style={{ color: 'var(--fg-4)' }}>© 2026 Béni. Read-only access. Your data stays yours.</p>
      </footer>
    </div>
  )
}
