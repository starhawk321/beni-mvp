import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Béni — the intelligence layer for your healthcare',
  description:
    'Béni connects to your insurers, makes sense of your plans and bills, and goes to work on your behalf.',
}

// Public marketing landing. Locked to the dark brand look (scoped under
// .beni-landing in globals.css), independent of the app's next-themes.
export default function LandingPage() {
  return (
    <div className="beni-landing">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          <Link href="/" className="lp-wordmark">
            <span className="lp-wordmark__mark">+</span>
            beni
          </Link>
          <div className="lp-nav__cta">
            <Link href="/login" className="lp-btn lp-btn--ghost">Log in</Link>
            <Link href="/signup" className="lp-btn lp-btn--grad">Get started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero__inner">
            <span className="lp-pill">
              <span className="lp-pill__dot" />
              Connects to Medicare, Cigna, Aetna, UHC, Anthem &amp; more.
            </span>
            <h1 className="lp-hero__title">
              The intelligence layer for your <span className="lp-grad">healthcare</span>.
            </h1>
            <p className="lp-hero__sub">
              Béni connects to your insurers, makes sense of your plans and bills, and goes
              to work on your behalf — so the most confusing part of your life finally runs
              itself.
            </p>
            <div className="lp-hero__cta">
              <Link href="/signup" className="lp-btn lp-btn--grad lp-btn--lg">Get started for free</Link>
              <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--lg">Log in</Link>
            </div>
          </div>
        </div>
      </header>

      {/* PREVIEW CARD */}
      <section className="lp-section lp-section--snug" style={{ paddingTop: 24 }}>
        <div className="lp-container">
          <article className="lp-preview">
            <div className="lp-preview__meta">
              <span className="lp-preview__meta-dot" />
              Cigna PPO Plus · live
            </div>
            <div className="lp-preview__inner">
              <div className="lp-overline">Deductible progress</div>
              <div className="lp-preview__figure">
                $1,200 <span className="lp-preview__slash">/ $3,000</span>
              </div>
              <div className="lp-preview__bar">
                <div className="lp-preview__bar-fill" />
              </div>
              <div className="lp-preview__caption">
                <strong>40% met</strong>
                <span>·</span>
                <span>$1,800 until full coverage.</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* THREE LAYERS */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-sect-head">
            <div className="lp-eyebrow">How Béni works</div>
            <h2 className="lp-sect-title">
              Most apps stop at a dashboard. Béni does <span className="lp-grad">more</span>.
            </h2>
          </div>

          <div className="lp-layers">
            <article className="lp-layer lp-layer--data">
              <span className="lp-layer__shape" />
              <div className="lp-layer__top">
                <span className="lp-layer__num">01 · DATA</span>
                <span className="lp-layer__tag"><span className="lp-layer__tag-dot" />Available now</span>
              </div>
              <div>
                <div className="lp-layer__name">
                  Consolidate
                  <span className="lp-layer__verb">in one place</span>
                </div>
                <p className="lp-layer__body">
                  Pulls your medical, dental, and FSA accounts into one readable place.
                  Browse your records, understand every bill.
                </p>
              </div>
            </article>

            <article className="lp-layer lp-layer--analytics">
              <span className="lp-layer__shape" />
              <div className="lp-layer__top">
                <span className="lp-layer__num">02 · ANALYTICS</span>
                <span className="lp-layer__tag"><span className="lp-layer__tag-dot" />Coming soon</span>
              </div>
              <div>
                <div className="lp-layer__name">
                  Understand
                  <span className="lp-layer__verb">what you&apos;d miss</span>
                </div>
                <p className="lp-layer__body">
                  Béni reads your plans, claims, and spending to surface what you&apos;d never
                  catch — unused benefits, billing errors, coverage gaps.
                </p>
              </div>
            </article>

            <article className="lp-layer lp-layer--agentic">
              <div className="lp-layer__top">
                <span className="lp-layer__num">03 · AGENTIC</span>
                <span className="lp-layer__tag"><span className="lp-layer__tag-dot" />Coming soon</span>
              </div>
              <div>
                <div className="lp-layer__name">
                  Act
                  <span className="lp-layer__verb">on your behalf</span>
                </div>
                <p className="lp-layer__body">
                  Béni&apos;s agents go to work for you — negotiating bills, submitting FSA
                  expenses, supporting prior authorizations.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SAVINGS TEASER */}
      <section className="lp-section">
        <div className="lp-container">
          <article className="lp-savings">
            <div>
              <div className="lp-savings__flag">
                Béni flagged a hospital bill ~40% above fair price.
              </div>
              <div className="lp-savings__flag-line">Baptist Health · billed Aug 31, 2026</div>
            </div>
            <div>
              <div className="lp-savings__outcome">
                <div className="lp-savings__outcome-label">Outcome</div>
                <div className="lp-savings__outcome-figure">
                  <span className="lp-savings__outcome-from">$1,374</span>
                  <span className="lp-savings__outcome-arrow">→</span>
                  <span>$890</span>
                </div>
                <div className="lp-savings__outcome-sub">
                  You saved <strong>$484</strong>.
                </div>
              </div>

              <div className="lp-timeline">
                <div className="lp-timeline__step lp-timeline__step--done">Reviewing</div>
                <div className="lp-timeline__step lp-timeline__step--done">Drafting</div>
                <div className="lp-timeline__step lp-timeline__step--done">Submitted</div>
                <div className="lp-timeline__step lp-timeline__step--done">Negotiating</div>
                <div className="lp-timeline__step lp-timeline__step--current">Resolved</div>
              </div>

              <div className="lp-savings__caption">
                This is where Béni is going. Bill negotiation, on your behalf.
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* HOOK */}
      <section className="lp-hook">
        <p className="lp-hook__line">
          Banking got Plaid. Spending got Mint. Healthcare never got its{' '}
          <span className="lp-grad">intelligence layer</span>.
        </p>
      </section>

      {/* PRIVACY BAR */}
      <section className="lp-privacy">
        <div className="lp-privacy__inner">
          <span className="lp-lock" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <span>
            <strong>Read-only and ephemeral.</strong>{' '}
            Your records stay with your insurer — Béni reads them, never copies them.
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <Link href="/" className="lp-wordmark">
            <span className="lp-wordmark__mark">+</span>
            beni
          </Link>
          <div className="lp-footer__copy">
            © 2026 Béni · Read-only access · Your data stays yours
          </div>
          <div className="lp-footer__links">
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
