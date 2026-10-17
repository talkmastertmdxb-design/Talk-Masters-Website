@AGENTS.md

# Talk-Masters Club website: project rules

- **Audience:** the club is open to everyone, of all ages, genders and backgrounds. Never frame it as a student or university club in copy, examples or imagery.
- **Name:** "Talk-Masters Club", a club of Toastmasters International. Never alter the TI emblem; the draft badge in `assets/source/` is not for production.
- **Plan first:** `docs/IMPLEMENTATION_PLAN.md` is the source of truth for phases, the "site is a speech" concept, and the visual and motion language. Brand tokens: `docs/BRAND.md`; colour tokens live only in `src/app/globals.css`.
- **Photos:** always go through `<ImageSlot id="…">` with the slot in `content/images.json`. Temporary Unsplash photos (via `npm run images:unsplash`) are allowed for scenes only: stage, audience, rooms. Never for portraits of founders, members or officers, and never AI-generated people.
- **Structure:** people pages follow `Plan.md`; every animation follows `SCROLL_ANIMATION_SYSTEM.md` through `data-reveal` / `data-parallax` / `data-draw` attributes (see `src/components/motion/ScrollReveals.tsx`). Line reveals (`data-reveal="lines"`) go on headings only.
- **Content:** only JSON in `content/`, validated by `src/lib/content/schemas.ts`. Unconfirmed facts get `"placeholder": true`.
- **Motion:** GSAP + Lenis only (no Framer Motion). Use the tokens in `src/lib/motion/tokens.ts`. Every animation needs a reduced-motion path.
- **21st.dev:** only for utility components (accordion, marquee, inputs, mobile menu). Signature moments (hero, Voice Line, Timing Light, agenda, Table Topics booth) are custom. Restyle anything imported to our tokens.
- **Quality gate:** `npm run verify` and `npm run test:e2e` must pass before a commit.
