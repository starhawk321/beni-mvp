import Link from 'next/link'

// Persistent, non-dismissible bar shown on every page when the user is in
// skip / "see a sample" mode (profile.connection_skipped = true). Honesty
// over UX comfort — only connecting a real insurer removes it.
export default function MockDataBanner() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 1200,
      background: '#FFC4BE', color: '#3D1612',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '10px 18px', flexWrap: 'wrap',
      fontFamily: 'var(--font-manrope), sans-serif', fontSize: 13.5, fontWeight: 500,
      textAlign: 'center',
    }}>
      <span>👁 Sample data shown for illustration — not your real coverage.</span>
      <Link href="/onboarding" style={{
        color: '#3D1612', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2,
      }}>
        Connect your insurance →
      </Link>
    </div>
  )
}
