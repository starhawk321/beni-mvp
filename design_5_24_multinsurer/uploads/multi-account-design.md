# Multi-Account Design — Decisions

Last updated: 2026-05-23

Captures the design path for handling multiple healthcare payers and spending
accounts (HSA/FSA) for a single user. Does not address household / multi-member
support (deferred).

## Scope

- **One person, multiple accounts.** Multi-member support is deferred.
- A single user may have multiple insurance payer connections AND multiple
  spending accounts (HSA/FSA) at the same time.

## Audience breakdown

Rough split of US insured adults (~308M) by account complexity:

| Bucket | Share | Pattern |
|---|---|---|
| Single plan, single carrier | ~30–40% | Young employed, Medicaid, simple Medicare Advantage |
| Medical + separate dental/vision | ~50–60% | Standard employer-sponsored — different carrier per benefit |
| Primary + secondary medical (real COB) | ~10–15% | Working seniors, spousal dual coverage |
| Medicare + Medigap supplement | ~4% | ~14M traditional Medicare beneficiaries |
| Standalone Part D pharmacy | ~3% | ~10M traditional Medicare beneficiaries |

**Implication:** Medical + dental + vision separation is the dominant
multi-payer pattern. Coordination of benefits (primary/secondary) matters but
affects a smaller slice and is more complex.

## Decision: payer aggregation strategy

- Multiple payers are treated as **independent buckets** for MVP.
- Spending is summed naively across them. This is correct for the dominant
  pattern (different benefit types — medical vs dental vs vision).
- For the ~10–15% with real coordination of benefits (same claim, two EOBs),
  this will slightly inflate aggregate totals.
- Acceptable for MVP. Post-MVP, add a coordination-of-benefits flag per
  connection and dedupe when both are flagged related.

## Decision: HSA/FSA are a separate concern

HSA and FSA are **not payers** — they are financial accounts. Different data
model, different APIs, different code path.

| | HSA | FSA |
|---|---|---|
| Type | Savings account (rolls over) | Spending account (use-it-or-lose-it) |
| Custodian | HealthEquity, Fidelity, Lively, Optum Bank | WageWorks, HealthEquity, Navia |
| Data | Transactions, investments, tax docs | Election, deductions, deadline |
| API | Plaid covers ~30%; direct custodian APIs rare | Almost no APIs |

**Audience reach:** ~67M Americans (~22% of insured adults) have at least one.

### Why they're high-leverage product territory

- FSA deadline urgency ("$842 expires Dec 31") creates clear UX moments
- HSA underuse — recommend using HSA for eligible expenses
- Cross-account intelligence — "this EOB shows $200 patient responsibility,
  use your FSA"

## Dashboard architecture

Single-column layout, no sidebar. Five sections from top to bottom.

```
┌─ HERO ──────────────────────────────────┐
│  Hello, {name}.                         │
│  Insurance paid · Out of pocket · Claims│
│  $8,420         · $1,247        · 14    │
└─────────────────────────────────────────┘

┌─ FOR YOU ───────────────────────────────┐
│ Actionable items — FSA deadline,        │
│ unused preventive benefits, etc.        │
│ Hidden when no items.                   │
└─────────────────────────────────────────┘

┌─ YOUR PLANS ────────────────────────────┐
│ One card per connected payer            │
│ Ordered: medical → dental → vision      │
│ Each card: plan name, ins paid, OOP,    │
│ claims count, deductible, OOP max       │
└─────────────────────────────────────────┘

┌─ SPENDING POWER (future) ───────────────┐
│ HSA · FSA balances                      │
└─────────────────────────────────────────┘

┌─ RECENT ACTIVITY ───────────────────────┐
│ Same-line format per claim:             │
│ Provider · Payer name                   │
│ Date                                    │
│ Ins. paid: $X  ·  OOP: $Y               │
└─────────────────────────────────────────┘
```

### Hero design decisions

- Three stats: **insurance paid**, **out of pocket**, **claims count**
- All three are aggregated across all connected payers (safe to sum)
- **No aggregated deductible or OOP max in hero** — that's mathematically wrong
  for separate plans (deductibles don't combine across plans)
- **No "you saved $X by having insurance"** — billed-vs-allowed gap is phantom
  money. Surfacing it as a hero stat is the dishonest move big carriers make;
  Béni's brand depends on being the honest one. Show the gap in claim detail
  drawers with context instead.

### Plan cards design decisions

- **One card per payer connection**, NOT grouped by benefit type
- Reason: plan details (deductible, OOP max, plan type) are inherent to a
  specific plan and cannot be sensibly aggregated across payers
- Visual order: medical first, then dental, then vision
- Each card shows: plan name, insurance paid (this payer), out of pocket
  (this payer), claims count (this payer), deductible status, OOP max status
- Empty state: when zero plans connected, "Connect insurer" CTA fills this
  section. "For you" section is hidden until something is connected.

### Recent activity design decisions

- Same-line per claim row showing: provider, payer name, date, insurance paid,
  out of pocket
- Each claim is tagged with the payer it came from (visible in the UI)
- Sort: most recent first
- Claims from different payers merged into one feed

### Spending power (HSA/FSA)

- Distinct section between Your Plans and Recent Activity
- One row per account — HSA balance, FSA balance with expiration urgency
- Different code path from insurance (Plaid or manual entry)
- **Do NOT mix HSA/FSA balances into insurance OOP totals**
- Built in Q3 2026 — placeholder section until then

## Phased roadmap

### Now (MVP)
- Insurance: multi-payer via direct FHIR per supported insurer
  (CMS ✓, Cigna ✓, BCBS in progress, Anthem/UHC/Aetna blocked on LLC)
- HSA/FSA: **manual entry only** — user types in balance, deadline, election
- Single mental model: independent buckets, no COB dedup

### Phase 2 (Q3 2026 — Financial Layer milestone)
- Plaid integration for HSA accounts that support it (~30% of custodians)
- FSA reimbursement tracking
- Cross-account recommendations ("use FSA for this expense")

### Phase 3 (Post-Q3)
- Coordination of benefits dedup logic (the 10–15% audience)
- Receipt OCR for FSA eligible expense tracking
- Direct custodian integrations as APIs become available

### Phase 4 (later)
- Multi-member household support (out of scope for now)

## References

- `lib/fhir/multi-payer.ts` — current aggregation implementation
- `docs/bcbs-payer-apis.md` — state-by-state BCBS API status
- GitHub milestone: Financial Layer — Q3 2026 (HSA/FSA work)
- GitHub issue #68 — FSA/HSA manual entry flow
