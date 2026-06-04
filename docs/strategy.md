# Béni — Strategy (June 2026)

## Positioning

**Béni is the financial layer for your healthcare.** An AI agent that reads every EOB and every bill the moment it arrives, tells you what you actually owe in plain English, and when something's wrong, drafts the letter to fix it.

We start with the pain that's costing users money today (billing) and expand into the rest of healthcare finance as the FHIR data picture matures (commercial coverage Jan 2027, prior auth API Jan 2027, payer-to-payer Jan 2027).

## The two problems we solve

### Problem 1 — "I don't know what I actually owe"
Medical bills arrive from multiple providers across paper, portals, and email. EOBs arrive separately from the insurer. The numbers don't match. Users have no unified place to see what's actually owed, when, to whom, or whether the bill is correct.

**Solution: unified bill inbox + EOB-to-bill reconciliation.** Daily-use surface. Auto-fetched EOBs from connected payers + photographed paper bills + email-forwarded PDFs land in one feed with AI plain-English explanations and "this matches your EOB / this doesn't" reconciliation.

### Problem 2 — "I don't know if my insurer screwed me"
Wrongful denials, cost-sharing errors, No Surprises Act violations, MA denials that wouldn't have happened under Original Medicare — all buried in CARC codes and EOB line items the user can't read. ~90% of appealable denials are never appealed.

**Solution: AI claims audit + drafted appeal letters.** Episodic "moment of magic." Every new EOB gets audited; when something's off, the inbox surfaces "we found you $X" and walks the user through appeal.

### Why the bundle works

Problem 1 gives users a reason to open the app (constant artifact arrival). Problem 2 gives the app a reason to push to users (appeals fire periodically with high stakes). Together: daily low-stakes engagement + periodic high-stakes engagement.

## Audience and TAM

The realistic addressable population for an FHIR-claims-based audit product is gated by Patient Access API coverage:

- Medicare Advantage (~33M) — rich audit surface
- ACA marketplace QHPs (~21M) — rich audit surface
- Medicaid managed care (~88M, low ARPU)
- Original Medicare (~32M) — thinner audit surface but useful for inbox + charity care

**Not accessible today:** employer-sponsored commercial (~155M) — outside CMS authority (ERISA).

**Unlocks Jan 1, 2027:** Cigna has explicitly committed to adding US Commercial plans to Patient Access on that date. Likely others follow because they have to rebuild the pipe for CMS-0057-F anyway. Plan around MA + marketplace first; treat commercial as 2027 upside.

## MVP scope (2 months, closed beta, solo build)

Ship two features:
1. **Bill inbox + EOB reconciliation** — the daily wedge
2. **AI audit + appeals** — the moment of magic

Defer to v2: charity care discovery, bill negotiation drafts, Rx cost optimization, HSA/FSA orchestration, prior auth tracker, tax deduction tracking, in-network verification.

Beta cohort: 20-50 users. Recruit high-utilizers (chronic conditions, post-surgery, MA users with frequent specialist visits) so the audit fires often enough to feel valuable.

## 8-week plan

### Week 1 — Foundation
- Wire Claude API for LLM analysis. Sign BAA with Anthropic upfront.
- Build CARC code → plain English mapping (~700 codes from WPC).
- Set up knowledge base scaffolding: NSA rules, MA-vs-Original-Medicare coverage gaps, top-5 carrier appeal procedures.
- Refactor FHIR pipeline so EOBs are objects an inbox can consume.
- Design inbox + audit screens.

### Weeks 2-3 — Inbox MVP
- EOB inbox view (chronological feed, plain-English per item).
- Paper bill capture (photo upload, OCR via Claude or Textract, structured fields).
- Email forwarding (`bills@yourdomain` → inbound parser → matched into inbox).
- Reconciliation logic (match provider bill ↔ EOB on date+provider+amount, flag discrepancies).

**Ship:** beta user can connect insurer, see auto-fetched EOBs, photograph a paper bill, and see "this matches / this doesn't."

### Weeks 4-5 — Audit engine
- Rule-based detection layer for high-confidence patterns (cost-sharing errors, OON-at-in-network-facility, deductible re-applied after meeting, denial of NCD-covered services for MA).
- LLM-based detection layer for fuzzy patterns (denial reasoning that doesn't justify denial, upcoding suspicion, plan-document violations).
- Finding object schema: type, amount at stake, evidence chain, confidence level.
- Surface findings in the inbox as "we found you $X" notifications.

**Ship:** audit runs on every new EOB, findings appear as alerts.

### Week 6 — Appeals
- Appeal letter templates per finding type + per carrier.
- LLM fills templates with user/claim specifics, cites relevant code/rule.
- User review/edit/sign flow.
- Sending: downloadable PDF + mailing instructions. Defer USPS API.
- Manual appeal status tracking.

**Ship:** user can take a finding → draft → review → download → mail.

### Week 7 — Polish + onboarding
- Onboarding flow that sets expectations ("we find things periodically, not daily").
- Notification system (email when finding appears, when bill arrives, when appeal hits 30-day mark).
- Privacy/HIPAA review (privacy policy, BAA confirmation, encryption check).
- Internal dogfooding bug fixes.

### Week 8 — Beta launch
- Onboard 20-50 users — friends, family, recruited high-utilizers.
- Support pipeline (founder on email/Slack).
- Daily feedback loop.
- Public landing page polish for next-cohort waitlist.

## Feature dependency on FHIR Patient Access

For future planning, here's which features can launch FHIR-free vs which are gated on the FHIR pipe:

| Feature | Needs FHIR? |
|---|---|
| Bill inbox (EOB side) | Yes (auto-fetch) or user upload |
| Bill inbox (provider bill side) | No (photo + email) |
| AI audit + appeals | Needs EOB (FHIR or upload) |
| Charity care discovery | No |
| Bill negotiation drafts | No |
| Collections defense | No |
| Surprise billing / NSA enforcement | Needs EOB |
| Itemized bill request automation | No |
| Medical debt credit report cleanup | No (uses credit bureau APIs) |
| Rx cost optimization | Helpful, not required |
| HSA/FSA orchestration | No (uses custodian APIs) |
| Good Faith Estimate / cost prediction | Helpful |
| In-network verification | Different API (Provider Directory) |
| Prior auth status tracker | Waiting on Jan 2027 |
| Tax deduction tracking | Helpful |

Strategic implication: a future "FHIR-free" pivot or hybrid mode could unlock the ~155M employer-sponsored population by ditching EOB auto-fetch and falling back to user-uploaded bills + charity care + negotiation. Not for the 2-month MVP, but a viable expansion path.

## The narrative

### Pain (the hook)
Medical bills are designed to confuse you into giving up. The average American gets 30+ bills and EOBs a year, the numbers don't match, the codes mean nothing, half the bills shouldn't be paid in full, and a quarter of denials are wrong. Insurers and hospitals count on you not appealing, not asking for charity care, not noticing when in-network gets billed as out-of-network. The system extracts value through complexity.

### Product
An AI agent that reads every EOB and every bill the moment it arrives, tells you what you actually owe in plain English, and when something's wrong, drafts the letter to fix it. Works in the background. Pings you when it finds money you can recover. Writes the appeal. You sign it.

### Wedge → destination
Start with the inbox and audit (what we ship in 2 months). Expand into plan switching with full claims context, pre-service cost estimates with prior-auth automation, Rx optimization, charity care, HSA/FSA orchestration. The financial layer for healthcare.

### Differentiation
- Counterforce / Claimable fight denials for *providers*; we fight for *patients*.
- Chapter / Healthpilot help you *pick* a plan; we work the year-round chaos *after*.
- GoodRx is Rx-only; we're the whole bill.
- Dollar For is charity-care-only, manual, nonprofit; we're AI-native across billing.
- HealthLock / TrueMed monitor for fraud; we recover money.

The moat is the stack: FHIR Patient Access integrations + every hospital FAP parsed + every plan's appeal procedure modeled + every NSA rule encoded. That stack compounds; the LLM is the rendering engine.

## What we considered and ruled out

| Direction | Why ruled out |
|---|---|
| Bill negotiation as standalone | Too crowded (Goodbill, Resolve, etc.) |
| Medicare Plan Finder competitor | Crowded (Chapter, Healthpilot, Plan Finder) |
| Medical payment card with FSA/HSA/insurance routing | First Dollar shape, B2B drift |
| Care navigation | Crowded (Galileo, Forward), requires provider relationships |
| Open enrollment / plan switching | Seasonal, brokered |
| Tax-time medical deductions as standalone | Seasonal |
| General "AI concierge" | Too vague |
| Building for commercial today | Not accessible via FHIR until ~2027 |

## Risks

1. **LLM hallucination in appeal letters.** Appeals have legal weight. Mitigation: rule-based detection surfaces only high-confidence findings; LLM fills templates with structured data, doesn't invent reasoning. User reviews before signing.
2. **Paper bill OCR accuracy.** Uneven. Mitigation: closed beta absorbs noise; manually correct + use as training signal.
3. **Beta cohort skews healthy.** Audit fires rarely, beta feels useless. Mitigation: actively recruit chronic-condition users, post-surgery users, frequent-utilizer MA users.
4. **HIPAA/PHI handling.** Anthropic offers BAA via direct API. Get paperwork signed week 1.
5. **Hit-rate variance.** Some users have nothing to appeal in a given year (0-1 findings for low utilizers; 3-10+ for high). Mitigated by pairing audit with daily-use inbox so the product still earns engagement on quiet weeks.

## What unlocks in 2027

CMS-0057-F effective Jan 1, 2027 adds:
- Prior Authorization API — PA status and data appears on Patient Access
- Provider Access API — providers can pull patient's data with consent
- Payer-to-Payer API — switching insurers triggers 5-year history transfer (solves cold-start)
- US Commercial population on Patient Access (Cigna confirmed; others likely follow)

Each of these turns into a product feature: PA tracking, provider-side share-this-bill, "import your last 5 years from your old insurer," and "we now work for your employer-sponsored plan."

Plan the 2-month MVP so that adding these in 2027 is incremental, not a rewrite.
