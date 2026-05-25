# Béni — 4-Slide Pitch (friendly VC chat)

Last updated: 2026-05-25

Four-slide deck for a casual VC product-feedback conversation. Structure:
1. Problem · 2. Solution (AI concierge, 3 layers) · 3. Timing & growth (graph) ·
4. Product (mobile app showcase, incl. agentic flows).

Goal of the chat: friendly product/strategy input, not fundraising. Lead with
a real problem, a concrete product, and a "why now" the VC can feel.

---

## Slide 1 — The Problem (universal, all patient categories)

**Headline:** "Your healthcare is the one part of your life you can't *see clearly*."
(brand gradient on "see clearly")

**01 — The data is hidden**
Opaque, inaccessible, and scattered across a dozen portals that don't talk to
each other. Even the CFPB notes errors are common and nearly impossible for
patients to resolve.

**02 — So people stay reactive**
Few ever look at their benefits proactively — only retroactively, or in a
panic before care.
> **38% of Americans have put off medical treatment over cost — a record high.** (Gallup, 2022)

**03 — And the cost is real**
Unsettled bills, unused benefits, forfeited dollars. Complexity turns into
money left on the table.
> **At least $220B in US medical debt** (KFF) · **$3–5B in FSA funds forfeited yearly** (EBRI data)

**Closing hook:** "Banking got Plaid. Spending got Mint. Healthcare never got
its intelligence layer."

---

## Slide 2 — The Solution

**Headline:** "Béni is your *AI concierge* for healthcare." (gradient on "AI concierge")

**Three layers, ascending value:**

**01 · Data Layer — Consolidate**
Béni pulls your healthcare data from every account — medical, dental, FSA, and
more — into one readable dashboard. Ask questions, browse your records, finally
understand your bills.

**02 · Analytics Layer — Understand**
Béni swims through your plans, bills, and spending to surface what you'd never
catch yourself: unused benefits, billing errors, coverage gaps.

**03 · Agentic Layer — Act**
Béni's agents go to work on your behalf — negotiating bills, submitting
FSA-eligible expenses, supporting prior authorizations, and more.

**Closing line:** "Most apps stop at the dashboard. Béni acts."

### Why this framing works
- The stack reads as a roadmap: Data ships now, Analytics next, Agentic is the north star.
- "Béni acts" is the differentiator — every competitor is just a dashboard.
- It ladders with Slide 3: Data layer ↔ today's data unlock; Agentic ↔ the big future.

### What a VC will poke at
- **"Can you really auto-negotiate bills / do prior auth?"** — Agentic is the
  destination, not v1. Earn the right to act by nailing data + analytics first.
  Some actions are human-in-the-loop initially (Béni drafts, you approve).
- **"'AI concierge' is crowded — what's different?"** — The unlock is *underneath*
  the AI: direct FHIR data access + structural neutrality (you're not the insurer).
  The data moat feeds the agent. Don't let "AI" do the talking.
- **"Which layer is the wedge?"** — Data + Analytics are the hook (immediate value,
  low risk). Agentic is the expansion.

---

## Slide 3 — Timing & Growth (graph, two-axis compounding)

**Eyebrow:** "WHY NOW & HOW WE GROW"
**Headline:** "Two ways we compound: more *people*, more *value* per person." (gradient on "people")

An expanding area/step chart climbing up and to the right; the big jump is the
2027 commercial-data unlock.

- **X-axis:** `Now (2025–26)` · `2027` · `Beyond`
- **Y-axis:** Addressable members (millions), cumulative — ~88M → ~243M → ~300M (accelerating)
- **Fill:** brand gradient rising from baseline
- **Step annotations (the data unlock driving each):**
  - ~88M — "Medicare + ACA marketplace + Anthem commercial"
  - ~243M — "Commercial / employer FHIR turns on — 2027 industry pledge" ← inflection, emphasized
  - ~300M — "Dental, vision, HSA/FSA"
- **Second track along the top** — product depth climbing in sync with the
  Slide 2 layers: "Data + Analytics" → "Agentic begins" → "Full agentic concierge"

**Narrative:** "As FHIR access expands we reach bigger markets — and as we climb
from data to analytics to agents, each user gets more valuable. Growth on both
axes at once."

**Footnote:** "Addressable members by data availability (TAM/SAM, not users).
2027 commercial timeline driven by an HHS-backed industry pledge (60+ insurers,
257M members). Anthem already provides commercial data today."

> Y-axis is the *opportunity* curve (addressable members), NOT users or revenue.
> Label it "Addressable members" so a VC doesn't read it as traction.

---

## Slide 4 — Product (mobile app showcase, incl. agentic flows)

**Eyebrow:** "THE PRODUCT"
**Headline:** "An *agent* in your pocket for healthcare." (gradient on "agent")

Four phone mockups fanned left → right, escalating from "see" to "act":

1. **Dashboard** — hero stats + plan cards + For You. Caption: "Everything in one place."
2. **Concierge chat** — natural-language Q&A grounded in real claims. Caption: "Ask anything."
3. **Bill negotiation agent** ⭐ (visual hero) — flag → status timeline → "$1,374 → $890, saved $484." Caption: "Béni negotiates for you."
4. **Agent activity inbox** — list of agent actions with status + dollar outcomes. Caption: "Working on your behalf."

### Agentic mockup design principle
Every agentic screen must show the agent **doing work and producing an outcome** —
not just chatting. Each needs (a) a clear task, (b) a status/progress indicator,
(c) a concrete result, ideally a dollar figure. That's what separates "AI feature"
from "agent that earns its keep."

### Other agentic flow ideas (if you want alternates)
- **FSA Auto-Sweep** — "$842 expires in 47 days" → Béni finds 6 eligible expenses ($640) → one-tap submit
- **Prior Authorization Assistant** — drafts the PA request + lists docs the doctor needs → stage tracker
- **Open Enrollment Optimizer** — simulates each plan on your real usage → "Plan B would've saved $1,200"

---

## Verified stats (with sources + confidence)

Only use these. Two commonly-cited stats were checked and rejected (see bottom).

| Claim | Figure | Source | Year | Notes |
|---|---|---|---|---|
| Total US medical debt | **at least $220B** | KFF (SIPP 2021 data) | pub. 2024 | Strong. Always say "at least." ~14M owe >$1k; ~3M owe >$10k. |
| Medical debt on credit reports | **$88B** | CFPB | data June 2021, pub. Mar 2022 | Strong, but predates 2022–23 bureau removals — cite as the June-2021 figure, not "today." |
| Put off medical treatment due to cost | **38%** (record high) | Gallup | 2022 | "Put off treatment for any condition." 27% for a *serious* condition. State wording precisely. |
| Delayed/skipped needed care (recent anchor) | **~33% / ~72M adults** | West Health–Gallup | 2024 | Alternative recent figure; different question wording than the 38%. |
| Skipped some medical care due to cost | **28%** | Federal Reserve (SHED) | 2024 | Most conservative anchor. |
| FSA funds forfeited annually | **~$3–5B/yr** (est.) | EBRI data; total is *Money* extrapolation | 2022–23 data | EBRI's per-account + % forfeiting figures are solid; the dollar TOTAL is an extrapolation (~22–23M accounts). Attribute as "estimated," not "EBRI found $X." |

### Why-now / regulatory facts (verified)

- The 2021 CMS rule (CMS-9115-F) mandates Patient Access FHIR APIs only for
  Medicare Advantage, Medicaid, CHIP, and federally-facilitated marketplace
  QHPs — **NOT** commercial/employer (ESI) or self-funded ERISA plans.
- CMS-0057-F (2024) uses the Jan 1, 2027 date but for the SAME regulated
  payers and mainly for prior-auth/provider APIs — does not reach commercial ESI.
- The Jan 1, 2027 commercial timeline traces to the **AHIP / BCBS Association
  voluntary pledge (June 23, 2025)** — ~60 insurers, ~257M members, HHS-backed.
  Pledge language is framed around prior-auth FHIR APIs "across all markets";
  Cigna appears to have aligned its commercial Patient Access rollout to it.
- **Anthem/Elevance already exposes Patient Access across "all lines of
  business, including commercial."** Aetna covers "certain commercial members."
  So commercial FHIR access is proven today, not hypothetical.

### Rejected stats — DO NOT USE

- **"80% of medical bills contain errors"** — industry lore from Medical
  Billing Advocates of America, a bill-review firm with a selection-biased
  sample. Academic estimates are ~30–40%. A sharp VC could shred it. If a
  billing-complexity claim is needed, use the CFPB framing ("errors are common
  and hard to resolve") instead.
- **"$X in unused benefits"** — no credible national aggregate exists. Don't
  invent one. Substitute the FSA forfeiture figure.

---

## Brand context block (paste into every claude.ai/design prompt)

> Béni is a healthcare-fintech app. Voice: intelligent, warm, slightly literary
> — not corporate, not gamified. No green checkmarks, confetti, or emoji.
> Visual: deep navy background #07101C; surfaces #0F1A2C and #141E33; cream
> text #F4ECDE; brand gradient linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 32%,
> #9B5BFF 65%, #E55BB8 100%) used on one emphasis word per slide; pastel accents
> cyan #C7E5F2, peach #FFC4BE, purple #D8CDF2. Type: Manrope (sans, 400–800),
> Instrument Serif italic for the one emphasis word. 16:9 (1920×1080). No drop
> shadows — use surface elevation. Generous whitespace. Slide number bottom-left "N / 3".

### Slide 1 prompt
Dark navy canvas, small "beni" wordmark top-left. Centered headline, brand
gradient on "see clearly": "Your healthcare is the one part of your life you
can't *see clearly*." Three numbered problem blocks (01, 02, 03 in JetBrains
Mono, dim cream), each with a bold lead line, a body line, and where present a
highlighted stat:
- 01 "The data is hidden" — "Opaque, inaccessible, and scattered across a dozen portals that don't talk to each other."
- 02 "So people stay reactive" — "Few look at their benefits proactively — only in a panic before care." Stat: "38% have put off treatment over cost (Gallup, 2022)."
- 03 "And the cost is real" — "Unsettled bills. Unused benefits. Forfeited dollars." Two stats side by side: "$220B in US medical debt (KFF)" and "$3–5B in FSA funds forfeited yearly (EBRI)."
Stats emphasized in larger Manrope 700 tabular-nums, source attribution in dim
cream beneath. Footer line, dim cream: "Banking got Plaid. Spending got Mint.
Healthcare never got its intelligence layer." Slide number "1 / 3".

### Slide 2 prompt
Left 35%: eyebrow "THE PRODUCT" + headline with brand gradient on "AI concierge":
"Béni is your *AI concierge* for healthcare." Small line beneath: "Most apps stop
at the dashboard. Béni acts." Right 65%: three stacked horizontal layer-cards,
ascending — each layer visibly builds on the one below (increasing
brightness/saturation toward the top). Each card: number, layer name + verb,
one-line description:
- Bottom "01 · DATA LAYER — Consolidate": "Pulls your data from every account — medical, dental, FSA — into one readable dashboard. Ask questions, browse records, understand your bills." Cyan pastel #C7E5F2.
- Middle "02 · ANALYTICS LAYER — Understand": "Swims through your plans, bills, and spending to surface unused benefits, billing errors, and coverage gaps." Peach pastel #FFC4BE.
- Top "03 · AGENTIC LAYER — Act": "Agents go to work on your behalf — negotiating bills, submitting FSA expenses, supporting prior authorizations." Brand gradient as the card surface to signal this is the magic layer; cream/dark ink for contrast.
Optional: a small Béni dashboard mockup peeking behind/beside the Data Layer
card. Slide number "2 / 3".

### Slide 3 prompt
Eyebrow "WHY NOW & HOW WE GROW" + headline with brand gradient on "people":
"Two ways we compound: more *people*, more *value* per person."
Center: a large area/step chart climbing up and to the right on dark navy.
- X-axis three labeled points: "Now 2025–26", "2027", "Beyond".
- Y-axis labeled "Addressable members (millions)", values ~88M → ~243M → ~300M.
- Area fill uses the brand gradient (sky→purple→coral), semi-transparent, rising from baseline. Curve accelerates — noticeable jump at the 2027 step (emphasize with a brighter vertical marker / glow).
- Step annotations naming the data unlock: ~88M "Medicare + ACA marketplace + Anthem commercial"; ~243M (largest jump) "Commercial / employer FHIR — 2027 industry pledge"; ~300M "Dental, vision, HSA/FSA".
- Thin secondary track along the top showing product depth climbing in sync, three labels aligned to x-axis: "Data + Analytics" → "Agentic begins" → "Full agentic concierge".
- 2027 column is the visual hero (inflection).
Footnote in dim cream: "Addressable members by data availability (TAM/SAM, not
users). 2027 commercial timeline driven by an HHS-backed industry pledge (60+
insurers, 257M members). Anthem already provides commercial data today."
Slide number "3 / 4".

### Slide 4 prompt
Eyebrow "THE PRODUCT" + headline with brand gradient on "agent": "An *agent* in
your pocket for healthcare." Main area: four iPhone-style phone mockups on dark
navy, fanned/staggered left→right with slight overlap, soft glow, slight
rotation for a dynamic product-shot feel. Each phone has a small caption beneath.
- Phone 1 — Dashboard (caption "Everything in one place"): "beni" wordmark top; navy hero card with three stacked stats "Insurance paid $8,420 / Out of pocket $1,247 / Claims 14"; two plan cards cyan #C7E5F2 (Medicare) and peach #FFC4BE (Cigna); a purple #D8CDF2 "For you" card; bottom tab bar (Home active / Plans / Claims / You).
- Phone 2 — Concierge chat (caption "Ask anything"): chat UI. User: "Why did I get charged $135 by Dr. Chen?" Béni reply with inline claim card: "Billed $250; Cigna's rate was $135, applied to your deductible. Correct — but it's FSA-eligible. Want me to submit it?" + "Submit to FSA" chip.
- Phone 3 — Bill negotiation agent (caption "Béni negotiates for you"), visual hero, slightly larger/centered: flag banner "Your $1,374 Memorial Hospital bill is ~40% above fair price"; vertical status timeline "Reviewing → Drafting dispute → Submitted → Negotiating → Resolved" (last step highlighted); big outcome card in brand gradient "$1,374 → $890. You saved $484."
- Phone 4 — Agent activity inbox (caption "Working on your behalf"): list with status icons + dollar outcomes — "✓ Disputed $135 bill — awaiting response", "✓ Submitted $640 in FSA claims", "⧗ Negotiating Memorial Hospital — saved $484 so far", "→ Free annual physical available — book it?".
Phones use dark Béni theme (#07101C screens, cream text, pastel + gradient accents).
Slide number "4 / 4".

---

## Notes for the conversation

- Bring the live dashboard on your laptop as backup — the slides set context,
  the demo is the real conversation.
- Don't include market-size or team slides for a friendly chat.
- If pushed on the moat: it's earned over time (structural neutrality +
  compounding data + integration breadth), not day-one. Say that honestly.
- The "why now" (Slide 3) is your strongest card — a dated, near-term,
  industry-wide, politically-backed data unlock.
