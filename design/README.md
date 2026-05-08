# Beni Design System

> **Beni** — a healthcare app that's a one-stop solution to view your benefits and manage all healthcare accounts from one place: insurance, dental, vision, FSA, HSA, and more.
>
> Tagline (from the codebase): *"Understand your health insurance, finally."*

This folder is the design system for Beni. It contains everything an
agent or designer needs to make on-brand visuals: foundations (color,
type, spacing, motion), brand assets (logo, illustrations, patterns),
and a high-fidelity UI kit reproducing the Beni web app screens.

---

## Sources

- **GitHub:** [`starhawk321/beni-mvp`](https://github.com/starhawk321/beni-mvp) — Next.js 16 + React 19 + Tailwind 4 + Supabase
  - `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` — implemented
  - `app/(app)/dashboard/page.tsx`, `app/(app)/onboarding/page.tsx` — stubs
  - `docs/fhir-apis.md` — confirms the integration target (UnitedHealthcare, Aetna, Cigna, Anthem/BCBS, Humana via SMART on FHIR)
  - `middleware.ts` — auth gating + onboarding flow
- **Color brief:** "Power of Positive Energy" palette from color-hex.com/color-palette/78728 — five hues: navy `#004383`, sky `#0586c3`, sun `#ffff99`, peach `#ffc799`, coral `#ffa199`.

> ⚠️ The MVP currently uses Tailwind defaults (`blue-600` primary, `gray-50`
> canvas, `rounded-2xl`/`rounded-lg`). This design system is the **proposed
> evolution** to a warmer, more distinctly "Beni" palette. Component
> anatomy and copy stay close to the codebase.

---

## Index

| Path                       | What it is                                                |
|----------------------------|------------------------------------------------------------|
| `colors_and_type.css`      | All design tokens (colors, type, spacing, radii, shadows, motion) and semantic type classes (`.t-h1`, `.t-numeric-xl`, …). |
| `assets/`                  | Logo, mark, blob pattern, spot illustrations.              |
| `preview/`                 | 25 design-system cards rendered in the Design System tab.  |
| `ui_kits/beni-web/`        | High-fidelity recreation of the web app (login → dashboard). |
| `SKILL.md`                 | Cross-compatible skill manifest for Claude Code reuse.     |

---

## Content Fundamentals

**Voice — warm, plain-spoken, on your side.** Beni's job is to translate
the impenetrable language of insurance into something a normal person
can act on. Default to "you", never "the user" or "the member".

- **Casing:** Sentence case for every UI string except product names.
  Buttons read "Add a benefit", not "Add A Benefit". Headlines look like
  spoken sentences.
- **Punctuation:** Periods on full sentences in body copy. No exclamation
  marks (we're warm, not bubbly). Em-dashes are fine.
- **Numbers:** Always tabular numerals. Money always shows the currency
  sign and two decimals when exact (`$1,842.50`), zero decimals on round
  marketing claims (`Save up to $3,000 a year`).
- **Tone moves:**
  - *Warm reassurance:* "You've got $1,842 left in your FSA. Want help spending it before December?"
  - *Honest defaults:* "Read-only access. Beni can see your plan, claims, and benefits. We can't change anything on your insurer's side."
  - *No jargon:* prefer "claim" over "EOB" in user-visible copy. Surface
    the technical term once in tertiary text if it's needed.
- **Emoji:** very sparingly. The codebase uses one (📬 on the
  signup-confirmation card) and it's tasteful. We prefer Lucide icons or
  small spot illustrations for warmth instead.

**What to avoid**

- "Welcome to your dashboard" / "Manage your account" generic SaaS-isms
- All-caps shouting (overlines are tracked-out 11 px caps, that's it)
- Marketing puffery ("Take control of your health journey")
- Jargon-first copy ("Contributory FY24 forfeiture deadline")

---

## Visual Foundations

**Surfaces.** Default canvas is **cream** (`#FBF6EE`), not white. White
is reserved for raised cards, fields, and modals. Cream gives the
product a calm, paper-like baseline that sets it apart from typical
fintech blue-on-grey.

**Color rhythm.**
- **Navy** anchors brand, primary buttons, and the hero balance card.
- **Sky** is the action accent — links, focus rings, "Connect insurance" highlights.
- **Coral / peach / sun** are reserved for plan-type accents (FSA / HSA / Life), illustration, and joyful moments (claim approved, savings unlocked).
- Avoid colored card backgrounds for normal containers — keep cards on white over cream. Color enters through the 6 px account accent stripe and the chip badges.

**Typography.**
- **Manrope** (sans) for everything functional. Weights 400/500/600/700/800.
- **Instrument Serif italic** for warmth moments — greetings, "ready for you" cards, hero questions. Used as accents, never paragraphs.
- **JetBrains Mono** for plan IDs and labels in design specs.
- Numerics use `font-variant-numeric: tabular-nums`. Always.
- Dollar amounts on cards: 32 px Manrope 700 with `-0.015em` tracking.

**Spacing.** 4-pt grid. Cards use 22 px / 24 px internal padding;
section gutters are 24 px. Page horizontal padding is 28 px on web.

**Radii.**
- 12 px on inputs and small surfaces.
- 16 px on form cards and lists.
- 20 px on default cards.
- 28 px on hero / sheet-like cards.
- Buttons and chips are pill (999).

**Borders.** Hairlines on cream are `#E8E3D8` (warm gray, never pure
gray). Strong borders `#D6CFC1`. We never use cool gray borders — they
clash with the cream canvas.

**Shadows.** Four levels (`--shadow-1`…`-4`). Cards rest at 1; floating
sheets and the hero card sit at 2; menus at 3; modals at 4. Shadows are
soft, neutral-tinted (rgba 13/27/42), never colored.

**Motion.**
- Standard easing `cubic-bezier(0.2, 0.8, 0.2, 1)` (snappy, no bounce).
- Emphasis easing `cubic-bezier(0.16, 1, 0.3, 1)` for entrances of hero / important elements.
- Durations: 120 / 200 / 320 / 520 ms. Default state changes use 200 ms.
- Buttons scale down to 0.98 on press for tactile feedback.
- We do **not** bounce. We do **not** spring. Healthcare needs to feel calm.

**Hover & press states.**
- Primary buttons → darker navy on hover (`--action-primary-hover`), 0.98 scale on press.
- Secondary cards/rows → border darkens to navy and shadow elevates from 1 → 2.
- Ghost links → light navy tint background (`--beni-navy-12`).
- Disabled → 55% opacity. No grey-on-grey.

**Focus.** 3 px sky ring (`--shadow-focus`). Always visible, never removed.

**Backgrounds & illustration.** No photography in the system. Hero
moments use a soft warm gradient blob (`assets/beni-pattern-blobs.svg`)
behind navy or cream cards. Empty states use spot illustrations
(`illus-piggy.svg`, `illus-care.svg`) — friendly, hand-drawn-feeling,
not corporate vector-people. We avoid generic stock illustration libraries.

**Transparency / blur.** Used in two places only: the navy hero card's
inner pill (`rgba(255,231,194,.18)` with `backdrop-filter: blur(4px)`),
and the floating dashboard nav. Otherwise everything is solid.

**Cards — what they look like.** White background, 1 px hairline
(`#E8E3D8`), 20 px radius, shadow-1 at rest, shadow-2 on hover.
No colored left border by default — that pattern is reserved for the
**account card** (6 px solid stripe in the account-type accent).
Never use the "rounded card with one colored left border accent" trope
elsewhere — it's a meaningful signal here, not decoration.

**Layout.** The web app is a 1200 px max-width single column with a
sticky top nav. The dashboard splits into a 1fr / 360 px main+sidebar
grid. Hero card spans full width. Account cards are a 2-column grid.

---

## Iconography

**Primary set: Lucide.** Loaded from CDN
(`https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`). Stroke
weight **1.75 px**, ink color (`var(--fg-1)`). The codebase doesn't
yet ship its own icon set, so Lucide is our starting point — flagged.

Common icons used in the product: `heart-pulse`, `stethoscope`, `pill`,
`eye`, `smile`, `wallet`, `receipt`, `credit-card`, `file-text`,
`shield-check`, `bell`, `calendar`, `search`, `user-round`, `settings`,
`arrow-up-right`, `chevron-right`.

**Logos & marks.** Custom; see `assets/beni-logo-wordmark.svg`,
`assets/beni-mark.svg`, `assets/beni-mark-cream.svg`. The mark is a
"+" inside a navy squircle with a coral dot — a deliberately literal
"healthcare plus", warmed up.

**Emoji.** One sanctioned use — the 📬 on the signup-confirmation card,
inherited from the codebase. Otherwise no emoji in product chrome.

**Spot illustrations.** Two starter illustrations live in `assets/`
(`illus-piggy.svg` for saving moments, `illus-care.svg` for human
moments). These are placeholders — replace with a commissioned
illustration set as the product matures. Flagged.

---

## Substitutions / things flagged for you

1. **Fonts ship from Google Fonts via `@import`** — no `.ttf`/`.woff2`
   in `fonts/`. If you want self-hosted files, send them and we'll wire
   them up.
2. **Logo is a proposal, not a real Beni mark.** The codebase has no
   logo yet — please send the real one when it exists.
3. **Spot illustrations are quick starters.** Commission a real set.
4. **Lucide is a stand-in icon system.** Swap when the product picks one.
5. **Onboarding & dashboard screens are *proposed designs*** — those
   pages are stubs in the MVP. The login and signup recreations are
   faithful to the actual code, just re-skinned.

---

## How to use this

If you're an agent making something for Beni:

1. Drop `colors_and_type.css` into your HTML head.
2. Wrap your root in `class="beni"` to inherit cream canvas + sans default.
3. Use semantic type classes (`.t-h1`, `.t-numeric-xl`) over raw vars.
4. Pull primitives from `ui_kits/beni-web/Primitives.jsx` — Button, Field, Chip, Badge, Card.
5. Drop logos / illustrations from `assets/` rather than redrawing.
