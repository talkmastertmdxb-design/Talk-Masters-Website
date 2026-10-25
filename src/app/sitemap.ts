import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Public pages, most important first. The style guide and credits are left out on purpose. */
const pages: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/join", priority: 0.9 },
  { path: "/members", priority: 0.8 },
  { path: "/team", priority: 0.7 },
  { path: "/our-story", priority: 0.7 },
  { path: "/pathways", priority: 0.7 },
  { path: "/achievements", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "monthly",
    priority,
  }));
}
