import { expect, test } from "@playwright/test";

test.describe("signature moments", () => {
  test("the Timing Light reaches red at the end of the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "The timing light is hidden on small screens");
    await page.goto("/");
    const light = page.locator("[data-signal]");
    await expect(light).toHaveAttribute("data-signal", "off");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(light).toHaveAttribute("data-signal", "red");
    await expect(light).toHaveText("7:00");
  });

  test("the hero headline finishes its intro and stays readable", async ({ page }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toHaveAccessibleName(
      /Find your voice\.\s*Lead with Confidence\.\s*Inspire the world\./,
    );
    await expect(title).toHaveCSS("opacity", "1", { timeout: 4000 });
  });

  test("stats keep their real values in the HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("500");
    expect(html).toContain("Speeches delivered");
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("shows the hero immediately, with no intro", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1", { timeout: 300 });
    await expect(page.locator("[data-hero-item]").first()).toHaveCSS("opacity", "1", { timeout: 300 });
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus in a dialog, and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Our story" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("navigating from the menu closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Why join" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect(page).toHaveURL(/#why-join$/);
  });
});

test("every 'Book a guest visit' link goes to /join, which loads", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .getByRole("link", { name: "Book a guest visit" })
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs)).toEqual(new Set(["/join"]));
  const response = await page.goto("/join");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Book a guest visit" })).toBeVisible();
});
