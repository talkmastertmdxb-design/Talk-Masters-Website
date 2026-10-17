import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const seriousViolations = async (page: import("@playwright/test").Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("Our story shows the founding year, founders and awards", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "Our story" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The people who started it" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recognised by Toastmasters International" })).toBeVisible();
  await expect(page.getByText("Smedley Award").first()).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("members list links to each member's story page", async ({ page }) => {
  await page.goto("/members");
  await expect(page.getByRole("heading", { level: 1, name: "Our members" })).toBeVisible();
  const first = page.getByRole("article").first().getByRole("link");
  const href = await first.getAttribute("href");
  expect(href).toMatch(/^\/members\/[a-z0-9-]+$/);
  await first.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Before", { exact: true })).toBeVisible();
  await expect(page.getByText("Today", { exact: true })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

// With Cache Components the shell streams first, so the status stays 200; Next.js
// renders the not-found page with noindex instead (docs: migrating-to-cache-components).
test("unknown member pages show not-found and are never indexed", async ({ page }) => {
  await page.goto("/members/not-a-real-member");
  await expect(page.getByText("This page could not be found")).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});

test("the home page features member stories", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How Toastmasters changed things for them" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Meet our members" })).toHaveAttribute("href", "/members");
});
