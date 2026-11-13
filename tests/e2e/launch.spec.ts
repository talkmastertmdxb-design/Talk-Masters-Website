import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** The main suite runs with no launch scheduled: the site is open and /launch only rehearses. */

const HEADLINE = "Something big is about to take the stage.";

test("with no launch scheduled, /launch sends visitors home", async ({ page }) => {
  await page.goto("/launch");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#hero-title")).toBeVisible();
});

test("a rehearsal counts down, hides the site's chrome, then opens the site", async ({ page }) => {
  await page.goto("/launch?in=8");
  await expect(page.getByRole("heading", { level: 1, name: HEADLINE })).toBeVisible();
  await expect(page.getByRole("timer")).toBeAttached();
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".echo")).toBeHidden();
  await expect(page.getByRole("link", { name: /Google Calendar/ })).toHaveAttribute(
    "href",
    /calendar\.google\.com/,
  );

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  // The final seconds light the timing lamps, then the finale opens the site.
  await expect(page.locator(".sp")).toHaveAttribute("data-phase", "red");
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
  await expect(page.locator("#hero-title")).toBeVisible();
});

test("a short countdown shows only the units that are left", async ({ page }) => {
  await page.goto("/launch?in=300");
  const words = await page.locator(".launch-count__word").allInnerTexts();
  expect(words).toEqual(["minutes", "seconds"]);
});

test("the countdown fits phones without scrolling sideways", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/launch?in=600000");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, String(width)).toBeLessThanOrEqual(0);
  }
});

test("the launch calendar file is a valid event", async ({ request }) => {
  const response = await request.get("/launch.ics?at=2026-12-13T06:30:00.000Z");
  expect(response.headers()["content-type"]).toContain("text/calendar");
  const body = await response.text();
  expect(body).toContain("DTSTART:20261213T063000Z");
  expect(body).toContain("SUMMARY:Talk-Masters Club: new website launch");
});
