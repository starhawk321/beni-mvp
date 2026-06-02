import WaitlistForm from '@/components/WaitlistForm'
import MarkStage from '@/components/MarkStage'
import GradientField from '@/components/GradientField'
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

        /* Looping bloom video — full viewport, behind everything */
        .bloom-video {
          position: fixed; inset: 0; z-index: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        /* Veil softens the video so the type stays readable */
        .bloom-veil {
          position: fixed; inset: 0; z-index: 1;
          background:
            radial-gradient(900px 600px at 50% 40%, rgba(7,16,28,0.35) 0%, rgba(7,16,28,0.78) 75%, rgba(7,16,28,0.92) 100%);
          pointer-events: none;
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
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-width: 480px;
          justify-self: end;
          animation: float 9s ease-in-out infinite;
        }

        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .enter-logo    { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .enter-tagline { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s both; }
        .enter-form    { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.46s both; }
        .enter-mark    { animation: fadeIn 1.2s ease 0.6s both; }
        .enter-footer  { animation: fadeIn 0.8s ease 0.8s both; }

        @media (max-width: 980px) {
          .mark-stage { display: none !important; }
          .hero { grid-template-columns: 1fr !important; }
          body { overflow: auto; }
        }
      `}</style>

      {/* Ambient looping video — sits behind everything as the bloom field */}
      <video
        className="bloom-video"
        src="/bloom-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
      {/* Dark overlay to keep text contrast over the video */}
      <div className="bloom-veil" aria-hidden />
      {/* Mouse-tracking gradient field — sits above the video */}
      <GradientField />
      <div className="grid" />

      <div style={{
        position: 'relative', zIndex: 2,
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: '24px 36px 28px',
      }}>
        {/* Header */}
        <header className="enter-logo" style={{ display: 'flex', alignItems: 'center' }}>
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
            <h1 className="enter-tagline" style={{
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

            <div className="enter-form" style={{ marginTop: 36 }}>
              <WaitlistForm />
            </div>
          </div>

          {/* Interactive mark */}
          <div className="mark-stage enter-mark">
            <MarkStage />
          </div>
        </main>

        {/* Footer */}
        <footer className="enter-footer" style={{
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
