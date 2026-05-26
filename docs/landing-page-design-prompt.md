# Béni — Landing Page Design Prompt (claude.ai/design)

For the **dev marketing landing** (`app/page.tsx`) — a scrolling web page (not a slide).
Goal: move to the dark redesign theme and expand the story from "understand your
insurance" to the three-layer product (Data → Analytics → Agentic) with a
bill-negotiation savings teaser. Mirrors the narrative in `docs/vc-pitch-deck.md`.

Paste everything below into claude.ai/design.

---

## Brand context (always include)

> Béni is a healthcare-fintech web app. Voice: intelligent, warm, slightly
> literary — not corporate, not gamified. No green checkmarks, confetti, or
> emoji. Visual: deep navy background #07101C; elevated surfaces #0F1A2C and
> #141E33; hairline borders rgba(255,255,255,0.06); cream text #F4ECDE with
> dimmer cream #B8C0CC / #6E7A8C for secondary; brand gradient
> linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)
> used sparingly on ONE emphasis word per section and on the hero CTA / the
> "magic" agentic surface; pastel accents cyan #C7E5F2, peach #FFC4BE, purple
> #D8CDF2 to tag distinct cards. Type: Manrope (sans, 400–800), Instrument Serif
> italic for the single emphasis word in each headline; tabular-nums for all
> dollar figures. No drop shadows — use surface elevation and subtle radial
> gradient "blobs" behind dark cards. Generous whitespace, large radii (22–28px).
> Desktop-first but responsive down to mobile (single column).

---

## The page (top to bottom)

**Sticky nav bar** (blurred dark, hairline bottom border): "beni" wordmark
left; right side two pills — "Log in" (ghost, hairline border, cream text) and
"Get started" (solid, brand-gradient fill, dark ink text).

**1 · Hero** (centered, generous top padding)
- Small pill badge: a dim dot + caption "Connects to Medicare, Cigna, Aetna, UHC, Anthem & more."
- Headline, Manrope 700–800, ~64px, cream, with brand gradient + Instrument
  Serif italic on the emphasis word: "The intelligence layer for your *healthcare*."
- Subhead, ~18px dim cream, max-width ~520px: "Béni connects to your insurers,
  makes sense of your plans and bills, and goes to work on your behalf — so the
  most confusing part of your life finally runs itself."
- Two CTAs: "Get started for free" (brand-gradient fill, dark ink) and "Log in"
  (ghost surface).

**2 · Live product preview** — one wide dark card (#0F1A2C, radius 28, soft
radial peach + cyan blobs bleeding from the corners). Inside: overline
"Deductible progress"; big tabular-nums figure "$1,200 / $3,000" (slash portion
dim); a slim progress bar at ~40% filled with the brand gradient; caption "40%
met · $1,800 until full coverage." This is the "see it clearly" proof shot.

**3 · The three layers** — section eyebrow "HOW BÉNI WORKS" + headline with
gradient on "more": "Most apps stop at a dashboard. Béni does *more*." Then three
cards, either stacked ascending or a 3-up grid, visibly increasing in
brightness/saturation from Data → Agentic. Each card: a small mono number, layer
name + verb, one body line, and a small status tag.
- **01 · DATA — Consolidate** (cyan #C7E5F2 accent, tag "Available now"):
  "Pulls your medical, dental, and FSA accounts into one readable place. Browse
  your records, understand every bill."
- **02 · ANALYTICS — Understand** (peach #FFC4BE accent, tag "Coming soon"):
  "Béni reads your plans, claims, and spending to surface what you'd never catch
  — unused benefits, billing errors, coverage gaps."
- **03 · AGENTIC — Act** (brand-gradient card surface, dark ink for contrast,
  tag "Coming soon"): "Béni's agents go to work for you — negotiating bills,
  submitting FSA expenses, supporting prior authorizations."

**4 · Savings teaser** — a hero "moment" band. Left: small flag line "Béni
flagged a hospital bill ~40% above fair price." Right / center: a brand-gradient
outcome card, large tabular-nums: "$1,374 → $890" with a line beneath "You saved
$484." Underneath, a slim 5-step status timeline (Reviewing · Drafting dispute ·
Submitted · Negotiating · Resolved) with the last step lit. Caption, dim cream:
"This is where Béni is going. Bill negotiation, on your behalf."

**5 · The hook** — a quiet full-width line, centered, dim cream, large:
"Banking got Plaid. Spending got Mint. Healthcare never got its *intelligence
layer*." (Instrument Serif italic + gradient on "intelligence layer").

**6 · Privacy / trust bar** — slim band, faint cyan tint (#C7E5F2 at low alpha),
a small lock glyph (not emoji — a thin line icon), text: "Read-only and
ephemeral. Your records stay with your insurer — Béni reads them, never copies
them."

**Footer** — "beni" wordmark, copyright "© 2026 Béni · Read-only access · Your
data stays yours," and quiet links: Privacy, Terms.

---

## Notes for translating to code afterward

- Reuse existing dark tokens from `app/globals.css` (`--page-bg`, `--surface-1/2`,
  `--ink`, `--ink-soft`, `--ink-dim`, `--hair`, `--brand-gradient`, pastels).
- Keep `Logo`, `Link href="/signup"`, `Link href="/login"` — same routes as today.
- Drop the emoji feature icons from the current page; use line glyphs or the
  numbered-layer treatment instead.
- The "Available now / Coming soon" tags keep us honest on a page real users can
  reach — easy to toggle as Analytics/Agentic ship.
