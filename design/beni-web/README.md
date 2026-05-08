# Beni Web App — UI Kit

A pixel-faithful recreation of the Beni MVP web app, evolved to the warm
positive-energy palette defined in `colors_and_type.css`.

## What's in here

| File                  | Purpose                                                          |
|-----------------------|------------------------------------------------------------------|
| `index.html`          | Click-thru prototype — Login → Signup → Onboarding → Dashboard   |
| `Shell.jsx`           | Page chrome (top bar, page wrap)                                 |
| `Auth.jsx`            | Auth-card layout with logo + tagline (Login / Signup / Confirm)  |
| `Onboarding.jsx`      | "Connect your insurance" with the 5 supported insurers           |
| `Dashboard.jsx`       | Logged-in dashboard: hero balance, account cards, claims feed    |
| `Primitives.jsx`      | Button, Field, Chip, Badge, Card, Toast — shared bits            |

## Source

- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
- `app/(app)/dashboard/page.tsx`, `app/(app)/onboarding/page.tsx`
- `docs/fhir-apis.md` — UHC, Aetna, Cigna, Anthem/BCBS, Humana

## Notes

- The MVP currently uses Tailwind defaults (`blue-600`, `gray-50`,
  `rounded-2xl` / `rounded-lg`). This kit keeps the same component anatomy
  and copy but re-skins to the cream/navy/coral palette. If the current
  Tailwind aesthetic is intentional, we should pull these back; flagged.
- Dashboard + onboarding pages are still stubs in the codebase, so those
  screens are **proposed** designs based on the product description.
