// Ambient four-petal flowers blooming across the viewport.
// Reuses the petal shape + brand gradient from MarkStage so the field
// reads as the same "language" as the centerpiece mark, just calmer.
// Pure SVG + CSS — no JS animation loop, no bundle cost beyond this file,
// honors prefers-reduced-motion.

type Dir = 'normal' | 'reverse'
type Flower = {
  left: string
  top: string
  size: number       // px
  opacity: number    // base opacity (kept low so it stays ambient)
  bloomDelay: number // seconds — staggered initial bloom across the field
  breathePeriod: number // seconds — slow scale pulse
  rotateDur: number  // seconds for a full revolution
  rotateDir: Dir
}

const FLOWERS: Flower[] = [
  { left: '8%',  top: '15%', size: 320, opacity: 0.16, bloomDelay: 0.40, breathePeriod: 9,  rotateDur: 110, rotateDir: 'normal'  },
  { left: '85%', top: '20%', size: 200, opacity: 0.12, bloomDelay: 0.75, breathePeriod: 7,  rotateDur: 85,  rotateDir: 'reverse' },
  { left: '15%', top: '78%', size: 380, opacity: 0.17, bloomDelay: 0.55, breathePeriod: 11, rotateDur: 140, rotateDir: 'reverse' },
  { left: '78%', top: '80%', size: 240, opacity: 0.13, bloomDelay: 1.05, breathePeriod: 8,  rotateDur: 95,  rotateDir: 'normal'  },
  { left: '50%', top: '6%',  size: 130, opacity: 0.10, bloomDelay: 1.35, breathePeriod: 6,  rotateDur: 70,  rotateDir: 'reverse' },
  { left: '45%', top: '94%', size: 150, opacity: 0.11, bloomDelay: 1.65, breathePeriod: 10, rotateDur: 100, rotateDir: 'normal'  },
]

export default function BloomField() {
  return (
    <>
      <style>{`
        .bloom-field {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
          /* Soft radial mask so the corners fade out and don't compete with the type */
          mask-image: radial-gradient(1200px 800px at 50% 45%, #000 30%, transparent 95%);
        }
        .bloom-flower {
          position: absolute;
          transform: translate(-50%, -50%);
        }
        .bloom-rotate, .bloom-breathe {
          width: 100%; height: 100%;
          transform-origin: center;
        }
        @keyframes bloom-petal-open {
          from { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.06); opacity: 0.95; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes bloom-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bloom-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        .bloom-petal {
          transform-origin: 50px 50px;
          transform-box: view-box;
          opacity: 0;
          animation: bloom-petal-open 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .bloom-petal { animation: none; opacity: 1; transform: none; }
          .bloom-rotate, .bloom-breathe { animation: none !important; }
        }
        @media (max-width: 720px) {
          /* On phones, dial the field down so type stays clean */
          .bloom-field { opacity: 0.7; }
        }
      `}</style>
      <div className="bloom-field" aria-hidden>
        {FLOWERS.map((f, i) => (
          <div
            key={i}
            className="bloom-flower"
            style={{
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
            }}
          >
            <div
              className="bloom-rotate"
              style={{
                animation: `bloom-spin ${f.rotateDur}s linear infinite`,
                animationDirection: f.rotateDir,
              }}
            >
              <div
                className="bloom-breathe"
                style={{
                  animation: `bloom-breathe ${f.breathePeriod}s ease-in-out infinite`,
                  animationDelay: `${f.bloomDelay + 1.5}s`,
                }}
              >
                <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
                  <defs>
                    <linearGradient id={`bloom-g-${i}`} x1="10%" y1="10%" x2="90%" y2="90%">
                      <stop offset="0%"   stopColor="#7AE7FF" />
                      <stop offset="45%"  stopColor="#5BA8FF" />
                      <stop offset="75%"  stopColor="#9B5BFF" />
                      <stop offset="100%" stopColor="#E55BB8" />
                    </linearGradient>
                  </defs>
                  <g fill={`url(#bloom-g-${i})`}>
                    {[0, 90, 180, 270].map((angle, p) => (
                      <g key={angle} transform={`rotate(${angle} 50 50)`}>
                        <path
                          className="bloom-petal"
                          d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"
                          style={{ animationDelay: `${f.bloomDelay + p * 0.15}s` }}
                        />
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
