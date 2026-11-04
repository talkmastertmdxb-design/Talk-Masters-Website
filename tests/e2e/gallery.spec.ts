import { expect, test } from "@playwright/test";

test.describe("gallery page", () => {
  test("is in the menu, right after Events", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = isMobile ? page.getByRole("dialog") : page.getByRole("navigation", { name: "Main" });
    const labels = (await nav.locator("a").allTextContents()).map((text) =>
      text.replace(/^\d+\s*/, "").trim(),
    );
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
    // The two rails carry different photos: none is shown twice.
    const sources = await corridor
      .locator("img")
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src")));
    expect(new Set(sources).size).toBe(18);
  });

  test("shows 40 photos still, then 40 more at a time, with focus on the first new one", async ({ page }) => {
    await page.goto("/gallery");
    const tiles = page.locator(".collage .collage__tile");
    await expect(tiles).toHaveCount(40);
    await expect(page.getByText(/^Showing 40 of \d+$/)).toBeVisible();
    // Still: nothing in the grid is animated.
    expect(
      await page
        .locator(".collage__copy")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");

    await page.getByRole("button", { name: "Show 40 more" }).click();
    await expect(tiles).toHaveCount(80);
    await expect(page.locator(".collage__tile[data-index='40']")).toBeFocused();
  });

  test("filters the grid, the counts match, and a new filter starts again at 40", async ({ page }) => {
    await page.goto("/gallery");
    const filters = page.getByRole("group", { name: "Show photos from" });
    await expect(filters.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    const tiles = page.locator(".collage .collage__tile");

    const moments = filters.getByRole("button", { name: /^Club moments/ });
    const count = Number((await moments.locator(".collage__count").textContent())?.trim());
    await moments.click();
    await expect(moments).toHaveAttribute("aria-pressed", "true");
    await expect(tiles).toHaveCount(Math.min(40, count));
    await expect(page.getByText(`Showing ${Math.min(40, count)} of ${count}`)).toBeVisible();

    const meetings = filters.getByRole("button", { name: /^Sunday meetings/ });
    await meetings.click();
    await expect(tiles).toHaveCount(40);
    await page.getByRole("button", { name: /^Show \d+ more$/ }).click();
    await expect(tiles).toHaveCount(75);
    await expect(page.getByRole("button", { name: /^Show \d+ more$/ })).toHaveCount(0);
  });

  test("opens any photo full screen, steps through and closes", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: /^She Leads/ }).click();
    await page.locator(".collage__tile[data-index='0']").press("Enter");
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toContainText("She Leads, 14 September 2025");
    await expect(viewer.getByText(/^1 of \d+$/)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText(/^2 of \d+$/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("a swipe steps to the next photo", async ({ page }) => {
    await page.goto("/gallery");
    await page.locator(".collage__tile[data-index='0']").press("Enter");
    const viewer = page.getByRole("dialog");
    const photo = viewer.locator(".lightbox__frame > div").first();
    const box = (await photo.boundingBox())!;
    const y = box.y + box.height / 2;
    await photo.dispatchEvent("pointerdown", {
      clientX: box.x + box.width * 0.7,
      clientY: y,
      pointerType: "touch",
    });
    await photo.dispatchEvent("pointerup", {
      clientX: box.x + box.width * 0.3,
      clientY: y,
      pointerType: "touch",
    });
    await expect(viewer.getByText(/^2 of \d+$/)).toBeVisible();
  });

  test("a shared link opens that photo, and Share copies the link without a share sheet", async ({
    page,
    context,
    browserName,
  }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
    if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/gallery?photo=meeting-2025-07-13-j480");
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveAccessibleName("Award winners holding their trophies and certificates");
    await viewer.getByRole("button", { name: "Share this photo" }).click();
    await expect(viewer.getByText(/Link copied|Couldn't share/)).toBeVisible();
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
