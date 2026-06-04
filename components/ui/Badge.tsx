import type { ReactNode } from 'react'

type BadgeTone = 'positive' | 'warning' | 'critical' | 'info'

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
}

const TONES: Record<BadgeTone, [string, string]> = {
  positive: ['var(--status-positive-bg)', '#216138'],
  warning:  ['var(--status-warning-bg)',  '#8a5212'],
  critical: ['var(--status-critical-bg)', '#8f2820'],
  info:     ['var(--status-info-bg)',     '#046397'],
}

function fs(px: number): string {
  return `calc(var(--s) * ${px}px)`
}

function sp(px: number): string {
  return `calc((var(--s) * 0.5 + 0.5) * ${px}px)`
}

export default function Badge({ tone = 'info', children }: BadgeProps) {
  const [bg, fg] = TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: fs(30),
        padding: `${sp(4)} ${sp(12)}`,
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: fs(15),
      }}
    >
      {children}
    </span>
  )
}
