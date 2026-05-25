import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initial = 'B'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()
    initial = (profile?.first_name?.[0] ?? user.email?.[0] ?? 'B').toUpperCase()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <AppNav initial={initial} />
      {children}
    </div>
  )
}
