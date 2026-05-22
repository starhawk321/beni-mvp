# BCBS State-by-State FHIR API Reference

Last updated: May 2026

## Key Insight: Parent Companies Reduce the Problem

BCBS is 33 independent plans but many share parent companies with unified APIs.
**6 parent integrations cover ~30 states.** The rest are truly independent.

---

## Group 1 — Anthem / Elevance Health
**~45M members · 14 states · ONE developer portal**

The highest-priority integration after CMS. One app registration covers all states below.

| State | Plan Name |
|---|---|
| California | Anthem Blue Cross |
| Colorado | Anthem Blue Cross and Blue Shield |
| Connecticut | Anthem Blue Cross and Blue Shield |
| Georgia | Anthem Blue Cross and Blue Shield |
| Indiana | Anthem Blue Cross and Blue Shield |
| Kentucky | Anthem Blue Cross and Blue Shield |
| Maine | Anthem Blue Cross and Blue Shield |
| Missouri | Anthem Blue Cross and Blue Shield |
| Nevada | Anthem Blue Cross and Blue Shield |
| New Hampshire | Anthem Blue Cross and Blue Shield |
| New York | Anthem Blue Cross Blue Shield |
| Ohio | Anthem Blue Cross and Blue Shield |
| Virginia | Anthem Blue Cross and Blue Shield |
| Wisconsin | Anthem Blue Cross and Blue Shield |

- **Developer portal:** https://developer.anthem.com
- **Registration:** Requires EIN, legal business name, privacy policy URL, app description
- **FHIR base (sandbox):** TBD — check developer portal after registration
- **OAuth type:** Standard OAuth 2.0 + SMART on FHIR
- **Status:** Needs LLC + EIN before registration can be completed
- **Notes:** Requires significant app information. Most valuable single BCBS integration.

---

## Group 2 — HCSC (Health Care Service Corporation)
**~16M members · 5 states · ONE developer portal**

| State | Plan Name |
|---|---|
| Illinois | Blue Cross and Blue Shield of Illinois |
| Montana | Blue Cross and Blue Shield of Montana |
| New Mexico | Blue Cross and Blue Shield of New Mexico |
| Oklahoma | Blue Cross and Blue Shield of Oklahoma |
| Texas | Blue Cross and Blue Shield of Texas |

- **Developer portal:** https://developers.hcsc.com (unconfirmed — may require account)
- **FHIR base:** TBD
- **OAuth type:** SMART on FHIR
- **Status:** Not yet registered
- **Notes:** Second largest independent BCBS parent. TX + IL alone = ~12M members.

---

## Group 3 — Highmark
**~6M members · 4 states**

| State | Plan Name |
|---|---|
| Delaware | Highmark Blue Cross Blue Shield Delaware |
| New York (Western) | Highmark Blue Cross Blue Shield of Western NY |
| New York (NE) | Highmark Blue Shield of Northeastern NY |
| Pennsylvania | Highmark Blue Cross Blue Shield / Highmark Blue Shield |
| West Virginia | Highmark Blue Cross Blue Shield West Virginia |

- **Developer portal:** https://developer.highmark.com (unconfirmed)
- **Status:** Not yet registered
- **Notes:** PA is the main market. May share a portal across all Highmark entities.

---

## Group 4 — CareFirst BlueCross BlueShield
**~3.5M members · DC, MD, VA**

| State/Region | Plan Name |
|---|---|
| Washington DC | CareFirst BlueCross BlueShield |
| Maryland | CareFirst BlueCross BlueShield |
| Virginia (northern) | CareFirst BlueCross BlueShield |

- **Developer portal:** https://developers.carefirst.com (unconfirmed)
- **Status:** Not yet registered
- **Notes:** Covers the DC metro area. One registration likely covers all three.

---

## Group 5 — Regence / Cambia Health
**~3M members · 4 western states**

| State | Plan Name |
|---|---|
| Idaho | Regence BlueShield of Idaho |
| Oregon | Regence BlueCross BlueShield of Oregon |
| Utah | Regence BlueCross BlueShield of Utah |
| Washington | Regence BlueShield |

- **Developer portal:** https://developer.regence.com (unconfirmed)
- **Parent company:** Cambia Health Solutions
- **Status:** Not yet registered
- **Notes:** Pacific Northwest focus. One Cambia/Regence registration likely covers all four.

---

## Group 6 — Premera Blue Cross
**~2.5M members · 2 states**

| State | Plan Name |
|---|---|
| Alaska | Premera Blue Cross Blue Shield of Alaska |
| Washington | Premera Blue Cross |

- **Developer portal:** https://developer.premera.com (unconfirmed)
- **Notes:** WA has both Regence and Premera — different plan networks.

---

## Group 7 — Wellmark
**~2.2M members · 2 states**

| State | Plan Name |
|---|---|
| Iowa | Wellmark Blue Cross and Blue Shield |
| South Dakota | Wellmark Blue Cross and Blue Shield |

- **Developer portal:** TBD
- **Notes:** Iowa + South Dakota only. Smaller footprint.

---

## Independent Plans (one plan per state)

These require individual registrations with no shared parent portal.

| State | Plan | Members (est.) | Developer Portal |
|---|---|---|---|
| **Florida** | Florida Blue | ~5M | https://developer.floridablue.com (unconfirmed) |
| **North Carolina** | BCBS of NC | ~4M | https://developer.bcbsnc.com |
| **New Jersey** | Horizon BCBS NJ | ~3.6M | https://developer.horizonblue.com (unconfirmed) |
| **Massachusetts** | BCBS of MA | ~3M | https://developer.bluecrossma.com (unconfirmed) |
| **Michigan** | BCBS of Michigan | ~4.5M | https://developer.bcbsm.com (unconfirmed) |
| **Minnesota** | BCBS of MN | ~2.7M | https://fhir-developer.bluecrossmn.com ✓ **In progress** |
| **Tennessee** | BCBS of TN | ~3M | TBD |
| **Louisiana** | BCBS of Louisiana | ~1.8M | TBD |
| **South Carolina** | BCBS of SC | ~1.6M | TBD |
| **Nebraska** | BCBS of Nebraska | ~0.7M | TBD |
| **Kansas** | BCBS of Kansas | ~0.9M | TBD |
| **Alabama** | BCBS of Alabama | ~3M | TBD |
| **Arizona** | BCBS of Arizona | ~1.5M | TBD |
| **Arkansas** | Arkansas BCBS | ~0.8M | TBD |
| **Hawaii** | BCBS of Hawaii | ~0.7M | TBD |
| **Mississippi** | BCBS of Mississippi | ~0.5M | TBD |
| **North Dakota** | BCBS of ND | ~0.4M | TBD |
| **Rhode Island** | BCBS of RI | ~0.6M | TBD |
| **Vermont** | BCBS of Vermont | ~0.2M | TBD |
| **Wyoming** | BCBS of Wyoming | ~0.1M | TBD |
| **Puerto Rico** | BCBS of Puerto Rico | ~1M | TBD |
| **Pennsylvania** | Independence Blue Cross | ~8M | https://developer.ibx.com (unconfirmed) |
| **Pennsylvania** | Capital Blue Cross | ~0.6M | TBD |

---

## Recommended Integration Priority

Given registration requirements (needs EIN/LLC) and member coverage:

| Priority | Plan | Members | Blocker |
|---|---|---|---|
| 1 | **Anthem/Elevance** | 45M | Needs LLC + EIN |
| 2 | **HCSC** | 16M | Needs LLC + EIN |
| 3 | **Independence Blue Cross (PA)** | 8M | Needs LLC + EIN |
| 4 | **BCBS Michigan** | 4.5M | Needs LLC + EIN |
| 5 | **Florida Blue** | 5M | Needs LLC + EIN |
| 6 | **BCBS NC** | 4M | Needs LLC + EIN |
| 7 | **Highmark** | 6M | Needs LLC + EIN |
| 8 | **CareFirst** | 3.5M | Needs LLC + EIN |
| 9 | **Regence/Cambia** | 3M | Needs LLC + EIN |
| —  | **Aggregator (1upHealth)** | All | $50K+/yr, post-funding |

**Current status:** CMS ✓, Cigna ✓, BCBS MN (sandbox blocked — BCBS support needed)

**Next step:** Form LLC → get EIN → register Anthem (covers 14 states in one shot)

---

## Notes

- All BCBS plans are required by CMS Interoperability Rule (2021) to offer Patient Access APIs
- All use SMART on FHIR / OAuth 2.0 — same standard, different endpoints and credentials
- Developer portal URLs marked "unconfirmed" need to be verified manually
- Registration timelines vary: some approve same-day (sandbox), others take 1–4 weeks
- Most require: EIN, legal business name, privacy policy URL, redirect URIs, app description
