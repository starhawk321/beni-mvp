import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAllPayersData } from '@/lib/fhir/multi-payer'
import { aggregateInboxItems, type InboxEOB } from '@/lib/inbox'
import { SeniorScope, Card, Chip, Badge, Button } from '@/components/ui'

const CLAIM_LABEL: Record<string, string> = {
  institutional: 'Hospital / facility',
  professional:  'Office visit',
  pharmacy:      'Prescription',
  oral:          'Dental',
  vision:        'Vision',
}

const PAYER_CHIP_TONE: Record<InboxEOB['payer'], 'navy' | 'sky' | 'fsa' | 'hsa'> = {
  cms:   'navy',
  aetna: 'fsa',
  cigna: 'sky',
  bcbs:  'hsa',
}

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('connection_skipped')
    .eq('id', user.id)
    .single()

  const skipped = profile?.connection_skipped === true
  const payerData = skipped ? [] : await fetchAllPayersData(supabase, user.id)
  const items = aggregateInboxItems(payerData)
  const flaggedCount = items.filter(i => i.denial.hasDenial).length

  return (
    <SeniorScope>
      <div style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 80px' }}>
          <Header itemCount={items.length} flaggedCount={flaggedCount} />

          {items.length === 0 ? (
            <EmptyState skipped={skipped} hasConnections={payerData.length > 0} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
              {items.map(item => <InboxCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </SeniorScope>
  )
}

// ── Page sections ────────────────────────────────────────────────────────────

function Header({ itemCount, flaggedCount }: { itemCount: number; flaggedCount: number }) {
  return (
    <header>
      <p className="t-overline" style={{ color: 'var(--beni-sky)', marginBottom: 8 }}>
        Inbox
      </p>
      <h1 className="t-display-m" style={{ margin: 0, marginBottom: 8 }}>
        Every EOB, in one place
      </h1>
      <p className="t-body" style={{ color: 'var(--fg-2)', margin: 0 }}>
        {itemCount === 0
          ? 'Your EOBs and bills will land here as your insurer processes claims.'
          : (
            <>
              <strong>{itemCount}</strong> {itemCount === 1 ? 'item' : 'items'}
              {flaggedCount > 0 && (
                <> · <strong style={{ color: 'var(--status-warning)' }}>{flaggedCount} possible {flaggedCount === 1 ? 'issue' : 'issues'}</strong></>
              )}
            </>
          )}
      </p>
    </header>
  )
}

function EmptyState({ skipped, hasConnections }: { skipped: boolean; hasConnections: boolean }) {
  if (skipped || !hasConnections) {
    return (
      <Card style={{ marginTop: 32, textAlign: 'center', padding: 40 }}>
        <h3 className="t-h2" style={{ margin: 0, marginBottom: 8 }}>No insurer connected yet</h3>
        <p className="t-body" style={{ color: 'var(--fg-2)', maxWidth: 460, margin: '0 auto 24px' }}>
          Connect Medicare, Aetna, Cigna, or Blue Cross to start seeing your EOBs and claims here.
          We fetch them live and never store them.
        </p>
        <Link href="/onboarding" style={{ textDecoration: 'none' }}>
          <Button>Connect an insurer</Button>
        </Link>
      </Card>
    )
  }

  // Connected but no EOBs returned
  return (
    <Card style={{ marginTop: 32, textAlign: 'center', padding: 40 }}>
      <h3 className="t-h2" style={{ margin: 0, marginBottom: 8 }}>Inbox is empty for now</h3>
      <p className="t-body" style={{ color: 'var(--fg-2)', maxWidth: 460, margin: '0 auto' }}>
        Your insurer hasn&apos;t processed any claims yet, or your account is new.
        New EOBs will appear here automatically as they land.
      </p>
    </Card>
  )
}

// ── Inbox card ────────────────────────────────────────────────────────────────

function InboxCard({ item }: { item: InboxEOB }) {
  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <Chip tone={PAYER_CHIP_TONE[item.payer]}>{item.payerName}</Chip>
        <span style={{ fontSize: 13, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>
          {formatDate(item.serviceDate)}
        </span>
      </div>

      <h3 className="t-h3" style={{ margin: 0, marginBottom: 2 }}>{item.provider}</h3>
      <p className="t-body-s" style={{ margin: 0, color: 'var(--fg-3)', marginBottom: 16 }}>
        {CLAIM_LABEL[item.claimType] ?? 'Claim'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          padding: '12px 0',
          borderTop: '1px solid var(--beni-line)',
          borderBottom: item.denial.hasDenial ? '1px solid var(--beni-line)' : '0',
        }}
      >
        <Amount label="Charged" value={item.amounts.charged} />
        <Amount label="Insurer paid" value={item.amounts.paid} tone="positive" />
        <Amount label="You owe" value={item.amounts.patient} tone="bold" />
      </div>

      {item.denial.hasDenial && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge tone="warning">Possible issue</Badge>
          <span className="t-body-s" style={{ color: 'var(--fg-3)' }}>
            Insurer paid $0 against ${item.amounts.charged.toFixed(2)} charged — worth a closer look.
          </span>
        </div>
      )}
    </Card>
  )
}

function Amount({ label, value, tone }: { label: string; value: number; tone?: 'positive' | 'bold' }) {
  const color =
    tone === 'positive' ? 'var(--status-positive)'
    : tone === 'bold'   ? 'var(--fg-1)'
    : 'var(--fg-2)'
  const weight = tone === 'bold' ? 800 : 600
  return (
    <div>
      <div className="t-overline" style={{ color: 'var(--fg-3)', marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: weight,
          fontSize: 18,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ${value.toFixed(2)}
      </div>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
