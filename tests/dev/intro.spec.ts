import { expect, test } from "@playwright/test";

/**
 * React Strict Mode (development) mounts, unmounts and re-mounts every component.
 * The intro once ended itself on that fake unmount, so in dev it never played.
 * This must run against `next dev` to catch that class of bug.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test("the intro really plays in development (survives Strict Mode re-mounting)", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  const html = page.locator("html");
  await expect(html).toHaveClass(/\bintro\b/);

  // Still playing well after mount: the counter is rolling and the overlay is up.
  await page.waitForTimeout(900);
  await expect(html).toHaveClass(/\bintro\b/);
  await expect(page.locator("[data-intro-overlay]")).toBeVisible();
  await expect(page.locator("[data-digit]").nth(1)).toHaveAttribute("style", /translate/);

  // And it hands over to the hero by itself.
  await expect(html).not.toHaveClass(/\bintro\b/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1", { timeout: 4000 });
});
