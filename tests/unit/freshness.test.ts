import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { formatDay } from "@/lib/content/dates";
import { updatesSchema } from "@/lib/content/schemas";
import { INDEXNOW_KEY, indexNowSite, indexNowSubmission } from "@/lib/seo/indexnow";
import { PUBLIC_PAGES } from "@/lib/seo/public-pages";

describe("formatDay", () => {
  it("prints a calendar day the same everywhere", () => {
    expect(formatDay("2026-10-27")).toBe("27 October 2026");
    expect(formatDay("2027-01-01")).toBe("1 January 2027");
  });
});

describe("updatesSchema", () => {
  it("accepts days that have passed", () => {
    expect(updatesSchema.parse({ meetings: "2026-10-27", team: "2026-01-01" })).toEqual({
      meetings: "2026-10-27",
      team: "2026-01-01",
    });
  });

  it("refuses a day in the future or a date that isn't one", () => {
    expect(updatesSchema.safeParse({ meetings: "2999-01-01", team: "2026-01-01" }).success).toBe(false);
    expect(updatesSchema.safeParse({ meetings: "27/10/2026", team: "2026-01-01" }).success).toBe(false);
  });

  it("is filled in for the pages that show it", () => {
    expect(content.updates.meetings).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(content.updates.team).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("indexNowSite", () => {
  it("only announces from production builds with an https address", () => {
    const site = "https://www.talkmasters.ae";
    expect(indexNowSite({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: site })?.href).toBe(`${site}/`);
    expect(indexNowSite({ VERCEL_ENV: "preview", NEXT_PUBLIC_SITE_URL: site })).toBeNull();
    expect(indexNowSite({ NEXT_PUBLIC_SITE_URL: site })).toBeNull();
    expect(indexNowSite({ VERCEL_ENV: "production" })).toBeNull();
    expect(
      indexNowSite({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }),
    ).toBeNull();
    expect(indexNowSite({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "not a url" })).toBeNull();
  });
});

describe("indexNowSubmission", () => {
  it("announces every public page with the key's public location", () => {
    const body = indexNowSubmission(
      new URL("https://www.talkmasters.ae"),
      PUBLIC_PAGES.map((page) => page.path),
    );
    expect(body.host).toBe("www.talkmasters.ae");
    expect(body.key).toBe(INDEXNOW_KEY);
    expect(body.keyLocation).toBe(`https://www.talkmasters.ae/${INDEXNOW_KEY}.txt`);
    expect(body.urlList).toHaveLength(PUBLIC_PAGES.length);
    expect(body.urlList).toContain("https://www.talkmasters.ae/join");
  });

  it("has its key file published with exactly the key in it", () => {
    const file = readFileSync(join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`), "utf8");
    expect(file).toBe(INDEXNOW_KEY);
  });
});
