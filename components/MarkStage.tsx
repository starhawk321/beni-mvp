'use client'

import { useState, useCallback } from 'react'

type Satellite = {
  orbit: number
  angle: number
  color: string
  glow: string
  size: number
}

const ORBITS = [
  { pct: 100, duration: 55,  dir: 1  },
  { pct: 80,  duration: 80,  dir: -1 },
  { pct: 60,  duration: 110, dir: 1  },
  { pct: 40,  duration: 140, dir: -1 },
]

const INITIAL: Satellite[] = [
  { orbit: 0, angle: 0,   color: '#7AE7FF', glow: '#7AE7FF', size: 10 },
  { orbit: 1, angle: 180, color: '#E55BB8', glow: '#E55BB8', size: 8  },
  { orbit: 2, angle: 90,  color: '#9B5BFF', glow: '#9B5BFF', size: 7  },
  { orbit: 0, angle: 270, color: '#5BA8FF', glow: '#5BA8FF', size: 6  },
  { orbit: 3, angle: 45,  color: '#7AE7FF', glow: '#7AE7FF', size: 5  },
]

function randomOtherOrbit(current: number) {
  const options = ORBITS.map((_, i) => i).filter(o => o !== current)
  return options[Math.floor(Math.random() * options.length)]
}

function randomAngle() {
  return Math.floor(Math.random() * 360)
}

export default function MarkStage() {
  const [satellites, setSatellites] = useState<Satellite[]>(INITIAL)
  const [hopping, setHopping]       = useState<Set<number>>(new Set())

  const handleHover = useCallback((idx: number) => {
    if (hopping.has(idx)) return
    setHopping(prev => new Set(prev).add(idx))
    setSatellites(prev => prev.map((s, i) =>
      i === idx
        ? { ...s, orbit: randomOtherOrbit(s.orbit), angle: randomAngle() }
        : s
    ))
    setTimeout(() => setHopping(prev => {
      const next = new Set(prev)
      next.delete(idx)
      return next
    }), 500)
  }, [hopping])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      maxWidth: 480,
      justifySelf: 'end',
      filter: 'drop-shadow(0 30px 80px rgba(91,168,255,0.20)) drop-shadow(0 10px 40px rgba(229,91,184,0.18))',
      animation: 'float 9s ease-in-out infinite',
    }}>
      {/* Orbit rings */}
      {ORBITS.map((orbit, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${orbit.pct}%`,
          height: `${orbit.pct}%`,
          top: `${(100 - orbit.pct) / 2}%`,
          left: `${(100 - orbit.pct) / 2}%`,
          borderRadius: '50%',
          border: `1px dashed rgba(255,255,255,${i === 0 ? 0.16 : 0.09})`,
          animation: `spin ${orbit.duration}s linear infinite`,
          animationDirection: orbit.dir === -1 ? 'reverse' : 'normal',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Satellites */}
      {satellites.map((sat, idx) => {
        const orbitPct = ORBITS[sat.orbit].pct / 100
        const rad = (sat.angle - 90) * (Math.PI / 180)
        const cx = 50 + (orbitPct * 50) * Math.cos(rad)
        const cy = 50 + (orbitPct * 50) * Math.sin(rad)
        const isHopping = hopping.has(idx)

        return (
          <div
            key={idx}
            onMouseEnter={() => handleHover(idx)}
            style={{
              position: 'absolute',
              width: sat.size, height: sat.size,
              borderRadius: '50%',
              background: sat.color,
              boxShadow: `0 0 ${sat.size + 4}px ${sat.glow}, 0 0 ${sat.size * 3}px ${sat.glow}40`,
              left: `calc(${cx}% - ${sat.size / 2}px)`,
              top:  `calc(${cy}% - ${sat.size / 2}px)`,
              cursor: 'pointer',
              transition: 'left 0.45s cubic-bezier(0.34,1.56,0.64,1), top 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s ease, box-shadow 0.2s ease',
              transform: isHopping ? 'scale(2)' : 'scale(1)',
              zIndex: 10,
            }}
          />
        )
      })}

      {/* Béni mark */}
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="big" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%"   stopColor="#7AE7FF"/>
            <stop offset="45%"  stopColor="#5BA8FF"/>
            <stop offset="75%"  stopColor="#9B5BFF"/>
            <stop offset="100%" stopColor="#E55BB8"/>
          </linearGradient>
          <radialGradient id="glow-g" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.9)"/>
            <stop offset="40%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#glow-g)" opacity="0.45"/>
        <path
          fillRule="evenodd"
          fill="url(#big)"
          d="M 35 35 C 35 18, 42 8, 50 8 C 58 8, 65 18, 65 35 C 82 35, 92 42, 92 50 C 92 58, 82 65, 65 65 C 65 82, 58 92, 50 92 C 42 92, 35 82, 35 65 C 18 65, 8 58, 8 50 C 8 42, 18 35, 35 35 Z M 50 30 C 50 42 58 50 70 50 C 58 50 50 58 50 70 C 50 58 42 50 30 50 C 42 50 50 42 50 30 Z"
        />
      </svg>
    </div>
  )
}
