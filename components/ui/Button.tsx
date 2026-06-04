'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'lg' | 'xl'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  children?: ReactNode
}

const HEIGHTS: Record<ButtonSize, number> = { md: 52, lg: 64, xl: 76 }
const FONT_PX: Record<ButtonSize, number> = { md: 18, lg: 21, xl: 21 }

function fs(px: number): string {
  return `calc(var(--s) * ${px}px)`
}

function sp(px: number): string {
  return `calc((var(--s) * 0.5 + 0.5) * ${px}px)`
}

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--action-primary)',
    color: '#FFE9CF',
    boxShadow: 'var(--shadow-2)',
  },
  secondary: {
    background: 'var(--bg-surface)',
    color: 'var(--fg-1)',
    border: '2px solid var(--beni-navy)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--action-primary)',
    textDecoration: 'underline',
    textUnderlineOffset: 4,
  },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', full, children, style, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: fs(HEIGHTS[size]),
        padding: `0 ${sp(28)}`,
        width: full ? '100%' : 'auto',
        borderRadius: 999,
        border: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: fs(FONT_PX[size]),
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-2) var(--ease-standard), transform var(--dur-1)',
        ...VARIANTS[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
