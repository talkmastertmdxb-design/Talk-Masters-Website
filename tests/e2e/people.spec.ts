import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so reveals and pins never hide what is being checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("Our Story follows Plan.md: why, the founders timeline, founders, legacy", async ({ page }) => {
  await page.goto("/our-story");
  await expect(
    page.getByRole("heading", { level: 1, name: "Every great speaker starts with a single conversation." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why Talk-Masters was created" })).toBeVisible();
  const stages = page.getByRole("heading", { level: 3 }).filter({
    hasText: /^(Idea|Planning|Club Formation|Chartering|First Meeting|First Achievement|Today)$/,
  });
  await expect(stages).toHaveText([
    "Idea",
    "Planning",
    "Club Formation",
    "Chartering",
    "First Meeting",
    "First Achievement",
    "Today",
  ]);
  await expect(page.getByRole("heading", { name: "Meet the founders" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Legacy" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("/about permanently redirects to /our-story", async ({ request }) => {
  const response = await request.get("/about", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/our-story");
});

test("Achievements shows club awards, member achievements, a timeline and impact", async ({ page }) => {
  await page.goto("/achievements");
  await expect(page.getByRole("heading", { name: "Club awards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Smedley Award" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Member achievements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Achievement timeline" })).toBeVisible();
  await expect(page.getByText("This recognition reflects the commitment")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("Members: journey cards open in a dialog, and there are no individual pages", async ({
  page,
  request,
}) => {
  await page.goto("/members");
  await expect(
    page.getByRole("heading", { level: 1, name: "Meet the people behind the voices" }),
  ).toBeVisible();
  const trigger = page.getByRole("button", { name: /journey$/ }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (const heading of ["Before Toastmasters", "Their journey", "Today"]) {
    await expect(dialog.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(dialog.getByRole("heading", { name: /advice for new guests/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await seriousViolations(page)).toEqual([]);

  const oldDetailPage = await request.get("/members/member-one");
  expect(oldDetailPage.status()).not.toBe(200);
});

test("a Spotlight 'Read more' link opens that member's journey", async ({ page }) => {
  await page.goto("/members#member-two");
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Team lists the Executive Committee with leadership statements", async ({ page }) => {
  await page.goto("/team");
  await expect(page.getByRole("heading", { level: 1, name: "The Executive Committee" })).toBeVisible();
  await expect(page.getByText("Vice President Education")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
