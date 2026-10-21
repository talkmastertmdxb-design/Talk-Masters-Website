/** Public site configuration. No secrets here: server-only values stay in process.env. */

interface SiteEnv {
  /** Accepts process.env as is. */
  [key: string]: string | undefined;
  NEXT_PUBLIC_SITE_URL?: string;
  /** Set by Vercel: the production domain, without https:// (e.g. talk-masters.vercel.app). */
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  /** Set by Vercel: "production", "preview" or "development". */
  VERCEL_ENV?: string;
}

/**
 * The site's public address, for metadata, Open Graph, the sitemap and canonical URLs.
 * An explicit NEXT_PUBLIC_SITE_URL wins (a custom domain); on Vercel the production domain
 * is used automatically; locally it is localhost.
 */
export function resolveSiteUrl(env: SiteEnv): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}

/** Only the production deployment is indexed; Vercel previews and local builds never are. */
export function isIndexable(env: SiteEnv): boolean {
  return env.VERCEL_ENV === "production";
}

export const siteUrl = resolveSiteUrl(process.env);

/** Evaluated at build time: pages are static, and the site rebuilds on every content change. */
export const buildYear = new Date().getFullYear();
