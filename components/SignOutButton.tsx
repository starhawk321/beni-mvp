'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
        border: 'var(--border-hairline)', background: 'var(--bg-surface)',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        color: 'var(--fg-3)', fontFamily: 'var(--font-manrope), sans-serif',
      }}
    >
      Sign out
    </button>
  )
}
