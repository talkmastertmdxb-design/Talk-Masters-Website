# PRD.md: Talk-Masters Toastmasters Club Website

## 1. Summary

A premium, story-driven website for Talk-Masters Club (a Toastmasters International club, open to everyone of every age and gender) that makes visitors think: "These people are confident, professional, inspiring, and this is a community I want to be part of." The site's job is to convert curious visitors into guests at a meeting.

## 2. Goals

1. Inspire visitors with a memorable, high-craft first impression
2. Increase guest registrations (primary conversion)
3. Showcase club achievements and member growth stories
4. Present the club as modern and professional
5. Make content updates easy for non-developers (all content lives in Google Drive)

## 3. Non-goals (v1)

- Member login, dues, or payment
- Full member directory or social features
- Multi-language support (design for it, ship English first)
- Native mobile app

## 4. Audience

| Persona                           | Needs                                                         |
| --------------------------------- | ------------------------------------------------------------- |
| Student or young adult            | Low-pressure way to practise speaking; proof it helps careers |
| Parent, career changer or retiree | A welcoming place at any age; confidence for new chapters     |
| Young professional                | Leadership experience, networking, credibility                |
| Future leader                     | A path from beginner to mentor                                |
| Public speaking enthusiast        | Contests, quality of feedback                                 |
| Prospective guest                 | When, where, what happens, is it safe to try                  |

## 5. User journey

| Stage       | Feeling                      | Site answer                                         |
| ----------- | ---------------------------- | --------------------------------------------------- |
| Landing     | "Wow, this looks different." | Cinematic hero, clear headline                      |
| Exploration | "I can see the value."       | Stats, journey, stories                             |
| Engagement  | "I want to learn more."      | Meeting format, events, testimonials, FAQ           |
| Conversion  | "I want to attend."          | Guest-visit CTA, repeated and always one click away |

## 6. Success metrics

| Metric                       | Target (to confirm with the club)                               |
| ---------------------------- | --------------------------------------------------------------- |
| Guest-visit form completions | Baseline in month 1, then +X% growth                            |
| CTA click-through from hero  | Tracked                                                         |
| Scroll depth to final CTA    | Tracked                                                         |
| Lighthouse (mobile)          | Performance 90+, Accessibility 95+, SEO 95+, Best Practices 95+ |
| Core Web Vitals              | LCP < 2.5s, INP < 200ms, CLS < 0.1                              |
| Content update time          | A new event or story live in under 1 day without a developer    |

## 7. Scope

**Must have (v1)**

- Pages: Home (all sections), Events (list and detail), Stories (list and detail), Team, Gallery, Join / Guest Visit, FAQ, 404, Privacy
- Guest-visit registration form with confirmation
- Google Drive powered content (see ARCHITECTURE.md)
- Responsive, accessible, SEO-ready
- Animation system with reduced-motion support

**Should have**

- Video testimonials and story video
- Gallery lightbox with event filters
- Newsletter or email capture
- Add-to-calendar for events
- Open Graph images per page

**Could have (later)**

- Meeting RSVP with capacity
- Speech/achievement showcase archive
- Bilingual (English/Arabic, RTL) given the Dubai base
- Member-only area

## 8. Content requirements

Content is authored by the club in Google Drive. Required content types:

| Type          | Fields                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| Site settings | Club name, tagline, meeting day/time/venue, contact email, social links, stats |
| Event         | Title, date/time, venue, type, banner, description, status, gallery            |
| Member story  | Name, role, before, today, quote, photo, optional video                        |
| Testimonial   | Quote, name, role, optional photo                                              |
| Officer       | Name, role, term, photo, short bio, optional social link                       |
| Achievement   | Title, year, description, certificate image                                    |
| Gallery item  | Image or video, caption, event, date                                           |
| FAQ           | Question, answer                                                               |

Consent: no member photo, name or story is published without written permission recorded in the content source.

**Content gaps today:** real photos beyond one speaker image, member stories and quotes, officer profiles, events, meeting logistics, verified statistics. The site ships with clearly marked placeholders until supplied.

## 9. Non-functional requirements

- **Performance:** responsive image variants (AVIF/WebP), lazy load below the fold, video poster frames, no layout shift, JS budget under 250KB gzipped for the initial route excluding deferred animation chunks
- **Accessibility:** WCAG 2.2 AA
- **SEO:** server-rendered pages, metadata, sitemap, structured data (Organization, Event), clean URLs
- **Privacy:** minimal analytics, consent where required, guest data stored securely and used only to contact the guest
- **Reliability:** site stays up and serves last good content if Google Drive is unavailable
- **Browser support:** last 2 versions of Chrome, Safari, Edge, Firefox; iOS Safari 16+

## 10. Constraints and assumptions

- Brand must stay compatible with Toastmasters International guidelines; verify before launch
- Hosting on a modern edge platform (Vercel assumed)
- The Google Drive structure is controlled by the club and must follow the agreed folder schema
- Design inspiration (Bailey Hart, Zeneth) informs structure and quality, not copied assets

## 11. Risks

| Risk                                     | Mitigation                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Heavy animation hurts mobile performance | Performance budget, mobile-reduced motion, test on mid-range devices |
| Drive content is messy or inconsistent   | Strict folder and file naming schema, validation with clear errors   |
| Large photo collections slow the site    | Build-time image pipeline, CDN, lazy loading, pagination             |
| Placeholder content ships by accident    | Publish checklist; placeholders visibly flagged in staging           |
| Brand misuse of the Toastmasters mark    | Brand review before launch                                           |
| Drive API quotas or outages              | Build-time sync with cached snapshot, not live requests              |

## 12. Milestones

1. Discovery sign-off: brand, content inventory, Drive schema
2. Design: key screens (home, event, story), motion prototype
3. Build: design system, home page, content pipeline
4. Build: remaining pages, forms, gallery
5. Content load, QA, accessibility and performance pass
6. Launch, analytics review, 30-day iteration

## 13. Open questions

1. Where and when are meetings, and how does a guest register today?
2. Who owns Drive content and publishes updates?
3. Are the stats (500+, 50+, 100+, 20+) verified and how often do they change?
4. Is Arabic needed at launch?
5. Is there an existing domain and email setup?
6. Should the guest form notify via email, a spreadsheet, or both?
7. Can the club supply real photography and consent forms?
8. Does Toastmasters International or the district need to approve the site or logo usage?
