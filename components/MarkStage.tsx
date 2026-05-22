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
          @keyframes petalBloom {
            0%   { transform: rotate(var(--r)) scale(0);    opacity: 0; }
            55%  { transform: rotate(var(--r)) scale(1.18); opacity: 1; }
            75%  { transform: rotate(var(--r)) scale(0.94); }
            90%  { transform: rotate(var(--r)) scale(1.04); }
            100% { transform: rotate(var(--r)) scale(1);    opacity: 1; }
          }
          .petal {
            transform-origin: 50px 50px;
            transform-box: view-box;
            animation: petalBloom 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--delay) both;
          }
        `}</style>
        <circle cx="50" cy="50" r="50" fill="url(#mark-glow)" opacity="0.45"/>
        <g fill="url(#mark-g)">
          {[
            { r: '0deg',   delay: '0.6s'  },
            { r: '90deg',  delay: '0.72s' },
            { r: '180deg', delay: '0.84s' },
            { r: '270deg', delay: '0.96s' },
          ].map(({ r, delay }) => (
            <path
              key={r}
              className="petal"
              style={{ '--r': r, '--delay': delay } as React.CSSProperties}
              d="M50 50 C 34 38, 30 16, 50 8 C 70 16, 66 38, 50 50 Z"
            />
          ))}</g>
      </svg>
    </div>
  )
}
