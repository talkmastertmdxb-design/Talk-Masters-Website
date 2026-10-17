# IMPLEMENTATION_PLAN.md: Talk-Masters Website

How we go from the existing docs to an award-level site. Planning comes first (sections 1-5); building starts at section 6, and only after the sign-off gate in section 8.

This plan **builds on** PRD.md, BRAND.md, DESIGN.md, FEATURES.md and ARCHITECTURE.md. It does not repeat them. Where it changes one of them, the change is marked **[Change]** and listed in section 9 for sign-off.

---

## 0. What we studied, and what it tells us

| Source                    | Finding                                                                                                                                                                      | Consequence                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| PRD / FEATURES            | Clear goal: turn visitors into guests. 16 home sections, 9 pages, Drive CMS, all treated as P0                                                                               | Scope is too large for launch while there is almost no content. Cut it down (section 2.4)             |
| BRAND                     | Navy, maroon and gold. Cambria **Bold** display. "Premium leadership brand, not a student club"                                                                              | Keep the palette. Change the display weight (section 3.2)                                             |
| DESIGN                    | Strong section blueprint and motion tokens. Asks for particles, light beams and cursor glow                                                                                  | Too many generic effects. Swap them for one motif that belongs to the brand (section 1.2)             |
| Bailey Hart PDF (5 pages) | Calm, warm editorial site. Hairlines instead of boxes. Glass cards on blurred photos. One idea per band                                                                      | Use as the reference for structure and pacing                                                         |
| Bailey Hart live site     | GSAP 3.15 (SplitText, ScrollTrigger, Flip, Draggable, Observer, CustomEase) + Lenis 1.2. Fonts: **Lora 400** + Geist. Marquees, a "ticker" list with an active row, a slider | Its elegance comes from a **regular-weight** serif and restrained motion, not bold type or effects    |
| `Logo.jpg.jpeg`           | 1024px raster on a light-blue background. Has a **Gemini watermark sparkle** bottom-right. It **redraws the Toastmasters International globe**                               | Brand-compliance risk. Not usable as a production asset (section 0.1)                                 |
| `large-thumbnail…mp4`     | 5 s, 800×450, the official TI logo animation on white                                                                                                                        | Too small and on the wrong background for a hero. At most a small brand moment, if TI usage allows it |
| Photography               | **None.** DESIGN mentions a speaker image, but none is in the folder                                                                                                         | The design must look finished with no photos (section 3.5)                                            |
| Missing files             | No README. `zeneth.png` and `/docs/inspiration/` don't exist. BRAND refers to `Logo_jpg.jpeg`                                                                                | Fix the doc references. Zeneth is treated only as DESIGN.md describes it                              |

### 0.1 Blocking risk: the logo

Toastmasters International brand rules restrict changing its emblem or combining it into a club logo. The current badge redraws the globe inside a custom roundel, and it appears to be AI-generated. **Before launch** (owner: club VP Public Relations):

1. Check club-logo rules on the official Toastmasters brand portal, plus the trademark notice and disclaimer that club sites must carry.
2. Likely outcome: a **typographic club wordmark** ("Talk-Masters", with the microphone glyph) next to the **official, unaltered TI emblem** downloaded from the portal, as SVG.
3. **Update 2026-10-17:** the club supplied a cleaner version (`assets/source/Talk-Masters New Logo.png`, transparent background, no AI watermark). It is now used in the nav, footer and favicon, next to the club name in type. The globe inside it is still a redrawing of the TI emblem, so step 1 is still required before launch.

---

## 1. Experience design (Creative Director, Awwwards Judge)

### 1.1 Big idea: "The site is a speech"

Every Toastmasters speech has an **Opening, Body and Close**, and is timed by **green, amber and red lights**. The home page follows the same shape, so the site _demonstrates_ what the club teaches instead of just describing it.

| Act                        | Purpose                                                    | Visitor feels                      |
| -------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| **Opening** (hook)         | One bold promise: "Find your voice."                       | "This is different."               |
| **Body** (proof)           | What happens in a meeting, how people grow, proof it works | "I could do this. It isn't scary." |
| **Close** (call to action) | Next meeting, one simple booking                           | "I'm going on Tuesday."            |

Award juries reward **one strong idea carried all the way through**, not a pile of effects. Everything below serves this idea.

### 1.2 The single motif: the Voice Line

A thin gold line runs through the whole site and changes as the story moves:

1. **Hero:** flat, which is silence. As the headline lands, it vibrates into a soft **waveform**: the first word.
2. **Journey timeline:** becomes the vertical progress line. Its amplitude grows at each stage (Attend → Mentor): the voice getting stronger.
3. **Close:** settles into the underline beneath "Book a guest visit."

**[Change]** This replaces DESIGN.md's drifting particles, light beams and generic cursor glow. On pointer devices we keep one ambient effect: a soft **stage spotlight** that follows the cursor slowly in the hero only.

### 1.3 Signature moments (no more than four; restraint is the point)

| #   | Moment                                                                                                                                                                                               | Why it earns its place                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| S1  | **Hero: "The first word"**: dark stage, spotlight, masked headline, the Voice Line becomes a waveform                                                                                                | First impression and the brand idea in five seconds                                                          |
| S2  | **Timing Light progress**: a small pill in the nav glows green → amber → red (maroon) as you scroll through the "speech", ending at the CTA. Tooltip: "Toastmasters speakers are timed with lights." | Smart for insiders, teaches outsiders, and is useful as a progress cue                                       |
| S3  | **Inside a meeting**: a pinned horizontal "agenda" that scrubs through a real evening (7:00 Welcome → 7:10 Prepared speeches → 7:45 Table Topics → 8:15 Evaluations → 8:45 Awards)                   | Answers the biggest fear ("what happens? will I have to speak?")                                             |
| S4  | **Table Topics booth**: an interactive impromptu prompt with a 60-second timer and the timing light. Ends with: "You just did a Table Topic. Do it for real at our next meeting."                    | Interaction with a purpose, shareable, and the strongest conversion hook. No microphone access, no recording |

### 1.4 Experience principles

1. **Reassurance before ambition.** At every age, the main barrier is fear of speaking. "Guests never have to speak" appears early and often.
2. **Open to everyone, visibly.** The club welcomes all ages, genders and backgrounds: students, working professionals, parents, career changers and retirees. Copy, photography and examples must show that range. Never frame it as a student or university club.
3. **One idea per band.** Big gaps, hairlines, no boxed-in clutter (the Bailey Hart discipline).
4. **The booking action is never more than one tap away** (F-41).
5. **Honest content.** No stock "teams", no invented numbers. Placeholders look deliberate, never fake.
6. **Motion has meaning.** It shows pacing, emphasis, progress or confirmation (see DESIGN.md §8).

---

## 2. User journey (Senior UX Designer)

### 2.1 Who arrives, and how (open to all ages and backgrounds)

| Visitor                          | Typical entry point                             | Device            | First thing they need                              |
| -------------------------------- | ----------------------------------------------- | ----------------- | -------------------------------------------------- |
| Student or young adult           | Instagram or WhatsApp link from a friend        | Mobile            | What it is, when it is, that guests attend free    |
| Working professional             | Google: "public speaking club [city]", LinkedIn | Mobile or desktop | Credibility, schedule, how it helps a career       |
| Parent, career changer, returner | Word of mouth, community groups                 | Mobile            | Reassurance: "people like me go here", no pressure |
| Retiree or lifelong learner      | Search, a friend's recommendation               | Desktop or tablet | Clear text, large tap targets, plain directions    |
| Toastmaster from another club    | Toastmasters club finder                        | Any               | Meeting time, venue, contests                      |

**So we design mobile-first** but test with older users too: body text at 18px or larger, strong contrast, no hover-only information. The hero on a 360px screen must show the promise, the next meeting date and the booking button without scrolling.

### 2.2 The guest path (critical flow)

```
Land (hero: promise + "Next meeting: Tue 14 Oct, 7pm, Room B12")
  → Reassure ("Guests just watch. No pressure.")
  → Understand (Inside a meeting, agenda scrub)
  → Try it (Table Topics booth, optional)
  → Trust (stories, stats, testimonials)
  → Book (3 fields: name, email, meeting; phone and note optional)
  → Confirmation (in place: add to calendar, map, "what to expect" card, WhatsApp/email contact)
  → Email (confirmation + reminder 24 h before)
```

The questions to answer, in this order: _What is it? Is it for me? Will I be put on the spot? When and where? Is it free? How do I come?_

### 2.3 Home page structure, mapped to the speech **[Change]** (DESIGN §7 had 16 bands; now 11)

| #   | Act     | Band                                                                                                         | Theme        | Source in DESIGN.md |
| --- | ------- | ------------------------------------------------------------------------------------------------------------ | ------------ | ------------------- |
| 1   | Opening | Hero, "The first word" (S1) + next-meeting chip + 2 CTAs                                                     | Dark         | §7.1                |
| 2   | Opening | Manifesto statement + bento stats (stat / photo-or-type / stat / stat)                                       | Light        | §7.2                |
| 3   | Body    | "Overcome the fear": split with 4 icon rows (Prepared Speeches, Table Topics, Leadership Roles, Evaluations) | Light        | §7.4                |
| 4   | Body    | **Inside a meeting**: pinned agenda scrub (S3)                                                               | Light → Dark | §7.5, reworked      |
| 5   | Body    | **Table Topics booth** (S4)                                                                                  | Dark         | New                 |
| 6   | Body    | Full-bleed stacked words: Students. Professionals. Parents. Retirees. Leaders. Everyone.                     | Dark         | §7.6                |
| 7   | Body    | Impact metrics panel (label left, big number right)                                                          | Dark         | §7.7                |
| 8   | Body    | Journey: sticky intro + Voice Line timeline                                                                  | Light        | §7.8                |
| 9   | Body    | Stories and testimonials combined (Before / Today cards, quote ticker)                                       | Light        | §7.9 + §7.13        |
| 10  | Close   | Next meeting + upcoming events, then FAQ                                                                     | Light        | §7.10 + §7.14       |
| 11  | Close   | Guest band (gradient) + footer                                                                               | Dark         | §7.15-16            |

Leadership team, gallery and the image rail move **off the home page** to their own pages, or wait until real photos exist.

### 2.4 Pages and launch scope **[Change]**

| Launch (v1)                                                                                           | Later, once content exists (v1.1+)                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Home, Join / Guest visit, Meetings (what to expect + FAQ), Events (list + detail), Team, Privacy, 404 | Stories detail pages, Gallery + lightbox, Achievements, Newsletter, RSVP capacity, Arabic/RTL |

Rule: **a page ships only when it has real content.** No placeholder pages in production.

---

## 3. Visual language (Creative Director)

### 3.1 Colour: BRAND.md stays; two refinements **[Change]**

- **Light bands (revised 2026-10-17):** brand soft gray `#F5F7F8` alternating with white. Warm ivory was dropped: cream + serif is the most common generated-site look.
- **Gold never as text on light backgrounds** (contrast). On light bands, gold appears only as a line or shape: the Voice Line, rules, dots.
- **Timing-light colours** (only in S2 and S4): green `#3C8D5A`, amber `#D6B06A` (our gold), red = maroon `#772432`. Each check is paired with a label or icon, never colour alone.
- Ratio from BRAND §3 still applies: 60 / 25 / 10 / 5.

### 3.2 Typography **[Change]**

Bailey Hart's elegance comes from a **regular-weight serif at large size with tight tracking**. Cambria Bold at 96px reads as heavy and "Word document".

| Role            | Proposal                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Display / H1-H2 | **Source Serif 4** (variable, self-hosted, optical sizing), weight **400-500**, tracking -0.02em, line height 1.0-1.05 |
| Emphasis        | The same serif in _italic_ for the single gold word ("_Confidence._")                                                  |
| Body / UI       | Open Sans (per BRAND) 400/600. 18px base, line height 1.65                                                             |
| Eyebrows        | Open Sans 600, 12px, uppercase, 0.24em tracking                                                                        |
| Numerals        | Serif lining figures, tabular in the metrics panel                                                                     |

Cambria stays in the fallback stack only. Fluid sizes via `clamp()`: H1 44 → 112px, H2 34 → 64px, display words up to 180px.

### 3.3 Composition

- 12-column grid, 1280px content width, full-bleed 1440px+ (DESIGN §4).
- **Asymmetric editorial layout:** headlines take 7 columns, body copy 5. Left-aligned eyebrow and headline, as on Bailey Hart page 2.
- Hairline rules (`1px rgba(0,65,101,.12)`) instead of boxes. Rounded media 24-28px. Pill buttons.
- A film-grain overlay (2-3% opacity, a static SVG noise texture) on dark bands for a cinematic feel, at almost no performance cost.

### 3.4 Components

Glass card, pill buttons (primary maroon, dark ink, ghost), hairline list rows with icons, ticker card (vertical list with one white active row), metric row, Before/Today story card, event card with a status chip, accordion, timing-light pill, agenda card with a time stamp, form fields. Icons: Lucide at 1.5px stroke, never filled.

### 3.5 Designing with no photography (key constraint)

1. **Type-led layouts first.** Every band must work with **no image**: big serif statements, the Voice Line, gradient stages.
2. **Abstract stage art** as image stand-ins: spotlight gradients, curtain-dark blurs, waveform plates. Built in CSS/SVG, not AI people.
3. **Never use AI-generated "members"** (fake people break trust and BRAND §5).
4. **Photo shoot brief** (club to commission, ideally one meeting night, signed consent forms):
   - Speaker at the lectern, three-quarter angle, under warm light
   - Audience laughing or reacting
   - Timer holding up the coloured cards
   - An evaluator giving feedback
   - Table Topics moment, nervous then smiling
   - Awards and ribbons
   - The officer team, informal group shot
   - 10 individual portraits, deliberately covering a range of ages, genders and backgrounds
   - Details: gavel, agenda, name badges
   - Venue exterior and entrance (so first-time guests recognise it)

---

## 4. Motion language (Motion Designer)

### 4.1 Principle: "Speak with pauses"

Good speakers pause before the important line. Our motion does the same: **a short hold, then a confident delivery, then stillness.** No constant motion, no looping noise.

### 4.2 Tokens (extends DESIGN §8)

| Token                                 | Value                                   | Use                          |
| ------------------------------------- | --------------------------------------- | ---------------------------- |
| `ease.deliver`                        | `expo.out` / `cubic-bezier(.16,1,.3,1)` | Every entrance               |
| `ease.breath`                         | `sine.inOut`                            | Ambient: spotlight, waveform |
| `ease.scrub`                          | `none` (linear) with Lenis smoothing    | Scroll-linked work           |
| `dur.quick` / `dur.base` / `dur.slow` | 0.45 s / 0.9 s / 1.3 s                  | Micro / reveals / hero       |
| `stagger.line` / `stagger.item`       | 0.09 s / 0.14 s                         | SplitText lines / cards      |
| `pause.beat`                          | 0.15-0.25 s                             | The hold before a key line   |
| Parallax                              | 6-10% max                               | Media only                   |

### 4.3 The choreography library (the only moves allowed)

| Name             | What it does                                                                       | Where                        |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| **Rise**         | Lines rise through a mask (SplitText `lines`, `mask: "lines"`)                     | Every H1/H2, once            |
| **Settle**       | Fade + 24px lift + slight scale from 0.98                                          | Cards, rows, paragraphs      |
| **Spotlight**    | Radial light follows the pointer with lerp 0.08                                    | Hero, pointer devices only   |
| **Voice**        | SVG path morph from flat to waveform; amplitude tied to a scroll or timeline value | Hero, journey, CTA underline |
| **Agenda scrub** | Pinned horizontal track driven by ScrollTrigger scrub; time stamp counts along     | S3                           |
| **Count**        | Number count-up; the real value is in the HTML first                               | Metrics                      |
| **Signal**       | Timing-light colour transition (0.45 s) + `aria-live` text                         | S2, S4                       |
| **Lift**         | Hover: media scale to 1.05 over 1.4 s, card up 4px, magnetic CTA at 18% max        | Pointer devices only         |
| **Curtain**      | Route change: a quick ink wipe (View Transitions API, CSS-only fallback)           | Page transitions (P2)        |

### 4.4 Hero timeline (target under 1.8 s, any input skips to the end state)

```
0.00  dark stage, grain, spotlight fades in (0.6s, breath)
0.20  nav settles in
0.35  H1 line 1 rises      "Find your voice."
0.50  H1 line 2 rises      "Lead with Confidence."  ← gold italic word lands last (+0.15 beat)
0.70  H1 line 3 rises      "Inspire the world."
0.95  Voice Line: flat → waveform (0.9s), then breathes gently
1.10  sub-copy + CTAs settle; next-meeting chip settles
1.40  "Scroll" cue
```

### 4.5 Branching (`gsap.matchMedia()`)

| Condition                     | Behaviour                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Desktop + pointer             | Everything                                                                                                        |
| Touch / under 900px           | No spotlight or magnetic; agenda becomes swipeable cards (no pin); parallax halved                                |
| `prefers-reduced-motion`      | No Lenis, no pin or scrub, no waveform motion (static wave drawn), opacity fades only, counters show final values |
| `save-data` / slow connection | Skip non-critical motion chunks entirely                                                                          |

---

## 5. Architecture (Frontend Architect, SEO, Accessibility)

ARCHITECTURE.md stays the base. Amendments:

### 5.1 Stack decisions **[Change]**

| Topic     | Decision                                                                                                                                                                                               | Reason                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Framework | Current stable **Next.js App Router + React + TypeScript (strict)**                                                                                                                                    | As planned                                                                           |
| Styling   | **Tailwind CSS v4**, tokens in `@theme` from a single `tokens.css`                                                                                                                                     | Tokens and utilities from one source                                                 |
| Motion    | **GSAP (incl. SplitText, ScrollTrigger, Observer) + Lenis** as the **only** animation system. Drop Framer Motion; use CSS / View Transitions for UI state                                              | One system means no conflicts and roughly 40KB less JS. GSAP plugins are free to use |
| Content   | **Repository pattern**: `ContentRepository` interface. v1 = `LocalContentRepository` (typed JSON in `/content`, Zod-validated). v1.1 = `DriveContentRepository` (the sync worker from ARCHITECTURE §3) | Launch isn't blocked on Google API setup; swapping later changes no components       |
| Forms     | Server Action + Zod + Cloudflare Turnstile + Resend (emails) + Google Sheet append (club inbox) + rate limit (Upstash or Vercel KV)                                                                    | Simple and secure, and officers already use Sheets                                   |
| Calendar  | `.ics` generation route + Google Calendar link                                                                                                                                                         | F-26                                                                                 |
| Analytics | Plausible or Vercel Web Analytics; events: `cta_click`, `booth_start`, `booth_complete`, `form_submit`, scroll depth                                                                                   | PRD §6                                                                               |

### 5.2 Structure (additions to ARCHITECTURE §5)

```
/components/signature/   Hero, VoiceLine, TimingLight, AgendaScrub, TableTopicsBooth
/components/motion/      MotionProvider (Lenis + ScrollTrigger + matchMedia), Rise, Settle, Count, Spotlight
/lib/content/            schemas.ts, repository.ts (interface), local.ts, drive.ts (later)
/lib/motion/tokens.ts    mirrors §4.2; the single source for JS motion values
/content/                settings.json, meetings.json, events.json, stories.json, faq.json, topics.json
/tests/unit  /tests/e2e
```

### 5.3 Performance budget

- Initial JS **under 150KB gzipped** (stricter than PRD's 250); GSAP and Lenis load in a deferred chunk after the hero paints.
- The hero is CSS/SVG only. **No canvas, no video in the LCP path.** LCP element = the H1 text.
- Fonts: 2 self-hosted variable files, subset, `font-display: swap`, size-adjusted fallbacks (no CLS).
- Images (once they exist): AVIF/WebP via `next/image`, blur placeholders, below the fold lazy.
- Targets: Lighthouse mobile 95+ in every category; LCP under 2.0 s, INP under 150 ms, CLS under 0.05 on a mid-range Android.

### 5.4 SEO plan

- Metadata API per route; generated OG images (`next/og`) in brand style.
- JSON-LD: `Organization` (with `parentOrganization: Toastmasters International`), `Event` for each meeting and event (date, location, `isAccessibleForFree: true`), `FAQPage`, `BreadcrumbList`.
- Local intent: titles like "Public Speaking & Leadership Club in [City], Talk-Masters Club (Toastmasters International)". A meetings page with venue, map and schedule.
- `sitemap.ts`, `robots.ts`, canonical URLs, semantic headings (exactly one H1 per page).
- Content: FAQ written around real search questions ("Can guests attend for free?", "What happens at a first meeting?", "Am I too old / too inexperienced to join?").

### 5.5 Accessibility plan (WCAG 2.2 AA)

- Every signature moment has an accessible equivalent:
  - SplitText keeps the full heading for screen readers.
  - The agenda is a real ordered list.
  - The booth timer announces through `aria-live="polite"` and has pause and reset buttons.
  - The timing light has text labels.
- Lenis off while focus is inside forms. Skip link. Focus rings: gold on dark, navy on light, 3px with offset.
- Target size of at least 44px, `prefers-reduced-motion` honoured everywhere, captions for any video, and a "Pause motion" toggle in the footer (WCAG 2.2.2).
- Contrast checked on the tokens before any components are built.

---

## 6. Skills and tools to use

### 6.1 Install (Phase 0; verify each one in its repository first, as find-skills advises)

| Skill                                                            | Install                                                                 | Use for                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `anthropics/skills@frontend-design` (994K installs)              | `npx skills add anthropics/skills --skill frontend-design`              | Design direction and avoiding generic AI aesthetics        |
| `vercel-labs/agent-skills@web-design-guidelines` (743K)          | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` | UI and accessibility review of every component             |
| `greensock/gsap-skills` (gsap-core, gsap-scrolltrigger)          | `npx skills add greensock/gsap-skills`                                  | Correct GSAP, SplitText and ScrollTrigger patterns         |
| `21st-dev/skill` (21st-ui-explore, 21st-ui-build, 21st-registry) | `npx skills add 21st-dev/skill`                                         | Component inspiration and builds through your 21st.dev key |
| `coreyhaines31/marketingskills@seo-audit`                        | `npx skills add coreyhaines31/marketingskills --skill seo-audit`        | SEO audit before launch                                    |
| `currents-dev/playwright-best-practices-skill`                   | `npx skills add currents-dev/playwright-best-practices-skill`           | E2E tests                                                  |

The 21st.dev skills have low install counts (about 1-2K) but come from the official `21st-dev` owner. Read each SKILL.md before use.

**Installed (2026-10-16):** frontend-design, web-design-guidelines, the 8 GreenSock skills, and 21st-ai, 21st-cli-use, 21st-ui-build, 21st-ui-explore, 21st-ui-review. **Removed on purpose:** `21st-design-sync` and `21st-registry` (Snyk: High Risk). They publish themes and components _publicly_ to the 21st.dev community, which this project never needs. Not yet installed: seo-audit (Phase 8), Playwright best practices (optional).

Plus the **21st.dev Magic MCP** (not configured yet):
`claude mcp add magic --scope user --env API_KEY="…" -- cmd /c npx -y @21st-dev/magic@latest`

### 6.2 Where 21st.dev helps, and where it must not be used

| Use 21st.dev (search first, generate once, then restyle to our tokens)                                                                                       | Build custom (these are what get an award)                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Accordion, marquee, pill input/form fields, mobile menu, event card shell, testimonial ticker, lightbox (later), 404 layout ideas, logo search (none needed) | Hero, Voice Line, Timing Light, Agenda scrub, Table Topics booth, metrics panel, the whole motion system |

Rule: anything from 21st.dev is **rebuilt to our tokens, typography and motion library** before it's merged, so nothing looks like it came from a component library.

### 6.3 Built-in skills and agents in this environment

- **artifact-design**: share design boards and the motion prototype as a private review page for club officers.
- **run**: launch the app to check each phase in a real browser.
- **code-review** / **security-review**: at every phase gate, plus the code-reviewer and security-reviewer agents per your workflow rules.
- **tdd-guide** agent: test-first for schemas, the repository, the form action, the booth timer logic and the `.ics` generator.

---

## 7. Implementation phases

Each phase ends with a **gate**: tests green, a code review with no CRITICAL or HIGH findings, and a visual check through `run`. Content structure for the people pages follows [Plan.md](../Plan.md); every animation follows [SCROLL_ANIMATION_SYSTEM.md](../SCROLL_ANIMATION_SYSTEM.md).

| Phase                              | Status                               | Deliverable                                  | Key tasks                                                                                                                                                                                                                                                                                                                                | Gate                                                    |
| ---------------------------------- | ------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **0. Setup**                       | ✅ Done                              | Repo + tooling                               | Next.js 16, TS strict, Tailwind v4, Vitest, Playwright + axe, CI, skills, Magic MCP                                                                                                                                                                                                                                                      | CI green                                                |
| **1. Design board**                | ✅ Built, **awaiting club sign-off** | Hero + first bands at 360 and 1440           | Type scale, tokens, contrast test, grain, Voice Line                                                                                                                                                                                                                                                                                     | Club sign-off on the look                               |
| **2. Motion system**               | ✅ Done                              | SCROLL_ANIMATION_SYSTEM.md, Animations 01-14 | Lenis (full on desktop, light on touch, off under reduced motion) + ScrollTrigger; page-level `RevealScope` (hydration-safe) (`data-reveal`, `data-parallax`, `data-draw`, `data-scroll-cue`); spotlight; SplitText line reveals; Voice Line morph; sticky storytelling; agenda scrub + clock + drawing line; booth timing lights + ring | Reduced motion verified; pinned sections fit one screen |
| **3. Foundations**                 | ✅ Done                              | Design system                                | Buttons, nav + mobile menu, footer, PageHeader, slider, dialog, image slots                                                                                                                                                                                                                                                              | a11y scans clean                                        |
| **4. Content layer**               | ✅ Done                              | Typed content                                | Zod schemas incl. Plan.md members (journey, impact, advice), founders, 7-stage founding timeline, awards, committee statements; consent + draft rules; placeholder audit                                                                                                                                                                 | Unit coverage ≥ 80%                                     |
| **5. Home page**                   | 🟡 Mostly done                       | Sections 1-5 + Plan.md additions             | ✅ Hero, Manifesto bento, Overcome the Fear (pinned), Inside a Meeting (S3), Table Topics booth (S4), Member Spotlight, Executive Committee. **To do:** full-bleed stacked words, impact metrics panel, member journey timeline, then Events between Spotlight and the close                                                             | E2E for every signature moment                          |
| **5b. People & credibility pages** | ✅ Done                              | Plan.md pages                                | `/our-story`, `/achievements`, `/members` (journey dialogs, no individual pages), `/team`, `/credits`; `/about` redirects                                                                                                                                                                                                                | a11y scans clean on every page                          |
| **5c. Imagery**                    | 🟡 Pipeline ready                    | Unsplash scene photos                        | `npm run images:unsplash` fills 18 scene slots with credited, free Unsplash photos. **Needs your Unsplash Access Key.** Portraits stay placeholders until real photos arrive                                                                                                                                                             | Review picks at `/styleguide`                           |
| **6. Conversion**                  | ⏭ Next                               | Booking + close                              | Guest-visit form (Server Action, Zod, Turnstile, Resend, Google Sheet, rate limit), success state, `.ics`; FAQ section; `/meetings` and `/events` pages, then add Meetings and Events to the nav (Plan.md order)                                                                                                                         | E2E booking flow; security review                       |
| **7. Remaining pages**             | Planned                              | Meetings, Events detail, Privacy             | Route transitions (Curtain), breadcrumbs, gallery if photos exist                                                                                                                                                                                                                                                                        | E2E smoke on every route                                |
| **8. SEO + analytics**             | Planned                              | Discoverability                              | Metadata, OG images, JSON-LD (Organization, Event, FAQPage), sitemap, privacy-friendly analytics; seo-audit skill                                                                                                                                                                                                                        | Rich-results test passes                                |
| **9. QA + polish**                 | Planned                              | Launch candidate                             | Lighthouse budget, real mid-range phones, VoiceOver/TalkBack, motion tuning, Awwwards self-critique (§8)                                                                                                                                                                                                                                 | All PRD §6 targets met                                  |
| **10. Launch**                     | Planned                              | Production                                   | Vercel, domain, CSP, uptime; publish checklist: no placeholders or stock photos left, consent recorded, TI logo approved                                                                                                                                                                                                                 | `npm run check:content -- --strict` passes              |
| **11. v1.1**                       | Later                                | Self-serve content                           | Google Drive CMS + sync worker, member directory filters (students, professionals, executives, alumni, officers), gallery                                                                                                                                                                                                                | An officer adds an event with no developer              |

### What happens next, in order

1. **You:** add `UNSPLASH_ACCESS_KEY` to `.env.local` (free at unsplash.com/oauth/applications), then run `npm run images:unsplash` or ask me to.
2. **You:** sign off the look (Phase 1), and send real content using [CONTENT_REQUESTS.md](CONTENT_REQUESTS.md): founders, members, committee, awards, meeting day and venue.
3. **Me:** finish the home page (Phase 5 to-dos), then Phase 6: the real booking form plus the Meetings and Events pages.

**Status log**

- 2026-10-16: Phase 0 done.
- 2026-10-17: Phases 1-3 built. D4 reverted to brand soft gray (cream + serif is the most common generated-site look).
- 2026-10-17: Plan.md people pages and the full scroll animation system built; Unsplash pipeline ready; Plan.md wording adapted to "open to everyone" (the club is not a student club).

- 2026-10-17: Hero redesigned from the club's reference (eyebrow, three-line headline, stats strip, quote, speaker photo with navy grade) and a first-visit intro adapted from `Hero_animation/8`: preloader counter 00→100%, speaking photos wiping in as the stage settles, nav glides in, headline delivered. Cut from ~12s to ~4s; plays once per 12 hours, home page only, skippable with any input, never under reduced motion, CSS failsafes if JS is late. The template's own photos are not used (unrelated fashion shoot, unknown licence).

Estimated time to launch from here: **about 2-3 weeks for one developer**, once real content arrives.

---

## 8. Definition of "award-level" (Awwwards Judge checklist)

Score each band 1-10 before launch:

- **Design:** consistent type rhythm, no generic sections, the Voice Line present and meaningful.
- **Usability:** booking in 3 taps from any screen, works one-handed on 360px.
- **Creativity:** at least two moments people screenshot (S1, S4).
- **Content:** real voice and real people, no filler.

Anything that scores below 7 gets redesigned, not decorated.

---

## 9. Decisions needed before Phase 1

| #   | Decision                                                                                          | Recommendation                              |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| D1  | City and venue, meeting day and time; how guests register today                                   | **Required** for the hero, SEO and the form |
| D2  | Logo: TI-compliant wordmark + official emblem (section 0.1)                                       | Redo the logo; don't use the AI badge       |
| D3  | Display serif at weight 400-500 instead of Cambria Bold (section 3.2)                             | Approve                                     |
| D4  | ~~Warm ivory `#F6F3EE`~~ reverted to brand soft gray `#F5F7F8` + white (2026-10-17)               | Done                                        |
| D5  | Drop particles, beams and Framer Motion; Voice Line motif + GSAP only (sections 1.2, 5.1)         | Approve                                     |
| D6  | Cut home to 11 bands; gallery, stories pages and achievements wait for content (sections 2.3-2.4) | Approve                                     |
| D7  | v1 content in typed local files; Drive CMS in v1.1 (section 5.1)                                  | Approve                                     |
| D8  | Photo shoot date + consent forms (section 3.5)                                                    | Book before Phase 5                         |
| D9  | Verified stats (500+, 50+, 100+, 20+)                                                             | Confirm or remove                           |
| D10 | Guest data destination: Sheet, email, or both                                                     | Both                                        |
