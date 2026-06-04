'use client'

import { createContext, useContext, useEffect, useState, type ReactNode, type CSSProperties } from 'react'

type SeniorScopeState = {
  scale: number
  contrast: boolean
  setScale: (n: number) => void
  setContrast: (b: boolean) => void
}

const SCALE_MIN = 0.85
const SCALE_MAX = 1.6
const STORAGE_KEY = 'beni:senior-scope'

const Ctx = createContext<SeniorScopeState | null>(null)

export function useSeniorScope(): SeniorScopeState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSeniorScope must be used inside <SeniorScope>')
  return ctx
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export default function SeniorScope({ children }: { children: ReactNode }) {
  const [scale, setScaleRaw] = useState(1)
  const [contrast, setContrast] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { scale?: number; contrast?: boolean }
      if (typeof parsed.scale === 'number') setScaleRaw(clamp(parsed.scale, SCALE_MIN, SCALE_MAX))
      if (typeof parsed.contrast === 'boolean') setContrast(parsed.contrast)
    } catch {
      // localStorage unavailable or corrupted — keep defaults
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, contrast }))
    } catch {
      // ignore
    }
  }, [scale, contrast])

  const setScale = (n: number) => setScaleRaw(clamp(n, SCALE_MIN, SCALE_MAX))

  return (
    <Ctx.Provider value={{ scale, contrast, setScale, setContrast }}>
      <div
        className="senior-scope"
        data-contrast={contrast ? 'on' : 'off'}
        style={{ '--s': scale } as CSSProperties}
      >
        {children}
      </div>
    </Ctx.Provider>
  )
}
