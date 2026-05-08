# FHIR Patient Access APIs — Major Insurers

All five major insurers are required by the CMS Interoperability Rule (2021) to expose FHIR R4 Patient Access APIs. All use **SMART on FHIR** (OAuth 2.0 + FHIR R4), so integrating one makes the others mostly config changes.

---

## UnitedHealthcare
- **Developer portal:** developer.uhc.com
- **FHIR resources:** Patient, Coverage, ExplanationOfBenefit, Claim
- **OAuth:** PKCE flow, user authenticates via myuhc.com credentials
- **Sandbox:** Yes, available after app registration
- **MVP ease:** Moderate — large but well-documented

## Aetna (CVS Health)
- **Developer portal:** developerportal.aetna.com
- **FHIR resources:** Patient, Coverage, ExplanationOfBenefit
- **OAuth:** SMART on FHIR
- **Sandbox:** Yes, synthetic test data available
- **MVP ease:** Good — one of the more developer-friendly portals ✓ recommended

## Cigna
- **Developer portal:** developer.cigna.com
- **FHIR resources:** Patient, Coverage, ExplanationOfBenefit
- **OAuth:** SMART on FHIR
- **Sandbox:** Yes
- **MVP ease:** Good — clean documentation ✓ recommended

## Anthem / Blue Cross Blue Shield
- **Developer portal:** developer.anthem.com
- **FHIR resources:** Patient, Coverage, ExplanationOfBenefit, Observation
- **OAuth:** SMART on FHIR
- **Sandbox:** Yes
- **MVP ease:** Moderate — BCBS is a federation, each state plan differs slightly

## Humana
- **Developer portal:** developer.humana.com
- **FHIR resources:** Patient, Coverage, ExplanationOfBenefit
- **OAuth:** SMART on FHIR
- **Sandbox:** Yes
- **MVP ease:** Good — straightforward registration

---

## Key FHIR Resources for Beni

| Resource | What it gives us |
|---|---|
| `Patient` | Member name, DOB, member ID |
| `Coverage` | Plan name, type, effective dates, network |
| `ExplanationOfBenefit` | Claims, amounts paid, deductible applied, OOP progress |

## MVP Recommendation

Start with **Aetna or Cigna** — best developer experience, sandbox available, clean docs.

Once one integration works, others are config changes (same SMART on FHIR standard).

---

*Source: Training data as of August 2025. Verify portal URLs and registration flows before implementing.*
