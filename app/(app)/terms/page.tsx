import Link from 'next/link'
import Logo from '@/components/Logo'
import HamburgerMenu from '@/components/HamburgerMenu'
import SignOutButton from '@/components/SignOutButton'

const navTabs = [
  { label: 'Overview', href: '/dashboard', active: false },
  { label: 'Plan',     href: '/plan',      active: false },
  { label: 'Terms',    href: '/terms',     active: true  },
  { label: 'Settings', href: '/settings',  active: false },
]

const terms = [
  {
    term: 'Deductible',
    short: 'What you pay before insurance kicks in',
    explanation: 'Your deductible is the amount you pay out-of-pocket for covered services before your insurance plan starts sharing the cost. For example, if your deductible is $3,000, you pay the first $3,000 of covered medical expenses yourself. After that, your insurance starts covering a share.',
    example: 'You visit a specialist and the bill is $500. If you haven\'t met your deductible yet, you pay the full $500.',
    color: 'var(--beni-sky)',
  },
  {
    term: 'Copay',
    short: 'A fixed amount you pay at each visit',
    explanation: 'A copay is a set dollar amount you pay for a covered service, usually at the time of the visit. Copays are typically the same every time — for example, $30 for a primary care visit. You pay this regardless of whether you\'ve met your deductible.',
    example: 'Your PCP copay is $30. Every time you see your primary care doctor, you pay $30 at the office — even if your deductible isn\'t met.',
    color: 'var(--beni-coral)',
  },
  {
    term: 'Coinsurance',
    short: 'Your share of costs after your deductible',
    explanation: 'Coinsurance is the percentage of costs you pay after meeting your deductible. If your plan has 20% coinsurance, your insurance pays 80% and you pay 20% of covered services. This continues until you reach your out-of-pocket maximum.',
    example: 'You have a $2,000 hospital bill after meeting your deductible. With 20% coinsurance, you pay $400 and your insurance pays $1,600.',
    color: 'var(--beni-peach)',
  },
  {
    term: 'Out-of-pocket maximum',
    short: 'The most you\'ll ever pay in a year',
    explanation: 'Your out-of-pocket maximum (OOP max) is the most you\'ll have to pay for covered services in a plan year. Once you hit this limit, your insurance covers 100% of covered costs for the rest of the year. It includes your deductible, copays, and coinsurance.',
    example: 'Your OOP max is $6,000. Once you\'ve paid $6,000 in deductibles, copays, and coinsurance, your insurance covers everything else at 100% for the year.',
    color: '#9B5BFF',
  },
  {
    term: 'Premium',
    short: 'Your monthly payment to keep insurance active',
    explanation: 'Your premium is the amount you (or your employer) pay every month to maintain your health insurance coverage — regardless of whether you use any medical services. It\'s like a subscription fee. Premiums do not count toward your deductible or out-of-pocket maximum.',
    example: 'You pay $180/month for your health plan. Even if you have zero medical visits that month, you still pay $180.',
    color: 'var(--beni-sun)',
  },
  {
    term: 'In-network vs out-of-network',
    short: 'Providers your insurance has deals with vs those it doesn\'t',
    explanation: 'In-network providers have contracts with your insurance company to offer services at negotiated rates. Out-of-network providers don\'t have these agreements, so they typically cost significantly more — or may not be covered at all depending on your plan type.',
    example: 'Seeing an in-network specialist costs you a $60 copay. Seeing an out-of-network specialist might cost 40% of the total bill.',
    color: 'var(--beni-navy)',
  },
  {
    term: 'FSA (Flexible Spending Account)',
    short: 'Pre-tax money for healthcare costs',
    explanation: 'An FSA lets you set aside pre-tax dollars from your paycheck to pay for eligible healthcare expenses like copays, prescriptions, and dental or vision costs. The money is use-it-or-lose-it — you generally must spend it by the end of the plan year.',
    example: 'You put $1,000 in your FSA at the start of the year. You use it to pay for glasses, a dentist visit, and prescriptions — all tax-free.',
    color: '#FFC4BE',
  },
  {
    term: 'EOB (Explanation of Benefits)',
    short: 'A summary of what insurance paid after a claim',
    explanation: 'An EOB is a statement from your insurance company showing what a medical claim cost, what they covered, and what you owe. It\'s not a bill — it\'s a record of how the claim was processed. Your actual bill comes from the provider.',
    example: 'You visit urgent care. A few weeks later you receive an EOB showing the provider charged $350, insurance paid $275, and you owe $75.',
    color: 'var(--beni-sky)',
  },
]

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo height={28} />
        <nav className="beni-nav-pills" style={{ gap: 2, background: 'var(--bg-sunken)', borderRadius: 'var(--r-pill)', padding: 3 }}>
          {navTabs.map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              height: 32, padding: '0 16px', borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 13,
              background: tab.active ? 'var(--beni-ink)' : 'transparent',
              color: tab.active ? '#fff' : 'var(--fg-3)',
              textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </header>
      <main style={{ maxWidth: 'var(--container-web)', margin: '0 auto', padding: '40px 28px' }}>
        <h1 className="t-h1" style={{ color: 'var(--fg-1)', marginBottom: 8 }}>Insurance terms, plain English</h1>
        <p className="t-body" style={{ color: 'var(--fg-3)', marginBottom: 40 }}>
          No jargon. Just clear explanations of what your plan actually means.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {terms.map((t) => (
            <div key={t.term} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 4, borderRadius: 999,
                  background: t.color, alignSelf: 'stretch', flexShrink: 0, minHeight: 48,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <h2 className="t-h3" style={{ color: 'var(--fg-1)', display: 'inline', marginRight: 10 }}>{t.term}</h2>
                    <span className="t-caption" style={{ color: 'var(--fg-3)' }}>{t.short}</span>
                  </div>
                  <p className="t-body-s" style={{ color: 'var(--fg-2)', marginBottom: 12, lineHeight: 1.6 }}>
                    {t.explanation}
                  </p>
                  <div style={{
                    background: 'var(--bg-sunken)', borderRadius: 'var(--r-3)',
                    padding: '10px 14px',
                  }}>
                    <span className="t-overline" style={{ color: 'var(--fg-4)', marginRight: 6 }}>Example</span>
                    <span className="t-body-s" style={{ color: 'var(--fg-2)' }}>{t.example}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
