import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("every page ends with the stage-light call to action", async ({ page }, testInfo) => {
  for (const path of ["/", "/pathways", "/team"]) {
    await page.goto(path);
    const band = page.locator("footer section[aria-labelledby='guest-band']");
    await expect(band.getByRole("heading", { name: "Ready to become a better speaker?" })).toBeVisible();
    // The stage light now runs behind the whole footer, not just the band (Bailey Hart layout).
    const flow = page.locator("footer > .cta-band__flow");
    await expect(flow).toBeAttached();
    const animation = await flow.evaluate((el) => getComputedStyle(el).animationName);
    // Drifts slowly for most visitors; holds still for anyone who asks for less motion.
    expect(animation).toBe(testInfo.project.name === "reduced-motion" ? "none" : "cta-drift");
  }
});

test("the call to action stays readable over the gradient", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("footer section[aria-labelledby='guest-band']");
  await band.scrollIntoViewIfNeeded();
  const results = await new AxeBuilder({ page })
    .include("footer section[aria-labelledby='guest-band']")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
