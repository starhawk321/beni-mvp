import WaitlistForm from '@/components/WaitlistForm'
import Logo from '@/components/Logo'

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
          position: relative; aspect-ratio: 1 / 1; max-width: 480px; justify-self: end;
          filter: drop-shadow(0 30px 80px rgba(91,168,255,0.20)) drop-shadow(0 10px 40px rgba(229,91,184,0.18));
          animation: float 9s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0); }
          50%      { transform: translateY(-12px) rotate(-1.5deg); }
        }
        .mark-stage svg { width: 100%; height: 100%; }
        .orbit {
          position: absolute; inset: 0; pointer-events: none;
          border-radius: 999px; border: 1px dashed rgba(255,255,255,0.16);
          animation: spin 60s linear infinite;
        }
        .orbit.o2 { inset: 10%; animation-duration: 90s; animation-direction: reverse; border-color: rgba(255,255,255,0.08); }
        .orbit.o3 { inset: 22%; animation-duration: 120s; border-color: rgba(255,255,255,0.08); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .satellite {
          position: absolute; width: 8px; height: 8px; border-radius: 999px;
          background: #7AE7FF; box-shadow: 0 0 12px #7AE7FF;
          top: -4px; left: 50%; transform: translateX(-50%);
        }
        .satellite.s2 { background: #E55BB8; box-shadow: 0 0 12px #E55BB8; }
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
          <Logo height={28} />
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

          {/* Animated mark */}
          <div className="mark-stage" aria-hidden="true">
            <div className="orbit"><span className="satellite" /></div>
            <div className="orbit o2"><span className="satellite s2" /></div>
            <div className="orbit o3" />
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="big" x1="10%" y1="10%" x2="90%" y2="90%">
                  <stop offset="0%"   stopColor="#7AE7FF"/>
                  <stop offset="45%"  stopColor="#5BA8FF"/>
                  <stop offset="75%"  stopColor="#9B5BFF"/>
                  <stop offset="100%" stopColor="#E55BB8"/>
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"  stopColor="rgba(255,255,255,0.9)"/>
                  <stop offset="40%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#glow)" opacity="0.45"/>
              <path d="M50 4 Q 54 46 96 50 Q 54 54 50 96 Q 46 54 4 50 Q 46 46 50 4 Z" fill="url(#big)"/>
            </svg>
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
