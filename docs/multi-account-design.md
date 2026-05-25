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

---

## Other pages — multi-payer specs

### Plan page

**Purpose**
Detailed view of each plan's terms — deductible, OOP max, covered benefits,
plan documents. Where users go when they need to know "is this covered?" or
"how much before my deductible is met?"

**Sections (top to bottom)**

1. **Page header** — "Plan details" + plan year context
2. **Plan selector** — when 2+ plans connected, tab strip at top: `Medicare · Cigna · Delta Dental` (one tab per connected plan). When only 1 plan, no selector.
3. **Coverage status pill** — `Coverage active · through Dec 31, 2026` (from CoverageEligibilityResponse)
4. **Deductible & OOP progress** — two-column progress bars for the **selected plan only** (never aggregated)
5. **Covered benefits table** — copay/coinsurance per service for the **selected plan only**. Sections: Medical, Dental, Vision, FSA (when populated)
6. **Plan documents** — links to SBC, plan summary (future)

**Multi-payer behavior**
- Tab selector at top. Default tab = first medical plan.
- Switching tabs swaps everything below to that plan's data.
- URL state: `/plan?payer=cms` so deep links work.

**Empty states**
- No plans connected → "Connect an insurer to see your plan details" + button to onboarding

**Key interactions**
- Click deductible progress → opens drawer with contributing claims (for that plan only)
- Click any benefit row → optional explanation link to /terms
- "Reconnect" link if token is expired

**Real data sample**
```
Plan selector: [Medicare] [Cigna PPO Plus]   ← Medicare selected
Coverage status: Active through Dec 31, 2026 (green pill)

Deductible              Out-of-pocket max
$0 of $0 (met)          $847 of $6,700 (12%)

Covered benefits — Medicare
  Primary care visit       $0
  Specialist visit         20% coinsurance
  Hospital inpatient       After Part A deductible
  Lab work                 $0 most preventive
```

---

### Health page

**Purpose**
Show the user's clinical health records — conditions, medications, lab
results, immunizations — drawn from their insurer's records. Privacy-forward
("we never store this") because clinical data is the most sensitive category.

**Sections (top to bottom)**

1. **Page header** — "Health records" + "Pulled directly from your insurers. Béni never stores this data."
2. **Conditions** — chronic + acute conditions from FHIR Condition resources
3. **Medications** — current and past prescriptions from MedicationRequest
4. **Lab results** — recent observations (filtered to category=laboratory)
5. **Immunizations** — vaccines from FHIR Immunization

**Multi-payer behavior**
- Data MERGED across all connected payers (clinical data is patient-specific, not plan-specific)
- Deduplicate by clinical code (same condition reported by two payers = one row)
- Each row shows a small payer badge indicating source (when multiple payers report it)
- If conflicting (one payer says "active", another says "resolved"), prefer most recent

**Empty states**
- No insurer connected → "Connect an insurer to see your health records" + CTA
- Connected but no data in category → "No conditions reported by your insurer via this connection" per-section message

**Key interactions**
- Click condition → drawer with detail (onset date, status, severity)
- Click medication → drawer with dosage, prescriber, dates
- Click lab result → drawer with value, range, interpretation

**Real data sample**
```
Conditions
  Type 2 diabetes mellitus              Active · Onset 2022-03
  Hypertension                          Active · Onset 2018-09
  Strep throat                          Resolved · 2024-11

Medications
  Metformin 500mg                       Active · Prescribed 2022-03
  Lisinopril 10mg                       Active · Prescribed 2018-09

Lab results
  HbA1c                                 6.8%   · Aug 12, 2026
  LDL Cholesterol                       125 mg/dL · Aug 12, 2026

Immunizations
  Influenza vaccine                     Oct 2025
  COVID-19 booster                      Sep 2024
```

---

### Activity page (new — doesn't exist yet)

**Purpose**
Full chronological claims feed — all claims across all payers, filterable
and searchable. The dashboard shows the latest 6; this page shows everything.

**Sections (top to bottom)**

1. **Page header** — "Activity" + total claim count
2. **Filters bar** — payer filter, claim type filter (medical/dental/vision/pharmacy), date range
3. **Spending totals** — for the current filter: insurance paid + out of pocket + claims count
4. **Claims list** — chronological, payer-tagged, click to expand

**Multi-payer behavior**
- Claims from all payers merged, sorted by service date desc
- Each row tagged with payer name (small chip)
- Filter chips at top: `All · Medicare · Cigna · Delta Dental`
- Filtering updates spending totals at top

**Empty states**
- No insurer connected → "Connect an insurer to see your activity"
- Filtered to a payer with no matching claims → "No claims matching this filter"

**Key interactions**
- Click any claim → opens ClaimDetailDrawer (existing component)
- Click filter chip → scopes feed + totals
- "Export" button (future, post-MVP) → CSV download

**Real data sample**
```
Filters: [All payers ▾] [All types ▾] [2026 ▾]

Spending so far in 2026
$8,420 insurance paid · $1,247 out of pocket · 14 claims

🏥 Hospital / Facility                          Medicare
   Baptist Health · Aug 31, 2026
   Insurance paid: $1,375  ·  Out of pocket: $0

👨‍⚕️ Doctor visit                                 Cigna
   Dr. Sarah Chen · Aug 24, 2026
   Insurance paid: $0  ·  Out of pocket: $135

💊 Prescription                                  Medicare
   Walgreens · Aug 18, 2026
   Insurance paid: $42  ·  Out of pocket: $8
```

---

### Settings page

**Purpose**
Account management hub — see/manage connected insurers, theme, account
deletion, privacy policy access.

**Sections (top to bottom)**

1. **Account** — name, email, member since
2. **Connected insurers** — one row per payer, with status badge + per-row Disconnect button + "+ Add another insurer" link
3. **Appearance** — theme toggle (light/dark)
4. **Legal** — privacy policy link
5. **Session** — sign out
6. **Danger zone** — delete account (links to confirmation page)

**Multi-payer behavior**
- Connected insurers section shows each as a separate row with its own Active badge and Disconnect button
- "Add another insurer" link routes to `/onboarding?add=true`
- When user has zero connections, replace list with "No insurers connected yet" + a "Connect insurer" button
- After disconnecting all, page stays on Settings (does NOT redirect to onboarding)

**Empty states**
- No insurer connected → "No insurers connected" empty state with Connect CTA

**Key interactions**
- Disconnect button → confirmation inline → API call → row disappears
- Add another → `/onboarding?add=true` (filters out already-connected payers)
- Reconnect link if token expired

**Real data sample**
```
Account
  Name             Sarthak Gupta
  Email            gsarthak@vt.edu
  Member since     May 2026

Connected insurers
  Medicare (CMS)               Active   [Disconnect]
  Cigna                        Active   [Disconnect]
  + Add another insurer

Appearance
  Theme            [light / dark toggle]

Legal
  Privacy Policy   View →

Session
  Sign out         [button]

Danger zone
  Delete account   [link to /settings/delete-account]
```

---

### Onboarding flow

**Purpose**
First-time setup connecting the user's primary insurer, then optionally
guiding them to add additional plans. Same picker is reused for the
"add another" path from Settings.

**Two modes:**

#### Mode A — First-time (no insurers connected)

**Sections**
1. **Sticky header** — Logo + "Step 1 of 2" progress indicator (was "Step 1 of 3" before)
2. **Title** — "Pick your insurer. We'll do the rest."
3. **Subtitle** — "We use read-only access to fetch your plan details and spending history."
4. **Insurer grid** — recommended insurers first, then less-common
5. **Trust footer** — "Béni never stores your health records"

**Flow:**
- Pick insurer → OAuth → callback writes token, marks profile.onboarding_complete = true
- After successful callback, land on **Step 2: "Add another?"** soft-prompt page (NEW)

**Step 2 — Soft prompt page (new)**
- Title: "Got it. Most people have more than one plan — want to connect another?"
- Common scenarios listed as helper text: "dental, vision, secondary insurance, spouse's plan"
- Two CTAs: `Add another` (back to insurer picker in add mode) | `Maybe later, take me to my dashboard`
- Either path leads to dashboard eventually

#### Mode B — Add another (existing user, `?add=true`)

**Sections**
1. **Sticky header** — Logo + "← Back to settings" link (no progress indicator)
2. **Title** — "Add another insurer."
3. **Subtitle** — "Connect any additional plans you have. Béni will show data from all of them together."
4. **Insurer grid** — same picker, but already-connected payers are hidden

**Flow:**
- Pick insurer → OAuth → callback writes token → redirects to dashboard
- TODO: ideally callback should redirect back to settings, but OAuth round-trip loses the `add=true` context (acceptable MVP gap)

**Empty states**
- Add mode with all payers connected → "You've connected all supported insurers" + back-to-settings link

**Multi-payer behavior**
- This whole flow IS the multi-payer onramp
- After connecting, user can come back to Settings to add more via Mode B

**Real data sample (Mode A Step 2 soft prompt)**
```
✓ Medicare connected

Got it. Most people have more than one plan — want to connect another?
Common: dental, vision, secondary insurance, spouse's plan, supplement plan

[Add another insurer]   [Take me to my dashboard]
```

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
