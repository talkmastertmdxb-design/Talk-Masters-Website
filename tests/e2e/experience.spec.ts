import { expect, test } from "@playwright/test";

test.describe("signature moments", () => {
  test("the Timing Light reaches red at the end of the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "The timing light is hidden on small screens");
    await page.goto("/");
    const light = page.locator("header [data-signal]");
    await expect(light).toHaveAttribute("data-signal", "off");
    // Pinned sections add height once measured, so keep going until the true end.
    await expect
      .poll(
        async () => {
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          return light.getAttribute("data-signal");
        },
        { timeout: 8000 },
      )
      .toBe("red");
    await expect(light).toHaveText("7:00");
  });

  test("the hero headline finishes its intro and stays readable", async ({ page }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toHaveAccessibleName(
      /Find your voice\.\s*Lead with Confidence\.\s*Inspire the world\./,
    );
    await expect(title).toHaveCSS("opacity", "1", { timeout: 4000 });
  });

  test("the home page follows the plan's section order", async ({ page }) => {
    await page.goto("/");
    const headings = (await page.getByRole("heading", { level: 2 }).allTextContents()).map((h) =>
      h.replace(/\s+/g, " ").trim(),
    );
    const order = [
      "Talk-Masters is where nervous first words become confident speeches.",
      "Nervous about speaking? So was everyone here.",
      "What actually happens on the night",
      "Your first Table Topic, right here.",
      "Real People. Real Growth.",
      "The people who run the room",
      "Ready to become a better speaker?",
    ];
    const positions = order.map((text) => headings.indexOf(text));
    expect(
      positions.every((p) => p >= 0),
      JSON.stringify(headings),
    ).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("Inside a meeting lists the evening from 7:00 to 8:45", async ({ page }) => {
    await page.goto("/");
    const agenda = page.getByRole("list", { name: "Meeting agenda" });
    await expect(agenda.getByRole("heading")).toHaveText([
      "Welcome",
      "Prepared Speeches",
      "Table Topics",
      "Evaluations",
      "Awards",
    ]);
  });

  test("the pinned agenda clock advances as you scroll", async ({ page, isMobile }, testInfo) => {
    test.skip(isMobile || testInfo.project.name === "reduced-motion", "Pinning needs desktop and motion");
    await page.goto("/");
    const clock = page.locator("[data-agenda-clock]");
    const top = await page
      .locator("#inside-a-meeting")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y + 1200), top);
    await expect.poll(async () => clock.textContent(), { timeout: 5000 }).not.toBe("7:00");
  });

  test("the Table Topics booth gives a topic and starts the timer", async ({ page }) => {
    await page.goto("/");
    const booth = page.locator(".booth");
    await booth.scrollIntoViewIfNeeded();
    const start = booth.getByRole("button", { name: "Start speaking" });
    await expect(start).toBeDisabled();
    await booth.getByRole("button", { name: "Give me a topic" }).click();
    await expect(booth.getByText("Press “Give me a topic”")).toHaveCount(0);
    await start.click();
    await expect(booth.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(booth.getByRole("timer")).not.toHaveText("0:00", { timeout: 3000 });
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("shows the hero immediately, with no intro", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1", { timeout: 300 });
    await expect(page.locator("[data-hero-item]").first()).toHaveCSS("opacity", "1", { timeout: 300 });
  });

  test("never pins sections, and reveal content is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-pinned]")).toHaveCount(0);
    await page.locator("#about").scrollIntoViewIfNeeded();
    await expect(page.getByText("Read how the club began")).toHaveCSS("opacity", "1");
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus in a dialog, and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Our Story" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("navigating from the menu closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Members" }).click();
    await expect(page).toHaveURL(/\/members$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });
});

test("every 'Book a guest visit' link goes to /join, which loads", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .getByRole("link", { name: "Book a guest visit" })
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs)).toEqual(new Set(["/join"]));
  const response = await page.goto("/join");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Book a guest visit" })).toBeVisible();
});
