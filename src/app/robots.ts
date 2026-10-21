import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

/** Production is open to search engines; Vercel previews are not, so they never compete with it. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable(process.env)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/styleguide", "/credits"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
