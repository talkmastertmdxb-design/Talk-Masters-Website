/**
 * Fills scene image slots (stage, audience, rooms) with Unsplash photos until the
 * club's own photos arrive. Never touches portraits or slots that already have a
 * club photo in /public/images.
 *
 *   1. Get a free Access Key: https://unsplash.com/oauth/applications
 *   2. Add UNSPLASH_ACCESS_KEY=... to .env.local
 *   3. npm run images:unsplash            (fills empty slots)
 *      npm run images:unsplash -- --force (re-picks Unsplash photos too)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pickPhoto, toSlotPhoto, type UnsplashPhoto } from "../src/lib/images/unsplash.ts";

const APP_NAME = "talk_masters_club";
const root = join(import.meta.dirname, "..");
const imagesFile = join(root, "content", "images.json");
const force = process.argv.includes("--force");

interface Slot {
  id: string;
  src: string | null;
  credit?: unknown;
  unsplash?: { photoId?: string; query: string; orientation: string };
  [key: string]: unknown;
}

function readEnvKey(): string | undefined {
  if (process.env.UNSPLASH_ACCESS_KEY) return process.env.UNSPLASH_ACCESS_KEY;
  const envFile = join(root, ".env.local");
  if (!existsSync(envFile)) return undefined;
  const line = readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("UNSPLASH_ACCESS_KEY="));
  return line?.slice("UNSPLASH_ACCESS_KEY=".length).trim() || undefined;
}

const key = readEnvKey();
if (!key) {
  process.stderr.write(
    "UNSPLASH_ACCESS_KEY is missing.\nCreate a free app at https://unsplash.com/oauth/applications and add the Access Key to .env.local\n",
  );
  process.exit(1);
}

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return (await response.json()) as T;
}

async function findPhoto(config: NonNullable<Slot["unsplash"]>): Promise<UnsplashPhoto | undefined> {
  if (config.photoId) {
    try {
      const pinned = await api<UnsplashPhoto>(
        `https://api.unsplash.com/photos/${encodeURIComponent(config.photoId)}`,
      );
      const usable = pickPhoto([pinned]);
      if (usable) return usable;
    } catch {
      process.stdout.write(`  pinned photo ${config.photoId} unavailable, searching instead\n`);
    }
  }
  const params = new URLSearchParams({
    query: config.query,
    orientation: config.orientation,
    content_filter: "high",
    per_page: "20",
  });
  const { results } = await api<{ results: UnsplashPhoto[] }>(
    `https://api.unsplash.com/search/photos?${params}`,
  );
  return pickPhoto(results);
}

const isUnsplash = (src: string | null): boolean => Boolean(src?.startsWith("https://images.unsplash.com/"));

const slots = JSON.parse(readFileSync(imagesFile, "utf8")) as Slot[];
const updated: Slot[] = [];
let filled = 0;

for (const slot of slots) {
  const wanted = slot.unsplash && (slot.src === null || (force && isUnsplash(slot.src)));
  if (!wanted || !slot.unsplash) {
    updated.push(slot);
    continue;
  }
  try {
    const photo = await findPhoto(slot.unsplash);
    if (!photo) {
      process.stdout.write(`✗ ${slot.id}: no suitable free photo for "${slot.unsplash.query}"\n`);
      updated.push(slot);
      continue;
    }
    // API guideline: register the download.
    await api(photo.links.download_location);
    const { src, credit } = toSlotPhoto(photo, APP_NAME);
    updated.push({ ...slot, src, credit });
    filled += 1;
    process.stdout.write(`✓ ${slot.id}: ${credit.name}\n`);
  } catch (error) {
    process.stdout.write(`✗ ${slot.id}: ${error instanceof Error ? error.message : String(error)}\n`);
    updated.push(slot);
  }
}

writeFileSync(imagesFile, `${JSON.stringify(updated, null, 2)}\n`);
process.stdout.write(
  `\nFilled ${filled} slot(s). Review them at /styleguide, then commit content/images.json.\n`,
);
