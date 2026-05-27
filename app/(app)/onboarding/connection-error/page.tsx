import Link from 'next/link'

const PAYER_NAMES: Record<string, string> = {
  cms:   'Medicare',
  cigna: 'Cigna',
  bcbs:  'BlueCross BlueShield MN',
  aetna: 'Aetna',
}

type Reason = 'cancelled' | 'token_exchange_failed' | 'missing_fields' | 'invalid_state' | 'server_error'

function copy(reason: Reason, payer: string): { title: string; body: string; support?: boolean } {
  switch (reason) {
    case 'cancelled':
      return { title: 'You stopped before finishing', body: `That's OK — no progress lost. Connecting ${payer} takes about 30 seconds when you're ready.` }
    case 'token_exchange_failed':
      return { title: "Couldn't complete the connection", body: `Something went wrong on our side completing the secure handshake with ${payer}. This is usually temporary.`, support: true }
    case 'missing_fields':
      return { title: `${payer} didn't return everything we need`, body: "Sometimes test or new accounts don't have a member ID linked yet. Try a different account, or come back later." }
    case 'invalid_state':
      return { title: 'Your session expired', body: 'Security check timed out. This usually fixes itself on the next try.' }
    default:
      return { title: 'Something didn\'t work', body: `We hit an unexpected error connecting to ${payer}. We've logged it and we're looking into it.`, support: true }
  }
}

const BRAND_GRADIENT = 'linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)'

export default async function ConnectionErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string; payer?: string; flow?: string }> }) {
  const { reason, payer, flow } = await searchParams
  const payerName = PAYER_NAMES[payer ?? ''] ?? 'your insurer'
  const c = copy((reason as Reason) ?? 'server_error', payerName)

  const tryAgainHref = flow === 'add' ? '/onboarding?add=true' : '/onboarding'
  const skipHref     = flow === 'add' ? '/settings' : '/home'

  return (
    <main className="beni-main" style={{ maxWidth: 540, paddingTop: 48, paddingBottom: 96 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--hair)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 24,
      }}>⚠️</div>

      <h1 style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 12 }}>{c.title}</h1>
      <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>{c.body}</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href={tryAgainHref} style={{
          height: 48, padding: '0 22px', borderRadius: 999, background: BRAND_GRADIENT, color: '#0F1A2C',
          fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: 15,
          display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
        }}>Try again</Link>
        {c.support ? (
          <a href="mailto:hello@benihealth.app" style={{
            height: 48, padding: '0 22px', borderRadius: 999, border: '1px solid var(--btn-ghost-border)', background: 'transparent', color: 'var(--ink)',
            fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 15,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
          }}>Email support</a>
        ) : (
          <Link href={skipHref} style={{
            height: 48, padding: '0 22px', borderRadius: 999, border: '1px solid var(--btn-ghost-border)', background: 'transparent', color: 'var(--ink)',
            fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 15,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
          }}>Skip for now</Link>
        )}
      </div>
    </main>
  )
}
