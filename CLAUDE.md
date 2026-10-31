@AGENTS.md

# Talk-Masters Club website: project rules

- **Audience:** the club is open to everyone, of all ages, genders and backgrounds. Never frame it as a student or university club in copy, examples or imagery.
- **Name:** "Talk-Masters Club", a club of Toastmasters International. Never alter the TI emblem; the draft badge in `assets/source/brand/` is not for production.
- **Plan first:** `docs/IMPLEMENTATION_PLAN.md` is the source of truth for phases, the "site is a speech" concept, and the visual and motion language. Brand tokens: `docs/BRAND.md`; colour tokens live only in `src/app/globals.css`.
- **Photos:** always go through `<ImageSlot id="…">` with the slot in `content/images.json`. Temporary Unsplash photos (via `npm run images:unsplash`) fill every slot for the demo, portraits included (the club asked for this on 2026-10-17). They are stand-ins: names stay placeholders, `check:content --strict` blocks launch until each is replaced by a real club photo, and AI-generated images are never used. The one exception is Echo, the mascot (`src/components/media/Mascot.tsx`, `public/images/mascot/`): an AI-drafted illustration the club chose on 2026-10-31, a stand-in until a designer redraws it as SVG. It is never a photo and never goes through `ImageSlot`. Unsplash images load through `src/lib/images/unsplash-loader.ts` (their CDN), never through the Next.js optimizer. Secrets live only in `.env.local`; `.env.example` must stay empty (a unit test enforces it).
- **Structure:** people pages follow `Plan.md`; every animation follows `SCROLL_ANIMATION_SYSTEM.md` through `data-reveal` / `data-parallax` / `data-draw` attributes on elements inside a page-level `<RevealScope>` (see `src/components/motion/RevealScope.tsx`; never query outside your own subtree, or hydration breaks). Line reveals (`data-reveal="lines"`) go on headings only.
- **Content:** only JSON in `content/`, validated by `src/lib/content/schemas.ts`. Unconfirmed facts get `"placeholder": true`.
- **Motion:** GSAP + Lenis only (no Framer Motion). Use the tokens in `src/lib/motion/tokens.ts`. Every animation needs a reduced-motion path.
- **21st.dev:** only for utility components (accordion, marquee, inputs, mobile menu). Signature moments (hero, Voice Line, Timing Light, agenda, Table Topics booth) are custom. Restyle anything imported to our tokens.
- **Quality gate:** `npm run verify` and `npm run test:e2e` must pass before a commit.
