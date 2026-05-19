'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: number
}

export default function Drawer({ open, onClose, title, subtitle, children, width = 420 }: DrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(13,27,42,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 300,
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width, height: '100vh',
        background: 'var(--bg-surface)',
        borderLeft: 'var(--border-hairline)',
        boxShadow: 'var(--shadow-4)',
        zIndex: 310,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : `translateX(${width}px)`,
        transition: 'transform 260ms var(--ease-standard)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: 'var(--border-hairline)',
          position: 'sticky', top: 0,
          background: 'var(--bg-surface)',
          zIndex: 1,
        }}>
          <div>
            <p className="t-h3" style={{ color: 'var(--fg-1)', margin: 0 }}>{title}</p>
            {subtitle && <p className="t-caption" style={{ color: 'var(--fg-3)', marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: 'var(--border-hairline)', background: 'var(--bg-sunken)',
              cursor: 'pointer', fontSize: 16, color: 'var(--fg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginLeft: 12,
            }}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 20px' }}>
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
