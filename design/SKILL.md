---
name: beni-design
description: Use this skill to generate well-branded interfaces and assets for Beni (a healthcare benefits app — insurance, dental, vision, FSA, HSA in one place), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files:

- `colors_and_type.css` — copy this into any HTML you make, then use the
  semantic classes (`.t-h1`, `.t-numeric-xl`, etc.) and CSS variables.
- `assets/` — logo, mark, blob pattern, spot illustrations. Drop these
  in, don't redraw them.
- `preview/` — small reference cards showing colors, type, spacing,
  components. Browse before designing to internalize the system.
- `ui_kits/beni-web/` — high-fidelity React (JSX) recreations of the
  web app's screens (login, signup, onboarding, dashboard). Use these
  as a source of truth for component anatomy, padding, and copy tone.

If creating visual artifacts (slides, mocks, throwaway prototypes,
etc.), copy assets out and create static HTML files for the user to
view. If working on production code, you can copy assets and read the
rules here to become an expert in designing with the Beni brand.

If the user invokes this skill without any other guidance, ask them
what they want to build or design, ask some questions (audience? web
or mobile? which screen / flow?), and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.

**Brand reminders before you write anything:**

- Canvas is cream `#FBF6EE`, never white.
- Primary is navy `#004383`, accent sky `#0586c3`, with peach/coral/sun
  for warmth.
- Manrope for UI; Instrument Serif italic for warmth moments
  ("Hello, Maya."); JetBrains Mono for plan IDs.
- Plain, on-your-side copy. No jargon. No exclamation marks. No emoji.
- Cards: white, hairline border `#E8E3D8`, radius 20, shadow-1.
- The colored-left-border pattern is reserved for **account cards only**.
- Tabular numerals for every dollar amount.
- Lucide icons, 1.75 stroke, ink color.
