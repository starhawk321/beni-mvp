# HIPAA & Privacy Compliance — Beni

Last updated: 2026-05-13

---

## TL;DR

**HIPAA probably does not apply to Beni today.** Because users authorize CMS to share *their own data* with Beni (consumer-directed OAuth), Beni is not a Business Associate under HIPAA. Our ephemeral architecture — fetch live, never store health records — is a deliberate legal and compliance advantage.

**What does apply: the FTC Health Breach Notification Rule (2024).** Beni qualifies as a Personal Health Record (PHR) vendor. Real enforcement teeth. Not optional.

---

## 1. What HIPAA Is

Four rules under the Health Insurance Portability and Accountability Act:

| Rule | What it covers |
|------|---------------|
| **Privacy Rule** | Who can access/use PHI. Patients' rights to their own records. Minimum necessary principle. |
| **Security Rule** | Safeguards for *electronic* PHI (ePHI): administrative, physical, technical. |
| **Breach Notification Rule** | Must notify affected individuals, HHS, and media (500+ affected) within 60 days of a breach. |
| **Enforcement Rule** | Civil penalties $100–$50,000 per violation (cap $1.93M/year). Criminal up to $250K + 10 years. |

### Who it applies to

- **Covered Entities (CEs):** Hospitals, physicians, pharmacies, insurers, health plans. CMS and Aetna/Cigna/UHC are CEs.
- **Business Associates (BAs):** Entities that handle PHI *on behalf of* a CE — billing companies, EHR vendors, cloud providers storing PHI.
- **Everyone else:** HIPAA does not apply.

**PHI = Protected Health Information** — any individually identifiable health information. The 18 HIPAA identifiers include names, dates, geographic data, account numbers, health plan beneficiary numbers, and more.

---

## 2. Does HIPAA Apply to Beni?

### The BA test (two conditions must both be true):
1. The entity creates, receives, maintains, or transmits PHI; **AND**
2. It does so **on behalf of** a covered entity

### Beni's position

**Condition 1 — Does Beni handle PHI?**
When Beni fetches FHIR data from CMS, it briefly processes PHI (claims, coverage, EOBs). But Beni **stores none of it**. What we store in Supabase:
- Encrypted OAuth tokens (`access_token`, `refresh_token`) — credentials, not PHI
- `patient_id` (Medicare beneficiary ID) — **borderline, see below**
- `profiles`: name, email, `onboarding_complete`, `selected_insurer` — not PHI

**Condition 2 — Does Beni operate "on behalf of" a CE?**
No. Beni operates **at the user's direction**. The user authorizes CMS to share *their own data* with Beni. Beni has no contractual relationship with CMS as a service provider. HHS OCR has explicitly stated:

> "An app's facilitation of access to the individual's ePHI at the individual's request alone does not create a business associate relationship."

> "Once health information is received from a covered entity, at the individual's direction, by an app that is neither a covered entity nor a business associate under HIPAA, the information is no longer subject to the protections of the HIPAA Rules."

**Conclusion: Beni is almost certainly NOT a HIPAA Covered Entity or Business Associate.**

### The weak spot: `patient_id`

The Medicare beneficiary ID stored in `fhir_tokens.patient_id` is listed in HIPAA's 18 identifier categories ("health plan beneficiary numbers"). It is the only field in our database that could plausibly be characterized as a HIPAA identifier.

**Action item:** Investigate whether `patient_id` can be derived from the access token at fetch time rather than stored persistently. If so, Beni's stored data becomes purely opaque encrypted credential strings — no health identifiers at all.

---

## 3. What Does Apply to Beni: FTC Rules

### FTC Health Breach Notification Rule (updated July 2024)

Applies to "vendors of personal health records" — entities not covered by HIPAA that maintain a PHR. A PHR is an electronic record of identifiable health information that draws from multiple sources. **Beni fits this definition exactly.**

**What it requires:**
- If there is an unauthorized acquisition or disclosure of PHR health information → notify affected users, the FTC, and media (500+ affected) within 60 days
- "Breach" includes any disclosure not explicitly authorized by the user — including intentional data sales
- FTC can take enforcement action for failures to notify

### FTC Section 5
Applies to all US consumer apps. Prohibits unfair or deceptive practices. A misleading privacy policy is a Section 5 violation.

### CARIN Code of Conduct
Voluntary but strongly recommended for CMS/Medicare ecosystem participation. Required for Medicare App Library listing. Covers: transparency, security, breach notification, prohibition on reselling health data.

### Applicability summary

| Rule | Applies to Beni? |
|------|-----------------|
| HIPAA Privacy Rule | No — not a CE or BA |
| HIPAA Security Rule | No — not a CE or BA |
| HIPAA Breach Notification | No — not a CE or BA |
| **FTC Health Breach Notification Rule** | **Yes** |
| **FTC Section 5** | **Yes** |
| CARIN Code of Conduct | Strongly recommended |
| State laws (CCPA, etc.) | Likely yes, state-dependent |

---

## 4. Our Architecture's Compliance Advantage

Beni's ephemeral data flow is a deliberate legal and compliance moat:

```
User logs in
  → Beni reads encrypted token from Supabase (not PHI)
  → Decrypts token in server memory
  → Fetches live FHIR data from CMS
  → Renders in browser
  → FHIR data discarded — never written to any database
  → User logs out → access token gone from memory
```

**What we store (Supabase):**
- `fhir_tokens`: encrypted access_token, encrypted refresh_token, patient_id, expires_at
- `profiles`: name, email, selected_insurer, onboarding_complete

**What we never store:** Coverage data, claims, EOBs, diagnosis codes, provider names, service dates, any FHIR response body.

**Why this matters:** No PHI in the database means:
- No HIPAA storage obligations
- No encrypted-at-rest PHI requirements (already done anyway)
- Minimal blast radius from any DB breach
- No requirement to delete health records on account deletion (there are none)

**Do not compromise this.** Any feature that requires caching FHIR data in Supabase fundamentally changes the compliance picture. Escalate those decisions explicitly.

---

## 5. Current Security Implementation

| Control | Status | Details |
|---------|--------|---------|
| Encryption in transit | ✅ | TLS via Vercel/Next.js |
| Encryption at rest (tokens) | ✅ | AES-256-GCM in `lib/fhir/crypto.ts` |
| Token stored separately from key | ✅ | Tokens in Supabase, key in env vars |
| Ephemeral FHIR data | ✅ | No FHIR responses written to DB |
| Row Level Security | ⚠️ Verify | Must be enabled on all Supabase tables |
| PHI in server logs | ⚠️ Check | Audit FHIR route console.* calls |
| Account deletion + token revocation | ❌ Not built | Must delete tokens + revoke CMS OAuth |
| Privacy policy | ❌ Not written | Required for FTC compliance |
| Breach response plan | ❌ Not written | Required for FTC HBNR |

---

## 6. Action Checklist

### Now — Free, ~2 days work

- [ ] **Write a privacy policy** — must accurately state: what we collect (name, email, insurer, encrypted tokens), what we fetch but never store (claims, coverage, health records), that we do not sell health data, how users can revoke access (delete account). Required for FTC compliance.
- [ ] **Write a breach response plan** — one page: how we detect a breach, who gets notified (users, FTC), within what timeframe (60 days), what the notification contains. Required under FTC HBNR.
- [ ] **Audit server logs** — check every `console.log/error` in `/app/api/fhir/` routes. FHIR response bodies must never appear in logs. Vercel's log drain captures everything in `console.*`.
- [ ] **Verify Supabase RLS** — confirm Row Level Security policies exist on `fhir_tokens`, `profiles`, `cms_oauth_state`. Write tests that verify a user cannot read another user's rows.
- [ ] **Implement account deletion + token revocation** — deleting a Beni account must: delete the `fhir_tokens` row from Supabase, and call CMS's OAuth revocation endpoint to revoke the grant.
- [ ] **Evaluate eliminating `patient_id` from storage** — if CMS patient_id can be derived from the access token at fetch time, remove it from persistent storage. Eliminates the only borderline PHI identifier in our DB.
- [ ] **Consider signing CARIN Code of Conduct** — free, signals seriousness to CMS ecosystem, required for Medicare App Library.

### At First Revenue / First Healthcare Partner (~$400/mo additional)

- [ ] **Supabase Team Plan + BAA** — ~$25/mo base + BAA add-on. Required before any B2B health deal.
- [ ] **Vercel Pro + HIPAA add-on + BAA** — $20/mo Pro + $350/mo HIPAA add-on. Required before any B2B health deal.
- [ ] **Designate Privacy/Security Officer** — one founder, formally documented. 20 minutes.
- [ ] **HIPAA workforce training** — 2-hour online course for all team members who touch systems with health data. Document completion. Many free options available.
- [ ] **Sentry BAA or PHI scrubbing** — either get a Sentry Business plan BAA, or implement a `beforeSend` hook that strips health data from error events before they reach Sentry.

### At Scale / Enterprise

- [ ] Compliance platform (Vanta, Drata — ~$600–$1,500/mo) for automated evidence collection
- [ ] Annual penetration testing (~$15,000–$30,000)
- [ ] SOC 2 Type II audit if enterprise clients require it (~$30,000–$80,000 first time)
- [ ] Dedicated HIPAA counsel review of all BAAs before signing

---

## 7. Vendor BAA Status

| Vendor | BAA Needed Now? | Available? | Cost |
|--------|----------------|------------|------|
| Supabase | Not yet (no PHI stored) | Yes, Team plan+ | ~$25/mo + BAA add-on |
| Vercel | Not yet | Yes, Pro + HIPAA add-on | $350/mo additional |
| CMS Blue Button | No (Beni is recipient, not BA) | N/A | — |
| Stripe | No (financial data only) | N/A | — |
| Sentry | Depends on log content | Yes, Business plan | ~$80/mo |
| SendGrid / email | Only if emails contain PHI | Yes | Included in Business |
| Google Workspace | Only if PHI discussed in email/docs | Yes | Free with Workspace |

---

## 8. What HIPAA Does NOT Require (Common Myths)

- **No official "HIPAA certification" exists.** Any company selling you one is selling a proprietary product. Do not display a "HIPAA Certified" badge — the FTC may treat it as deceptive advertising.
- **HIPAA does not require a specific tech stack.** No "HIPAA-approved" database or framework.
- **You do not need a BAA with every vendor** — only those that handle PHI on your behalf.
- **HIPAA does not require pen testing** (though it's best practice for risk management).
- **HIPAA does not require 2FA for end users** (currently — proposed 2025 NPRM would change this).
- **De-identified data is not PHI.** If the 18 identifiers are removed and re-identification risk is certified low, HIPAA does not apply.

---

## 9. Key Principle Going Forward

> **The ephemeral architecture is Beni's compliance moat. Never cache FHIR data in the database without a deliberate architectural and legal review.**

Any feature request that involves storing health records (conditions, medications, labs, immunizations) permanently in Supabase must be evaluated against:
1. Does it change Beni's HIPAA BA status?
2. What additional safeguards are required?
3. Is there a way to deliver the feature ephemerally instead?

---

## Sources

- [HHS: Covered Entities and Business Associates](https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html)
- [HHS: Right of Access, Health Apps & APIs](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis/index.html)
- [HHS: HIPAA Security Rule NPRM 2025](https://www.hhs.gov/hipaa/for-professionals/security/hipaa-security-rule-nprm/factsheet/index.html)
- [FTC: Updated Health Breach Notification Rule 2024](https://www.ftc.gov/business-guidance/blog/2024/04/updated-ftc-health-breach-notification-rule-puts-new-provisions-place-protect-users-health-apps)
- [CMS: Best Practices for App Developers](https://www.cms.gov/files/document/best-practices-payers-and-app-developersupdated21023.pdf)
- [Supabase: HIPAA Compliance Docs](https://supabase.com/docs/guides/security/hipaa-compliance)
- [Vercel: HIPAA Compliance Guide](https://vercel.com/kb/guide/hipaa-compliance-guide-vercel)
- [CARIN Code of Conduct](https://onerecord.com/code-of-conduct)
