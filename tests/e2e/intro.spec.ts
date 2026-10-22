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

    // Hands over in ~2.4s (plus up to 1.2s waiting for the photo): overlay gone, nav back, headline readable.
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 4500 });
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

  test("the Skip button skips, and doesn't press what's underneath", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "No intro under reduced motion");
    await page.goto("/");
    const skip = page.locator("[data-intro-skip]");
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 1500 });
    await expect(page.locator("[data-intro-overlay]")).toBeHidden();
    // The header's booking button sits under the Skip button; the skip click must not follow it.
    await page.waitForTimeout(400);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("plays only once: a second visit goes straight to the hero", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "No intro under reduced motion");
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/, { timeout: 7000 });
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
    await expect(page.locator("[data-intro-overlay]")).toBeHidden();
  });

  test("never plays on phones: the hero shows at once", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Opens its own phone-sized context");
    const phone = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      storageState: { cookies: [], origins: [] },
    });
    const page = await phone.newPage();
    await page.goto(testInfo.project.use.baseURL!);
    await expect(page.locator("html")).not.toHaveClass(/intro/);
    await expect(page.locator("[data-intro-overlay]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1", { timeout: 1500 });
    await phone.close();
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
