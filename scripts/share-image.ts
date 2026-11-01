/**
 * Draws the link-preview image (WhatsApp, LinkedIn, X, iMessage) from the club's own content:
 * name, city, meeting rule and Echo. Writes src/app/opengraph-image.jpg and twitter-image.jpg,
 * which Next.js serves and links from every page.
 *   npm run share:image
 * Run it again whenever the meeting rule, the city or Echo changes. Needs network for the fonts.
 */
import { chromium } from "@playwright/test";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const settings = JSON.parse(readFileSync(join(root, "content", "settings.json"), "utf8")) as {
  clubName: string;
  parentOrganisation: string;
  meeting: { weekday: string; weeksOfMonth: number[]; startTime: string; city: string };
};
const echo = readFileSync(join(root, "public", "images", "mascot", "toon", "wave.png")).toString("base64");
const arm = readFileSync(join(root, "public", "images", "mascot", "toon", "wave-arm.png")).toString("base64");

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];
const { meeting } = settings;
const weeks = meeting.weeksOfMonth.map((week) => ORDINALS[week - 1]).join(" & ");
const weekday = meeting.weekday.charAt(0).toUpperCase() + meeting.weekday.slice(1);
const [hour = 0, minute = 0] = meeting.startTime.split(":").map(Number);
const time = `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
const schedule = `Every ${weeks} ${weekday}, ${time}`;
const alt = `${settings.clubName}, ${settings.meeting.city}: a ${settings.parentOrganisation} public speaking club. ${schedule}. Find your voice, lead with confidence.`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; }
  body { position: relative; overflow: hidden; background: #0b1220; color: #fff; font-family: "Open Sans", sans-serif; }
  .glow { position: absolute; right: -180px; bottom: -260px; width: 900px; height: 900px; border-radius: 50%;
    background: radial-gradient(closest-side, rgb(214 176 106 / 0.24), rgb(10 90 133 / 0.18) 55%, transparent); }
  .copy { position: absolute; left: 84px; top: 92px; width: 690px; }
  .eyebrow { margin: 0; font-weight: 600; font-size: 22px; letter-spacing: 0.24em; text-transform: uppercase; color: #d6b06a; }
  h1 { margin: 26px 0 0; font-family: "Source Serif 4", serif; font-weight: 400; font-size: 84px; line-height: 1.04; letter-spacing: -0.025em; }
  h1 em { color: #d6b06a; }
  .line { width: 300px; height: 3px; margin-top: 30px; background: #d6b06a; border-radius: 2px; }
  .facts { margin: 30px 0 0; font-size: 26px; line-height: 1.45; color: rgb(255 255 255 / 0.82); }
  .echo { position: absolute; right: 30px; bottom: 30px; width: 400px; }
  .echo img { position: absolute; inset: 0; width: 100%; }
  .echo .body { position: relative; }
  .echo .arm { transform: rotate(-10deg); transform-origin: 31.6% 41.3%; }
  .sticker { filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 24px 30px rgb(0 0 0 / 0.45)); }
  .floor { position: absolute; right: 110px; bottom: 26px; width: 240px; height: 28px; border-radius: 50%;
    background: radial-gradient(closest-side, rgb(214 176 106 / 0.45), transparent); }
</style></head><body>
  <div class="glow"></div>
  <div class="copy">
    <p class="eyebrow">${settings.clubName} · ${meeting.city}</p>
    <h1>Find Your Voice.<br>Lead With <em>Confidence.</em></h1>
    <div class="line"></div>
    <p class="facts">A ${settings.parentOrganisation} club.<br>${schedule}. Guests free.</p>
  </div>
  <div class="floor"></div>
  <div class="echo sticker"><img class="body" src="data:image/png;base64,${echo}" alt=""><img class="arm" src="data:image/png;base64,${arm}" alt=""></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const out = join(root, "src", "app", "opengraph-image.jpg");
await page.screenshot({ path: out, type: "jpeg", quality: 88 });
await browser.close();

copyFileSync(out, join(root, "src", "app", "twitter-image.jpg"));
writeFileSync(join(root, "src", "app", "opengraph-image.alt.txt"), alt);
writeFileSync(join(root, "src", "app", "twitter-image.alt.txt"), alt);
console.log(`Wrote src/app/opengraph-image.jpg and twitter-image.jpg (1200×630)\nAlt: ${alt}`);
