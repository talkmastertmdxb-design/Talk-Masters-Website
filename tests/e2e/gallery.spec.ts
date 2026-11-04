import { expect, test } from "@playwright/test";

test.describe("gallery page", () => {
  test("is in the menu, right after Events", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = isMobile ? page.getByRole("dialog") : page.getByRole("navigation", { name: "Main" });
    const labels = (await nav.locator("a").allTextContents()).map((text) => text.replace(/^\d+\s*/, "").trim());
    expect(labels[labels.findIndex((label) => label.startsWith("Events")) + 1]).toMatch(/^Gallery/);
  });

  test("opens white, with the headline over a decorative corridor of photos", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The club, as the camera saw it");
    const hero = page.locator("section:has(#gallery-title)");
    await expect(hero).toHaveAttribute("data-header", "light");
    await expect(hero).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const corridor = hero.locator("[aria-hidden='true']").first();
    await expect(corridor.locator("img")).toHaveCount(18);
  });

  test("filters the collage, and the counts match what it shows", async ({ page }) => {
    await page.goto("/gallery");
    const filters = page.getByRole("group", { name: "Show photos from" });
    const all = filters.getByRole("button", { name: /^All/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    const shown = page.locator(".collage__copy:not(.collage__copy--loop) > li:not([aria-hidden])");
    const meetings = filters.getByRole("button", { name: /^Sunday meetings/ });
    const count = Number((await meetings.locator(".collage__count").textContent())?.trim());
    await meetings.click();
    await expect(meetings).toHaveAttribute("aria-pressed", "true");
    await expect(shown).toHaveCount(count);
    await expect(page.getByText(`${count} photos`, { exact: true })).toBeVisible();
  });

  test("opens any photo full screen, steps through and closes", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: /^She Leads/ }).click();
    const first = page
      .locator(".collage__copy:not(.collage__copy--loop) > li:not([aria-hidden]) button")
      .first();
    await first.press("Enter");
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toContainText("She Leads, 14 September 2025");
    await expect(viewer.getByText(/^1 of \d+$/)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText(/^2 of \d+$/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("drifts, holds still under the pointer, and stays still for reduced motion", async ({
    page,
    isMobile,
  }, testInfo) => {
    await page.goto("/gallery");
    const collage = page.locator(".collage");
    const track = collage.locator(".collage__track").first();
    const animation = () => track.evaluate((el) => getComputedStyle(el).animationName);
    if (testInfo.project.name === "reduced-motion") {
      expect(await animation()).toBe("none");
      await expect(collage.locator(".collage__copy--loop").first()).toBeHidden();
      return;
    }
    expect(await animation()).toBe("collage-drift");
    test.skip(isMobile, "No pointer to hover with");
    await collage.hover();
    await expect.poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");
  });

  test("an Events-page link opens the gallery on that meeting's photos", async ({ page }) => {
    await page.goto("/gallery?from=session-80");
    await expect(
      page.getByRole("group", { name: "Show photos from" }).getByRole("button", { name: /^Sunday meetings/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("never scrolls sideways on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout");
    await page.goto("/gallery");
    const width = page.viewportSize()!.width;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
});

test.describe("sunday meetings on /events", () => {
  test("each meeting has a card with its photos and a link to all of them", async ({ page }) => {
    await page.goto("/events");
    const band = page.locator("section#meetings");
    await expect(band.getByRole("heading", { name: "From our Sunday meetings" })).toBeVisible();
    const card = band.locator("article#session-80");
    await expect(card.getByRole("heading", { name: /Session 80/ })).toBeVisible();
    await expect(card.getByText("Sunday 10 August 2025")).toBeVisible();
    await expect(card.locator("[data-image-slot]")).toHaveCount(4);
    await expect(card.getByRole("link", { name: /See all 39 photos/ })).toHaveAttribute(
      "href",
      "/gallery?from=session-80",
    );
    await expect(page.getByRole("link", { name: "Open the Gallery" })).toHaveAttribute("href", "/gallery");
  });
});

test.describe("members' words beside the video", () => {
  test("one quote at a time, with the member's portrait on top of the stack", async ({ page }) => {
    await page.goto("/");
    const stack = page.getByRole("group", { name: "Members in their own words" });
    await stack.scrollIntoViewIfNeeded();
    await expect(stack.locator("blockquote")).toHaveCount(1);
    await expect(stack).toContainText("Edwin Sunny");
    await expect(stack.getByText("1 of 6")).toBeVisible();
    await expect(stack.locator(".quote-stack__photo[data-place='0'] img")).toHaveCount(1);

    await stack.getByRole("button", { name: "Next member" }).click();
    await expect(stack).toContainText("Noufal Aboobacker");
    await stack.getByRole("button", { name: "Previous member" }).press("Enter");
    await stack.getByRole("button", { name: "Previous member" }).click();
    await expect(stack.getByText("6 of 6")).toBeVisible();
  });
});
