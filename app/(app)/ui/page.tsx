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
  LabeledInput,
} from '@/components/ui'

export default function UISandbox() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <SeniorScope>
      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <h1 className="t-h1" style={{ marginBottom: 8 }}>Senior primitive sandbox</h1>
          <p className="t-body" style={{ marginBottom: 24 }}>
            Use the <strong>AccessBar</strong>'s Text Size +/- below to scale every primitive on this page.
            Each section shows one primitive from <code>components/ui/</code> in isolation.
          </p>

          <Section title="AccessBar — persistent accessibility chrome">
            <p className="t-body-s" style={{ marginBottom: 12, color: 'var(--fg-3)' }}>
              In production this lives at the top of every senior surface (via <code>SeniorPage</code>).
              The Text Size buttons here scale everything below.
            </p>
            <AccessBar onHelp={() => setHelpOpen(true)} />
          </Section>

          <Section title="HelpSheet — modal with a real phone CTA">
            <Button onClick={() => setHelpOpen(true)}>Open help sheet</Button>
          </Section>

          <Section title="Explain — inline jargon tooltip">
            <p className="t-body" style={{ maxWidth: 560 }}>
              Your{' '}
              <Explain term="deductible">
                The amount you pay out of pocket for covered services before your insurance starts paying.
              </Explain>{' '}
              for this year is <strong>$1,250</strong>. Click the "?" to see the explanation. ESC or click outside closes it.
            </p>
          </Section>

          <Section title="Button — variants × sizes">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button size="md">Primary md</Button>
              <Button size="lg">Primary lg</Button>
              <Button size="xl">Primary xl</Button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
              <Button variant="secondary" size="lg">Secondary</Button>
              <Button variant="ghost" size="lg">Ghost</Button>
              <Button size="lg" disabled>Disabled</Button>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
              <Button variant="primary" size="lg" full>Full-width primary</Button>
            </div>
          </Section>

          <Section title="Field + Input">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
              <LabeledInput
                label="Email"
                hint="We'll never share it"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
              <LabeledInput
                label="Member ID"
                error="That doesn't look right — should be 9 characters"
                name="memberId"
                defaultValue="ABC123"
              />
            </div>
          </Section>

          <Section title="Card — content container">
            <Card>
              <h3 className="t-h3" style={{ margin: 0, marginBottom: 8 }}>Inside a card</h3>
              <p className="t-body" style={{ margin: 0 }}>
                Cards use <code>--s</code>-scaled padding so they feel right at any text size.
              </p>
            </Card>
          </Section>

          <Section title="Chip — account type accents">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip tone="navy">Medical</Chip>
              <Chip tone="sky">Dental</Chip>
              <Chip tone="vision">Vision</Chip>
              <Chip tone="fsa">FSA</Chip>
              <Chip tone="hsa">HSA</Chip>
              <Chip tone="life">Life</Chip>
            </div>
          </Section>

          <Section title="Badge — status tones">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="positive">Paid</Badge>
              <Badge tone="warning">Pending</Badge>
              <Badge tone="critical">Denied</Badge>
              <Badge tone="info">In review</Badge>
            </div>
          </Section>

          <Section title="Composition — what a real card might look like">
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Chip tone="navy">Medical</Chip>
                <Badge tone="warning">Pending</Badge>
              </div>
              <h3 className="t-h3" style={{ margin: '0 0 4px' }}>Massachusetts General Hospital</h3>
              <p className="t-body-s" style={{ margin: 0, color: 'var(--fg-3)' }}>
                Visit on March 14 · Claim #3429-A
              </p>
              <p className="t-numeric-l" style={{ margin: '12px 0 4px' }}>$487.20</p>
              <p className="t-body" style={{ margin: 0, color: 'var(--fg-2)' }}>
                Your{' '}
                <Explain term="coinsurance">
                  Your share of the cost after the deductible is met — typically 20% for in-network services.
                </Explain>{' '}
                for this visit.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="primary" size="lg">Pay $487.20</Button>
                <Button variant="ghost" size="lg">View bill</Button>
              </div>
            </Card>
          </Section>
        </div>

        <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </SeniorScope>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ padding: '24px 0', borderTop: '1px solid var(--beni-line)' }}>
      <h2 className="t-h2" style={{ marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  )
}
