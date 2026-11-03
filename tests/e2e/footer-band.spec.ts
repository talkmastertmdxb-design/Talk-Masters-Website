import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("every page ends with the gold guest invitation, over the footer's stage light", async ({
  page,
}, testInfo) => {
  for (const path of ["/", "/pathways", "/team"]) {
    await page.goto(path);
    const band = page.locator("footer section[aria-labelledby='guest-band']");
    await expect(
      band.getByRole("heading", { name: "Come as a guest. Speak only if you want to." }),
    ).toBeVisible();
    await expect(band.getByRole("link", { name: "Book a guest visit" })).toHaveAttribute("href", "/join");
    await expect(band.getByRole("button", { name: "Book on WhatsApp" })).toBeVisible();
    await expect(band).toContainText("ask for your consent before calling on you");
    await expect(band.locator("[data-next-meeting]")).toBeAttached();
    // The stage light runs behind the rest of the footer.
    const flow = page.locator("footer > .cta-band__flow");
    await expect(flow).toBeAttached();
    const animation = await flow.evaluate((el) => getComputedStyle(el).animationName);
    // Drifts slowly for most visitors; holds still for anyone who asks for less motion.
    expect(animation).toBe(testInfo.project.name === "reduced-motion" ? "none" : "cta-drift");
  }
});

test("the gold invitation stays readable", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("footer section[aria-labelledby='guest-band']");
  await band.scrollIntoViewIfNeeded();
  const results = await new AxeBuilder({ page })
    .include("footer section[aria-labelledby='guest-band']")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});

test.describe("venue map", () => {
  for (const screen of [
    { width: 360, height: 640, minHeight: 240, maxHeight: 300 },
    { width: 768, height: 1024, minHeight: 360, maxHeight: 420 },
    { width: 1440, height: 900, minHeight: 310, maxHeight: 320 },
  ]) {
    test(`fits the footer at ${screen.width}px and loads only when reached`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "Sets its own viewports");
      await page.setViewportSize(screen);
      await page.goto("/");
      const map = page.locator("footer iframe[title^='Map:']");
      await expect(map).toHaveAttribute("src", /^https:\/\/www\.google\.com\/maps\/embed\?/);
      await expect(map).toHaveAttribute("loading", "lazy");
      await expect(map).toHaveAttribute("title", "Map: Hor Al Anz Public Library, Dubai");
      await map.scrollIntoViewIfNeeded();
      const box = (await map.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(screen.width);
      expect(box.height).toBeGreaterThanOrEqual(screen.minHeight);
      expect(box.height).toBeLessThanOrEqual(screen.maxHeight);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(screen.width);
    });
  }
});
