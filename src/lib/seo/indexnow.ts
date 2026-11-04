/**
 * IndexNow: tells Bing, Yandex, Naver, Seznam and Yep that pages changed, so they recrawl them
 * within minutes instead of days (Bing's index also feeds Copilot and ChatGPT search). The key
 * is public by design: search engines confirm it by reading public/<key>.txt on the site.
 * No path aliases here: scripts/indexnow.ts imports this file directly with Node.
 */

export const INDEXNOW_KEY = "7f3c9a1e5b2d48c6a0e4f81d3b6c92a5";
/** The shared endpoint: one submission reaches every participating search engine. */
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowSubmission {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/** The request body announcing `paths` on the site at `siteUrl`. */
export function indexNowSubmission(
  siteUrl: URL,
  paths: readonly string[],
  key = INDEXNOW_KEY,
): IndexNowSubmission {
  return {
    host: siteUrl.host,
    key,
    keyLocation: new URL(`/${key}.txt`, siteUrl).toString(),
    urlList: paths.map((path) => new URL(path, siteUrl).toString()),
  };
}

interface BuildEnv {
  [key: string]: string | undefined;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_SITE_URL?: string;
}

/**
 * The site to announce, or null when this build shouldn't announce anything: only production
 * builds on Vercel with a real public address do. Local builds, tests and previews never ping.
 */
export function indexNowSite(env: BuildEnv): URL | null {
  if (env.VERCEL_ENV !== "production" || !env.NEXT_PUBLIC_SITE_URL) return null;
  try {
    const url = new URL(env.NEXT_PUBLIC_SITE_URL);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
