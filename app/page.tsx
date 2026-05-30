import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Béni — the intelligence layer for your healthcare',
  description:
    'Béni connects to your insurers, makes sense of your plans and bills, and goes to work on your behalf.',
}

// Public marketing landing. Locked to the dark brand look (scoped under
// .beni-landing in globals.css), independent of the app's next-themes — so the
// Logo SVG is referenced directly here rather than via the <Logo> component,
// which depends on a ThemeProvider context the landing doesn't have.
export default function LandingPage() {
  return (
    <div className="beni-landing">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          <Link href="/" aria-label="Béni home" className="lp-logo">
            <Image src="/assets/beni-logo-wordmark-dark.svg" alt="Béni" width={78} height={26} priority />
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
            <span className="lp-pill lp-anim lp-anim--1">
              <span className="lp-pill__dot" />
              Connects to Medicare, Cigna, Aetna, UHC, Anthem &amp; more.
            </span>
            <h1 className="lp-hero__title lp-anim lp-anim--2">
              The intelligence layer for your <span className="lp-grad">healthcare</span>.
            </h1>
            <p className="lp-hero__sub lp-anim lp-anim--3">
              Béni connects to your insurers, makes sense of your plans and bills, and goes
              to work on your behalf.
            </p>
            <div className="lp-hero__cta lp-anim lp-anim--4">
              <Link href="/signup" className="lp-btn lp-btn--grad lp-btn--lg">Get started for free</Link>
              <Link href="/login" className="lp-btn lp-btn--ghost lp-btn--lg">Log in</Link>
            </div>
          </div>
        </div>
      </header>

      {/* PREVIEW CARD */}
      <section className="lp-section lp-section--snug" style={{ paddingTop: 24 }}>
        <div className="lp-container">
          <article className="lp-preview lp-anim lp-anim--5">
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
          <div className="lp-sect-head lp-reveal">
            <div className="lp-eyebrow">How Béni works</div>
            <h2 className="lp-sect-title">
              Most apps stop at a dashboard. Béni does <span className="lp-grad">more</span>.
            </h2>
          </div>

          <div className="lp-layers">
            <article className="lp-layer lp-layer--data lp-reveal">
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
                  Your medical, dental, and FSA accounts in one readable place.
                </p>
              </div>
            </article>

            <article className="lp-layer lp-layer--analytics lp-reveal">
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
                  Unused benefits, billing errors, coverage gaps — surfaced before they cost you.
                </p>
              </div>
            </article>

            <article className="lp-layer lp-layer--agentic lp-reveal">
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
                  Agents that negotiate bills, file FSA expenses, and chase prior auths for you.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* HOOK */}
      <section className="lp-hook lp-reveal">
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
          <Link href="/" aria-label="Béni home" className="lp-logo">
            <Image src="/assets/beni-logo-wordmark-dark.svg" alt="Béni" width={66} height={22} />
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
