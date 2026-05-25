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

**Two modes — same picker, different framing:**

#### Mode A — First-time (no insurers connected)

**Picker page sections**
1. **Sticky header** — Logo only (no progress indicator — see "Progress indicator" note below)
2. **Title** — "Pick your insurer. We'll do the rest."
3. **Subtitle** — "We use read-only access to fetch your plan details and spending history."
4. **Insurer grid** — recommended insurers first, then less-common
5. **Co-equal demo CTA** (below grid, before footer):
   ```
   Or see a sample dashboard first →
   Explore Béni with example data before connecting.
   ```
   Clicking this sets `connection_skipped = true` and routes to the dashboard
   (with mock data + disclaimer bar). User can come back to OAuth anytime.
6. **Trust footer** — "Béni never stores your health records"

#### Mode B — Add another (existing user, from Settings)

**Picker page sections**
1. **Sticky header** — Logo + "← Back to settings" link (no progress indicator)
2. **Title** — "Add another insurer."
3. **Subtitle** — "Connect any additional plans you have. Béni will show data from all of them together."
4. **Insurer grid** — same picker, already-connected payers hidden

**Empty states**
- Add mode with all payers connected → "You've connected all supported insurers" + back-to-settings link

---

### Post-OAuth interstitial — `/onboarding/connected`

After EVERY successful OAuth callback (both first-time and add-another),
the user lands here. The callback never goes straight to dashboard or
settings — it always routes through this interstitial.

**Why interstitial:**
- Explicit "✓ Cigna connected" feedback (no silent success)
- Routes the "where next?" decision into one place, not the callback
- Naturally supports the Step 2 soft prompt loop
- Solves the OAuth-state-loss problem: callback only needs to know "first vs add"

**Page content varies by flow context:**

##### First-time flow (single iteration, just connected first plan)
```
You've connected
  ✓ Medicare

Most people also have:
  • Medicare supplement (Medigap)
  • Part D prescription plan
  • Spouse's employer plan

If any of these apply, connect them now to see
your full coverage in one place.

[Add another insurer]   [I'm all set — take me to my dashboard]
```

##### Subsequent iterations (2+ payers, either flow)
```
You've connected
  ✓ Medicare
  ✓ Cigna Medigap

Anything else? You can always add more later in Settings.

[Add another]   [I'm done — take me to my dashboard]
```

##### Add-another flow (came from Settings)
Same prompt as above, but "I'm done" CTA returns to `/settings` instead of dashboard.

##### Cap
After 3rd connection, skip the prompt entirely and auto-redirect:
- First-time flow → dashboard
- Add-another flow → settings

---

**Soft prompt rules:**
- "Most people also have" suggestions only list FHIR-capable plans we can
  actually connect right now. Do not list dental/vision while those are
  manual-entry-only — that promises something we can't deliver.
- Show the running list of what's already connected for context.
- The CTA wording matters: "I'm all set" / "I'm done" are more permissive
  than "Take me to my dashboard" — gives explicit permission to skip without
  feeling abandoned.

---

### Implementation: how the callback knows the flow

The OAuth `state` parameter is the carrier for app context through the
round-trip, but state itself is just a CSRF token. To preserve flow context:

**Schema change:** add a `flow_intent text` column to the per-payer
oauth_state tables (`cms_oauth_state`, `cigna_oauth_state`, `bcbs_oauth_state`).
Values: `'first'` (first-time onboarding) or `'add'` (from Settings).

**Authorize route:**
- Reads `?add=true` from URL → sets `flow_intent = 'add'`
- Otherwise `flow_intent = 'first'`
- Stores in oauth_state row alongside the CSRF token

**Callback route:**
- Validates CSRF state as today
- Reads `flow_intent` from oauth_state row
- Exchanges code for token, stores fhir_tokens, deletes oauth_state row
- Redirects to `/onboarding/connected?payer=<name>&flow=<intent>`

**Interstitial page (`/onboarding/connected`):**
- Reads `payer` and `flow` from query params
- Renders soft prompt with appropriate copy
- "Add another" CTA → `/onboarding?add=true` (always uses add mode now)
- "I'm done" CTA → `/dashboard` if `flow=first`, `/settings` if `flow=add`
- If user has 3+ connections, auto-redirects after 2s (no manual click needed)

---

### Connection failure handling — `/onboarding/connection-error`

Every callback error path routes through this page. No more silent failures
where the user lands on `/dashboard?error=...` with the param stripped by
middleware.

URL: `/onboarding/connection-error?reason=<code>&payer=<name>&flow=<first|add>`

**Reason codes and copy:**

`cancelled` — fires for both literal user cancellation AND wrong-credentials/
locked-account scenarios at the payer. We cannot distinguish these from the
OAuth spec; the payer returns `error=access_denied` in all three cases.
```
You stopped before finishing

That's OK — no progress lost. Connecting {Payer} takes
about 30 seconds when you're ready.

[Try again]   [Skip for now]
```

`token_exchange_failed` — payer rejected our credentials during code-for-token
exchange. Usually our config issue (wrong client secret, expired credentials).
```
Couldn't complete the connection

Something went wrong on our side completing the secure
handshake with {Payer}. This is usually temporary.

[Try again]   [Email support]
```

`missing_fields` — token came back without patient_id or access_token. Often
a sandbox or new-account issue at the payer.
```
{Payer} didn't return everything we need

Sometimes test or new accounts don't have a member ID
linked yet. Try a different account, or come back later.

[Try again]   [Skip for now]
```

`invalid_state` — CSRF state mismatch, typically stale cookies or replay.
```
Your session expired

Security check timed out. This usually fixes itself
on the next try.

[Try again]
```

`server_error` — generic catchall for our 500s or network timeouts.
```
Something didn't work

We hit an unexpected error connecting to {Payer}.
We've logged it and we're looking into it.

[Try again]   [Email support]
```

**Behavior rules:**
- "Try again" → `/onboarding?add=true` if `flow=add`, else `/onboarding`
- "Skip for now" → `/dashboard` if `flow=first`, else `/settings`
- Every error case logs a structured entry: `{ reason, payer, user_id, timestamp }`
  for trend monitoring (e.g., "CMS missing_fields spiking" = sandbox is broken)

**What we can't and shouldn't try to handle:**
- Wrong password / locked account — handled by the payer's own login page,
  we never see the failed credentials
- All three of "user cancelled", "wrong password", "account locked" come back
  to us as `error=access_denied` indistinguishably — we treat all as `cancelled`
- The gentle, non-blaming copy works for all three

**Stale oauth_state rows:**
- If user abandons OAuth mid-flow (closes tab), the oauth_state row sits orphaned
- The authorize route uses `upsert({ onConflict: 'user_id' })` so the next attempt
  overwrites the stale row — self-healing
- Periodic cleanup job to age out rows older than 1 hour is a post-MVP nice-to-have

**Future enhancement (post-MVP):**
- Track failed attempts per payer in localStorage or DB
- After 2+ `cancelled` events for the same payer, show a payer-specific
  helper link on the error page: "Trouble logging in to Medicare?
  [Reset your password at Medicare.gov →]"

---

### Skip path — "I don't have insurance to connect" / "See a sample first"

Today, users are trapped in onboarding if they can't or won't connect a payer.
This locks out the biggest segment: people whose insurer isn't yet supported
(Anthem, UHC, most BCBS, etc.). We need an escape hatch.

The escape hatch doubles as the **value-preview path** — letting curious or
hesitant users explore Béni with mock data before committing to OAuth.

**Two triggers, same destination:**

1. **Below the insurer picker** — co-equal CTA framed as exploration:
   ```
   Or see a sample dashboard first →
   Explore Béni with example data before connecting.
   ```

2. **Inside the picker grid** — fallback for "my insurer isn't here":
   ```
   Don't see your insurer? [Continue without connecting →]
   ```

Both set `connection_skipped = true` and route to the mock-data dashboard.

**Why a co-equal CTA instead of a small skip link:**
- Doesn't slow down committed users — picker is still the primary UI
- Dignified option for hesitant users (not framed as "giving up")
- Real demo > passive tour screens — the mock dashboard IS the product walkthrough
- Disclaimer bar does the conversion work once they're in the app
- Cleaner funnel analytics: explicit "demo" clicks reveal hesitant-user volume

---

### Decisions deferred to post-MVP

**Situation-based onboarding ("What's your coverage situation?" gate)**

Considered: asking the user to classify themselves upfront — Medicare only,
Medicare + supplement, employer + spouse, etc. — to tailor the picker and
"For You" items.

Deferred because:
- Adds friction before any value is delivered
- Most users don't know the terminology (Medigap, secondary, supplemental)
- The Step 2 soft prompt already collects this signal at the right moment
  (after they've seen value)
- Even after classification we'd show the same picker — the question doesn't
  change what we display

Revisit when:
- Signup-funnel data shows drop-off concentrated at the picker
- Waitlist functionality for unsupported payers becomes a feature
- Personalized "For You" recommendations need richer coverage signal

**What happens on skip:**
1. Set `profiles.connection_skipped = true`
2. Set `profiles.onboarding_complete = true` (so middleware lets them through)
3. Land on dashboard with mock data + disclaimer bar

When the user later connects a real insurer:
- `connection_skipped` flips back to `false`
- Mock data path is no longer used; real FHIR data is fetched

**Schema change:**
```sql
alter table profiles
  add column connection_skipped boolean default false;
```

---

### Mock data — for skip-path users

A single canned dataset, same for every skip-mode user. Designed to showcase
multi-payer value: 60-year-old with Medicare + Cigna Medigap, 10 mixed claims,
realistic chronic-condition health profile.

**File:** `lib/mock-data.ts` — exports `MOCK_PAYERS`, `MOCK_HEALTH_RECORDS`,
`MOCK_FOR_YOU_ITEMS` shaped exactly like the real parser output, so the rest
of the code path is unchanged. Pages check `profile.connection_skipped` and
swap data sources.

**Dataset summary:**

| Plan | Insurance paid YTD | OOP YTD | Claims | Deductible | OOP max |
|---|---|---|---|---|---|
| Medicare Part A+B | $5,840 | $480 | 6 | met | $480 / $6,700 |
| Cigna Medigap Plan G | $1,425 | $233 | 4 | $233 / $250 | met |
| **Aggregate (hero)** | **$7,265** | **$713** | **10** | — | — |

**Claims feed (10 items spanning 4 months):**
```
🏥 Memorial Hospital · Medicare · Sep 12 — paid $2,340, OOP $0 (outpatient surgery)
👨‍⚕️ Dr. Patel Cardiology · Medicare · Sep 5 — paid $385, OOP $0 (specialist)
💊 CVS Pharmacy · Medicare · Aug 28 — paid $32, OOP $8 (Atorvastatin refill)
👨‍⚕️ Dr. Sarah Chen · Cigna Medigap · Aug 24 — paid $0, OOP $135 (annual physical)
🔬 Quest Diagnostics · Cigna Medigap · Aug 18 — paid $95, OOP $42 (lab panel)
🏥 Baptist Health Imaging · Medicare · Aug 5 — paid $1,820, OOP $230 (MRI)
💊 Walgreens · Cigna Medigap · Jul 22 — paid $18, OOP $4 (Lisinopril)
👨‍⚕️ Dr. Patel Cardiology · Medicare · Jul 8 — paid $215, OOP $0 (follow-up)
🔬 LabCorp · Cigna Medigap · Jun 30 — paid $72, OOP $18 (cholesterol)
🏥 Memorial Hospital ER · Medicare · May 14 — paid $1,420, OOP $180 (ER visit)
```

**For You items:**
- "Your annual wellness visit is covered — schedule yours"
- "Cigna Medigap deductible: $17 from being met"
- "1 claim under review — Memorial Hospital, Sep 12"

**Health records:**
```
Conditions: Hypertension (2018), Type 2 diabetes (2020),
            Lumbar disc herniation (2024)
Medications: Metformin 500mg, Lisinopril 10mg, Atorvastatin 20mg
Lab results: HbA1c 6.8%, LDL 118, BP 128/82, HDL 52
Immunizations: Influenza (Oct 2025), COVID booster (Sep 2024),
               Pneumococcal (Aug 2023), Shingles (Jan 2022)
```

---

### Disclaimer bar — when showing mock data

Persistent, full-width, sticky at the top of every page when
`profile.connection_skipped = true`:

```
┌─────────────────────────────────────────────────────────────────┐
│ 👁 Sample data shown for illustration. Connect your insurance   │
│   to see your real coverage. [Connect now →]                    │
└─────────────────────────────────────────────────────────────────┘
```

**Rules:**
- Sticky at top of viewport, above the app's regular nav header
- Distinct background — warm yellow or soft pastel — so it's never missed
- **NOT dismissible.** Honesty over UX comfort. Users must connect to remove it.
- "Connect now →" link routes to `/onboarding`
- On mobile, copy may wrap but the bar stays visible

**Component:** `components/MockDataBanner.tsx`, conditionally rendered in
the root layout based on `profile.connection_skipped`.

---

### Empty state vs mock data — when do we use which?

| User state | Dashboard shows |
|---|---|
| Never connected, never skipped (mid-onboarding) | Bounced back to /onboarding by middleware |
| Connected at least one payer | Real FHIR data |
| Skipped explicitly | Mock dataset + disclaimer bar |
| Was connected, disconnected all (different from skip) | Empty state with clear "Reconnect" CTA — no mock data, because they explicitly removed real data |

This means we have THREE dashboard states: real data, mock data, true empty.
Disconnect ≠ skip — a user who deliberately removed their connection should
not be shown mock data.

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
