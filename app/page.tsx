import WaitlistForm from '@/components/WaitlistForm'
import MarkStage from '@/components/MarkStage'
import Image from 'next/image'

export default function StealthPage() {
  return (
    <>
      <style>{`
        html, body {
          margin: 0; padding: 0; height: 100%;
          background: #07101C;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }
        .field {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(900px 600px at 18% 28%, rgba(122,231,255,0.18), transparent 60%),
            radial-gradient(900px 600px at 82% 22%, rgba(155,91,255,0.18), transparent 62%),
            radial-gradient(900px 700px at 50% 110%, rgba(229,91,184,0.16), transparent 60%);
        }
        .grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 88px 88px;
          mask-image: radial-gradient(900px 600px at 50% 40%, #000 60%, transparent 100%);
        }
        .mark-stage {
          max-width: 480px; justify-self: end;
          animation: float 9s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 980px) {
          .mark-stage { display: none !important; }
          .hero { grid-template-columns: 1fr !important; }
          body { overflow: auto; }
        }
      `}</style>

      <div className="field" />
      <div className="grid" />

      <div style={{
        position: 'relative', zIndex: 2,
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: '24px 36px 28px',
      }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/assets/beni-logo-wordmark-dark.svg" alt="Béni" width={144} height={48} priority />
        </header>

        {/* Hero */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 56,
          alignItems: 'center',
        }} className="hero">
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: 'var(--font-manrope), sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(48px, 6.2vw, 88px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}>
              The{' '}
              <em style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontStyle: 'italic',
                fontWeight: 400,
                background: 'linear-gradient(110deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 65%, #E55BB8 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                intelligent
              </em>
              <br/>way to healthcare.
            </h1>

            <div style={{ marginTop: 36 }}>
              <WaitlistForm />
            </div>
          </div>

          {/* Interactive mark */}
          <div className="mark-stage">
            <MarkStage />
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(241,237,226,0.42)', fontSize: 12, letterSpacing: '0.02em',
          fontFamily: 'var(--font-manrope), sans-serif',
        }}>
          <span>© 2026 Béni Health</span>
          <a href="mailto:hello@benihealth.app" style={{ color: 'inherit', textDecoration: 'none' }}>
            hello@benihealth.app
          </a>
        </footer>
      </div>
    </>
  )
}
