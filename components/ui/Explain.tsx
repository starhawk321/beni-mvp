'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ExplainProps = {
  term: string
  children: ReactNode
}

// All sizes scale with --s (set by SeniorScope, default 1).
const SZ = {
  btn:        'calc(var(--s) * 26px)',
  btnFs:      'calc(var(--s) * 15px)',
  popW:       'calc(var(--s) * 280px)',
  popPadV:    'calc((var(--s) * 0.5 + 0.5) * 14px)',
  popPadH:    'calc((var(--s) * 0.5 + 0.5) * 16px)',
  popFs:      'calc(var(--s) * 17px)',
  popMt:      'calc((var(--s) * 0.5 + 0.5) * 10px)',
  ctaPadV:    'calc((var(--s) * 0.5 + 0.5) * 6px)',
  ctaPadH:    'calc((var(--s) * 0.5 + 0.5) * 14px)',
}

export default function Explain({ term, children }: ExplainProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span>{term}</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`What does ${term} mean?`}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: SZ.btn,
          height: SZ.btn,
          borderRadius: 999,
          border: '2px solid var(--beni-sky)',
          background: open ? 'var(--beni-sky)' : 'var(--beni-sky-12)',
          color: open ? '#fff' : 'var(--beni-sky)',
          fontWeight: 800,
          fontSize: SZ.btnFs,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          lineHeight: 1,
          flexShrink: 0,
          padding: 0,
        }}
      >
        ?
      </button>
      {open && (
        <span
          role="dialog"
          aria-label={`Definition of ${term}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 30,
            width: SZ.popW,
            background: 'var(--beni-navy)',
            color: '#fff',
            padding: `${SZ.popPadV} ${SZ.popPadH}`,
            borderRadius: 16,
            boxShadow: 'var(--shadow-3)',
            fontSize: SZ.popFs,
            fontWeight: 500,
            lineHeight: 1.5,
            textTransform: 'none',
            letterSpacing: 'normal',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {children}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              marginTop: SZ.popMt,
              background: 'rgba(255,255,255,0.16)',
              border: 0,
              color: '#fff',
              borderRadius: 999,
              padding: `${SZ.ctaPadV} ${SZ.ctaPadH}`,
              fontSize: SZ.btnFs,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Got it
          </button>
        </span>
      )}
    </span>
  )
}
