# Talk-Masters Club website

The website for **Talk-Masters Club**, a club of Toastmasters International: a public speaking and leadership community **open to everyone, of every age, gender and background**.

The site's job: turn curious visitors into guests at a meeting.

## Quick start

Requires Node.js 24+.

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Open `/styleguide` in development to see the design tokens and every image slot.

## Scripts

| Command                                                 | What it does                                                                              |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                                           | Development server                                                                        |
| `npm run build` / `npm start`                           | Production build / serve                                                                  |
| `npm run lint` · `npm run typecheck` · `npm run format` | Code quality                                                                              |
| `npm test` · `npm run test:coverage`                    | Unit tests (Vitest, 80% coverage minimum)                                                 |
| `npm run test:e2e`                                      | End-to-end + accessibility tests (Playwright + axe) on desktop, mobile and reduced motion |
| `npm run check:content`                                 | Lists placeholder content and missing photos (`-- --strict` fails if any remain)          |
| `npm run verify`                                        | Everything CI runs before the E2E stage                                                   |

## Where things live

```
content/          Site content as JSON (settings, events, stories, FAQs, image slots…)
public/images/    Club photos (see docs/IMAGES.md)
src/app/          Routes (Next.js App Router)
src/components/   UI, media and (soon) signature + motion components
src/lib/          Content schemas and repository, design and motion tokens
tests/            Unit (Vitest) and E2E (Playwright) tests
docs/             Product, brand, design, architecture and the implementation plan
assets/source/    Raw brand source files (not served)
```

## Updating content

Edit the JSON in `content/`. Every file is validated at build time; a mistake fails the build with a message naming the file and field. Anything marked `"placeholder": true` is unconfirmed and must be replaced before launch. Photos: see [docs/IMAGES.md](docs/IMAGES.md).

## Docs

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): experience, journey, visual and motion language, architecture, phases
- [PRD](docs/PRD.md) · [Brand](docs/BRAND.md) · [Design](docs/DESIGN.md) · [Features](docs/FEATURES.md) · [Architecture](docs/ARCHITECTURE.md)

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS v4 · GSAP + Lenis · Zod · Vitest · Playwright + axe.
