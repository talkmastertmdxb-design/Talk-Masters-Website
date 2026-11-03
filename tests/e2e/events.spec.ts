import { expect, test } from "@playwright/test";

test.describe("events page", () => {
  test("is in the menu, right after Meetings", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = isMobile ? page.getByRole("dialog") : page.getByRole("navigation", { name: "Main" });
    const labels = (await nav.locator("a").allTextContents()).map((text) =>
      text.replace(/^\d+\s*/, "").trim(),
    );
    const meetings = labels.findIndex((label) => label.startsWith("Meetings"));
    expect(labels[meetings + 1]).toMatch(/^Events/);
  });

  test("tells She Leads in full: when, where and who took the stage", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beyond the Sunday meeting");
    const event = page.locator("article#she-leads");
    await expect(event.getByRole("heading", { name: "She Leads" })).toBeVisible();
    await expect(event.getByText("Where every woman is a leader")).toBeVisible();
    await expect(event.getByText("Sunday 14 September 2025", { exact: true })).toBeVisible();
    await expect(event.getByText("9:00 am – 1:00 pm")).toBeVisible();
    await expect(event.getByText("Glendale International School, Oud Metha, Dubai")).toBeVisible();

    const lineup = event.getByRole("list").first();
    await expect(lineup.getByRole("listitem")).toHaveCount(5);
    await expect(lineup.getByRole("listitem").first()).toContainText("Chief Guest");
    await expect(lineup.getByRole("listitem").first()).toContainText("Deewee Alcasoas");
    // Each poster opens full size.
    const poster = lineup.getByRole("link", { name: /Deewee Alcasoas's poster full size/ });
    const response = await page.request.get((await poster.getAttribute("href"))!);
    expect(response.status()).toBe(200);
  });

  test("with nothing announced, points to the next regular meeting", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /No special event announced yet/ })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Book a guest visit" })).toHaveAttribute(
      "href",
      "/join",
    );
  });

  test("on phones the posters swipe sideways inside their row, never the page", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Phone layout");
    await page.goto("/events");
    const row = page.locator("#she-leads-lineup + ul");
    // Read down the whole page, letting the lazy posters load: their hidden labels once widened
    // the page, and a phone then zoomed it out.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(100);
    }
    await page.waitForLoadState("networkidle");
    await expect.poll(() => row.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(200);
    const width = page.viewportSize()!.width;
    expect(await page.evaluate(() => window.innerWidth)).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });

  test("on desktop the whole line-up sits in one row", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop layout");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/events");
    const tops = await page
      .locator("#she-leads-lineup + ul > li")
      .evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().top)));
    expect(tops).toHaveLength(5);
    expect(new Set(tops).size).toBe(1);
  });
});
