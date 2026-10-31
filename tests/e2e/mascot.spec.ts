import { expect, test } from "@playwright/test";

test("Echo greets guests beside their questions, in its own spotlight on dark pages", async ({
  page,
}, testInfo) => {
  const reduced = testInfo.project.name === "reduced-motion";
  for (const [path, onDark] of [
    ["/", false],
    ["/join", true],
  ] as const) {
    await page.goto(path);
    const faq = page.locator("section[aria-labelledby='faq-title']");
    const echo = faq.getByRole("img", { name: "Echo, the Talk-Masters mascot, a cartoon microphone" });
    // Scroll by the heading: Echo never stops floating, so it never counts as "stable" to Playwright.
    await faq.getByRole("heading", { name: "Questions guests ask" }).scrollIntoViewIfNeeded();
    await expect(echo).toBeVisible();

    const mascot = faq.locator(".mascot");
    if (onDark) await expect(mascot).toHaveClass(/mascot--on-dark/);
    else await expect(mascot).not.toHaveClass(/mascot--on-dark/);

    // Floats for most visitors; holds still for anyone who asks for less motion.
    const animation = await faq
      .locator(".mascot__float")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation, path).toBe(reduced ? "none" : "mascot-float");

    // Every few seconds Echo waves: only his raised arm turns, at the shoulder.
    const wave = await faq.locator(".echo-figure__arm").evaluate((el) => getComputedStyle(el).animationName);
    expect(wave, path).toBe(reduced ? "none" : "echo-wave");
  }
});
