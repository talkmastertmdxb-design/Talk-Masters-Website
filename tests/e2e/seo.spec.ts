import { expect, test, type Page } from "@playwright/test";

/** Every public page, with the structured data it must carry beyond the site-wide graph. */
const PAGES = [
  { path: "/", types: ["FAQPage"] },
  { path: "/join", types: ["BreadcrumbList", "Event", "FAQPage"] },
  { path: "/meetings", types: ["BreadcrumbList", "Event"] },
  { path: "/members", types: ["BreadcrumbList"] },
  { path: "/team", types: ["BreadcrumbList"] },
  { path: "/pathways", types: ["BreadcrumbList"] },
  { path: "/our-story", types: ["BreadcrumbList"] },
  { path: "/achievements", types: ["BreadcrumbList"] },
  { path: "/events", types: ["BreadcrumbList", "Event"] },
] as const;

/** Every JSON-LD block on the page, parsed (a block that isn't valid JSON fails the test). */
async function structuredData(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((text) => {
    const data = JSON.parse(text) as Record<string, unknown> | Record<string, unknown>[];
    const nodes = Array.isArray(data) ? data : [data];
    return nodes.flatMap((node) => (node["@graph"] as Record<string, unknown>[] | undefined) ?? [node]);
  });
}

test.describe("search and sharing", () => {
  // Server-rendered markup: the same on every device, so one browser is enough.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Markup only; checked once");
  });

  for (const { path, types } of PAGES) {
    test(`${path} has its canonical URL, a share image and its structured data`, async ({ page }) => {
      await page.goto(path);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, "canonical").not.toBeNull();
      expect(new URL(canonical!).pathname).toBe(path);

      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

      const found = new Set((await structuredData(page)).map((node) => node["@type"]));
      for (const type of ["Organization", "WebSite", ...types]) expect(found, `${path} ${type}`).toContain(type);
    });
  }

  test("the share image serves as a 1200×630 JPEG", async ({ page, request }) => {
    await page.goto("/");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    // og:image is absolute on the production domain; fetch the same path from the test server.
    const response = await request.get(new URL(image!).pathname + new URL(image!).search);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/jpeg");
  });

  test("offers the club icon to search engines, including a classic favicon.ico", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="icon"][href^="/favicon.ico"]')).toHaveCount(1);
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/icon/);
  });

  test("titles name the city people search for", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Talk-Masters Club Dubai | Toastmasters Public Speaking Club");
    await page.goto("/meetings");
    await expect(page).toHaveTitle("Meetings | Talk-Masters Club Dubai");
  });

  test("the meeting events are upcoming, free and in person", async ({ page }) => {
    await page.goto("/join");
    const events = (await structuredData(page)).filter((node) => node["@type"] === "Event");
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(new Date(event.endDate as string).getTime()).toBeGreaterThan(Date.now());
      expect(event).toMatchObject({ isAccessibleForFree: true, offers: { price: 0 } });
    }
  });

  test("pages that change say when they were last updated, and the sitemap agrees", async ({
    page,
    request,
  }) => {
    for (const path of ["/meetings", "/team"]) {
      await page.goto(path);
      const stamp = page.getByText(/^Last updated \d{1,2} [A-Z][a-z]+ \d{4}$/);
      await expect(stamp, path).toBeVisible();
      await expect(stamp.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
    }
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toMatch(/\/meetings<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}/);
    expect(sitemap).toMatch(/\/team<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}/);
  });

  test("key pages open with a plain answer", async ({ page }) => {
    await page.goto("/meetings");
    await expect(page.getByText(/^Talk-Masters meets on the 2nd & 4th Sunday of every month/)).toBeVisible();
    await page.goto("/join");
    await expect(page.getByText(/^Visiting is free\./)).toBeVisible();
    await page.goto("/");
    await expect(page.getByText(/^Talk-Masters Club is a Toastmasters public speaking club in Dubai/)).toBeVisible();
  });

  test("serves the IndexNow key so search engines can confirm it", async ({ request }) => {
    const key = "7f3c9a1e5b2d48c6a0e4f81d3b6c92a5";
    const response = await request.get(`/${key}.txt`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(key);
  });

  test("a missing page says so in its title and stays out of the index", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/^Page not found/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("no layout shift on /join", () => {
  // The guest form's dates, heading and message depend on today. The server renders them (from a
  // time refreshed hourly), so the form is the same size before and after the browser takes over.
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test(`the guest form keeps its size at ${viewport.width}px`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "Sets its own viewports");
      const measure = async (javaScriptEnabled: boolean) => {
        const context = await browser.newContext({ javaScriptEnabled, viewport });
        const page = await context.newPage();
        await page.goto("/join");
        // The whole booking panel: stage art, heading, form and message preview.
        const form = page.locator(".rounded-panel").filter({ hasText: "Which meeting?" });
        const heading = await page.getByRole("heading", { level: 1 }).textContent();
        const height = (await form.boundingBox())!.height;
        await context.close();
        return { heading, height };
      };
      const server = await measure(false);
      const live = await measure(true);
      // The real date is already in the HTML, not a placeholder.
      expect(server.heading).not.toContain("on a Sunday");
      expect(Math.abs(live.height - server.height)).toBeLessThanOrEqual(1);
    });
  }
});
