'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

function fs(px: number): string {
  return `calc(var(--s) * ${px}px)`
}

function sp(px: number): string {
  return `calc((var(--s) * 0.5 + 0.5) * ${px}px)`
}

// ── Field (label + hint/error wrapper) ────────────────────────────────────

type FieldProps = {
  label?: string
  hint?: string
  error?: string
  htmlFor?: string
  children: ReactNode
}

export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'flex', flexDirection: 'column', gap: sp(8) }}>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: fs(19),
            color: 'var(--fg-1)',
          }}
        >
          {label}
        </span>
      )}
      {children}
      {error && (
        <span style={{ fontSize: fs(17), color: 'var(--status-critical)', fontWeight: 600 }}>
          {error}
        </span>
      )}
      {!error && hint && (
        <span style={{ fontSize: fs(17), color: 'var(--fg-2)' }}>
          {hint}
        </span>
      )}
    </label>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, style, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      style={{
        minHeight: fs(62),
        padding: `0 ${sp(18)}`,
        borderRadius: 14,
        border: `2px solid ${error ? 'var(--status-critical)' : 'var(--beni-line-strong)'}`,
        background: '#fff',
        fontFamily: 'var(--font-sans)',
        fontSize: fs(21),
        fontWeight: 500,
        color: 'var(--fg-1)',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color var(--dur-2), box-shadow var(--dur-2)',
        ...style,
      }}
      {...rest}
    />
  )
})

// ── Combined helper for the common label+input pattern ───────────────────

type LabeledInputProps = Omit<InputProps, 'id' | 'error'> & {
  label?: string
  hint?: string
  error?: string
}

export function LabeledInput({ label, hint, error, ...inputProps }: LabeledInputProps) {
  const generatedId = useId()
  const id = inputProps.name ? `field-${inputProps.name}` : generatedId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <Input id={id} error={Boolean(error)} {...inputProps} />
    </Field>
  )
}
