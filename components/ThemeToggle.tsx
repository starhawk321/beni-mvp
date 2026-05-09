'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'transparent', border: 'none',
        cursor: 'pointer', padding: 0,
      }}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: isDark ? 'var(--beni-sky)' : 'var(--beni-line-strong)',
        position: 'relative',
        transition: 'background 200ms',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: 3, left: isDark ? 21 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
          transition: 'left 200ms var(--ease-standard)',
        }} />
      </div>
      <span className="t-body-s" style={{ color: 'var(--fg-2)' }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
