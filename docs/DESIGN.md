# DESIGN.md: Talk-Masters Website Design System

Brand tokens live in BRAND.md. This file defines how they become a site: layout, components, motion, and the reference-driven page structure.

## 1. Design intent

A premium, editorial, cinematic leadership brand. Calm confidence: lots of whitespace, large serif type, real photography, restrained motion. It should read as "elite design agency", not template, SaaS dashboard or a student club.

## 2. References and how we use them

| Reference                      | What we take                                                                                                                                                                                                                                                                                                                                                                                                    | What we do not copy                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Bailey Hart** (PDF, primary) | Editorial serif on warm light backgrounds; black/solid pill buttons; wide horizontal image rail with glass UI cards and a quote overlay; caps-label image-card carousel with arrows; eyebrow + icon-row split sections; full-bleed photo with huge stacked serif words; black metrics panel with label-left, big-number-right rows; case cards; FAQ accordion; blurred warm gradient newsletter band and footer | Its copy, logos, imagery, exact layouts |
| **Zeneth** (screenshot)        | Rounded hero card with nav inside; bento stat cards mixing numbers and photos; giant "Our services" title over opposing marquees; staggered process cards; image case-study cards                                                                                                                                                                                                                               | Same as above                           |
| **Awwwards-level prompt**      | Dark cinematic hero, particles, light beams, glass nav, GSAP + Lenis motion                                                                                                                                                                                                                                                                                                                                     | Anything that adds noise                |

Original work only: capture craftsmanship and structure, not the pixels.

### Inspiration files (read these before building)

Stored in `docs/inspiration/` (`zeneth.png` is not supplied yet):

| File                                | What it shows                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `bailey-hart.pdf`                   | Full-page capture of the primary reference, 5 pages                                                       |
| `bailey-hart-p-1.png` ... `p-5.png` | The same pages as images, for tools that read images better than PDFs                                     |
| `zeneth.png`                        | Secondary reference: rounded hero card, bento stats, marquee, dark metrics panel, staggered process cards |

Page-by-page notes on the Bailey Hart reference:

1. **Page 1:** centered hero (small avatar chip, serif headline, two pill buttons), then a wide image rail that bleeds off both edges: glass list card with one white highlighted row, a portrait with an overlaid pull quote, a lifestyle photo. Below: a logo strip, then a "problems we solve" carousel of tall image cards with small uppercase labels and round arrow buttons.
2. **Page 2:** two alternating split sections. Each has an eyebrow, serif H2, one line of copy, a dark pill button and icon-led list rows separated by hairlines. The visual side is a glass chat UI over a blurred photo, then a vertical glass list card with a testimonial and avatar. Then a full-bleed photo with huge stacked serif words fading to black.
3. **Page 3:** black panel with a metrics table (uppercase label on the left, big serif number on the right, hairline dividers), then a row of dark case cards with logos and one-line outcomes.
4. **Page 4:** two-up blog cards with date and tag chips, an FAQ with a left heading and right-hand accordion rows, a logo marquee, and a newsletter band over a blurred warm gradient with a pill email input.
5. **Page 5:** footer on the same blurred gradient with logo, tagline, three link columns and small legal links.

Principles to keep: warm and calm light sections, serif display type, hairline dividers instead of boxes, glass cards on blurred photos, one idea per band, big gaps between bands. Principles to change: swap its warm olive/gold palette for the Talk-Masters blue, maroon and gold; replace business imagery with real club photos; replace its consulting copy with club content.

## 3. Theme strategy

The page alternates **dark cinematic** and **light editorial** bands so scrolling feels like scenes:

1. Hero: dark (`--ink`) with stage photo
2. Who we are + stats: light (`--soft-gray`)
3. Image rail: light
4. Meetings carousel: light
5. Full-bleed photo with stacked words: dark overlay
6. Metrics panel: dark
7. Journey, stories, events, gallery: light
8. Testimonials, FAQ: light
9. Guest-visit band + footer: dark with blurred blue/gold gradient

Support `prefers-color-scheme` only as a gentle dark variant of light bands; the scene alternation is the primary design.

## 4. Grid, spacing, shape

- 12-column grid, max width 1280px (content), 1440px (full-bleed), gutters 24px desktop, 16px mobile
- 8px spacing system. Section padding 160px desktop, 96px tablet, 72px mobile
- Radius: cards 24-28px, large panels 32px, buttons 999px, small chips 16px
- Shadow: `0 10px 30px rgba(0,0,0,.08)` on light; none on dark (use 1px `rgba(255,255,255,.08)` border)
- Glass: `background: rgba(17,24,39,.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.1)`

## 5. Typography application

- H1 hero 72-96px, Cambria Bold, three lines, only "Confidence." in gold
- Section titles H2 48-64px; oversize display titles up to 180px for editorial moments ("Our meetings")
- Eyebrows above every H2: uppercase, tracked, muted
- Body 18px+, max line length 60-70ch
- Numerals in stats use Cambria so counters feel editorial

## 6. Components

**Navigation**: floating glass pill. Transparent at top, frosted after 40px scroll. Logo scales to 0.94. Links have an underline that reveals from the left. Right-side primary button "Guest Visit". Mobile: full-screen menu with staggered link reveal.

**Buttons**

- Primary: maroon `#772432`, white text, 16/32 padding, pill. Hover: slightly lighter, soft gold glow, label arrow shifts 2px max
- Secondary: transparent with 1px light border; hover brightens border to gold
- Dark: `--ink` fill for use on light bands
- Magnetic pull on hover (max ~18% of offset), disabled on touch and reduced motion

**Cards**: white or `#E8ECEE` on light, glass on dark. Images zoom to 105-108% on hover over 1.4s. Hover lift max 6px.

**Stat card**: big Cambria number with gold "+", small label, optional photo variant for bento mix.

**Image rail**: horizontal strip of tall cards that bleeds off both edges; mixes photo cards, a glass list card (the five journey steps with the active one highlighted white) and a quote card with member name and role.

**Marquee**: two rows moving in opposite directions, pause on hover, static under reduced motion.

**Timeline**: vertical line that draws with scroll progress (blue to gold); five milestones reveal one at a time.

**Accordion (FAQ)**: rounded rows on soft gray, plus/minus toggle, animated height, keyboard operable.

**Forms**: pill inputs, visible labels, inline validation, success state replaces the form in place.

## 7. Section blueprint (top to bottom)

1. **Hero**: full viewport rounded card; dark gradient, drifting gold particles, faint light beams, speaker photo right with parallax; 3-line headline; paragraph; two buttons; stat strip along the bottom; "Scroll to explore" cue
2. **Who we are**: centered statement H2 and four bento cards (stat / photo / stat / stat)
3. **Image rail**: wide moving rail: photo, journey glass card, quote card, photo, with a logo-style strip of partner or community organisation names beneath
4. **Overcome the fear**: split layout; headline, copy, CTA, list rows with icons (Prepared Speeches, Impromptu Speaking, Leadership Projects, Constructive Feedback) on the left, large photo with floating card on the right
5. **Our meetings**: giant title, caps-label image-card carousel with arrows
6. **Full-bleed statement**: photo with huge stacked words (Students / Professionals / Parents / Retirees / Leaders / Everyone)
7. **Impact panel (dark)**: metric rows (Speeches Delivered 500+, Active Members 50+, Leadership Roles 100+, Nationalities 20+) with count-up
8. **Member journey**: sticky intro left, drawing timeline right (Attend, Participate, Compete, Lead, Mentor)
9. **Member stories**: large image cards with Before / Today lines and a play button for video
10. **Events**: one large featured card plus smaller upcoming and past cards
11. **Leadership team**: officer portraits with role titles, hover reveals a short bio
12. **Gallery**: masonry grid with lightbox; images lazy-loaded, filtered by event
13. **Testimonials**: scrolling review cards
14. **FAQ**: "Questions? We're glad you asked." with accordion
15. **Guest-visit band**: blurred blue and gold gradient, email or short form, button "Book A Guest Visit"
16. **Footer**: logo, tagline, meeting details, navigation, socials, legal

## 8. Motion language

**Allowed:** fade up, opacity reveal, scale in, parallax (subtle), mask reveal, stagger, scroll-progress, magnetic buttons, cursor-aware glow, number count-up.
**Forbidden:** bounce, elastic, spin, tumble, aggressive hover scaling, anything over ~1.5s except ambient loops.

| Token              | Value                                         |
| ------------------ | --------------------------------------------- |
| Ease out (default) | `cubic-bezier(.22,1,.36,1)` / GSAP `expo.out` |
| Fast               | 0.5s                                          |
| Standard           | 0.8-1.2s                                      |
| Stagger            | 0.12-0.16s                                    |
| Parallax range     | images 6-10%, never more                      |

Rules:

- Every animation must have a purpose (guide the eye, show progress, confirm an action)
- Nothing appears simultaneously: vary delay and duration
- Hero headline: each line rises through a mask, one after another
- Page load: short sequence (logo, nav, hero lines), under 2s, skippable by interaction
- Smooth scroll with Lenis; ScrollTrigger synced to it

**Mobile:** disable magnetic and cursor glow, halve particle count, shorten parallax, keep reveals. **Reduced motion:** no Lenis, no parallax, no marquee movement; content just fades in.

## 9. Responsive behavior

Breakpoints: 640 / 900 / 1280. Under 900px: single column, asymmetry becomes stacked with alternating image alignment, carousels become swipeable, nav becomes full-screen menu, minimum tap target 44px.

## 10. Accessibility

WCAG 2.2 AA; visible focus rings (gold on dark, blue on light); semantic landmarks; alt text from content source; captions on video; all motion respects `prefers-reduced-motion`; no information carried by color alone; carousels and accordions fully keyboard operable.

## 11. Do and don't

- Do: let photography and type carry the page; leave space; keep one idea per section
- Don't: box everything, stack borders, use clip art or stock handshakes, overuse maroon, add effects without purpose
