'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth/errors'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(friendlyAuthError(error.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <Logo height={36} />
          <p className="t-body-s" style={{ color: 'var(--fg-3)', marginTop: 8, fontStyle: 'italic', fontFamily: 'var(--font-instrument-serif), serif' }}>
            Understand your health insurance, finally.
          </p>
        </div>

        <h1 className="t-h2" style={{ color: 'var(--fg-1)', marginBottom: 24 }}>Welcome back</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="t-caption" style={{ color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label className="t-caption" style={{ color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="input"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--status-critical-bg)',
              color: 'var(--status-critical)',
              borderRadius: 'var(--r-3)',
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="t-body-s" style={{ color: 'var(--fg-3)', textAlign: 'center', marginTop: 24 }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--beni-sky)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>

        <p className="t-caption" style={{ color: 'var(--fg-4)', textAlign: 'center', marginTop: 16 }}>
          By signing up you agree to our{' '}
          <Link href="/privacy" style={{ color: 'var(--fg-3)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
        </p>

      </div>

      <style>{`
        .auth-shell {
          min-height: 100vh;
          background-color: var(--bg-canvas);
          background-image: radial-gradient(ellipse 80% 60% at 15% 15%, rgba(255,199,153,0.55) 0%, transparent 70%),
                            radial-gradient(ellipse 70% 50% at 85% 10%, rgba(255,161,153,0.45) 0%, transparent 65%),
                            radial-gradient(ellipse 60% 50% at 50% 90%, rgba(255,255,153,0.35) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 40% at 10% 80%, rgba(5,134,195,0.18) 0%, transparent 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .auth-card {
          background: var(--bg-surface);
          border-radius: var(--r-6);
          padding: 36px;
          width: 100%;
          max-width: 440px;
          box-shadow: var(--shadow-3);
        }
      `}</style>
    </div>
  )
}
