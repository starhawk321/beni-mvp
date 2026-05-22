'use client'

import { useState, useCallback } from 'react'

const ORBITS = [
  { size: '100%', duration: 55,  reverse: false },
  { size: '78%',  duration: 80,  reverse: true  },
  { size: '56%',  duration: 110, reverse: false },
  { size: '38%',  duration: 45,  reverse: true  },
]

type Sat = { id: number; orbit: number; color: string; size: number; hopping: boolean }

const INIT: Sat[] = [
  { id: 0, orbit: 0, color: '#7AE7FF', size: 10, hopping: false },
  { id: 1, orbit: 1, color: '#E55BB8', size: 8,  hopping: false },
  { id: 2, orbit: 2, color: '#9B5BFF', size: 7,  hopping: false },
  { id: 3, orbit: 0, color: '#5BA8FF', size: 6,  hopping: false },
  { id: 4, orbit: 3, color: '#7AE7FF', size: 5,  hopping: false },
]

export default function MarkStage() {
  const [sats, setSats] = useState<Sat[]>(INIT)

  const hop = useCallback((id: number) => {
    setSats(prev => prev.map(s => s.id === id ? { ...s, hopping: true } : s))
    setTimeout(() => {
      setSats(prev => prev.map(s => {
        if (s.id !== id) return s
        const opts = [0, 1, 2, 3].filter(i => i !== s.orbit)
        return { ...s, orbit: opts[Math.floor(Math.random() * opts.length)], hopping: false }
      }))
    }, 200)
  }, [])

  const bySatOrbit = ORBITS.map((_, i) => sats.filter(s => s.orbit === i))

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%',
      filter: 'drop-shadow(0 30px 80px rgba(91,168,255,0.20)) drop-shadow(0 10px 40px rgba(229,91,184,0.18))' }}>

      {/* Orbit rings — each one spins and carries its satellite children */}
      {ORBITS.map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size, height: orb.size,
          top: `calc((100% - ${orb.size}) / 2)`,
          left: `calc((100% - ${orb.size}) / 2)`,
          borderRadius: '50%',
          border: `1px dashed rgba(255,255,255,${i === 0 ? 0.16 : 0.09})`,
          animation: `spin ${orb.duration}s linear infinite`,
          animationDirection: orb.reverse ? 'reverse' : 'normal',
        }}>
          {bySatOrbit[i].map(sat => (
            <span
              key={sat.id}
              onMouseEnter={() => hop(sat.id)}
              style={{
                position: 'absolute',
                width: sat.size, height: sat.size,
                borderRadius: '50%',
                background: sat.color,
                boxShadow: `0 0 ${sat.size + 4}px ${sat.color}, 0 0 ${sat.size * 3}px ${sat.color}40`,
                top: -(sat.size / 2),
                left: `calc(50% - ${sat.size / 2}px)`,
                cursor: 'pointer',
                transform: sat.hopping ? 'scale(0)' : 'scale(1)',
                transition: 'transform 0.18s ease',
                // Counter-rotate so satellite doesn't spin with the ring
                animation: `spin ${orb.duration}s linear infinite`,
                animationDirection: orb.reverse ? 'normal' : 'reverse',
              }}
            />
          ))}
        </div>
      ))}

      {/* Béni mark */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="mark-g" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%"   stopColor="#7AE7FF"/>
            <stop offset="45%"  stopColor="#5BA8FF"/>
            <stop offset="75%"  stopColor="#9B5BFF"/>
            <stop offset="100%" stopColor="#E55BB8"/>
          </linearGradient>
          <radialGradient id="mark-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.9)"/>
            <stop offset="40%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <style>{`
          /* All petals start at 0deg (closed bud pointing up), then rotate to final positions */
          @keyframes unfurl-0   { from { transform: rotate(0deg)   scale(0.12); opacity:0.4; } 70% { transform: rotate(0deg)   scale(1.06); opacity:1; } to { transform: rotate(0deg)   scale(1); opacity:1; } }
          @keyframes unfurl-90  { from { transform: rotate(0deg)   scale(0.12); opacity:0.4; } 70% { transform: rotate(92deg)  scale(1.06); opacity:1; } to { transform: rotate(90deg)  scale(1); opacity:1; } }
          @keyframes unfurl-180 { from { transform: rotate(0deg)   scale(0.12); opacity:0.4; } 70% { transform: rotate(182deg) scale(1.06); opacity:1; } to { transform: rotate(180deg) scale(1); opacity:1; } }
          @keyframes unfurl-270 { from { transform: rotate(0deg)   scale(0.12); opacity:0.4; } 70% { transform: rotate(272deg) scale(1.06); opacity:1; } to { transform: rotate(270deg) scale(1); opacity:1; } }
          .petal { transform-origin: 50px 50px; transform-box: view-box; animation-duration: 1.2s; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); animation-fill-mode: both; }
          .p0 { animation-name: unfurl-0;   animation-delay: 0.5s; }
          .p1 { animation-name: unfurl-90;  animation-delay: 0.65s; }
          .p2 { animation-name: unfurl-180; animation-delay: 0.8s; }
          .p3 { animation-name: unfurl-270; animation-delay: 0.95s; }
          @keyframes budFade { 0% { opacity:0.95; r:7; } 60% { opacity:0.5; } 100% { opacity:0; r:0; } }
          .bud { animation: budFade 1.5s ease-out 0.5s both; }
        `}</style>
        <circle cx="50" cy="50" r="50" fill="url(#mark-glow)" opacity="0.45"/>
        <g fill="url(#mark-g)">
          <path className="petal p0" d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"/>
          <path className="petal p1" d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"/>
          <path className="petal p2" d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"/>
          <path className="petal p3" d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"/>
        </g>
        <circle className="bud" cx="50" cy="50" r="7" fill="url(#mark-g)"/>
      </svg>
    </div>
  )
}
