import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/our-story", "/achievements", "/members", "/team", "/join", "/credits"];

/** Collects React/Next errors, e.g. "A tree hydrated but some attributes … didn't match". */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text().split("\n")[0] ?? "");
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const route of routes) {
  test(`${route} hydrates without errors, with motion on`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(route, { waitUntil: "load" });
    // Let every client effect (GSAP, SplitText, Lenis) run.
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
}

test("reveals still run after client-side navigation", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("link", { name: "Our Story" }).first().click();
  await expect(page).toHaveURL(/\/our-story$/);
  const heading = page.getByRole("heading", { name: "Why Talk-Masters was created" });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute("aria-label", /Why Talk-Masters was created/, { timeout: 10_000 });
  await expect(heading).toHaveCSS("opacity", "1");
  expect(errors).toEqual([]);
});
