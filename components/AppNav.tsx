'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const NAV_ITEMS = [
  { label: 'Home',    href: '/home'    },
  { label: 'Plans',   href: '/plans'   },
  { label: 'Claims',  href: '/claims'  },
  { label: 'Records', href: '/records' },
]

const TAB_ITEMS = [
  { label: 'Home',    href: '/home'    },
  { label: 'Plans',   href: '/plans'   },
  { label: 'Claims',  href: '/claims'  },
  { label: 'You',     href: '/settings' },
]

const BRAND_GRADIENT = 'linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)'

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

function Avatar({ initial }: { initial: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'linear-gradient(135deg, #FFC4BE 0%, #E55BB8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 14,
      color: '#1A0E2E', flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

function AvatarMenu({ initial }: { initial: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
      >
        <Avatar initial={initial} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          minWidth: 180, padding: 6,
          background: 'var(--surface-1)', border: '1px solid var(--hair)',
          borderRadius: 'var(--r-4)', boxShadow: 'var(--shadow-3)',
          zIndex: 1100,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {[
            { label: 'Settings', href: '/settings' },
            { label: 'Privacy Policy', href: '/privacy' },
          ].map(item => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)} style={{
              padding: '10px 12px', borderRadius: 'var(--r-3)',
              fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, fontWeight: 500,
              color: 'var(--ink)', textDecoration: 'none',
            }}>
              {item.label}
            </Link>
          ))}
          <button onClick={handleSignOut} style={{
            padding: '10px 12px', borderRadius: 'var(--r-3)',
            fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14, fontWeight: 500,
            color: 'var(--ink)', background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left',
          }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppNav({ initial }: { initial: string }) {
  const pathname = usePathname()

  // Onboarding + debug flows render their own chrome — hide the app nav there
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/debug')) {
    return null
  }

  return (
    <>
      {/* Desktop top nav */}
      <header className="beni-topnav" style={{
        alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 44px 28px',
        maxWidth: 'var(--container-web)', margin: '0 auto', width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link href="/home" style={{ textDecoration: 'none', display: 'flex' }}>
            <Logo height={26} />
          </Link>
          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map(item => {
              const active = isActive(pathname, item.href)
              return (
                <Link key={item.label} href={item.href} style={{
                  padding: '8px 16px', borderRadius: 999,
                  fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14,
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-dim)',
                  textDecoration: 'none',
                }}>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <AvatarMenu initial={initial} />
      </header>

      {/* Mobile top bar — wordmark + avatar only */}
      <header className="beni-tabbar" style={{
        display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
      }}>
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex' }}>
          <Logo height={22} />
        </Link>
        <AvatarMenu initial={initial} />
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="beni-tabbar" style={{
        display: 'none',
        position: 'fixed', bottom: 12, left: 12, right: 12, zIndex: 1000,
        background: 'var(--surface-1)', border: '1px solid var(--hair)',
        borderRadius: 999, padding: 6,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, width: '100%' }}>
          {TAB_ITEMS.map(item => {
            const active = isActive(pathname, item.href)
            return (
              <Link key={item.label} href={item.href} style={{
                padding: '10px 6px', borderRadius: 999,
                fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
                textAlign: 'center', textDecoration: 'none',
                background: active ? BRAND_GRADIENT : 'transparent',
                color: active ? '#0F1A2C' : 'var(--ink-dim)',
              }}>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
