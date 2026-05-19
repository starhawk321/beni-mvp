# Payer FHIR Patient Access APIs — Research

Last updated: 2026-05-16

All major US payers are required by the CMS Interoperability Rule to expose FHIR R4 Patient Access APIs. This document tracks developer portal details, sandbox access, and integration notes for each.

Source: Flexpa State of Payer APIs reports (Nov 2025, May 2025) + direct portal research.

---

## Market Coverage

~155 million Americans have employer-sponsored insurance (ESI) — the largest single coverage type in the US (~49% of the population).

| Insurer | ESI Members | ESI Market Share | Cumulative Coverage |
|---------|------------|-----------------|-------------------|
| UnitedHealthcare | ~28M | ~14% | 14% |
| Anthem / Elevance | ~25M | ~12% | 26% |
| Aetna (CVS) | ~22M | ~10% | 36% |
| BCBS TX/IL/OK (HCSC) | ~20M | ~10% | 46% |
| Cigna | ~18M | ~8% | 54% |
| BCBS regional (others) | ~15M | ~8% | 62% |
| Humana | ~8M | ~4% | 66% |
| Kaiser Permanente | ~9M | ~4% | 70% |

**Beni's realistic MVP coverage (Aetna + Cigna + Anthem + UHC):** ~44% of ESI market — roughly 68 million people.

Note: HCSC plans (BCBS TX/IL/OK) represent ~10% but their FHIR API is effectively non-functional. Skipping them costs 10% coverage but saves significant integration pain.

---

## Summary Table

| Insurer | FHIR Available | ESI Market Share | Portal | Startup-Friendly | Beni Status |
|---------|---------------|-----------------|--------|-----------------|-------------|
| UnitedHealthcare | ✅ | ~14% | `portal.flex.optum.com` | ⚠️ Moderate — org approval required, complex routing | Not registered |
| Anthem / Elevance | ✅ | ~12% | `anthem.com/developers` | ⭐ Best — synthetic sandbox, great docs | Not registered |
| Aetna (CVS) | ✅ | ~10% | `developerportal.aetna.com` | ✅ Good — you already applied | ✅ Submitted |
| BCBS TX/IL/OK (HCSC) | ⚠️ | ~10% | `interoperability.hcsc.com` | ❌ Skip — effectively non-functional | Skip |
| Cigna | ✅ | ~8% | `developer.cigna.com` | ✅ Good — credentials via email | ✅ Integrated |
| Humana | ✅ | ~4% | `developers.humana.com` | ⭐ Best — instant sandbox credentials | Not registered |
| Kaiser Permanente | ✅ | ~4% | `developer.kp.org` | ⚠️ Moderate — Epic-backed | Not registered |
| Highmark BCBS | ✅ | regional | `cmsapiportal.hmhs.com` | ✅ Good — active community | Not registered |
| Blue Shield of CA | ✅ | regional | `devportal-dev.blueshieldca.com` | ✅ Good | Not registered |
| Highmark BCBS | regional | `cmsapiportal.hmhs.com` | ✅ Good | N/A |
| Blue Shield of CA | regional | `devportal-dev.blueshieldca.com` | ✅ Good | N/A |
| HCSC (BCBS TX/IL/OK) | ~10% combined | `interoperability.hcsc.com` | ❌ Skip | 6–8/100 |

---

## Detailed Notes

### Humana
- **Portal:** `developers.humana.com` · FHIR docs: `fhir.humana.com/documentation`
- **Sandbox:** Self-service at `developers.humana.com/apis/registerapp` — instant client ID + secret
- **OAuth:** OAuth 2.0 Authorization Code (same pattern as CMS Blue Button 2.0)
- **Sandbox data:** 20 synthetic test users available
- **Notes:** Cleanest registration experience. Works exactly as expected. One gap: omits prescription quantity from drug claims.
- **Status for Beni:** Not yet registered

---

### Anthem / Elevance Health
- **Portal:** `anthem.com/developers`
- **FHIR base:** `https://patient360c.anthem.com/P360Member/api/fhir-r4`
- **CA-specific:** `patient360ca.anthem.com`
- **OAuth:** SMART on FHIR (OAuth 2.0 Authorization Code)
- **Sandbox:** Self-service with synthetic data. Production access takes several weeks.
- **Notes:** Best-in-class developer experience. Full lines of business. Refresh tokens supported.
- **Status for Beni:** Not yet registered

---

### Aetna (CVS Health)
- **Portal:** `developerportal.aetna.com`
- **Support:** `interoperabilitydevelopersupport@aetna.com`
- **OAuth:** SMART on FHIR · Sandbox auth: `https://vteapif1.aetna.com/fhirdemo/v1/fhirserver_auth/oauth2/authorize`
- **Registration:** Requires completing a security questionnaire (Excel workbook)
- **Known quirks:**
  - Authorization endpoint requires non-standard `AUD` parameter
  - `redirect_uri` required in request but server ignores it (uses portal-configured value)
  - Production CDN bug: invalid HTTP headers — workaround requires `insecureHTTPParser: true`
  - Sandbox tokens are 5-minute access only, no refresh tokens
  - Currently supports Medicare Advantage plans only (not ACA Exchange or Part D)
- **Status for Beni:** ✅ Submitted — under review (2–4 business days)

---

### Cigna
- **Portal:** `developer.cigna.com`
- **Sandbox:** `developer.cigna.com/service-apis/patient-access/sandbox`
- **Implementation guide:** `developer.cigna.com/service-apis/patient-access/implementation-guide`
- **OAuth:** SMART on FHIR · Scopes: `openid fhirUser patient/*.read`
- **Registration:** Register at `developer.cigna.com/register/details` → client ID + secret delivered via email from Cigna rep
- **Notes:** Good partner behavior — proactively communicates API changes to developers. Synthetic test users provided.
- **Status for Beni:** Not yet registered

---

### UnitedHealthcare / Optum
- **Portal:** `portal.flex.optum.com` (also `uhc.com/legal/interoperability-apis`)
- **OAuth:** OAuth 2.0 Authorization Code + PKCE
- **Registration:** Requires OneHealthcare ID + org registration reviewed by security/compliance team
- **Known complexity:** Authorization endpoints are plan-specific subdomains (e.g. `rmhp.authz.flex.optum.com`) — app must know patient's specific plan to route correctly
- **Notes:** Sandbox doesn't issue refresh tokens despite production docs promising 3-month tokens. Support only M–F 9am–4pm CST.
- **Status for Beni:** Not yet registered

---

### Kaiser Permanente
- **Portal:** `developer.kp.org` · Partnership program: `interchange.kp.org`
- **OAuth:** SMART on FHIR (Epic-backed — KP runs on Epic EHR)
- **Notes:** Regional entity structure — multiple separate API endpoints (Northern CA, Southern CA, Northwest, Hawaii, etc.). Coverage resource not available in Patient Access API. Works like Epic app registration.
- **Status for Beni:** Not yet registered

---

### Highmark BCBS (PA, WV, DE, WY)
- **Portal:** `cmsapiportal.hmhs.com`
- **Getting started:** `cmsapiportal.hmhs.com/highmark-getting-started`
- **OAuth:** OAuth 2.0 + JWT (sandbox uses API key only — no OAuth needed for testing)
- **Sandbox org code:** `3wA5yE7XCiilX737K4j7MxiR1WM8Pjpn`
- **Notes:** 1,500+ developers registered. Active community. Covers Highmark + BCBS Wyoming.
- **Status for Beni:** Not yet registered

---

### Blue Shield of California (separate from Anthem)
- **Portal:** `devportal-dev.blueshieldca.com/bsc/fhir-sandbox/interoperability`
- **OAuth:** SMART on FHIR
- **Notes:** One of few payers making all lines of business available via Patient Access API.
- **Status for Beni:** Not yet registered

---

### HCSC — BCBS of Texas, Illinois, Oklahoma, New Mexico, Montana
- **Portal:** `interoperability.hcsc.com`
- **Status:** ❌ **Do not integrate** — Flexpa scores: TX 6/100, IL 7/100, OK 8/100
- **Notes:** No known integrator has achieved working end-to-end FHIR data retrieval. Portal exists on paper only.

---

### Other BCBS Regional Plans

| Plan | Portal |
|------|--------|
| BCBS Minnesota | `fhir-developer.bluecrossmn.com` |
| BCBS North Carolina | `bluecrossnc.com` developer section |
| BCBS Florida | `developer.bcbsfl.com/interop/interop-developer-portal` |
| Horizon BCBS (NJ) | `developer.interop.horizonblue.com` |
| CareFirst BCBS (DC/MD/VA) | `developer.carefirst.com/product/fhir-patient-access` |
| Excellus BCBS (NY) | `news.excellusbcbs.com/developer-info/interoperability-apis` |
| Capital BlueCross (PA) | `capbluecross.com` developer section |

---

## Alternative: Flexpa (Middleware)

**`flexpa.com`** — normalizes connections to 100+ payers behind a single API. Instead of integrating each payer individually, connect once to Flexpa and get access to all supported payers.

**Trade-offs:**
- Pro: Saves months of individual payer integrations
- Pro: Handles OAuth flows, token management, data normalization
- Con: Adds a vendor dependency and cost (~usage-based pricing)
- Con: Less control over the raw FHIR data

Worth evaluating once Aetna sandbox is working — Flexpa can be added as a parallel path.

---

## Registration Priority for Beni

1. ✅ **Aetna** — submitted, awaiting approval
2. 🔜 **Humana** — register next, instant credentials
3. 🔜 **Cigna** — register next, email-based credentials
4. 🔜 **Anthem** — self-serve sandbox, register when ready for ESI focus
5. ⏳ **UnitedHealthcare** — register when above are working, budget extra time
6. ⏳ **Kaiser** — register via Epic app ecosystem when ready
7. ❌ **HCSC plans** — skip until they fix their implementation
