import Logo from '@/components/Logo'

export default function StealthPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Logo height={72} />
      <p style={{
        marginTop: 20,
        fontFamily: 'var(--font-instrument-serif), serif',
        fontStyle: 'italic',
        fontSize: 18,
        color: 'var(--fg-3)',
        letterSpacing: '0.01em',
      }}>
        the intelligent way to healthcare
      </p>
    </div>
  )
}
