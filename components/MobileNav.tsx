'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Plan',     href: '/plan'      },
  { label: 'Terms',    href: '/terms'     },
  { label: 'Settings', href: '/settings'  },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="beni-mobile-nav">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link key={tab.label} href={tab.href} style={{
            flex: 1, height: 32, padding: '0 8px',
            borderRadius: 'var(--r-pill)',
            fontFamily: 'var(--font-manrope), sans-serif',
            fontWeight: 600, fontSize: 12,
            background: active ? 'var(--beni-ink)' : 'transparent',
            color: active ? '#fff' : 'var(--fg-3)',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
