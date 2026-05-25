import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// "See a sample dashboard" path — marks the profile as skipped so the app
// unlocks (mock data + disclaimer bar) without a real insurer connection.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('profiles').upsert({
    id:                  user.id,
    email:               user.email ?? '',
    onboarding_complete: true,
    connection_skipped:  true,
  }, { onConflict: 'id' })

  if (error) {
    console.error('skip upsert failed:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
