'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConnectInsurerButton() {
  const router = useRouter()

  async function handleClick() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ onboarding_complete: false, selected_insurer: null })
      .eq('id', user.id)

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        height: 36, padding: '0 18px', borderRadius: 'var(--r-pill)',
        background: 'var(--action-primary)', color: '#ffe9cf',
        fontSize: 13, fontWeight: 600,
        border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-manrope), sans-serif',
      }}
    >
      Connect insurer
    </button>
  )
}
