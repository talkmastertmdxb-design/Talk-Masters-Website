# IMAGES.md: Adding photos to the site

Every photo on the site has a named **slot** in [`content/images.json`](../content/images.json). Until a photo is supplied, the slot shows a designed "stage" placeholder at the final size, so adding the real photo never shifts the layout.

## To add a photo

1. **Check consent.** Everyone recognisable in the photo has given written permission (docs/PRD.md §8).
2. **Prepare the file.** Convert it to **WebP** (the content check rejects JPG and PNG), at least 1600px on the long edge where the original allows, roughly the slot's `aspectRatio`. Name it after the slot, e.g. `hero-stage.webp`. Keep the original in `assets/source/`, not in `public/`.
3. **Put it in** `public/images/`.
4. **Point the slot at it** in `content/images.json`:
   ```json
   { "id": "hero-stage", "src": "/images/hero-stage.webp", ... }
   ```
   Update `alt` so it describes the real photo. Optionally add `"focalPoint": "50% 30%"` to keep a face in frame when cropped.
5. **Check** with `npm run check:content`. The slot disappears from the "still to replace" list.

Next.js produces AVIF/WebP at every size automatically. Don't resize by hand.

## To add a new slot

Add an entry with `id` (kebab-case), `alt`, `aspectRatio` (e.g. `"4/5"`), `brief` (what the photographer should capture) and `"src": null`. Use it in a page with:

```tsx
<ImageSlot id="your-slot-id" sizes="(min-width: 900px) 50vw, 100vw" />
```

## Temporary Unsplash photos (scenes only)

Until club photos arrive, scene slots (stage, audience, meeting rooms, venue) can use free Unsplash photos:

1. Create a free app at https://unsplash.com/oauth/applications and copy its **Access Key**.
2. Add `UNSPLASH_ACCESS_KEY=...` to `.env.local` (never commit it).
3. Run `npm run images:unsplash`. Each slot with an `unsplash` setting in `images.json` gets a free photo (Unsplash+ is skipped), hotlinked from the Unsplash CDN as their API rules require, with the photographer credited on `/credits`.
4. Check the picks at `/styleguide`. To change one, set `unsplash.photoId` to the ID at the end of the photo's Unsplash URL and run `npm run images:unsplash -- --force`.

For the demo, portrait slots (founders, members, committee) also use Unsplash portraits chosen across ages, genders and backgrounds. They are placeholders only: names stay "Member name" until real content arrives, and `npm run check:content -- --strict` fails until every stock photo is replaced with a real club photo.

Quality rules the script enforces: free photos only (Unsplash+ skipped), at least 2000px on the long edge, and nothing described as AI-generated, rendered or illustrated. Re-pick a weak result with `"pick": 1` (the next result) and `npm run images:unsplash -- --slot <id>`.

## Where to see them

- `npm run dev`, then open `/styleguide` to see every slot and its photo brief.
- In production, briefs are hidden. Set `NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS=true` on a preview deployment to show them to the club.

## Rules

- Real club photos are the goal. Unsplash photos are temporary demo stand-ins, and never AI-generated (docs/BRAND.md §5).
- Before launch, replace every portrait with the real person's photo: a stranger's face must never appear above a real member's name.
- Show the full range of members: all ages, genders and backgrounds.
- The shot list is in docs/IMPLEMENTATION_PLAN.md §3.5.
