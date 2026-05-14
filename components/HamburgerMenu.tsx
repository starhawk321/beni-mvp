'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/dashboard', emoji: '🏠' },
  { label: 'Plan',     href: '/plan',      emoji: '📋' },
  { label: 'Terms',    href: '/terms',     emoji: '📖' },
  { label: 'Settings', href: '/settings',  emoji: '⚙️' },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger button */}
      <button
        className="beni-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          width: 36, height: 36,
          borderRadius: 'var(--r-2)',
          border: 'var(--border-hairline)',
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          padding: 8,
        }}
      >
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--fg-1)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--fg-1)', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 18, height: 2, background: 'var(--fg-1)', borderRadius: 2 }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(13,27,42,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 260, height: '100vh',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-4)',
        zIndex: 110,
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms var(--ease-standard)',
      }}>
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          style={{
            alignSelf: 'flex-end',
            width: 32, height: 32,
            border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 20,
            color: 'var(--fg-3)',
          }}
        >✕</button>

        {/* Nav links */}
        <nav style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 'var(--r-3)',
                  textDecoration: 'none',
                  background: active ? 'var(--beni-navy-12)' : 'transparent',
                  color: active ? 'var(--beni-navy)' : 'var(--fg-2)',
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontWeight: active ? 700 : 500,
                  fontSize: 16,
                  transition: 'background 150ms',
                }}
              >
                <span style={{ fontSize: 20 }}>{tab.emoji}</span>
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
