import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'
import MockDataBanner from '@/components/MockDataBanner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initial = 'B'
  let showMockBanner = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, connection_skipped')
      .eq('id', user.id)
      .single()
    initial = (profile?.first_name?.[0] ?? user.email?.[0] ?? 'B').toUpperCase()
    showMockBanner = profile?.connection_skipped === true
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      {showMockBanner && <MockDataBanner />}
      <AppNav initial={initial} />
      {children}
    </div>
  )
}
