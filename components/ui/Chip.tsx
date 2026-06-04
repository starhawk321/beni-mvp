import type { ReactNode } from 'react'

type ChipTone = 'navy' | 'sky' | 'vision' | 'fsa' | 'hsa' | 'life'

type ChipProps = {
  tone?: ChipTone
  children: ReactNode
}

const TONES: Record<ChipTone, [string, string]> = {
  navy:   ['#dbe6f2', '#003a72'],
  sky:    ['#d3ecf7', '#046397'],
  vision: ['#e6dffa', '#4b3a9e'],
  fsa:    ['#ffd9d2', '#8f352e'],
  hsa:    ['#ffe4cc', '#8a4f1e'],
  life:   ['#f7edb0', '#665219'],
}

function fs(px: number): string {
  return `calc(var(--s) * ${px}px)`
}

function sp(px: number): string {
  return `calc((var(--s) * 0.5 + 0.5) * ${px}px)`
}

export default function Chip({ tone = 'navy', children }: ChipProps) {
  const [bg, fg] = TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: fs(32),
        padding: `${sp(4)} ${sp(14)}`,
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: fs(15),
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ width: fs(9), height: fs(9), borderRadius: 999, background: fg }} />
      {children}
    </span>
  )
}
