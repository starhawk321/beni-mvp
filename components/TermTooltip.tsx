'use client'

import { useEffect, useRef, useState } from 'react'
import { TERMS, type TermSlug } from '@/lib/terms'

interface Props {
  term:     TermSlug
  children: React.ReactNode  // the wrapped term text shown inline
}

// Inline (?) trigger next to a term. Click or focus opens a popover with the
// plain-English explanation + example. Esc / outside click closes it.
export default function TermTooltip({ term, children }: Props) {
  const def = TERMS[term]
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement | null>(null)

  // Close on Escape and on outside click while open
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDocClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [open])

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
      {children}
      <button
        type="button"
        aria-label={`What is ${def.term}?`}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, padding: 0, marginLeft: 2,
          borderRadius: '50%',
          background: 'transparent',
          border: '1px solid var(--ink-dim, currentColor)',
          color: 'inherit',
          opacity: 0.55,
          fontFamily: 'var(--font-manrope), sans-serif',
          fontSize: 10, fontWeight: 700, lineHeight: 1,
          cursor: 'pointer',
          transform: 'translateY(-1px)',
        }}
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={def.term}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 50,
            width: 'min(320px, 88vw)',
            background: 'var(--surface-2)',
            border: '1px solid var(--hair)',
            borderRadius: 'var(--r-3, 12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            padding: '14px 16px',
            fontFamily: 'var(--font-manrope), sans-serif',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 3, borderRadius: 999, background: def.color, alignSelf: 'stretch', minHeight: 24, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{def.term}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{def.short}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 10px' }}>
            {def.explanation}
          </p>
          <div style={{
            background: 'var(--bg-sunken, rgba(0,0,0,0.04))',
            borderRadius: 8,
            padding: '8px 10px',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-dim)', marginRight: 6,
            }}>Example</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{def.example}</span>
          </div>
        </div>
      )}
    </span>
  )
}
