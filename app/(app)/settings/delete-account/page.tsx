import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'
import Link from 'next/link'
import DeleteAccountConfirm from '@/components/DeleteAccountConfirm'

export default async function DeleteAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tokens } = await supabase
    .from('fhir_tokens')
    .select('payer')
    .eq('user_id', user!.id)

  const connectedCount = tokens?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <header style={{
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <Link href="/settings" style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--fg-3)', textDecoration: 'none',
          fontFamily: 'var(--font-manrope), sans-serif',
        }}>
          ← Back to settings
        </Link>
      </header>

      <main className="beni-main" style={{ maxWidth: 560 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--status-critical-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, fontSize: 24,
        }}>
          ⚠️
        </div>

        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 12 }}>
          Delete your Béni account
        </h1>

        <p className="t-body" style={{ color: 'var(--fg-2)', marginBottom: 28, lineHeight: 1.6 }}>
          This is permanent. Take a moment to read what happens when you delete your account.
        </p>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>What will be deleted</p>
          <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li className="t-body-s" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>
              Your Béni account, name, and email
            </li>
            <li className="t-body-s" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>
              {connectedCount > 0
                ? `Your ${connectedCount} connected insurer${connectedCount > 1 ? 's' : ''} (access will be revoked)`
                : 'Any future insurer connections'}
            </li>
            <li className="t-body-s" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>
              Your settings and preferences
            </li>
          </ul>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 32, background: 'var(--beni-sky-12)', borderColor: 'transparent' }}>
          <p className="t-overline" style={{ color: 'var(--beni-sky)', marginBottom: 14 }}>What we never had to delete</p>
          <p className="t-body-s" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>
            Béni doesn't store your health records, claims, or any medical data — your insurer keeps all of that. Deleting your account only removes your Béni profile and our access to your insurer.
          </p>
        </div>

        <DeleteAccountConfirm />

        <p className="t-caption" style={{ color: 'var(--fg-4)', marginTop: 24, textAlign: 'center' }}>
          Need help instead?{' '}
          <a href="mailto:hello@benihealth.app" style={{ color: 'var(--beni-sky)', fontWeight: 600, textDecoration: 'none' }}>
            Email us
          </a>
        </p>
      </main>
    </div>
  )
}
