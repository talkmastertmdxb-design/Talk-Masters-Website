# GROWTH_PLAN.md: Talk-Masters Website

How the website delivers the club's marketing strategy: more guests, more second visits, more members who stay, and members who bring others.

This plan **builds on** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), which remains the source of truth for the experience design, motion language and the build phases 0-11. Growth phases are numbered **G0-G6** so they never clash with those. Where a growth phase replaces or extends a build phase, it says so and marks the change **[Change]**. Section 10 lists the changes that need sign-off.

---

## 1. The strategy in one page

**Positioning:** _Talk-Masters: where Dubai rehearses its big moments._ People don't join to "improve their public speaking". They join to get ready for an interview, a promotion, a pitch, a toast, or to find their first community in a new city.

**Framework:** every visitor moves through five stages. The site has one job at each one.

| Stage      | Visitor's question              | The site's job                                                 | Phase  |
| ---------- | ------------------------------- | -------------------------------------------------------------- | ------ |
| **Notice** | "Is this for people like me?"   | Speak to their moment, not to a demographic                    | G2, G5 |
| **Visit**  | "Will I be embarrassed?"        | Remove every unknown; promise they never have to speak         | G1, G2 |
| **Belong** | "Do these people know me?"      | Capture the right data so a human follows up within 24 hours   | G1, G4 |
| **Become** | "Am I actually changing?"       | Make members' progress public                                  | G3     |
| **Bring**  | "Who do I know who needs this?" | Give every member a personal invitation and something to share | G4     |

**What the site can't do:** it can't make the meeting good. Every phase is paired with an in-room ritual (section 8) that the club launches at the same time. A better website that brings people to a flat meeting only spreads the flat meeting further.

**North-star metric:** guests who return for a second visit. Section 9 defines the full funnel.

---

## 2. Where we are today

| Area                  | State (2026-10-20)                                                                                        | Consequence                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Booking               | [/join](../src/app/join/page.tsx) ends in an **"Email us to book" `mailto:`** link to `hello@example.com` | Most mobile visitors drop off here, and we learn nothing about them         |
| Meeting details       | Day, venue and stats in `content/settings.json` are placeholders                                          | The hero can't show "Next meeting: …"; the numbers can't be trusted         |
| Tagline               | "A Club with Difference"                                                                                  | Says there's a difference, never says what it is                            |
| Home page             | Hero, About, FearStory, InsideMeeting, TableTopicsBooth, MemberSpotlight, ExecutiveCommittee              | Strong on "what happens"; nothing yet on "is it for me?" or proof of change |
| People pages          | `/members` (journey dialogs, no individual pages), `/team`, `/our-story`, `/achievements`                 | Good foundation for proof; stories have no shareable URL                    |
| Content model         | Zod schemas in `src/lib/content/schemas.ts`, `ContentRepository` with consent and draft rules             | Every new content type below plugs into the same pattern                    |
| Planned but not built | Phase 6 (booking form, `/meetings`, `/events`, FAQ), Phase 8 (SEO, analytics), Phase 11 (Drive CMS)       | G1 delivers Phase 6 with growth data built in                               |

---

## 3. Phase overview

| Phase  | Name                           | Strategy stages | When                     | Effort (1 developer)    | Gate                                                              |
| ------ | ------------------------------ | --------------- | ------------------------ | ----------------------- | ----------------------------------------------------------------- |
| **G0** | Decisions and content          | All             | Now, in parallel with G1 | Club: 1-2 weeks         | Section 10 decisions signed off; real meeting details             |
| **G1** | Booking engine                 | Visit, Belong   | Weeks 1-2                | 7-9 days                | E2E booking flow; security review; first real booking logged      |
| **G2** | Perception and reassurance     | Notice, Visit   | Week 3, before launch    | 5-6 days                | Copy signed off; 360px hero shows promise + date + button         |
| —      | **Launch** (build Phases 7-10) | —               | Week 4                   | see IMPLEMENTATION_PLAN | `check:content --strict` passes                                   |
| **G3** | Proof of change                | Become          | Months 1-2               | 6-8 days                | 5 real wins and 3 real debuts published with consent              |
| **G4** | Referrals, events and cohorts  | Bring, Belong   | Months 2-3               | 8-10 days               | 10 members have live invite pages; first signature event sold out |
| **G5** | Reach and partnerships         | Notice          | Months 3-6               | 7-9 days                | 3 moment landing pages indexed; first partner enquiry             |
| **G6** | Scale                          | All             | Months 6-18              | 15-25 days              | Officers publish wins and events with no developer                |

Order rationale: **G1 first because everything else depends on its data.** The moment a guest chose, who invited them, and whether they came back are what make the follow-up, the campaigns and the referral system work.

---

## 4. G0: Decisions and content (club, now)

No code. These unblock everything else and run alongside G1.

| #    | Task                                                                                                                              | Owner                 | Needed by |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------- |
| G0.1 | Confirm meeting day, venue, map link, parking and entrance details                                                                | VP Education          | G1        |
| G0.2 | Choose where guest data lives (recommended: a Google Sheet owned by the club account) and who can see it                          | President             | G1        |
| G0.3 | Name the **Guest Host** roster: who meets guests at the door each meeting                                                         | VP Membership         | G1        |
| G0.4 | Approve the positioning line and replace the tagline (section 10, G-D1)                                                           | Committee             | G2        |
| G0.5 | Replace placeholder stats with real numbers, or remove them                                                                       | VP Education          | G2        |
| G0.6 | Check Toastmasters brand rules for the "green light" symbol, invite cards and campaign materials                                  | VP Public Relations   | G3, G4    |
| G0.7 | Start collecting consent forms: name, photo, words, video, and "may we publish your win"                                          | VP Public Relations   | G3        |
| G0.8 | Create accounts: Resend (email domain), Cloudflare Turnstile, Upstash (rate limit), Plausible (analytics), Google service account | Developer + President | G1        |

---

## 5. G1: Booking engine (weeks 1-2)

**Replaces build Phase 6's form scope [Change]:** same stack as IMPLEMENTATION_PLAN §5.1 (Server Action, Zod, Turnstile, Resend, Google Sheet, rate limit), plus the growth fields, the reminder, and the follow-up data.

**Goal:** a guest books in under 60 seconds on a phone, gets everything they need to arrive calmly, and the club knows what they're preparing for and who invited them.

### 5.1 The guest record

One Zod schema for everything the form sends, in `src/lib/booking/schema.ts` (it's a submission, not content, so it stays out of `content/schemas.ts`).

| Field       | Rule                                                                                     | Why                                          |
| ----------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| `name`      | Required, 2-80 characters, trimmed                                                       | The Guest Host greets them by name           |
| `email`     | Required, valid email                                                                    | Confirmation and reminder                    |
| `phone`     | Optional, digits with optional `+`, 7-15 digits                                          | WhatsApp follow-up, which is how Dubai talks |
| `meeting`   | Required; must match a published, upcoming `meeting` event slug                          | No bookings for past or unknown dates        |
| `moment`    | Optional; one of the slugs in `content/moments.json` (G2), or `curious`                  | Personal follow-up; campaign measurement     |
| `referrer`  | Optional; must match a member slug with `inviteEnabled` (G4), otherwise silently dropped | Referral attribution; never trust the URL    |
| `source`    | Optional, hidden; `utm_source`/`utm_campaign` from the URL, max 60 characters            | Which campaign or partner works              |
| `note`      | Optional, max 500 characters                                                             | "I'm nervous" or "I use a wheelchair"        |
| `privacy`   | Required checkbox: agrees to the privacy notice                                          | Lawful basis for storing personal data       |
| `website`   | Honeypot: must be empty                                                                  | Bot trap that needs no JavaScript            |
| `turnstile` | Required token, verified server-side                                                     | Spam protection                              |

The form asks only **name, email and meeting** up front. "What are you preparing for?" is a row of optional chips under them, pre-selected when the visitor arrived from a moment (G2) or an invite (G4).

### 5.2 Submission flow

```
GuestForm (client, useActionState)  ──►  bookGuestVisit (Server Action, src/app/join/actions.ts)
                                            1. rate limit by IP (Upstash, 5 per 10 min)
                                            2. honeypot + Turnstile verify
                                            3. Zod parse; resolve meeting, moment, referrer against content
                                            4. append row to the Guest Sheet  ◄── source of truth, awaited
                                            5. after(): confirmation email to guest (with .ics)
                                                        notification email to VP Membership + Guest Host
                                                        analytics event `booking_submitted`
                                            6. return { ok: true } → inline success state
```

- **The record is stored before any email is sent.** If the Sheet append fails, the action emails the full record to the club address instead, so a booking is never lost, and logs the error **without personal data**.
- Emails run in `after()` (read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md` first) so the guest isn't kept waiting.
- The form works without JavaScript except for Turnstile; without JS, the honeypot and rate limit still apply.
- Read `node_modules/next/dist/docs/01-app/02-guides/forms.md` and `server-actions.md` before building: this Next.js version differs from older guides.

### 5.3 The Guest Sheet (the club's CRM)

| Column                                 | Filled by               | Used for                        |
| -------------------------------------- | ----------------------- | ------------------------------- |
| `bookedAt`                             | Site                    | Funnel timing                   |
| `name`, `email`, `phone`               | Site                    | Contact                         |
| `meeting`                              | Site                    | Who to expect                   |
| `moment`, `referrer`, `source`, `note` | Site                    | Personal follow-up; attribution |
| `reminderSentAt`                       | Cron (5.5)              | Avoids double reminders         |
| `guestHost`                            | Officer                 | Who greets them                 |
| `attended`                             | Officer, at the meeting | Funnel: booked → came           |
| `followUpSentAt`                       | Guest Host              | The 24-hour promise             |
| `secondVisitOn`                        | Officer                 | **North-star metric**           |
| `joinedOn`                             | Officer                 | Funnel: came → member           |

Officers only ever type in the last five columns. The site never reads personal data back to the browser.

### 5.4 Emails

| Email              | To                                 | Content                                                                                                                                                                                     |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Confirmation**   | Guest                              | Date, time, venue, map link, parking, "what to wear: whatever you wore to work", Guest Host's first name and photo, "you will never be asked to speak", `.ics` attachment, WhatsApp contact |
| **New guest**      | VP Membership + Guest Host on duty | Name, meeting, **moment**, **inviter**, note; a ready-to-copy follow-up message template for after the meeting                                                                              |
| **Reminder** (5.5) | Guest                              | "See you tomorrow at 7", with the map link and one line from the Guest Host                                                                                                                 |

Email templates live in `src/lib/booking/emails.ts` as plain functions that return subject, text and HTML, so unit tests can snapshot them.

### 5.5 Calendar and reminder

- `.ics` per meeting at `src/app/events/[slug]/calendar.ics/route.ts`, statically generated, with two alarms (24 hours and 2 hours before). Also linked from the success state and event pages.
- Daily reminder: a cron route `src/app/api/cron/reminders/route.ts` (Vercel Cron, 09:00 Dubai time), protected by `CRON_SECRET`. It finds rows for tomorrow's meeting with an empty `reminderSentAt`, sends the reminder, and writes the timestamp back.

### 5.6 Privacy page

`/privacy` ships in G1 (moved forward from build Phase 7 **[Change]**) because G1 starts collecting personal data. It covers: what we collect, why, who sees it (named officer roles), where it's stored, how long we keep it (recommended: 12 months after the last visit), and how to ask for deletion. Written to the UAE Personal Data Protection Law (Federal Decree-Law 45 of 2021); the club should have it checked.

### 5.7 Files

| File                                            | Purpose                                                                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/booking/schema.ts`                     | Guest record schema (5.1)                                                                                                                                      |
| `src/lib/booking/sheet.ts`                      | Append and update rows (Google Sheets API, service account)                                                                                                    |
| `src/lib/booking/emails.ts`                     | Email templates (5.4)                                                                                                                                          |
| `src/lib/booking/turnstile.ts`, `rate-limit.ts` | Bot and abuse protection                                                                                                                                       |
| `src/lib/booking/ics.ts`                        | Calendar file builder                                                                                                                                          |
| `src/app/join/actions.ts`                       | `bookGuestVisit` Server Action                                                                                                                                 |
| `src/components/booking/GuestForm.tsx`          | The form, success state and errors                                                                                                                             |
| `src/app/join/page.tsx`                         | Rebuilt around the form and "Your first evening" (G2)                                                                                                          |
| `src/app/events/[slug]/calendar.ics/route.ts`   | `.ics` download                                                                                                                                                |
| `src/app/api/cron/reminders/route.ts`           | Daily reminder                                                                                                                                                 |
| `src/app/privacy/page.tsx`                      | Privacy notice                                                                                                                                                 |
| `.env.example`                                  | Add **commented, empty** names: `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GUEST_NOTIFY_EMAIL` (the env test requires empty values) |

### 5.8 Tests and gate

- **Unit:** schema accepts and rejects (bad email, past meeting, unknown referrer dropped, honeypot filled, note too long); `.ics` output (times in `Asia/Dubai`, alarms present); email templates (moment and inviter shown; no `undefined`); reminder selection (tomorrow only, skips already-sent).
- **Integration:** the action with Sheet, Resend and Turnstile mocked: stores before emailing; falls back to email when the Sheet fails; rate limit returns a friendly error.
- **E2E:** book from `/join` on a 360px viewport in under 3 taps after typing; success state shows calendar and map links; form keyboard-only; axe clean.
- **Security review** (security-reviewer agent): no secrets client-side, no personal data in logs, Turnstile verified server-side, cron route rejects requests without the secret.
- **Gate:** all of the above, plus one real booking end-to-end on the production domain.

---

## 6. G2: Perception and reassurance (week 3, before launch)

**Goal:** within 3 seconds a visitor sees their own situation; within 30 seconds every reason not to come is gone.

### 6.1 Positioning in the hero and metadata

| Change                                                                                                                                                              | Where                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Keep "Find your voice" as the emotional line; add the supporting line: _"The room where Dubai rehearses its big moments: interviews, pitches, promotions, toasts."_ | `src/components/sections/Hero.tsx` (copy from `settings.json`) |
| Next-meeting chip in the hero from the soonest published `meeting` event: "Next meeting: Tue 10 Nov, 7 pm"                                                          | Hero; already planned in IMPLEMENTATION_PLAN §2.2              |
| Replace the tagline (G-D1). Add `positioning` to `settingsSchema` so copy stays in content                                                                          | `content/settings.json`, `schemas.ts`                          |
| Site title and description lead with the outcome and the city: "Public Speaking & Leadership Club in Dubai"                                                         | `src/app/layout.tsx` metadata                                  |

### 6.2 "What's coming up for you?" (the moment picker)

A new home band **after About**, answering "is this for me?" before the body of the speech. It **replaces the planned full-bleed stacked words band** ("Students. Professionals. Parents…") **[Change]**: listing demographics says "everyone"; naming moments makes each visitor feel addressed.

**Content:** `content/moments.json`, one entry per moment, validated by a new `momentSchema`:

```jsonc
{
  "slug": "interview", // also the form value and the /for/ URL (G5)
  "label": "An interview", // the chip
  "headline": "Walk in having said it out loud.",
  "body": "Impromptu speaking every week is interview practice with a friendly panel.",
  "proof": { "memberSlug": "…", "winSlug": "…" }, // optional; links to real stories (G3)
  "status": "published",
  "placeholder": true,
}
```

Starting set: `interview`, `promotion`, `pitch`, `new-to-dubai`, `english-at-work`, `big-day` (toasts and speeches at weddings and events), plus a fixed "Just curious".

**Component:** `src/components/sections/MomentPicker.tsx`. An accessible tab list (arrow keys, `aria-selected`); the panel shows the headline, the body, a proof card if one exists, and a "Book a guest visit" button linking to `/join?moment=interview`. Motion: panel crossfade through the existing tokens, instant under reduced motion. Selection fires `moment_selected`.

### 6.3 Removing fear

| Change                                                                                                                                                                                                      | Where                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **"Your first evening"**: a minute-by-minute timeline (6:50 you arrive and a named Guest Host meets you → 7:00 → … → 9:00 you leave with three notes from members). Content in `content/first-evening.json` | `/join` above the form, and `/meetings`                                                |
| **The guest promise** ("You will never be asked to speak") as a small line under **every** booking button, not only in the FAQ                                                                              | `src/components/ui/GuestPromise.tsx`, used by Hero, footer band, `/join`, MomentPicker |
| **Plain-language glossary**: "Tonight's host", "Filler-word coach", "Unscripted". `content/glossary.json`; the agenda in InsideMeeting uses the plain names with the Toastmasters term as secondary text    | InsideMeeting, `/meetings`                                                             |
| **Arrival details**: parking, entrance photo, what to wear, step-free access                                                                                                                                | `settings.meeting` (new optional fields), `/join`                                      |
| **FAQ** rewritten around real search questions, with `FAQPage` JSON-LD (build Phase 6 item, unchanged)                                                                                                      | Home close, `/meetings`                                                                |

### 6.4 Truthful numbers

- Remove any stat still marked `placeholder` before launch; `check:content --strict` already blocks it. Smaller real numbers beat round invented ones.

### 6.5 Tests and gate

- Unit: `momentSchema`, `glossarySchema`, `firstEveningSchema`; `?moment=` pre-selects the chip and an unknown value is ignored.
- E2E: on 360px, the hero shows the promise, next meeting and button without scrolling; the moment picker is keyboard-operable; every booking button has the guest promise next to it; axe clean.
- **Gate:** the committee signs off the copy; five people who've never been to a meeting read the home page on a phone and can say when, where and "I don't have to speak".

---

## 7. Post-launch phases

### 7.1 G3: Proof of change (months 1-2)

**Goal:** show people changing, not meetings happening.

| Deliverable                  | Detail                                                                                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wins** content type        | `content/wins.json`: `slug`, `displayName` (first name, or "A member"), `memberSlug?`, `moment?`, `text` (max 160 characters: "Ran my first leadership meeting"), `date`, `consent`, `status`. The repository filters drafts and wins without consent, as it does for people |
| **Wins wall**                | Home band in the Body act, after MemberSpotlight; full list at `/wins`, filterable by moment. Lines rise in with `data-reveal`; static under reduced motion                                                                                                                  |
| **Member levels and debuts** | Extend `memberSchema` with `level` (`guest`, `debut`, `graduate`, `mentor`, `host`, `ambassador`) and `debutOn?`. A **debut wall** on `/members`: newest debuts first, each with a green-light badge (reuses `TimingLight` styling)                                          |
| **Story pages** **[Change]** | `/stories/[slug]` for members who opt in (`storyPage: true`). Plan.md has no individual member pages; these are needed so a story has a URL to share. First-speech vs tenth-speech video when consented: a click-to-load YouTube-nocookie facade with captions required      |
| **Share images**             | `opengraph-image.tsx` for `/stories/[slug]` and `/wins/[slug]` via `next/og`, in brand style: photo, one line, the green light, club name. Read the `opengraph-image.md` docs first                                                                                          |
| **Achievements reframed**    | `/achievements` leads with life wins, then Toastmasters awards                                                                                                                                                                                                               |

**Content pipeline until the Drive CMS (G6):** members submit a win through a Google Form; an officer approves it and the developer adds it to `wins.json` weekly. That takes a few minutes and keeps every claim checked.

**Gate:** 5 real wins and 3 real debuts live, each with recorded consent; share images pass the LinkedIn Post Inspector and the Facebook sharing debugger.

### 7.2 G4: Referrals, events and cohorts (months 2-3)

**Goal:** turn members into the main source of new guests, and give non-members a low-commitment way in.

#### Personal invitations

| Deliverable            | Detail                                                                                                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Member fields          | `inviteEnabled` (opt-in) and `inviteNote` (one line, "Come on Tuesday, I'll save you a seat") in `memberSchema`                                                                                                                                                   |
| `/invite/[slug]`       | Statically generated for opted-in members with consent. Shows "**[Name] invited you**", their photo and note, the next meeting, the guest promise, and the booking form with the referrer pre-filled. `noindex`. Unknown slugs return 404                         |
| Printable invite cards | `/print/invite-cards` (unlisted, `noindex`, print CSS): a sheet of business-card-sized cards per member with a QR code to `/invite/[slug]?utm_source=card`. QR rendered at build time as SVG (pick a maintained package, e.g. `qrcode`, after checking it on npm) |
| Inviter recognition    | The monthly report (section 9) counts bookings and attendances per inviter so officers can thank people publicly. **No cash or prizes for referrals**                                                                                                             |

#### Signature events

| Deliverable            | Detail                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event schema additions | `series?` (`unscripted-dubai`, `pitch-night`, `iftar-stories`, `worst-speech`, `speech-of-the-year`), `capacity?`, `rsvpOpen` (boolean), `audience?` (`everyone`, `members`)                                                    |
| `content/series.json`  | One page per series: what it is, why come, past photos, next date                                                                                                                                                               |
| RSVP                   | The same Server Action with `kind: "event"`; the Sheet gets an `event` column. Seats left = capacity minus rows for that event, read server-side and cached for one minute. When full, the button becomes **Join the waitlist** |
| Event pages            | `/events` and `/events/[slug]` (build Phase 7), with `Event` JSON-LD, `.ics`, share image, and "seats left" when under 10                                                                                                       |
| Ticketed showcase      | Speech of the Year links to an external ticketing service. **Don't build payments**                                                                                                                                             |

#### Cohorts

| Deliverable            | Detail                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/cohorts.json` | `slug`, `name` ("January 2027 cohort"), `applyBy`, `startsOn`, `graduationOn`, `seats`, `seatsTaken` (officer updates it), `status`                            |
| Cohort banner          | On `/join` and in the home close: "The January cohort starts 15 Jan. 8 places left." Closes automatically after `applyBy`; shows "Join the waitlist" when full |
| Booking link           | Guests who attended can apply with `kind: "cohort"`; the Sheet records the cohort                                                                              |

**Gate:** 10 members have live invite pages; one signature event reaches capacity; invite-sourced bookings are visible in the monthly report.

### 7.3 G5: Reach and partnerships (months 3-6)

**Goal:** bring in people who've never heard of Toastmasters, through search, campaigns and partners.

| Deliverable              | Detail                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Moment landing pages** | `/for/[moment]` from `moments.json` with `generateStaticParams`: headline, a member story in that moment, relevant wins, the first-evening timeline, FAQ, form with the moment pre-filled. Titles aimed at local searches ("Interview practice in Dubai"). Ship 3 first: `new-to-dubai`, `interview`, `promotion` |
| **Campaign links**       | A short UTM convention in this doc's appendix (`utm_source` = linkedin, instagram, card, partner-name; `utm_campaign` = moment or event slug). Every campaign links to a landing page, never the home page                                                                                                        |
| **`/companies`**         | For learning and development teams: a free lunchtime demo meeting; enquiry form (`kind: "company"`, company name, team size)                                                                                                                                                                                      |
| **`/recruiters`**        | Mock Interview Nights: recruiters run real interviews, members practise; enquiry form (`kind: "recruiter"`)                                                                                                                                                                                                       |
| **`/alumni`**            | "Once a Talk-Master": former members grouped by the country they live in now (`segment: "alumni"` plus `currentCity`), with a line on what they do. A plain list; no map library                                                                                                                                  |
| **`/speak-up`**          | Community workshops (job seekers, women returning to work, teenagers through Toastmasters' Youth Leadership Program): `content/initiatives.json`, partner logos, how to request one                                                                                                                               |
| **Newsletter** (F-42)    | "This month's wins": one email a month, double opt-in through Resend, link in the footer                                                                                                                                                                                                                          |

**Gate:** 3 landing pages indexed in Google Search Console; the first company or recruiter enquiry received; campaign bookings attributed in the monthly report.

### 7.4 G6: Scale (months 6-18)

| Deliverable                    | Why                                                                                       | Notes                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Drive CMS** (build Phase 11) | Wins, events and cohorts change weekly; officers must publish them without a developer    | `DriveContentRepository` behind the existing interface; no component changes         |
| **Arabic and right-to-left**   | Reach Arabic-speaking members and partners; Ramadan events                                | Large: routing, fonts, mirrored layouts and motion. Read the Next.js i18n docs first |
| **Sister club page**           | When meetings pass about 35 people, sponsor a new club and point the overflow to it       | Content page plus a second meeting in `events.json`                                  |
| **Annual impact report page**  | A yearly page with real funnel numbers, wins and Speak Up reach for partners and sponsors | Built from the monthly reports                                                       |

---

## 8. In-room rituals paired with each phase

The site and the room must change together. The club owns this column.

| Phase | Website delivers                                  | The club launches                                                                                                 |
| ----- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| G1    | Booking with moment and inviter; Guest Host email | Guest Host at the door; **personal follow-up within 24 hours** that mentions the guest's moment                   |
| G2    | The guest promise; plain-language roles           | Nobody is called on to speak; the meeting uses the same plain role names as the site                              |
| G3    | Wins wall; debut wall; story pages                | **Win of the Week** (3 minutes each meeting); the **Debut** ritual for first speeches; consent forms at the table |
| G4    | Invite pages and cards; events; cohorts           | Invite cards handed out; inviters thanked publicly; **green cards** for guests; Graduation Night                  |
| G5    | Landing pages; company and recruiter pages        | A named owner for partnerships; a recruiter night each quarter                                                    |
| G6    | Drive CMS                                         | Officers publish weekly                                                                                           |

---

## 9. Measurement

### 9.1 The funnel

| Step                       | Measured by                             | Year-3 target       |
| -------------------------- | --------------------------------------- | ------------------- |
| Visit                      | Plausible page views                    | —                   |
| Moment chosen              | `moment_selected` event                 | —                   |
| Booked                     | Sheet row (and `booking_submitted`)     | Baseline in month 1 |
| Attended                   | `attended` column                       | 70% of bookings     |
| **Second visit**           | `secondVisitOn` column (**north star**) | 50% of attendees    |
| Joined                     | `joinedOn` column                       | 30% of attendees    |
| Still active at 90 days    | Membership list                         | 75% of new members  |
| Came through an invitation | `referrer` present                      | 50% of new members  |

### 9.2 Analytics events

Privacy-friendly (Plausible or Vercel Web Analytics), no cookies, no personal data in event properties.

`cta_click` (location), `moment_selected` (moment), `booking_started`, `booking_submitted` (moment, has_referrer, source), `booking_failed` (reason), `invite_page_view`, `event_rsvp` (event), `waitlist_join`, `booth_start`, `booth_complete`, `share_click` (page type).

### 9.3 Monthly report

`scripts/funnel-report.ts` (read-only service account) reads the Guest Sheet and prints the funnel for the last month, broken down by **moment**, **source** and **inviter**. The committee reviews it at each monthly meeting and decides one thing to change. This is how the club learns, for example, that "new to Dubai" guests return twice as often as "interview" guests, and moves effort there.

---

## 10. Decisions needed

| #    | Decision                                                                    | Recommendation                                                            | Blocks |
| ---- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| G-D1 | Positioning line and new tagline                                            | "Where Dubai rehearses its big moments"; drop "A Club with Difference"    | G2     |
| G-D2 | Guest data store, who can see it, retention period                          | Club-owned Google Sheet; President, VP Membership, Guest Hosts; 12 months | G1     |
| G-D3 | Moment picker replaces the stacked-words band (§6.2)                        | Approve                                                                   | G2     |
| G-D4 | Individual story pages for opted-in members (§7.1), an exception to Plan.md | Approve; opt-in only                                                      | G3     |
| G-D5 | The green light as the club symbol, on cards and badges                     | Approve after the TI brand check (G0.6)                                   | G3, G4 |
| G-D6 | Adopt quarterly cohorts                                                     | Pilot one cohort in January 2027                                          | G4     |
| G-D7 | Analytics provider                                                          | Plausible (no cookie banner needed)                                       | G1     |
| G-D8 | Privacy notice reviewed by someone with legal knowledge                     | Before G1 goes live                                                       | G1     |

## 11. Risks

| Risk                                                        | Mitigation                                                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| The site succeeds but the meeting experience doesn't change | Section 8: no phase ships without its ritual; the committee tracks second visits, not bookings         |
| Follow-ups aren't sent, so captured data is wasted          | Notification email includes the follow-up template; `followUpSentAt` is reviewed monthly               |
| Members don't consent to wins, stories or invite pages      | Everything is opt-in; the site works with whatever exists, and pages ship only with real content       |
| Personal data leak or misuse                                | Server-only credentials; no personal data in logs or analytics; retention limit; security review in G1 |
| Toastmasters brand breach in campaigns                      | G0.6 before any printed or campaign material                                                           |
| Manual JSON updates become a bottleneck                     | Weekly batch until G6; the Drive CMS is the fix                                                        |
| Meetings get too big and lose their safe feeling            | Cohort caps, waitlists, and the sister club in G6                                                      |

---

## Appendix: campaign link convention

```
https://<domain>/for/<moment>?utm_source=<channel>&utm_campaign=<moment-or-event>
```

| `utm_source`                        | Use                                                             |
| ----------------------------------- | --------------------------------------------------------------- |
| `linkedin`, `instagram`, `whatsapp` | Organic and member posts                                        |
| `card`                              | Printed invite card QR                                          |
| `partner-<name>`                    | Relocation firms, coworking spaces, recruiters, newcomer groups |
| `event-<slug>`                      | Signature event follow-ups                                      |

**Status log**

- 2026-10-20: Plan written. Next: G0 decisions, then G1.
