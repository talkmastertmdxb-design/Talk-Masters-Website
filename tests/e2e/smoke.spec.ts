import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("renders one H1 and the club identity", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Talk-Masters.*home/ }).first()).toBeVisible();
    await expect(page).toHaveTitle(/Talk-Masters Club/);
  });

  test("offers a working skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("shows hero photography without placeholder labels in production", async ({ page }) => {
    await page.goto("/");
    const slot = page.locator('[data-hero-backdrop] [data-image-slot="hero-club-group"]');
    await expect(slot).toBeVisible();
    await expect(slot.getByText("Photo needed")).toHaveCount(0);
  });

  test("rotates the hero photos in order: the club group photo first, the microphone last", async ({
    page,
  }) => {
    await page.goto("/");
    const slides = page.locator("[data-hero-backdrop] [data-image-slot]");
    const ids = await slides.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-image-slot")),
    );
    expect(ids).toEqual(["hero-club-group", "hero-stage", "hero-audience", "hero-microphone"]);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    // Scan the settled page: mid-animation opacity would distort contrast results.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("does not scroll horizontally on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("sends security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

test("hides the internal style guide in production", async ({ request }) => {
  const response = await request.get("/styleguide");
  expect(response.status()).toBe(404);
});

test("serves a sitemap, and robots.txt keeps non-production builds out of search", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/members</loc>");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  // Local and preview builds are never indexed; production is (src/lib/site.ts).
  expect(await robots.text()).toMatch(/Disallow: \/\s*$/m);
});

test("caches the video and photos in the browser", async ({ request }) => {
  const video = await request.head("/videos/member-voices-full.mp4");
  expect(video.headers()["cache-control"]).toContain("max-age=2592000");
});
