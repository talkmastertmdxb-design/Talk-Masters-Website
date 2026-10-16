# FEATURES.md: Talk-Masters Website Features

Priority: **P0** launch, **P1** launch if time allows, **P2** post-launch. Each feature lists acceptance criteria.

## 1. Experience layer

| ID   | Feature                              | Pri | Acceptance criteria                                                                                                                                                                       |
| ---- | ------------------------------------ | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | **Cinematic hero**                   | P0  | Full-viewport card; 3-line headline with only "Confidence." in gold; speaker image with subtle parallax; drifting particles; faint light beams; two CTAs; stat strip; LCP image preloaded |
| F-02 | **Masked headline reveal**           | P0  | Each line rises through a mask in sequence; runs once; skipped under reduced motion                                                                                                       |
| F-03 | **Floating glass navigation**        | P0  | Transparent at top, frosted after scroll; logo scales; animated underline links; persistent "Guest Visit" button; full-screen mobile menu                                                 |
| F-04 | **Smooth scroll**                    | P0  | Lenis, synced with ScrollTrigger; disabled for reduced motion and when focus is inside form fields                                                                                        |
| F-05 | **Staggered section reveals**        | P0  | Elements enter with varied timing; triggered once; no layout shift                                                                                                                        |
| F-06 | **Animated counters**                | P0  | Start only in viewport; smooth ease-out; final value correct without JavaScript                                                                                                           |
| F-07 | **Scroll-drawn timeline**            | P0  | Progress line fills with scroll; five milestones (Attend, Participate, Compete, Lead, Mentor) reveal in order                                                                             |
| F-08 | **Image rail**                       | P1  | Wide horizontal rail with photo, journey glass card, quote card; swipe and drag on touch                                                                                                  |
| F-09 | **Dual marquee**                     | P1  | Opposing rows; pauses on hover; static under reduced motion                                                                                                                               |
| F-10 | **Magnetic buttons and cursor glow** | P1  | Pointer devices only; subtle; off on touch and reduced motion                                                                                                                             |
| F-11 | **Page transitions**                 | P2  | Short fade/mask between routes; focus and scroll position handled correctly                                                                                                               |
| F-12 | **Loading sequence**                 | P2  | Under 2 seconds; never blocks content on repeat visits                                                                                                                                    |

## 2. Content sections

| ID   | Feature                | Pri | Acceptance criteria                                                                                      |
| ---- | ---------------------- | --- | -------------------------------------------------------------------------------------------------------- |
| F-20 | **About / Who we are** | P0  | Statement headline, short copy, bento stat cards                                                         |
| F-21 | **Why join**           | P0  | Four benefit rows with icons and a large photo                                                           |
| F-22 | **Meeting experience** | P0  | Prepared Speeches, Impromptu Speaking, Leadership Projects, Constructive Feedback, each with description |
| F-23 | **Member journey**     | P0  | Sticky intro and animated timeline                                                                       |
| F-24 | **Achievements**       | P1  | Club and member achievements with year, optional certificate image                                       |
| F-25 | **Member stories**     | P0  | Before / Today layout, photo, quote; detail page with optional video                                     |
| F-26 | **Events**             | P0  | Featured event card plus upcoming and past lists; detail page; add-to-calendar; status badge             |
| F-27 | **Leadership team**    | P1  | Officer portraits, roles, term; bio on hover or tap                                                      |
| F-28 | **Gallery**            | P1  | Masonry grid, event filter, lightbox with keyboard navigation, lazy loading                              |
| F-29 | **Testimonials**       | P0  | Scrolling review cards with name and role                                                                |
| F-30 | **FAQ**                | P1  | Accessible accordion; first-time-guest questions                                                         |
| F-31 | **Final CTA band**     | P0  | "Ready To Become A Better Speaker?" with Book A Guest Visit                                              |
| F-32 | **Footer**             | P0  | Logo, tagline, meeting details, links, socials, legal                                                    |

## 3. Conversion

| ID   | Feature                      | Pri | Acceptance criteria                                                                                                                                       |
| ---- | ---------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-40 | **Guest-visit form**         | P0  | Name, email, phone (optional), "which meeting", short note; validation; spam protection; success state; confirmation email; stored for the club to review |
| F-41 | **Persistent CTA**           | P0  | A guest-visit action reachable in one click from every page and every scroll position                                                                     |
| F-42 | **Newsletter capture**       | P2  | Email field with consent text                                                                                                                             |
| F-43 | **Event RSVP**               | P2  | Optional per-event registration with capacity                                                                                                             |
| F-44 | **Click-to-call / map link** | P1  | Venue link opens maps; contact email link                                                                                                                 |

## 4. Content management (Google Drive)

| ID   | Feature                      | Pri | Acceptance criteria                                                                                                 |
| ---- | ---------------------------- | --- | ------------------------------------------------------------------------------------------------------------------- |
| F-50 | **Drive sync**               | P0  | Reads a defined folder tree and spreadsheet(s); builds typed content; runs on schedule and on demand                |
| F-51 | **Content validation**       | P0  | Missing fields, bad dates, oversized or missing images produce readable errors; failed sync keeps last good content |
| F-52 | **Media pipeline**           | P0  | Images become responsive AVIF/WebP at several widths with blur placeholders; videos get posters                     |
| F-53 | **Add content without code** | P0  | Dropping a new event or story into Drive appears on the site after the next sync, no developer needed               |
| F-54 | **Draft vs published**       | P1  | Status column controls visibility; drafts previewable on a private URL                                              |
| F-55 | **Consent flag**             | P1  | Items without media consent are excluded                                                                            |
| F-56 | **Manual refresh**           | P1  | Protected webhook or button to republish immediately                                                                |

## 5. Platform

| ID   | Feature                 | Pri | Acceptance criteria                                                                           |
| ---- | ----------------------- | --- | --------------------------------------------------------------------------------------------- |
| F-60 | **Responsive design**   | P0  | Layout verified at 360, 768, 1024, 1440                                                       |
| F-61 | **Accessibility**       | P0  | WCAG 2.2 AA; keyboard and screen reader pass; reduced motion honored                          |
| F-62 | **SEO**                 | P0  | Per-page metadata, Open Graph images, sitemap, robots, Event and Organization structured data |
| F-63 | **Analytics**           | P1  | Privacy-friendly; tracks CTA clicks, form submissions, scroll depth                           |
| F-64 | **Performance budget**  | P0  | Lighthouse mobile 90+, Core Web Vitals pass                                                   |
| F-65 | **Error and 404 pages** | P0  | On-brand, with path back to home and guest CTA                                                |
| F-66 | **Security basics**     | P0  | HTTPS, security headers, rate-limited form endpoint, no secrets in the client                 |
| F-67 | **Multilingual / RTL**  | P2  | Content model and layout ready for Arabic                                                     |

## 6. Build order

1. Design tokens, layout grid, nav, buttons, hero (F-01 to F-05)
2. Stats, about, meeting experience, timeline (F-06, F-07, F-20 to F-23)
3. Drive sync and media pipeline (F-50 to F-52)
4. Stories, events, testimonials, CTA, footer (F-25, F-26, F-29, F-31, F-32)
5. Guest form and persistent CTA (F-40, F-41)
6. Team, gallery, FAQ, rail, marquee (F-08, F-09, F-27, F-28, F-30)
7. QA: accessibility, performance, SEO, content load; then P2 items
