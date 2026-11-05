import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Each page and the stage light it carries; the animated moods name their keyframes. */
const PLACEMENTS = [
  { path: "/", preset: "teaser", animation: "stage-rise" },
  { path: "/join", preset: "join", animation: "stage-sway" },
  { path: "/pathways", preset: "quiz", animation: "stage-sway" },
  { path: "/achievements", preset: "impact", animation: "none" },
  { path: "/our-story", preset: "legacy", animation: "none" },
] as const;

const seriousViolations = async (page: Page, selector: string) => {
  const results = await new AxeBuilder({ page }).include(selector).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("each placement carries its stage light, still for reduced motion", async ({ page }, testInfo) => {
  const reduced = testInfo.project.name === "reduced-motion";
  for (const { path, preset, animation } of PLACEMENTS) {
    await page.goto(path);
    const flow = page.locator(`.stage-light--${preset} .stage-light__flow`).first();
    await expect(flow).toBeAttached();
    const name = await flow.evaluate((el) => getComputedStyle(el).animationName);
    expect(name, `${preset} on ${path}`).toBe(reduced ? "none" : animation);
  }
});

test("the stage light is decoration only and never covers the page", async ({ page }) => {
  await page.goto("/");
  const light = page.locator(".stage-light--teaser");
  await expect(light).toHaveAttribute("aria-hidden", "true");
  expect(await light.evaluate((el) => getComputedStyle(el).zIndex)).toBe("-1");
  // The mission haze bleeds edge to edge without making the page scroll sideways.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the quiz light warms to gold once a path is suggested", async ({ page }) => {
  await page.goto("/pathways#find-your-path");
  const quiz = page.locator("#find-your-path");
  const warm = quiz.locator(".stage-light__warm");
  await expect(warm).toHaveCSS("opacity", "0");
  await quiz.getByRole("button", { name: /Persuading people/ }).click();
  await quiz.getByRole("button", { name: "In my own business" }).click();
  await expect(quiz.getByRole("heading", { name: "Persuasive Influence" })).toBeFocused();
  await expect(warm).toHaveCSS("opacity", "1", { timeout: 5000 });
  expect(await seriousViolations(page, "#find-your-path")).toEqual([]);
});

test("the achievements timeline shows only this year, in a gold glow", async ({ page }) => {
  await page.goto("/achievements");
  const years = page.locator("section[aria-labelledby='timeline-title'] h3.year-glow");
  await expect(years).toHaveText(["2026"]);
  await expect(page.locator("section[aria-label='Impact'] svg.lucide-trophy")).toBeAttached();
});

test("the 404 page sends a lost visitor back on stage", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "You've wandered off stage." })).toBeVisible();
  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Book a guest visit" }).last()).toHaveAttribute(
    "href",
    "/join",
  );
  await expect(page.locator(".stage-light--not-found")).toBeAttached();
  expect(await seriousViolations(page, "main")).toEqual([]);
});

test("the phone menu opens onto an aurora", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Phone menu");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu.locator(".stage-light--menu")).toBeAttached();
  await expect(menu.getByRole("link", { name: /Members/ })).toBeVisible();
});

test("words stay readable over every light", async ({ page }) => {
  for (const [path, selector] of [
    ["/", "#about"],
    ["/join", "main"],
    ["/achievements", "section[aria-label='Impact']"],
    ["/our-story", "section[aria-labelledby='legacy-title']"],
  ] as const) {
    await page.goto(path);
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    // Scroll reveals fade text in, so a mid-fade scan can read low; retry until it settles.
    await expect
      .poll(() => seriousViolations(page, selector), { message: `${selector} on ${path}`, timeout: 10_000 })
      .toEqual([]);
  }
});
