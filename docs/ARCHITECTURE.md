# ARCHITECTURE.md: Talk-Masters Website

## 1. Principles

- **Fast by default:** static or incrementally generated pages served from the edge
- **Content is data:** the club edits Google Drive; the site never edits code to change content
- **Drive is a source, not a runtime dependency:** content is synced and cached; visitors never hit Drive
- **Animation is progressive enhancement:** content is readable without JavaScript and without motion
- **Typed everywhere:** one schema defines content, validation, and components

## 2. Stack

| Layer                      | Choice                                                                                                               | Why                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework                  | **Next.js (App Router) + React + TypeScript**                                                                        | SSG/ISR, SEO, image handling; matches the README preference |
| Styling                    | **Tailwind CSS** with design tokens as CSS variables                                                                 | Fast, consistent, tokens from BRAND.md                      |
| Scroll and timeline motion | **GSAP + ScrollTrigger**, **Lenis**                                                                                  | Precise scroll storytelling per the brief                   |
| UI motion                  | **Framer Motion**                                                                                                    | Route transitions, menus, accordions, presence animations   |
| Content source             | **Google Drive + Google Sheets** via Google APIs                                                                     | Required by the brief                                       |
| Content schema             | **Zod**                                                                                                              | Validation and TypeScript types from one source             |
| Media                      | `sharp` build pipeline, `next/image`, blurhash                                                                       | Responsive AVIF/WebP, placeholders                          |
| Forms                      | Next.js route handler, Zod validation, Turnstile or hCaptcha, email provider (Resend) and a Sheet or database record | Spam-resistant, simple                                      |
| Hosting                    | **Vercel** (or Cloudflare)                                                                                           | Edge CDN, ISR, preview deploys                              |
| Media storage              | Object storage with CDN (Vercel Blob, S3 or R2)                                                                      | Do not hotlink Drive; Drive URLs are not stable or fast     |
| Analytics                  | Plausible or similar                                                                                                 | Privacy-friendly                                            |
| Quality                    | ESLint, Prettier, Playwright, axe, Lighthouse CI                                                                     | Guards accessibility and performance                        |

A prototype single-file HTML build (GSAP + Lenis) exists and can serve as a motion reference; production should follow this architecture.

## 3. System diagram

```
Google Drive folders + Google Sheets  (club edits here)
        │
        │  scheduled sync / webhook / manual refresh
        ▼
Sync worker (Node script or serverless job)
  - fetch sheets + files via Google API (service account, read-only)
  - validate with Zod schemas
  - process media (resize, AVIF/WebP, blurhash, video posters)
  - upload media to object storage / CDN
  - write content snapshot (JSON) to storage and trigger revalidation
        │
        ▼
Next.js app (Vercel)
  - reads snapshot at build time and via ISR
  - server components render pages
  - client components handle animation only
        │
        ├── Visitors (edge cache, CDN media)
        └── /api/guest-visit  →  validate → spam check → store → email club + guest
```

## 4. Google Drive content model

Suggested structure (owned by the club):

```
Talk-Masters Website/
├── settings            (Sheet: club info, meeting details, stats, social links)
├── events/             (Sheet: events; one subfolder per event with banner + gallery)
├── stories/            (Sheet: stories; photos and optional video by name)
├── testimonials        (Sheet)
├── officers/           (Sheet + portraits)
├── achievements/       (Sheet + certificate images)
├── gallery/            (event-named folders of photos/videos)
└── faq                 (Sheet)
```

Rules:

- Sheets are the structured source (one row per item, a `status` column of draft or published, a `consent` column, a stable `slug`)
- Files are matched to rows by slug or filename convention
- The sync uses a read-only service account shared on the root folder
- Changes are detected by modified time and checksum so only new or changed media is reprocessed

## 5. Application structure

```
/app
  layout.tsx            fonts, tokens, nav, footer, smooth-scroll provider
  page.tsx              home (composes sections)
  events/               list + [slug]
  stories/              list + [slug]
  team/  gallery/  faq/  join/
  api/guest-visit/route.ts
  api/revalidate/route.ts   (secret-protected)
/components
  sections/             Hero, WhoWeAre, ImageRail, Meetings, Impact, Journey, Stories, Events, Team, Gallery, Testimonials, Faq, GuestBand
  ui/                   Button, Card, GlassNav, Marquee, Accordion, Lightbox, Counter
  motion/               SmoothScroll, Reveal, MaskText, Parallax, Magnetic, ScrollProgress
/lib
  content/              schemas (Zod), loaders, types
  sync/                 drive client, sheet parsers, media pipeline
  seo/                  metadata and JSON-LD helpers
/styles/tokens.css      brand variables from BRAND.md
/scripts/sync.ts
/content-cache/         last good snapshot
```

## 6. Rendering and caching

- Pages are statically generated from the snapshot; ISR revalidates after each sync
- Event and story detail pages generated per slug
- Home is fully static; only the guest form uses a dynamic endpoint
- Media served from CDN with long cache and content-hashed URLs
- If a sync fails validation, the previous snapshot stays live and the club is notified

## 7. Animation architecture

- **Server-first:** all content is rendered as HTML; animation components only enhance
- A single `SmoothScroll` provider owns Lenis and syncs ScrollTrigger once
- Reusable primitives (`Reveal`, `MaskText`, `Parallax`, `Counter`, `ScrollProgress`) take timing from shared tokens (ease `expo.out`, durations 0.5-1.4s, stagger 0.12-0.16s)
- GSAP and Lenis loaded in a deferred client chunk; hero reveal uses CSS fallback if JS is late
- Use `gsap.matchMedia()` to branch desktop, mobile and reduced-motion behavior
- Kill triggers on unmount; `ScrollTrigger.refresh()` after images load to avoid drift
- Animate only `transform` and `opacity`; avoid layout-triggering properties
- Particles: a single canvas, capped count (50 desktop, ~20 mobile), paused when off-screen or tab hidden
- Framer Motion used for UI state transitions, not for scroll storytelling, to avoid two systems fighting over one element

## 8. Media strategy

- Source files uploaded to Drive at full quality
- Pipeline outputs widths 480, 768, 1280, 1920 in AVIF and WebP, plus a blurhash placeholder
- Hero image preloaded; everything below the fold lazy
- Video: compressed MP4/WebM with a poster image; hero loop under 3MB and disabled on data-saver or reduced motion
- Gallery paginates or virtualizes beyond ~60 images

## 9. Guest-visit flow

1. Visitor submits form on `/join` or in the final band
2. Route handler validates (Zod), checks bot token, rate-limits by IP
3. Record saved (Google Sheet row or database)
4. Confirmation email to guest; notification to officers
5. Success state shown inline; event fired to analytics

## 10. Security and privacy

- Google credentials, email keys and webhook secret stored in environment variables, server-side only
- Drive access is read-only and limited to the website folder
- No personal guest data in client bundles or logs
- Security headers (CSP, HSTS, frame, referrer), HTTPS only
- Consent column enforced: items without consent never leave the sync worker
- Data-retention policy for guest submissions documented on the privacy page

## 11. Quality gates

- CI runs lint, type-check, unit tests for schemas and parsers
- Playwright: smoke tests for each route and the guest form
- axe checks on key pages; manual keyboard and screen-reader pass
- Lighthouse CI budgets: performance 90+, accessibility 95+
- Visual review on real mobile devices for scroll and animation smoothness
- Preview deploy for every pull request; content previews via draft status

## 12. Deployment

- Environments: local, preview (per branch), production
- Sync runs on a schedule (for example every 15 minutes) plus a manual trigger
- Rollback: redeploy previous build; snapshot history kept
- Monitoring: uptime check, error tracking, sync-failure alerts

## 13. Decisions to confirm

1. Hosting provider and domain ownership
2. Guest data store: Google Sheet vs database
3. Sync cadence and who is notified of sync errors
4. Whether Arabic/RTL is needed at launch
5. Media storage provider and budget
