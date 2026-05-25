# Handoff: Beni Dashboard (Home)

## Overview
The Beni "Home" dashboard is the post-login landing surface for a member with multiple connected healthcare plans. It summarizes plan-year coverage, surfaces personalized callouts, lists each connected plan with progress against deductible and out-of-pocket maximum, teases the upcoming HSA/FSA "Spending power" feature, and shows recent claims activity. Beni's voice is **intelligent, warm, slightly literary** — not corporate, not gamified — and the design avoids generic health-app tropes (no green checkmarks, no celebratory confetti, no aggressive iconography).

This handoff covers two breakpoints:
- **Desktop** (≥ 1024px) — single-column main content, 1280px reference width, ~1200px max content width centered with 44px horizontal padding.
- **Mobile** (≤ 480px) — single column, 412px reference width, 18px horizontal padding, bottom tab bar.

There is no tablet-specific layout; treat anything between as desktop with adjusted padding.

## About the Design Files
The files in this bundle are **design references created in HTML/React (Babel-in-browser)** — prototypes showing intended look and behavior, not production code to copy directly. They render inside a `<DesignCanvas>` shell that lets the designer view desktop and mobile side-by-side; that shell is *not* part of the product.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, React Native, etc.) using its established patterns, design tokens, and component library. If no environment exists yet, choose the framework appropriate to the project. Do not transplant the inline-styled JSX in `dashboard.jsx` verbatim — the design tokens, layout values, and copy are the source of truth; the code is just one expression of them.

## Fidelity
**High-fidelity.** Colors, type ramp, spacing, and copy are final. Recreate pixel-perfectly using the target codebase's existing system. The only deliberately placeholder section is **Spending power**, which is a "coming soon" tease.

---

## Screens / Views

### Global chrome

#### Desktop top nav
- **Layout**: horizontal flex, space-between, 20px top / 28px bottom padding, full content width.
- **Left cluster** (gap 36px):
  - **Wordmark**: 26×26 rounded square (radius 8) filled with the brand gradient (`linear-gradient(135deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)`) containing a `+` glyph (Manrope 800, 16px, color `#0F1A2C`). Word "beni" follows in Instrument Serif italic, 28px, color `#F4ECDE`, letter-spacing `-0.02em`.
  - **Primary nav** (flex, gap 4px): `Home` (active), `Plans`, `Claims`, `Records`. Each is a pill: padding `8px 16px`, radius 999, Manrope 600 / 14px. Active = bg `rgba(255,255,255,0.06)`, color `#F4ECDE`. Inactive = transparent, color `rgba(244,236,222,0.55)`.
- **Right cluster** (gap 12px): search icon button, notifications icon button, then user avatar — 36×36 circle, gradient `linear-gradient(135deg, #FFC4BE 0%, #E55BB8 100%)`, initial "S" in Manrope 700 / 14px, color `#1A0E2E`.
- **Icon buttons**: 36×36 circle, `1px solid rgba(255,255,255,0.10)` border, transparent bg, color `#F4ECDE`, font-size 16.

#### Mobile top nav
- Wordmark scaled down: 22×22 mark, 24px Instrument Serif "beni".
- Right cluster: search icon (34×34) + avatar (34×34). No nav links — those move to a bottom tab bar.

#### Mobile bottom tab bar
- Container: `rgba(20,30,51,0.92)` bg, `1px solid rgba(255,255,255,0.08)`, radius 999, 6px inner padding, 4-column grid.
- Items: `Home` (active), `Plans`, `Claims`, `You`.
- Active tab pill: full brand gradient `linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)`, text color `#0F1A2C`.
- Inactive: transparent, color `rgba(244,236,222,0.7)`.
- Each tab: Manrope 600 / 13px, padding `10px 6px`, radius 999, centered.

#### Page background
- `#07101C` (deep navy, brand primary background) for the page. The shade `#0a1320` is only used for the design-canvas shell — production background is `#07101C`.

---

### 1. Hero card

A single full-width dark card holding the user greeting and three horizontal stats summarizing the plan year.

- **Background**: `#0F1A2C` (one notch lighter than page bg so the card lifts).
- **Border**: `1px solid rgba(255,255,255,0.06)`.
- **Radius**: 28px desktop, 24px mobile.
- **Padding**: `36px 40px 32px` desktop, `26px 22px 24px` mobile.
- **Overflow**: hidden (for blob accents).

**Decorative gradient blobs** (absolute, behind content, `pointer-events: none`):
- Top-right blob: radial gradient `rgba(155,91,255,0.55) → rgba(229,91,184,0.32) → transparent 70%`. Desktop 520×520, offset right `-80px` top `-200px`. Mobile 360×360, right `-120px` top `-160px`. 2px blur.
- Bottom-left blob: radial gradient `rgba(122,231,255,0.34) → rgba(91,168,255,0.18) → transparent 72%`. Desktop 380×380, left `-40px` bottom `-180px`. Mobile 280×280, left `-80px` bottom `-140px`.

**Content** (z-indexed above blobs):
- **Eyebrow**: "PLAN YEAR SO FAR · 2026" — Manrope 600 / 11px, letter-spacing `0.16em`, uppercase, color `rgba(255,255,255,0.5)`.
- **Headline**: "Hello, Sarthak. Here's where your *coverage* stands."
  - Manrope 700, color `#F4ECDE`, letter-spacing `-0.02em`, line-height 1.1.
  - Desktop 42px (single line), mobile 30px (second sentence wraps to its own line via `display: block`).
  - The word "coverage" is rendered in Instrument Serif italic, 400 weight, with the brand gradient clipped to text: `linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)` + `background-clip: text` + `color: transparent`. Keep the same font-size as surrounding sans (the serif optically reads larger anyway).
- **Stats row**:
  - Desktop: 3 equal columns, separated by `1px solid rgba(255,255,255,0.10)` left borders on columns 2 and 3. Column padding-left 36px on all but first. Top margin 36px.
  - Mobile: stacked, separated by `1px solid rgba(255,255,255,0.08)` top borders on all but first, with 18px padding-top between. Top margin 26px.
  - Each stat:
    - **Label**: Manrope 500 / 12px, `rgba(255,255,255,0.55)`, letter-spacing `0.02em`.
    - **Value**: Manrope 700, tabular-nums, color `#FBF6EE`, letter-spacing `-0.025em`, line-height 1. Desktop 46px, mobile 40px. Margin-top 6px.
    - **Sub**: Manrope 400 / 13px, `rgba(255,255,255,0.55)`. Margin-top 8px.

**Stat content** (from the realistic data):
| Label | Value | Sub |
|---|---|---|
| Insurance paid | `$8,420` | across 2 plans |
| Out of pocket | `$1,247` | 14% of total cost |
| Claims | `14` | this plan year |

> Note: Beni intentionally does **not** show a combined deductible or OOP-max number here. Those are per-plan and not meaningfully summable. If a future iteration adds an aggregate, it must come with a footnote.

---

### 2. For you

A row of personalized callout cards. Two by default; expand to a horizontal scroll once there are >2.

- **Section header** (shared component — see *Shared components* below):
  - Title: "For you" — Manrope 700 / 20px, color `#F4ECDE`, letter-spacing `-0.01em`.
  - Sub: "2 worth a look" (count) — Manrope 400 / 13px, `rgba(244,236,222,0.45)`.
  - No action link.
- **Grid**: 2 columns desktop, 1 column mobile. Gap 16px desktop / 12px mobile.

**Card**:
- Radius 20.
- Padding `22px 24px 20px` desktop / `20px 20px 18px` mobile.
- Ink color `#1A0E2E` for all text on these cards.
- Backgrounds rotate through brand pastels (assign in order):
  1. `#D8CDF2` (purple pastel)
  2. `#FFC4BE` (peach pastel)
- **Title**: Manrope 700, 18.5px desktop / 17px mobile, letter-spacing `-0.01em`, line-height 1.25.
- **Body**: Manrope 400 / 14px, `rgba(26,14,46,0.78)`, line-height 1.45, `text-wrap: pretty`. Margin-top 10px.
- **CTA button**: 34px tall, radius 999, padding `0 14px`. Border `1px solid rgba(26,14,46,0.18)`, bg `rgba(255,255,255,0.55)`, color `#1A0E2E`. Manrope 600 / 13px. Trailing `→` arrow at 14px. Margin-top 16px.

**Card content** (from data):
1. **Card 1 (purple)**
   - Title: "Your Medicare deductible is met."
   - Body: "Preventive visits and most covered services run at 100% for the rest of the plan year."
   - CTA: "See what's free now →"
2. **Card 2 (peach)**
   - Title: "Dr. Sarah Chen wants $135."
   - Body: "Cigna processed it as patient responsibility on Aug 24. We can walk you through whether to dispute."
   - CTA: "Review claim →"

---

### 3. Your plans

Two-column grid of plan cards. Each card uses one of the brand pastel surfaces. Card design must scale to N plans (just grow the grid).

- **Section header**: Title "Your plans", sub "2 connected", action "Add a plan →" (right-aligned, color `#7AE7FF`).
- **Grid**: 2 cols desktop, 1 col mobile. Gap 16 / 14.

**Plan card structure**:
- Radius 22.
- Padding `26px 26px 22px` desktop / `22px 22px 20px` mobile.
- Backgrounds are **per-plan** (not rotating):
  - Medicare: bg `#C7E5F2` (light cyan), ink `#0B2A3D`, accent `#5BA8FF`.
  - Cigna PPO Plus: bg `#FFC4BE` (peach), ink `#3D1612`, accent `#E55BB8`.
  - (Additional carriers reuse remaining brand pastels `#B8D0E8` and `#D8CDF2` and a sensible ink/accent.)
- **Header** (flex, space-between, gap 10):
  - Left:
    - Carrier overline: Manrope 700 / 11px, letter-spacing `0.16em`, uppercase, color `ink` at 55% opacity.
    - Plan name: Manrope 700, 21px desktop / 19px mobile, letter-spacing `-0.01em`, color `ink`. Margin-top 4px.
  - Right: member ID in mono (JetBrains Mono or whatever the codebase uses) 11px, `ink` at 55% opacity, margin-top 6px to align with plan name baseline.
- **Mini-stats row** (3 columns, gap 8, margin-top 22 desktop / 18 mobile):
  - Each mini-stat:
    - Label: Manrope 500 / 11px, `ink` at 60% opacity, letter-spacing `0.02em`.
    - Value: Manrope 700 / 22px, letter-spacing `-0.015em`, tabular-nums, color `ink`. Margin-top 4px.
  - Columns: "Ins. paid" / "OOP" / "Claims".
- **Meters** (margin-top 22, flex column gap 14):
  - Each meter:
    - Top row: label (`ink` at 72%, Manrope 600 / 12.5px) and right value (`ink`, Manrope 600 / 12.5px, tabular-nums).
    - If status is "met", prepend a 6×6 dot in the plan's `accent` color before the right value.
    - Bar: 4px tall, radius 999, track `rgba(0,0,0,0.10)`, fill `accent`, width = `pct%`.

**Plan card content** (from data):

**Medicare card** (cyan pastel)
- Carrier: "MEDICARE"
- Plan: "Part A + Part B"
- Member ID: `1EG4-TE5-MK72`
- Mini-stats: Ins. paid `$6,200` · OOP `$847` · Claims `8`
- Meter 1 — Deductible: right value "Met" with accent dot, bar 100% filled.
- Meter 2 — Out-of-pocket max: right value "$0 of $6,700", bar 0%.

**Cigna card** (peach pastel)
- Carrier: "CIGNA"
- Plan: "PPO Plus"
- Member ID: `U7244 81902 01`
- Mini-stats: Ins. paid `$2,220` · OOP `$400` · Claims `6`
- Meter 1 — Deductible: right value "$1,200 of $3,000", bar 40%.
- Meter 2 — Out-of-pocket max: right value "$400 of $8,150", bar ~5%.

> Numbers are formatted with `$` prefix, no decimals for round amounts (`$6,200`), commas as thousands separator. The "$X of $Y" pattern uses `fmtMoney`.

---

### 4. Spending power (placeholder)

A "coming soon" tease for the HSA/FSA module. Visually distinct from real cards by being dark + dashed.

- **Section header**: Title "Spending power", sub "HSA · FSA", no action.
- **Card**:
  - Background `#141E33` (darker than hero, slightly lifted from page).
  - Border `1px dashed rgba(155,91,255,0.45)`.
  - Radius 22.
  - Padding `28px 30px` desktop / `24px 22px` mobile.
  - Layout: flex row on desktop (align-center, gap 24), stacked on mobile.
  - Decorative blob: absolute top-right, 220×220, radial gradient `rgba(155,91,255,0.30) → transparent 70%`.
- **Left content**:
  - Headline: Instrument Serif italic, 26px desktop / 22px mobile, color `#F4ECDE`, line-height 1.2, letter-spacing `-0.01em`. Copy: *"Soon — your HSA and FSA balances, side by side with your bills."*
  - Subcopy: Manrope 400 / 14px, color `rgba(244,236,222,0.66)`, line-height 1.5, max-width 520px, margin-top 10. Copy: "We'll surface what's eligible, what's expiring, and which account to spend from. Connect an account to get on the early list."
- **Right buttons** (flex, gap 10, wrap):
  - **Primary**: "Connect HSA" — 40px tall, padding `0 18px`, radius 999, no border, bg = full brand gradient `linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)`, color `#0F1A2C`, Manrope 700 / 13px.
  - **Secondary**: "Add FSA manually" — 40px tall, padding `0 18px`, radius 999, border `1px solid rgba(244,236,222,0.18)`, transparent bg, color `#F4ECDE`, Manrope 600 / 13px.

---

### 5. Recent activity

Vertical stack of claim cards on the dark page surface.

- **Section header**: Title "Recent activity", sub "3 of 14 claims", action "See all claims →".
- **Stack**: flex column, gap 10.

**Activity card**:
- Background `#141E33`.
- Border `1px solid rgba(255,255,255,0.06)`.
- Radius 18.
- Padding `18px 22px` desktop / `16px 18px` mobile.
- **Desktop layout**: 3-column grid `1fr auto auto`, gap 28, items aligned center.
- **Mobile layout**: stacked block — top region with provider + payer + meta, then a 14px-padded top-bordered row with the two figures left-aligned, no arrow button.

**Card content** (left → right on desktop):

1. **Provider block**:
   - Row 1 (flex, gap 10, wrap): provider name in Manrope 700 / 16px, color `#F4ECDE`, letter-spacing `-0.005em`. Followed by a **payer tag**.
   - Row 2: detail text — Manrope 400 / 13px, `rgba(244,236,222,0.55)`. Format: `{detail} · {date}`.

2. **Figures** (flex, gap 28 desktop / 24 mobile, right-aligned cells):
   - "Ins. paid" mini-figure: label Manrope 500 / 11px, `rgba(244,236,222,0.5)`. Value Manrope 700 / 17px, tabular-nums, color `#F4ECDE`. If $0, render `—` in `rgba(244,236,222,0.35)`.
   - "OOP" mini-figure: same structure, but if value > 0 color shifts to **peach `#FFC4BE`** to signal "you paid this". If $0, render `—` dim.
   - Min-width 86px so figures align.

3. **Arrow button** (desktop only): 36×36 circle, `1px solid rgba(255,255,255,0.10)`, transparent bg, `→` glyph color `#F4ECDE`. `aria-label="Open claim"`.

**Payer tag** (used inline with provider name):
- Pill: height 22, padding `0 9px`, radius 999, Manrope 600 / 11px, letter-spacing `0.02em`.
- Leading 5×5 dot.
- **cyan tone** (Medicare): bg `rgba(122,231,255,0.14)`, fg `#7AE7FF`, dot `#7AE7FF`.
- **peach tone** (Cigna PPO Plus): bg `rgba(255,196,190,0.16)`, fg `#FFC4BE`, dot `#E55BB8`.
- Future carriers should be assigned a tone consistent with their plan-card pastel.

**Claim content** (from data):
| Provider | Detail | Payer | Date | Ins. paid | OOP |
|---|---|---|---|---|---|
| Baptist Health | Outpatient procedure | Medicare (cyan) | Aug 31 | $1,375.00 | — |
| Dr. Sarah Chen | Office visit · specialist | Cigna PPO Plus (peach) | Aug 24 | — | $135.00 |
| Walgreens | Prescription · refill | Medicare (cyan) | Aug 18 | $42.00 | $8.00 |

Money formatting on activity figures uses `fmtMoneyD` — always 2 decimal places (e.g. `$1,375.00`). On the plan cards and hero, money is formatted with `fmtMoney` — no decimals on whole amounts.

---

### Shared components

#### SectionHeader
- Flex row, baseline-aligned, space-between, gap 12, bottom margin 14.
- Left: title (Manrope 700 / 20px, `#F4ECDE`, letter-spacing `-0.01em`) + optional subtitle (Manrope 400 / 13px, `rgba(244,236,222,0.45)`), gap 12, baseline-aligned.
- Right (optional): action link — Manrope 600 / 13px, color `#7AE7FF`, no underline, trailing `→`.

#### GradientWord
Inline span that renders text in Instrument Serif italic with the brand gradient clipped to the type. Used sparingly — currently only on "coverage" in the hero. Don't use it on more than one phrase per screen.

#### MeterBar
4px-tall pill with a fill. Two color modes: dark surface (track `rgba(255,255,255,0.18)`) and pastel surface (track `rgba(0,0,0,0.10)`). Fill always solid plan accent color.

---

## Interactions & Behavior

- **Section header action links** (e.g. "Add a plan", "See all claims") navigate to the matching sub-page.
- **For-you CTAs** trigger flow-specific routes: "See what's free now" → Coverage explainer for the affected plan. "Review claim" → Claim detail with dispute walkthrough.
- **Plan card** — entire card is a click target → plan detail page. No hover state on mobile; on desktop, raise the card 2px and brighten by 2% on hover, transition `transform 180ms ease, filter 180ms ease`.
- **Activity card arrow button** → claim detail. On mobile, the whole row is the tap target.
- **Connect HSA** opens the HSA connection flow. "Add FSA manually" opens a small drawer for entering employer + plan year.
- **Avatar** opens the account menu.
- **Animations on load**: gentle staggered fade+rise for each section, 200ms apart, 24px translate, 320ms `cubic-bezier(0.2, 0.8, 0.2, 1)`. Optional — skip if the codebase already has scroll/load motion conventions.
- **Hover states**: nav pills brighten background by ~4%. Buttons darken/lighten by ~6%. No scale transforms.
- **Empty/loading states**:
  - Hero: skeleton bars for the three stats (rounded rectangles, `rgba(255,255,255,0.08)`).
  - Plan cards: render the card chrome with skeleton bars for value/meter rows.
  - Activity: 3 skeleton cards by default.
- **Error states**: replace section body with an inline message — Manrope 500 / 14px, `rgba(244,236,222,0.65)`, and a small "Try again" link in `#7AE7FF`.
- **Responsive breakpoint**: switch from desktop layout to mobile at 720px. Single-column always; only the inner grids (For you, Your plans) collapse to 1 column.

## State Management
- `user` — display name and avatar derivation.
- `planYearTotals` — derived/summed from `plans[]`. Recomputed when plans change.
- `plans[]` — array of plan objects with carrier, plan name, memberId, balances, deductible (`{used, total, met}`), OOP max (`{used, total}`), bg/ink/accent tokens.
- `forYou[]` — server-driven list of personalized callouts. Each item has `kind`, `title`, `body`, `cta`, and a target route.
- `activity[]` — most recent N claims (default 3), each with provider, detail, payer (label + tone), date, `insPaid`, `oop`.
- All currency is integers/cents in the data layer; format at the view boundary.

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--page-bg` | `#07101C` | App background |
| `--surface-1` | `#0F1A2C` | Hero card |
| `--surface-2` | `#141E33` | Activity cards, Spending Power |
| `--ink-cream` | `#F4ECDE` | Primary text on dark |
| `--ink-cream-soft` | `#FBF6EE` | Hero stat values |
| `--pastel-cyan-light` | `#C7E5F2` | Medicare plan card |
| `--pastel-cyan` | `#B8D0E8` | Reserved (additional plan) |
| `--pastel-peach` | `#FFC4BE` | Cigna plan card, OOP accent text |
| `--pastel-purple` | `#D8CDF2` | "For you" card 1 |
| `--ink-navy` | `#0B2A3D` | Text on cyan-light |
| `--ink-plum` | `#3D1612` | Text on peach |
| `--ink-violet` | `#1A0E2E` | Text on purple |
| `--accent-sky` | `#7AE7FF` | Gradient stop 1, action links |
| `--accent-blue` | `#5BA8FF` | Gradient stop 2, Medicare bar |
| `--accent-purple` | `#9B5BFF` | Gradient stop 3 |
| `--accent-coral` | `#E55BB8` | Gradient stop 4, Cigna bar |
| `--brand-gradient` | `linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)` | Hero word, CTAs, mobile active tab |

Opacity tokens for cream-on-dark text: 0.55 (secondary), 0.45 (tertiary), 0.35 (disabled).

### Typography
- **Sans**: Manrope, weights 400/500/600/700/800. Default for all UI.
- **Display / Emphasis**: Instrument Serif, italic only, weight 400. Use **sparingly** for brand moments — wordmark, hero gradient word, the Spending Power headline. Never for body or buttons.
- **Mono**: codebase default (e.g. JetBrains Mono). Used only for member IDs.

Type ramp:
| Style | Family | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Hero title | Manrope | 42 / 30 | 700 | -0.02em | 1.1 |
| Section title | Manrope | 20 | 700 | -0.01em | 1.2 |
| Card title (For you) | Manrope | 18.5 / 17 | 700 | -0.01em | 1.25 |
| Plan name | Manrope | 21 / 19 | 700 | -0.01em | 1.2 |
| Stat value (hero) | Manrope | 46 / 40 | 700 | -0.025em | 1.0 |
| Mini-stat value | Manrope | 22 | 700 | -0.015em | 1.1 |
| Activity figure value | Manrope | 17 | 700 | -0.01em | 1.2 |
| Body | Manrope | 14 | 400 | normal | 1.45 |
| Meta / sub | Manrope | 13 | 400 | normal | 1.4 |
| Label / overline | Manrope | 11 | 600/700 | 0.02em or 0.16em (uppercase) | 1.2 |
| Display emphasis | Instrument Serif | 26 / 22 | 400 italic | -0.01em | 1.2 |

All currency uses `font-variant-numeric: tabular-nums`.

### Spacing
- Section gap: 36 desktop / 28 mobile.
- Card padding: 26–28px desktop / 22–24px mobile.
- Grid gaps: 16 desktop / 14 mobile for plan cards; 16 / 12 for For-you.
- Page horizontal padding: 44 desktop / 18 mobile.

### Radii
- Cards: 28 (hero), 22 (plan, spending power), 20 (for you), 18 (activity).
- Buttons / tags / pills: 999 (full pill).
- Wordmark mark: 8 (desktop) / 7 (mobile).

### Borders
- Card hairline on dark surfaces: `1px solid rgba(255,255,255,0.06)`.
- Stat dividers: `1px solid rgba(255,255,255,0.10)` (desktop) / `rgba(255,255,255,0.08)` (mobile).
- Spending-power dashed: `1px dashed rgba(155,91,255,0.45)`.

### Shadows
None. The design uses surface elevation (different navy shades) instead of drop shadows. Resist adding shadows.

## Assets
- **Brand wordmark + logo mark**: Beni's wordmark uses Instrument Serif italic; the "+" mark is rendered live in CSS using the brand gradient. SVG variants exist in the source design system (`beni-mark.svg`, `beni-logo-wordmark.svg`) and should be used in production rather than the CSS recreation.
- **Avatars**: gradient circle with the user's initial (no uploaded photos in this design). When a real photo exists, use it with a 1px outer ring `rgba(255,255,255,0.15)`.
- **Icons**: search and notifications are placeholder glyphs (`⌕`, `◔`) in the prototype — replace with the codebase's icon set (Phosphor, Lucide, or whichever is in use). 16–18px stroke icons centered in 36×36 buttons.

## Files
Files in this handoff:
- `Dashboard.html` — entry HTML (hosts the design canvas with desktop + mobile artboards).
- `dashboard.jsx` — all the dashboard components and the realistic data object. The source of truth for layout, copy, and tokens.
- `design-canvas.jsx` — the side-by-side canvas shell. **Not part of the product.** Ignore.
- `colors_and_type.css` — design-system stylesheet from the Beni system; provides Manrope + Instrument Serif font-faces and the CSS variables referenced in the JSX. Pull `--font-sans`, `--font-display`, `--font-mono` from here.
- `assets/beni-mark.svg` — brand mark SVG.

## Implementation notes / gotchas
- **Do not aggregate per-plan numbers across carriers** without an explicit footnote. Medicare and Cigna deductibles/OOP maxes live in separate domains.
- The gradient on the headline word is achieved via `background-clip: text` + `color: transparent`. Provide a fallback `color: #9B5BFF` for browsers that don't support it.
- Tabular-nums on all currency to keep columns aligned, especially the activity figures.
- Member IDs (`1EG4-TE5-MK72`, `U7244 81902 01`) are formatted by carrier convention — keep the literal spacing/hyphenation.
- The "Met" deductible state should be reachable for any plan; design it as a status, not as Medicare-specific.
- For accessibility: text on pastels meets WCAG AA with the specified ink colors. Don't lighten ink colors on pastels. The cream-on-navy combinations also clear AA. Re-check if you add new color pairs.
- The product avoids: green check-mark celebrations, percentage "progress" gamification (the meters are factual, not achievements), confetti, emoji.
