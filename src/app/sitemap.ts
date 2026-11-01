import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { PUBLIC_PAGES } from "@/lib/seo/public-pages";
import { siteUrl } from "@/lib/site";

/** Pages with a recorded "Last updated" day (content/updates.json) tell crawlers when they changed. */
const lastChanged: Readonly<Record<string, string>> = {
  "/meetings": content.updates.meetings,
  "/team": content.updates.team,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    ...(lastChanged[path] ? { lastModified: lastChanged[path] } : {}),
    changeFrequency: "monthly",
    priority,
  }));
}
