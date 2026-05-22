import Link from 'next/link'

export default function DeleteAccountButton() {
  return (
    <Link
      href="/settings/delete-account"
      style={{
        height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
        border: '1px solid var(--status-critical)',
        background: 'transparent', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: 'var(--status-critical)',
        fontFamily: 'var(--font-manrope), sans-serif', whiteSpace: 'nowrap',
        textDecoration: 'none',
        display: 'flex', alignItems: 'center',
      }}
    >
      Delete account
    </Link>
  )
}
