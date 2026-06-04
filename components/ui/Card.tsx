import type { CSSProperties, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  pad?: number
  style?: CSSProperties
}

function sp(px: number): string {
  return `calc((var(--s) * 0.5 + 0.5) * ${px}px)`
}

export default function Card({ children, pad = 28, style }: CardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--beni-line)',
        borderRadius: 24,
        boxShadow: 'var(--shadow-1)',
        padding: sp(pad),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
