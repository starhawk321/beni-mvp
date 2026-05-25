import { createClient } from '@/lib/supabase/server'
import ConnectedInterstitial from '@/components/ConnectedInterstitial'

const PAYER_NAMES: Record<string, string> = {
  cms:   'Medicare',
  cigna: 'Cigna',
  bcbs:  'BlueCross BlueShield MN',
}

export default async function ConnectedPage({ searchParams }: { searchParams: Promise<{ payer?: string; flow?: string }> }) {
  const { payer, flow } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tokens } = await supabase
    .from('fhir_tokens')
    .select('payer')
    .eq('user_id', user!.id)

  const connected = (tokens ?? [])
    .map(t => PAYER_NAMES[t.payer] ?? t.payer)
    .filter(Boolean)

  const justConnected = PAYER_NAMES[payer ?? ''] ?? 'Your insurer'

  return (
    <ConnectedInterstitial
      justConnected={justConnected}
      connected={connected}
      flow={flow === 'add' ? 'add' : 'first'}
      connectedCount={connected.length}
    />
  )
}
