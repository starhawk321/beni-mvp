'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="t-caption" style={{ color: 'var(--fg-2)', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--status-critical)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Save profile fields — user may be auto-confirmed (email confirm off)
    // or pending confirmation. Update profile either way.
    const userId = data.user?.id
    if (userId) {
      await supabase.from('profiles').update({
        first_name:    form.firstName,
        last_name:     form.lastName,
        date_of_birth: form.dob || null,
        gender:        form.gender || null,
      }).eq('id', userId)
    }

    // If email confirmation is off, user is immediately logged in
    if (data.session) {
      router.push('/onboarding')
      router.refresh()
    } else {
      setConfirmed(true)
    }

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
            margin: '0 auto 24px', fontSize: 32,
          }}>✉️</div>
          <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 12 }}>Check your email</h1>
          <p className="t-body" style={{ color: 'var(--fg-3)' }}>
            We sent a confirmation link to{' '}
            <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{form.email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <style>{authStyles}</style>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ marginBottom: 28 }}>
          <Logo height={36} />
          <p className="t-body-s" style={{ color: 'var(--fg-3)', marginTop: 8, fontStyle: 'italic', fontFamily: 'var(--font-instrument-serif), serif' }}>
            Understand your health insurance, finally.
          </p>
        </div>

        <h1 className="t-h2" style={{ color: 'var(--fg-1)', marginBottom: 24 }}>Create your account</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First name" required>
              <input type="text" required value={form.firstName} onChange={set('firstName')} placeholder="Sarah" className="input" />
            </Field>
            <Field label="Last name" required>
              <input type="text" required value={form.lastName} onChange={set('lastName')} placeholder="Johnson" className="input" />
            </Field>
          </div>

          <Field label="Email" required>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input" />
          </Field>

          <Field label="Password" required>
            <input type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" className="input" />
          </Field>

          {/* DOB + Gender row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Date of birth">
              <input type="date" value={form.dob} onChange={set('dob')} className="input" style={{ colorScheme: 'light dark' }} />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')} className="input" style={{ cursor: 'pointer' }}>
                <option value="">Select</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          {error && (
            <div style={{
              background: 'var(--status-critical-bg)', color: 'var(--status-critical)',
              borderRadius: 'var(--r-3)', padding: '10px 14px', fontSize: 14, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="t-body-s" style={{ color: 'var(--fg-3)', textAlign: 'center', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--beni-sky)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
      <style>{authStyles}</style>
    </div>
  )
}

const authStyles = `
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
    padding: 36px; width: 100%; max-width: 480px; box-shadow: var(--shadow-3);
  }
`
