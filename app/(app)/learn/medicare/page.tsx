'use client'

import { useState, type ReactNode } from 'react'
import {
  SeniorScope,
  AccessBar,
  HelpSheet,
  Explain,
  Button,
  Card,
  Chip,
  Badge,
} from '@/components/ui'

type Path = 'og' | 'ma'
type PartKey = 'A' | 'B' | 'C' | 'D'

export default function MedicareLandscape() {
  const [path, setPath] = useState<Path>('og')
  const [openPart, setOpenPart] = useState<PartKey | null>('A')
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <SeniorScope>
      <AccessBar onHelp={() => setHelpOpen(true)} />

      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 24px 80px' }}>
          {/* HERO */}
          <header style={{ marginBottom: 40 }}>
            <p className="t-overline" style={{ color: 'var(--beni-sky)', marginBottom: 8 }}>
              The 5-minute tour
            </p>
            <h1 className="t-display-m" style={{ margin: 0, marginBottom: 16 }}>
              The Medicare landscape
            </h1>
            <p className="t-body" style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 680, color: 'var(--fg-2)' }}>
              Medicare is the federal health insurance program for Americans 65 and older
              (plus some younger people with disabilities or ESRD). It covers <strong>~67 million people</strong>{' '}
              and is split roughly evenly between two structurally different paths.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Stat label="Total enrollees" value="~67M" />
              <Stat label="Original Medicare" value="~32M" />
              <Stat label="Medicare Advantage" value="~33M" />
              <Stat label="Annual federal cost" value="~$1T" />
            </div>
          </header>

          {/* SECTION 1: THE BIG CHOICE */}
          <Section
            number="1"
            title="The big choice — Original vs Medicare Advantage"
            sub="Every Medicare beneficiary picks one of two paths. They look superficially similar but behave very differently."
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <PathTab active={path === 'og'} onClick={() => setPath('og')}>
                Original Medicare
              </PathTab>
              <PathTab active={path === 'ma'} onClick={() => setPath('ma')}>
                Medicare Advantage
              </PathTab>
            </div>

            {path === 'og' && (
              <Card>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Chip tone="navy">Federal program</Chip>
                  <Chip tone="sky">No network</Chip>
                </div>
                <h3 className="t-h3" style={{ margin: 0, marginBottom: 8 }}>
                  Original Medicare = the government runs your insurance
                </h3>
                <p className="t-body" style={{ margin: 0, marginBottom: 12, color: 'var(--fg-2)' }}>
                  CMS pays doctors and hospitals directly using a fixed fee schedule. You can see any provider in
                  the country that accepts Medicare (most do). No referrals, no prior auth for most services, no
                  network restrictions if you travel.
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
                  <li>Covers <Explain term="Part A">Hospital insurance — inpatient stays, skilled nursing, hospice. Free if you or your spouse paid Medicare taxes for 40+ quarters.</Explain> + <Explain term="Part B">Medical insurance — doctor visits, outpatient care, durable medical equipment. ~$185/mo premium in 2025, income-adjusted upward (IRMAA).</Explain></li>
                  <li><strong>No out-of-pocket maximum</strong> — you owe 20% coinsurance forever unless you add Medigap</li>
                  <li>No drug coverage built in — buy a separate Part D plan (~$40/mo average)</li>
                  <li>Usually paired with <Explain term="Medigap">Medicare Supplement Insurance — private plans labeled A through N that fill in OG&apos;s cost-sharing gaps. Plans G and N are most popular post-2020.</Explain> to cap exposure</li>
                </ul>
              </Card>
            )}

            {path === 'ma' && (
              <Card>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Chip tone="sky">Private insurer</Chip>
                  <Chip tone="vision">Network + PA</Chip>
                </div>
                <h3 className="t-h3" style={{ margin: 0, marginBottom: 8 }}>
                  Medicare Advantage = a private insurer runs your Medicare
                </h3>
                <p className="t-body" style={{ margin: 0, marginBottom: 12, color: 'var(--fg-2)' }}>
                  CMS pays a private insurer (UHC, Humana, Aetna, Kaiser, BCBS plans) a flat per-member-per-month
                  amount. The insurer takes on your care under CMS rules, but with their own networks, prior auth,
                  and benefit add-ons.
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
                  <li>Replaces Original Medicare A + B (and usually bundles D)</li>
                  <li>Has an <Explain term="OOP max">Out-of-pocket maximum — Medicare Advantage caps annual in-network spending at $9,350 max in 2025 ($14,000 combined in/out-of-network for PPOs). Original Medicare has no cap.</Explain> built in</li>
                  <li>Often $0 premium + extra benefits (dental, vision, hearing, OTC, gym, fitness)</li>
                  <li>You&apos;re locked to the plan&apos;s network — referrals + prior auth for many services</li>
                  <li>Big audit surface: <Explain term="OIG finding">A 2022 OIG study found ~13% of MA prior-auth denials would have been covered under Original Medicare rules — these are appealable on that basis alone.</Explain> denial issues</li>
                </ul>
              </Card>
            )}
          </Section>

          {/* SECTION 2: THE FOUR PARTS */}
          <Section
            number="2"
            title="The four parts — A, B, C, D"
            sub="The alphabet is confusing because Parts A, B, D are coverage types, and Part C is the wrapper that bundles them privately."
          >
            <PartCard
              k="A"
              label="Hospital insurance"
              isOpen={openPart === 'A'}
              onToggle={() => setOpenPart(openPart === 'A' ? null : 'A')}
              summary="Inpatient hospital, skilled nursing, hospice. Free for most."
            >
              <Detail label="Premium" value="$0 if 40+ quarters of Medicare taxes paid; up to $518/mo otherwise" />
              <Detail label="Deductible" value="$1,676 per benefit period (2025)" />
              <Detail label="Coinsurance" value="$0 days 1-60; $419/day days 61-90; $838/day days 91-150" />
              <Detail label="Who pays" value="Funded by the Medicare HI Trust Fund via FICA payroll tax" />
            </PartCard>

            <PartCard
              k="B"
              label="Medical insurance"
              isOpen={openPart === 'B'}
              onToggle={() => setOpenPart(openPart === 'B' ? null : 'B')}
              summary="Doctor visits, outpatient care, lab + imaging, durable medical equipment."
            >
              <Detail label="Premium" value="$185/mo (2025 standard); higher via IRMAA for incomes >$106K single / >$212K joint" />
              <Detail label="Deductible" value="$257/year (2025)" />
              <Detail label="Coinsurance" value="20% of Medicare-approved amount after deductible; no OOP cap" />
              <Detail label="Late penalty" value="+10% to premium per full year delayed, lifetime — adds up fast" />
            </PartCard>

            <PartCard
              k="C"
              label="Medicare Advantage"
              isOpen={openPart === 'C'}
              onToggle={() => setOpenPart(openPart === 'C' ? null : 'C')}
              summary="Private alternative that replaces A + B (and usually bundles D)."
            >
              <Detail label="Premium" value="Varies; ~$17/mo average; many plans $0 above the Part B premium" />
              <Detail label="Deductible" value="Plan-specific; often $0 for medical, separate Rx deductible" />
              <Detail label="OOP max" value="$9,350 in-network max (2025); $14,000 combined for PPOs" />
              <Detail label="Networks" value="HMO (closed), PPO (in/out tiers), PFFS, SNP (Special Needs Plans)" />
              <Detail label="Top 4 carriers" value="UHC ~28%, Humana ~18%, BCBS plans ~13%, Aetna/CVS ~10%" />
            </PartCard>

            <PartCard
              k="D"
              label="Prescription drug coverage"
              isOpen={openPart === 'D'}
              onToggle={() => setOpenPart(openPart === 'D' ? null : 'D')}
              summary="Either bundled in MA or bought as a standalone PDP. Formulary-based."
            >
              <Detail label="Premium" value="Standalone PDP avg ~$40/mo (2025); often $0 bundled in MA" />
              <Detail label="OOP cap" value="$2,000/year (NEW 2025) — IRA capped Part D OOP, donut hole eliminated" />
              <Detail label="Late penalty" value="+1% of national base premium per month delayed, lifetime" />
              <Detail label="Formulary" value="Plan-specific drug list; tiers determine your copay; subject to change annually" />
              <Detail label="Extra Help" value="Income-based subsidy (LIS) — full subsidy <150% FPL eliminates almost all Part D costs" />
            </PartCard>
          </Section>

          {/* SECTION 3: ENROLLMENT TIMING */}
          <Section
            number="3"
            title="Enrollment timing — when you can sign up"
            sub="Miss the right window and you pay lifetime penalties or get locked out for months."
          >
            <Card>
              <Timing
                label="IEP"
                name="Initial Enrollment Period"
                window="7 months around your 65th birthday — the 3 months before, the month of, and the 3 months after"
                what="First chance to enroll. Coverage starts the month after enrollment (or month of birthday if early)."
              />
              <Timing
                label="GEP"
                name="General Enrollment Period"
                window="Jan 1 – Mar 31 each year"
                what="For people who missed IEP. Coverage starts the month after enrollment. Late penalties apply."
              />
              <Timing
                label="AEP"
                name="Annual Enrollment Period"
                window="Oct 15 – Dec 7 each year"
                what="Switch between Original ↔ MA, change Part D, change MA plans. Effective Jan 1."
              />
              <Timing
                label="MA OEP"
                name="MA Open Enrollment Period"
                window="Jan 1 – Mar 31 each year"
                what="MA enrollees can switch to a different MA plan OR drop back to Original Medicare. One change."
              />
              <Timing
                label="SEP"
                name="Special Enrollment Period"
                window="Triggered by qualifying events"
                what="Moving, losing employer coverage, qualifying for Extra Help, dual-eligibility, plan terminated. Window varies."
                last
              />
            </Card>
          </Section>

          {/* SECTION 4: COSTS */}
          <Section
            number="4"
            title="Costs at a glance (2025)"
            sub="What people pay across the two paths. Numbers are typical / median where ranges apply."
          >
            <Card>
              <CostRow label="Part A premium" og="$0 (most)" ma="$0 (most)" />
              <CostRow label="Part B premium" og="$185/mo + IRMAA" ma="$185/mo + IRMAA (you still pay this)" />
              <CostRow label="Plan premium on top" og="Medigap ~$100-300/mo" ma="$0-50/mo typical" />
              <CostRow label="Part D premium" og="~$40/mo standalone" ma="Usually $0 (bundled)" />
              <CostRow label="Annual deductible" og="$257 (Part B) + Medigap covers" ma="$0-500 typical, plan-specific" />
              <CostRow label="OOP max (medical)" og="None without Medigap" ma="$9,350 in-network (2025)" />
              <CostRow label="OOP max (Part D)" og="$2,000 (NEW 2025)" ma="$2,000 (NEW 2025)" />
              <CostRow label="Network restrictions" og="None" ma="HMO/PPO networks" last />
            </Card>
          </Section>

          {/* SECTION 5: BIG PAYERS */}
          <Section
            number="5"
            title="Who's running Medicare Advantage"
            sub="The MA market is dominated by 5 carriers controlling ~75% of enrollment."
          >
            <Card>
              <Carrier name="UnitedHealthcare" share={28} note="Largest. Strong Optum/UHG vertical integration." />
              <Carrier name="Humana" share={18} note="Pure-play Medicare focus, no commercial." />
              <Carrier name="BCBS plans (collectively)" share={13} note="33 independent state Blues, varying quality." />
              <Carrier name="Aetna / CVS Health" share={10} note="Bundled with CVS pharmacy + MinuteClinic." />
              <Carrier name="Kaiser Permanente" share={7} note="Integrated payer-provider; West Coast + select markets." last />
            </Card>
          </Section>

          {/* SECTION 6: WHAT'S CHANGING */}
          <Section
            number="6"
            title="What's changing in 2025-2027"
            sub="The Medicare landscape is in active motion. Three things to know."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge tone="positive">2025 — already in effect</Badge>
                </div>
                <h3 className="t-h3" style={{ margin: 0, marginBottom: 4 }}>$2,000 Part D OOP cap</h3>
                <p className="t-body" style={{ margin: 0, color: 'var(--fg-2)' }}>
                  The IRA capped annual Part D out-of-pocket at $2,000. The donut hole (coverage gap) is
                  eliminated. Plus a smoothing mechanism lets people pay over the year.
                </p>
              </Card>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge tone="positive">2025 — already in effect</Badge>
                </div>
                <h3 className="t-h3" style={{ margin: 0, marginBottom: 4 }}>Medicare drug price negotiation</h3>
                <p className="t-body" style={{ margin: 0, color: 'var(--fg-2)' }}>
                  CMS negotiated prices on 10 drugs effective 2026, with more coming. First time Medicare has
                  directly negotiated drug prices.
                </p>
              </Card>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge tone="warning">Jan 1, 2027</Badge>
                </div>
                <h3 className="t-h3" style={{ margin: 0, marginBottom: 4 }}>CMS-0057-F API wave</h3>
                <p className="t-body" style={{ margin: 0, color: 'var(--fg-2)' }}>
                  New FHIR APIs for Prior Auth, Provider Access, and Payer-to-Payer data transfer. Cigna has
                  publicly committed to including US Commercial members on Patient Access from this date.
                </p>
              </Card>
            </div>
          </Section>

          <footer style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--beni-line)' }}>
            <p className="t-body-s" style={{ color: 'var(--fg-3)' }}>
              Numbers from CMS, KFF, OIG and Medicare.gov, 2025 plan year. Click any "?" to expand jargon.
              Use the Text Size buttons up top to scale this whole page.
            </p>
          </footer>
        </div>

        <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </SeniorScope>
  )
}

// ── Small composition helpers (defined here so the page reads top-to-bottom) ──

function Section({
  number, title, sub, children,
}: { number: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <span
          className="t-numeric-l"
          style={{
            color: 'var(--beni-sky)',
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 800,
          }}
        >
          {number}
        </span>
        <h2 className="t-h2" style={{ margin: 0 }}>{title}</h2>
      </div>
      {sub && (
        <p className="t-body" style={{ color: 'var(--fg-2)', marginTop: 0, marginBottom: 16, maxWidth: 720 }}>
          {sub}
        </p>
      )}
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--beni-line)',
        borderRadius: 12,
        padding: '10px 16px',
        minWidth: 160,
      }}
    >
      <div className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 4 }}>{label}</div>
      <div className="t-numeric-l" style={{ fontSize: 24 }}>{value}</div>
    </div>
  )
}

function PathTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 20px',
        borderRadius: 12,
        border: active ? '2px solid var(--beni-navy)' : '1px solid var(--beni-line-strong)',
        background: active ? 'var(--beni-navy-12)' : 'var(--bg-surface)',
        color: active ? 'var(--beni-navy)' : 'var(--fg-2)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function PartCard({
  k, label, summary, isOpen, onToggle, children,
}: { k: PartKey; label: string; summary: string; isOpen: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--beni-line)',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 0,
          padding: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 999,
            background: 'var(--beni-navy)',
            color: '#FFE9CF',
            fontWeight: 800,
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {k}
        </span>
        <div style={{ flex: 1 }}>
          <div className="t-h3" style={{ margin: 0 }}>Part {k} — {label}</div>
          <div className="t-body-s" style={{ color: 'var(--fg-3)', marginTop: 2 }}>{summary}</div>
        </div>
        <span style={{ fontSize: 18, color: 'var(--fg-3)' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 20px 20px 80px', borderTop: '1px solid var(--beni-line)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px dashed var(--beni-line)' }}>
      <div style={{ minWidth: 140, fontWeight: 700, color: 'var(--fg-1)', fontSize: 14 }}>{label}</div>
      <div style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

function Timing({
  label, name, window: when, what, last,
}: { label: string; name: string; window: string; what: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '14px 0',
        borderBottom: last ? '0' : '1px dashed var(--beni-line)',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ minWidth: 80 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: 'var(--beni-sky-12)',
            color: 'var(--beni-sky)',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 2 }}>{when}</div>
        <div style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 4 }}>{what}</div>
      </div>
    </div>
  )
}

function CostRow({ label, og, ma, last }: { label: string; og: string; ma: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        padding: '12px 0',
        borderBottom: last ? '0' : '1px dashed var(--beni-line)',
        fontSize: 14,
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--fg-1)' }}>{label}</div>
      <div style={{ color: 'var(--fg-2)' }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--beni-sky)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Original</span>{og}</div>
      <div style={{ color: 'var(--fg-2)' }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--beni-sky)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>MA</span>{ma}</div>
    </div>
  )
}

function Carrier({ name, share, note, last }: { name: string; share: number; note: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 0',
        borderBottom: last ? '0' : '1px dashed var(--beni-line)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: 'var(--fg-1)', fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>{note}</div>
      </div>
      <div style={{ minWidth: 180, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 8,
            background: 'var(--beni-line)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${share * 2}%`,
              height: '100%',
              background: 'var(--beni-sky)',
              borderRadius: 999,
            }}
          />
        </div>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--fg-1)', minWidth: 36, textAlign: 'right' }}>
          {share}%
        </div>
      </div>
    </div>
  )
}
