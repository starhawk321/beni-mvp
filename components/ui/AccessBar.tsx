'use client'

import { useSeniorScope } from './SeniorScope'

type AccessBarProps = {
  onHelp?: () => void
}

const SCALE_STEP = 0.12

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 999,
  border: '1.5px solid var(--beni-line-strong)',
  background: '#fff',
  color: 'var(--fg-1)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
}

export default function AccessBar({ onHelp }: AccessBarProps) {
  const { scale, contrast, setScale, setContrast } = useSeniorScope()

  return (
    <div style={{ background: 'var(--beni-navy)', color: '#fff', width: '100%' }}>
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#dbe6f2' }}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>⚙</span>
          <span>Make this page easier to read</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#dbe6f2', marginRight: 2 }}>Text size</span>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setScale(+(scale - SCALE_STEP).toFixed(2))}
              aria-label="Smaller text"
            >
              <span style={{ fontSize: 14 }}>A</span>
              <span style={{ fontSize: 18 }}>–</span>
            </button>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setScale(+(scale + SCALE_STEP).toFixed(2))}
              aria-label="Larger text"
            >
              <span style={{ fontSize: 18 }}>A</span>
              <span style={{ fontSize: 18 }}>+</span>
            </button>
          </div>

          <button
            type="button"
            style={{
              ...btnStyle,
              background: contrast ? 'var(--beni-sun)' : '#fff',
              borderColor: contrast ? 'var(--beni-sun)' : 'var(--beni-line-strong)',
            }}
            onClick={() => setContrast(!contrast)}
            aria-pressed={contrast}
          >
            <span aria-hidden="true">◑</span> High contrast {contrast ? 'on' : 'off'}
          </button>

          {onHelp && (
            <button
              type="button"
              style={{
                ...btnStyle,
                background: 'var(--beni-coral)',
                border: '1.5px solid var(--beni-coral)',
                color: '#7a2a23',
              }}
              onClick={onHelp}
            >
              <span aria-hidden="true">☎</span> Get help
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
