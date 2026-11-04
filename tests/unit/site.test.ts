import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { isIndexable, resolveSiteUrl } from "@/lib/site";

describe("resolveSiteUrl", () => {
  it("prefers an explicit address, e.g. a custom domain", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://talkmasters.ae",
        VERCEL_PROJECT_PRODUCTION_URL: "talk-masters.vercel.app",
      }).href,
    ).toBe("https://talkmasters.ae/");
  });

  it("uses the Vercel production domain automatically", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "talk-masters.vercel.app" }).href).toBe(
      "https://talk-masters.vercel.app/",
    );
  });

  it("falls back to localhost for local builds", () => {
    expect(resolveSiteUrl({}).href).toBe("http://localhost:3000/");
  });
});

describe("isIndexable", () => {
  it("lets search engines index production only", () => {
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({})).toBe(false);
  });
});

describe("sitemap", () => {
  it("lists every public page and leaves internal ones out", () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths).toEqual([
      "/",
      "/join",
      "/meetings",
      "/members",
      "/team",
      "/our-story",
      "/pathways",
      "/achievements",
      "/events",
      "/gallery",
    ]);
  });
});
