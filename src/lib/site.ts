/** Public site configuration. No secrets here: server-only values stay in process.env. */
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
