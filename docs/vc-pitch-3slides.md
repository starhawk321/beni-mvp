# Béni — 3-Slide Pitch (friendly VC chat)

Last updated: 2026-05-25

Three-slide deck for a casual VC product-feedback conversation. Structure:
Problem → Solution → Timeline (data unlocked vs customers unlocked).

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

**Headline:** "Béni makes your healthcare *make sense* — and tells you what to do."
(brand gradient on "make sense")

**The three-step spine:**
1. **Connect** — read-only link to your insurer via FHIR. Real claims, no manual entry.
2. **See** — every plan, claim, benefit, and dollar in one place, across all your insurers.
3. **Act** — flags wrong bills, surfaces unused benefits, picks the right plan at enrollment.

**Hero visual:** the Béni dashboard mockup (desktop + mobile).

**Differentiator line:** "Every other tool shows you what happened. Béni tells
you what to do."

---

## Slide 3 — The Timeline (data unlocked → customers unlocked)

**Headline:** "Each data *unlock* opens a bigger market." (gradient on "unlock")
**Eyebrow:** "WHY NOW"

Two-track horizontal timeline, time progressing left → right:

| | Now (2025–26) | 2027 inflection | Beyond |
|---|---|---|---|
| **Data unlocked** | Medicare (CMS), ACA marketplace, Anthem commercial | Commercial / employer plans — industry pledge, Cigna Jan 2027 | Dental, vision, HSA/FSA |
| **Customers unlocked** | Retirees + marketplace · ~88M | Employer-sponsored · +155M | Full financial picture · ~300M insured |

The 2027 column is visually emphasized (the inflection). Brand gradient on the
connecting timeline line, widening left → right.

**Narrative line:** "We build on today's data and ride the unlock curve into
progressively larger markets — the intelligence layer that's already there
when each wave hits."

**Footnote:** "2027 commercial timeline driven by an HHS-backed industry pledge
(60+ insurers, 257M members). Anthem already provides commercial data today."

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
Left 40%: eyebrow "THE PRODUCT" + headline gradient on "make sense": "Béni makes
your healthcare *make sense*." Vertical 3-step list: "1 Connect — read-only link
to your insurer via FHIR, real claims, no manual entry. 2 See — every plan,
claim, and dollar in one place. 3 Act — flags wrong bills, surfaces unused
benefits, picks the right plan." Line below: "Every other tool shows you what
happened. Béni tells you what to do." Right 60%: product mockup of the Béni
dashboard on dark navy — hero card with three stats (Insurance paid $8,420 ·
Out of pocket $1,247 · Claims 14), two plan cards (Medicare cyan pastel #C7E5F2,
Cigna peach pastel #FFC4BE), one "For you" card. Slight perspective tilt + soft
glow. Mobile artboard inset bottom-right.

### Slide 3 prompt
Two-track horizontal timeline. Eyebrow "WHY NOW" + headline gradient on "unlock":
"Each data *unlock* opens a bigger market." Three columns left→right: "Now
2025–26", "2027 inflection", "Beyond". Top track "DATA UNLOCKED": Now = "Medicare,
ACA marketplace, Anthem commercial"; 2027 = "Commercial / employer plans —
industry pledge, Cigna Jan 2027"; Beyond = "Dental, vision, HSA/FSA". Bottom
track "CUSTOMERS UNLOCKED" with growing-size bars/circles: Now = "Retirees +
marketplace · ~88M"; 2027 = "Employer-sponsored · +155M"; Beyond = "Full
financial picture · ~300M insured". Emphasize the 2027 column. Brand gradient
on the connecting timeline line, widening left→right. Narrative line in cream:
"We build on today's data and ride the unlock curve into progressively larger
markets — the intelligence layer that's already there when each wave hits."
Footnote in dim cream: "2027 commercial timeline driven by HHS-backed industry
pledge (60+ insurers, 257M members). Anthem already provides commercial data today."

---

## Notes for the conversation

- Bring the live dashboard on your laptop as backup — the slides set context,
  the demo is the real conversation.
- Don't include market-size or team slides for a friendly chat.
- If pushed on the moat: it's earned over time (structural neutrality +
  compounding data + integration breadth), not day-one. Say that honestly.
- The "why now" (Slide 3) is your strongest card — a dated, near-term,
  industry-wide, politically-backed data unlock.
