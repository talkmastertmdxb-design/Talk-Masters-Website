/**
 * Announces the public pages to IndexNow after a production build on Vercel (runs as `postbuild`).
 * Everywhere else (local builds, tests, previews) it does nothing. It never fails the build: a
 * search engine being unreachable is worth a log line, not a broken deploy.
 */
import { INDEXNOW_ENDPOINT, indexNowSite, indexNowSubmission } from "../src/lib/seo/indexnow.ts";
import { PUBLIC_PAGES } from "../src/lib/seo/public-pages.ts";

const TIMEOUT_MS = 10_000;

const site = indexNowSite(process.env);
if (!site) {
  console.log("IndexNow: skipped (only production builds on Vercel announce pages).");
} else {
  const body = indexNowSubmission(
    site,
    PUBLIC_PAGES.map((page) => page.path),
  );
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 200 = accepted, 202 = accepted while the key is checked (normal on the first submission).
    const ok = response.status === 200 || response.status === 202;
    console.log(`IndexNow: ${ok ? "announced" : "not accepted"} ${body.urlList.length} pages (HTTP ${response.status}).`);
  } catch (error) {
    console.warn(`IndexNow: could not reach ${INDEXNOW_ENDPOINT} (${error instanceof Error ? error.message : error}).`);
  }
}
