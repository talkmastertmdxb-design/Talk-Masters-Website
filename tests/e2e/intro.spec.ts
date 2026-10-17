import { expect, test } from "@playwright/test";

// A genuinely new visitor: nothing in storage.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("first-visit hero intro", () => {
  test.skip(({ isMobile }) => isMobile, "Timing is the same on mobile; one viewport is enough");

  test("counts to 100%, wipes in the photos, then hands over to the hero", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "No intro under reduced motion");
    await page.goto("/");
    const overlay = page.locator("[data-intro-overlay]");
    await expect(overlay).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/\bintro\b/);

    // Hands over within a few seconds: overlay gone, nav back, headline readable.
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 7000 });
    await expect(overlay).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1", { timeout: 3000 });
    await expect(page.locator(".site-header")).toHaveCSS("transform", "none", { timeout: 2000 });
    expect(await page.evaluate(() => localStorage.getItem("tm-intro-v2"))).not.toBeNull();
  });

  test("any key skips it straight to the hero", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "No intro under reduced motion");
    await page.goto("/");
    await expect(page.locator("[data-intro-overlay]")).toBeVisible();
    await page.waitForTimeout(300);
    await page.keyboard.press("Space");
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 1500 });
  });

  test("plays only once: a second visit goes straight to the hero", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "No intro under reduced motion");
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 7000 });
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
    await expect(page.locator("[data-intro-overlay]")).toBeHidden();
  });

  test("never plays under reduced motion, or on other pages", async ({ page, browser }) => {
    await page.goto("/members");
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
    const reduced = await browser.newContext({
      reducedMotion: "reduce",
      storageState: { cookies: [], origins: [] },
    });
    const quiet = await reduced.newPage();
    await quiet.goto(new URL("/", page.url()).toString());
    await expect(quiet.locator("html")).not.toHaveClass(/\bintro\b/);
    await expect(quiet.getByRole("heading", { level: 1 })).toBeVisible();
    await reduced.close();
  });
});
