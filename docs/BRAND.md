# BRAND.md: Talk-Masters Toastmasters Club

Single source of truth for identity, color, type and voice. Everything in DESIGN.md builds on this.

## 1. Identity

- **Name:** Talk-Masters Club, a club of Toastmasters International
- **Audience:** open to everyone: all ages, genders and backgrounds. Never position it as a student or university club.
- **Tagline (on logo):** "A Club with Difference"
- **Logo:** circular navy badge, gold ring, gold "TALK-MASTERS" wordmark with microphone, Toastmasters International globe in the centre. Current file: `assets/source/Talk-Masters New Logo.png` (500×500, transparent), used on the site as `public/brand/talk-masters-badge.png`, the favicon and the Apple touch icon. Older draft: `assets/source/logo-badge-draft.jpg`. Both still contain a redrawn Toastmasters International globe, so the lockup must be checked against the Toastmasters brand portal before launch (IMPLEMENTATION_PLAN §0.1). A vector (SVG) version would also look sharper at large sizes.
- **Logo rules:** never recolor, stretch or crop. Keep clear space equal to the height of the globe's banner on every side. Minimum size 32px on screen. The embedded Toastmasters International mark must stay unaltered. Verify club-name lockup rules against the official Toastmasters brand portal before launch.
- **Brand position:** a premium leadership brand, not a student club.
- **Reference blend:** Apple elegance 40%, Awwwards experimentation 25%, Toastmasters professionalism 20%, TED inspiration 10%, premium editorial 5%.

## 2. Personality

Inspiring, sophisticated, confident, premium, modern leadership. Warm and welcoming, never stuffy.

**Avoid:** corporate bureaucracy, dated educational sites, generic club sites, heavy red or maroon use, busy layouts, clip art, PowerPoint styling.

## 3. Color

| Token         | Hex       | Role                                                                                                                                    |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--tm-blue`   | `#004165` | Primary. Navigation accents, key sections, primary surfaces                                                                             |
| `--tm-maroon` | `#772432` | Primary buttons and sparing accents. Never a dominant fill                                                                              |
| `--gold`      | `#D6B06A` | Premium accent (replaces Toastmasters yellow). Hover glow, achievement badges, stat highlights, the single highlighted word in the hero |
| `--cool-gray` | `#A9B2B1` | Dividers, secondary icons                                                                                                               |
| `--soft-gray` | `#F5F7F8` | Light page background                                                                                                                   |
| `--white`     | `#FFFFFF` | Cards, text on dark                                                                                                                     |
| `--ink`       | `#0B1220` | Dark page background                                                                                                                    |
| `--surface`   | `#111827` | Dark cards and panels                                                                                                                   |
| `--muted`     | `#9CA3AF` | Muted text on dark                                                                                                                      |

Supporting values from the working prototype: button hover blue `#005786`, maroon hover `#8A2A3B`, light card `#E8ECEE`.

**Usage ratio:** roughly 60% neutral (ink, soft gray, white), 25% blue, 10% maroon, 5% gold. Gold stays rare so it keeps feeling premium.

**Contrast:** body text must hit WCAG AA (4.5:1). Gold on `--ink` passes. Gold on white does not, so never put gold text on light backgrounds.

## 4. Typography

| Role    | Font      | Weight                              | Size    |
| ------- | --------- | ----------------------------------- | ------- |
| H1      | Cambria   | Bold                                | 72-96px |
| H2      | Cambria   | Bold                                | 48-64px |
| H3      | Cambria   | Bold                                | 30-40px |
| Body    | Open Sans | Regular                             | 18-22px |
| Buttons | Open Sans | SemiBold                            | 15-16px |
| Eyebrow | Open Sans | Regular, uppercase, 0.24em tracking | 12-13px |

- Cambria is not installed everywhere. Web fallback stack: `Cambria, "Source Serif 4", Georgia, serif`. Self-host Source Serif 4 so the fallback is identical on every device.
- Scale down fluidly with `clamp()`; never below 40px for H1 on mobile.
- Tight tracking on large serif (`-0.01em`), generous line height on body (1.6-1.7).

## 5. Imagery

**Use:** people of all ages, genders and backgrounds, confident speakers, stage lighting, real audience engagement, networking, leadership moments. Real club photos beat any stock.

**Avoid:** generic office teams, handshakes, fake meetings, cartoons.

Treatment: warm, dramatic, slightly desaturated. Dark gradient overlay when text sits on a photo. Rounded corners 24-28px.

## 6. Voice

- Direct, warm, active. Short sentences.
- Speak to the visitor: "Find your voice." Not "Our members develop..."
- Core lines: _Find Your Voice. Lead With Confidence. Inspire The World._ / _Where Leaders Are Made_ / _Ready To Become A Better Speaker?_
- CTAs: "Join Our Next Meeting", "Book A Guest Visit", "Watch Our Members Grow".
- No jargon, no hype. Use real numbers only: 500+ speeches delivered, 50+ active members, 100+ leadership roles, 20+ nationalities. Confirm these with the club before launch and update them as they change.

## 7. Open questions

1. Is the official Toastmasters logo placement acceptable beside the club badge?
2. Does the club have a vector (SVG) logo? The JPEG limits quality.
3. Final approved tagline: "A Club with Difference" or "A Club with a Difference"?
