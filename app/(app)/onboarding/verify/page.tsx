'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import type { Conflict, ConflictField } from '@/lib/fhir/conflicts'

export default function VerifyPage() {
  const router = useRouter()
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [choices, setChoices] = useState<Record<ConflictField, 'user' | 'fhir'>>({} as Record<ConflictField, 'user' | 'fhir'>)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('pending_conflicts')
        .eq('id', user.id)
        .single()

      const pending: Conflict[] = profile?.pending_conflicts ?? []

      if (pending.length === 0) {
        router.push('/dashboard')
        return
      }

      setConflicts(pending)
      // Default all choices to fhir (insurer data)
      const defaults = {} as Record<ConflictField, 'user' | 'fhir'>
      pending.forEach(c => { defaults[c.field] = 'fhir' })
      setChoices(defaults)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fieldMap: Record<ConflictField, string> = {
      firstName:   'first_name',
      lastName:    'last_name',
      dateOfBirth: 'date_of_birth',
      gender:      'gender',
    }

    const updates: Record<string, string> = { pending_conflicts: null as unknown as string }
    conflicts.forEach(conflict => {
      const dbField = fieldMap[conflict.field]
      updates[dbField] = choices[conflict.field] === 'fhir'
        ? conflict.fhirValue
        : conflict.userValue
    })

    await supabase.from('profiles').update(updates).eq('id', user.id)
    router.push('/dashboard')
    router.refresh()
  }

  function selectAll(source: 'user' | 'fhir') {
    const all = {} as Record<ConflictField, 'user' | 'fhir'>
    conflicts.forEach(c => { all[c.field] = source })
    setChoices(all)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="t-body" style={{ color: 'var(--fg-3)' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <header style={{
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center',
        borderBottom: 'var(--border-hairline)',
        background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
      }}>
        <Logo height={26} />
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '56px 28px' }}>
        {/* Header */}
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--r-3)',
          background: 'var(--status-warning-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 20,
        }}>⚠️</div>

        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 10 }}>
          We found some differences
        </h1>
        <p className="t-body" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>
          Your insurer has different information on file. Choose which version to keep for each field.
        </p>

        {/* Bulk actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => selectAll('user')}
            style={{
              height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
              border: 'var(--border-strong)', background: 'transparent',
              fontSize: 13, fontWeight: 600, color: 'var(--fg-2)',
              cursor: 'pointer', fontFamily: 'var(--font-manrope), sans-serif',
            }}
          >
            Keep all mine
          </button>
          <button
            onClick={() => selectAll('fhir')}
            style={{
              height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
              border: 'var(--border-strong)', background: 'transparent',
              fontSize: 13, fontWeight: 600, color: 'var(--fg-2)',
              cursor: 'pointer', fontFamily: 'var(--font-manrope), sans-serif',
            }}
          >
            Use insurer data
          </button>
        </div>

        {/* Conflict cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {conflicts.map(conflict => (
            <div key={conflict.field} className="card" style={{ padding: 20 }}>
              <p className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>
                {conflict.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* User value */}
                <button
                  onClick={() => setChoices(prev => ({ ...prev, [conflict.field]: 'user' }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--r-3)',
                    border: choices[conflict.field] === 'user'
                      ? `2px solid var(--beni-sky)`
                      : 'var(--border-hairline)',
                    background: choices[conflict.field] === 'user'
                      ? 'var(--beni-sky-12)'
                      : 'var(--bg-surface)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: choices[conflict.field] === 'user'
                      ? '5px solid var(--beni-sky)'
                      : '2px solid var(--beni-line-strong)',
                    transition: 'all 150ms',
                  }} />
                  <div>
                    <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{conflict.userValue}</p>
                    <p className="t-caption" style={{ color: 'var(--fg-4)' }}>You entered</p>
                  </div>
                </button>

                {/* FHIR value */}
                <button
                  onClick={() => setChoices(prev => ({ ...prev, [conflict.field]: 'fhir' }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--r-3)',
                    border: choices[conflict.field] === 'fhir'
                      ? `2px solid var(--beni-sky)`
                      : 'var(--border-hairline)',
                    background: choices[conflict.field] === 'fhir'
                      ? 'var(--beni-sky-12)'
                      : 'var(--bg-surface)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: choices[conflict.field] === 'fhir'
                      ? '5px solid var(--beni-sky)'
                      : '2px solid var(--beni-line-strong)',
                    transition: 'all 150ms',
                  }} />
                  <div>
                    <p className="t-body-strong" style={{ color: 'var(--fg-1)' }}>{conflict.fhirValue}</p>
                    <p className="t-caption" style={{ color: 'var(--fg-4)' }}>From your insurer</p>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {saving ? 'Saving…' : 'Save and continue'}
        </button>
      </main>
    </div>
  )
}
