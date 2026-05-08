'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setConfirmed(true)
    setLoading(false)
  }

  if (confirmed) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--status-positive-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 32,
          }}>
            ✉️
          </div>
          <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 12 }}>Check your email</h1>
          <p className="t-body" style={{ color: 'var(--fg-3)' }}>
            We sent a confirmation link to{' '}
            <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{email}</span>.
            Click it to activate your account.
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
            display: flex; align-items: center; justify-content: center; padding: 24px;
          }
          .auth-card {
            background: var(--bg-surface); border-radius: var(--r-6);
            padding: 36px; width: 100%; max-width: 440px; box-shadow: var(--shadow-3);
          }
        `}</style>
      </div>
    )
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

        <h1 className="t-h2" style={{ color: 'var(--fg-1)', marginBottom: 24 }}>Create your account</h1>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="t-body-s" style={{ color: 'var(--fg-3)', textAlign: 'center', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--beni-sky)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
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
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .auth-card {
          background: var(--bg-surface); border-radius: var(--r-6);
          padding: 36px; width: 100%; max-width: 440px; box-shadow: var(--shadow-3);
        }
      `}</style>
    </div>
  )
}
