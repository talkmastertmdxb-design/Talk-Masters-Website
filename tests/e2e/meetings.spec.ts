import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so reveals never hide what is being checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("Meetings opens with the timing light and the next meeting, and is first in the nav", async ({
  page,
  isMobile,
}) => {
  await page.goto("/meetings");
  await expect(page.getByRole("heading", { level: 1, name: "Every minute has a role." })).toBeVisible();
  await expect(page.getByRole("list", { name: "The timer's lights" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.locator("main [data-next-meeting]").first()).not.toHaveAttribute(
    "data-next-meeting",
    "pending",
  );
  if (!isMobile) {
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.locator("li").first()).toContainText("Meetings");
    await expect(nav.getByRole("link", { name: /Meetings/ })).toHaveAttribute("aria-current", "page");
  }
  expect(await seriousViolations(page)).toEqual([]);
});

test("the running order is Meeting #112, 123 minutes, and its roles link to the cast", async ({ page }) => {
  await page.goto("/meetings");
  const order = page.locator("#running-order");
  await expect(order.getByRole("heading", { level: 2 })).toContainText("Meeting #112");
  await expect(order).toContainText("123 minutes, start to finish");
  await expect(order.getByRole("heading", { level: 3 })).toHaveText([
    "Before we start",
    "Opening",
    "Prepared speeches",
    "Table Topics",
    "Evaluations",
    "Closing",
  ]);
  await order.getByRole("link", { name: "Grammarian" }).click();
  await expect(page).toHaveURL(/#role-grammarian$/);
  await expect(page.locator("#role-grammarian")).toBeInViewport();
});

test("the cast highlights good first roles on request", async ({ page }) => {
  await page.goto("/meetings");
  const cast = page.locator("#roles");
  await expect(cast.getByRole("heading", { name: "Toastmaster of the Day" })).toBeVisible();
  const toggle = cast.getByRole("checkbox", { name: "Highlight good first roles" });
  // The switch is styled; people click its label, which toggles the real checkbox.
  await cast.getByText("Highlight good first roles").click();
  await expect(toggle).toBeChecked();
  await expect(cast.locator("#role-grammarian")).toHaveCSS("opacity", "0.28");
  await expect(cast.locator("#role-timer")).toHaveCSS("opacity", "1");
});

test("the timing lights: drag a Table Topic to 1:30 and amber comes on", async ({ page }) => {
  await page.goto("/meetings");
  const lab = page.locator("#timing-lights");
  await lab.getByText("Table Topic", { exact: true }).click();
  const range = lab.getByRole("slider", { name: "Time into the speech" });
  await range.fill("90");
  await expect(lab.locator(".timing-lab")).toHaveAttribute("data-signal", "amber");
  await expect(lab.getByText("Amber: start bringing it home")).toBeVisible();
  await range.fill("30");
  await expect(lab.locator(".timing-lab")).toHaveAttribute("data-signal", "off");
});
