// Shared loading skeleton for data-heavy app pages. Mirrors the dashboard
// shape closely enough to avoid layout shift while FHIR data is fetched.

function Bar({ w, h = 16, mt = 0 }: { w: number | string; h?: number; mt?: number }) {
  return <div className="beni-skel" style={{ width: w, height: h, marginTop: mt }} />
}

export default function DashboardSkeleton() {
  return (
    <main className="beni-main" style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 96 }}>
      {/* Hero */}
      <div style={{ background: '#0F1A2C', borderRadius: 28, padding: '36px 40px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Bar w={180} h={12} />
        <Bar w="60%" h={34} mt={16} />
        <div style={{ display: 'flex', gap: 48, marginTop: 36 }}>
          {[0, 1, 2].map(i => (
            <div key={i}>
              <Bar w={90} h={12} />
              <Bar w={110} h={40} mt={8} />
            </div>
          ))}
        </div>
      </div>

      {/* Two-card rows */}
      {[0, 1].map(row => (
        <div key={row}>
          <Bar w={160} h={20} />
          <div className="beni-accounts-grid" style={{ marginTop: 14 }}>
            {[0, 1].map(i => (
              <div key={i} className="beni-skel" style={{ height: 150, borderRadius: 22 }} />
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
