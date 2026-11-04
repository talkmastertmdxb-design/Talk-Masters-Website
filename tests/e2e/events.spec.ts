import { expect, test, type Page } from "@playwright/test";

/** Scroll the whole page so every lazy photo loads, then settle at the top. */
async function readDownThePage(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.waitForLoadState("networkidle");
}

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

  test("opens on a collage of photos and an index of the events, most recent first", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beyond the Sunday meeting");
    await expect(page.locator(".events-collage [data-image-slot] img")).toHaveCount(5);

    const index = page.getByRole("navigation", { name: "Events on this page" }).getByRole("link");
    await expect(index).toHaveCount(3);
    await expect(index.nth(2)).toHaveAttribute("href", "#meetings");
    await expect(index.nth(2)).toContainText("13 July 2025 and 10 August 2025");
    await expect(index.nth(0)).toHaveAttribute("href", "#she-leads");
    await expect(index.nth(0)).toContainText("Sunday 14 September 2025");
    await expect(index.nth(1)).toHaveAttribute("href", "#careernova");

    await index.nth(1).press("Enter");
    await expect(page).toHaveURL(/#careernova$/);
    await expect(page.locator("article#careernova").getByRole("heading", { level: 2 })).toBeInViewport();
  });

  test("tells She Leads in full: when, where and the story of the day", async ({ page }) => {
    await page.goto("/events");
    const event = page.locator("article#she-leads");
    await expect(event.getByRole("heading", { name: "She Leads", level: 2 })).toBeVisible();
    await expect(event.getByText("Where every woman is a leader")).toBeVisible();
    await expect(event.getByText("Sunday 14 September 2025", { exact: true })).toBeVisible();
    await expect(event.getByText("9:00 am – 1:00 pm")).toBeVisible();
    await expect(event.getByText("Glendale International School, Oud Metha, Dubai")).toBeVisible();
    await expect(event).toContainText("Prathiba Leo moderated a panel with Tarannum Sheikh");
  });

  test("fans out the She Leads posters, one held up in front", async ({ page }) => {
    await page.goto("/events");
    const event = page.locator("article#she-leads");
    const deck = event.getByRole("list", { name: "She Leads line-up posters" });
    await deck.scrollIntoViewIfNeeded();
    await expect(deck.getByRole("listitem")).toHaveCount(5);
    const front = () => deck.locator("[aria-current='true']");

    // The middle poster starts in front, and the caption names its person.
    await expect(front()).toHaveAccessibleName("Emcee: Remy George");
    await expect(event.getByText("3 of 5")).toBeVisible();

    await event.getByRole("button", { name: "Next poster" }).click();
    await expect(front()).toHaveAccessibleName("Emcee: Deepthi Rajeevan");

    // Any card brings itself forward, and the caption follows. (The card two places back is
    // mostly covered, so it is pressed from the keyboard rather than clicked dead centre.)
    await deck.getByRole("button", { name: "Chief Guest: Deewee Alcasoas" }).press("Enter");
    await expect(front()).toHaveAccessibleName("Chief Guest: Deewee Alcasoas");
    await expect(event.getByRole("button", { name: "Previous poster" })).toBeDisabled();

    // The keyboard turns it too.
    await front().press("ArrowRight");
    await expect(front()).toHaveAccessibleName("Panel Moderator: Prathiba Leo");

    // The poster in front opens full size.
    const full = event.getByRole("link", { name: /Open the poster full size/ });
    await expect(full).toHaveAccessibleName(/Prathiba Leo/);
    const response = await page.request.get((await full.getAttribute("href"))!);
    expect(response.status()).toBe(200);
  });

  test("tells CareerNova: when, where and its seven talks in running order", async ({ page }) => {
    await page.goto("/events");
    const event = page.locator("article#careernova");
    await expect(event.getByRole("heading", { name: "CareerNova", level: 2 })).toBeVisible();
    await expect(event.getByText("Sunday 29 June 2025", { exact: true })).toBeVisible();
    await expect(event.getByText("9:00 am – 1:00 pm")).toBeVisible();
    await expect(event.getByText("Glendale International School, Oud Metha, Dubai")).toBeVisible();

    const talks = event.getByRole("list", { name: "CareerNova talks" });
    await talks.scrollIntoViewIfNeeded();
    await expect(talks.getByRole("listitem")).toHaveCount(7);
    await expect(talks.getByRole("listitem").first()).toContainText("Pay yourself first");
    await expect(talks.getByRole("listitem").first()).toContainText("Deepak Bhadra");
    // A talk without a known title is named by its speaker alone.
    await expect(talks.getByRole("listitem").nth(3)).toHaveText("Ganesan");

    const counter = event.getByText(/^\d of 7$/);
    await expect(counter).toHaveText("1 of 7");
    await expect(event.getByRole("button", { name: "Previous session" })).toBeDisabled();
    await event.getByRole("button", { name: "Next session" }).click();
    await expect(counter).toHaveText("2 of 7");
    await expect(talks.getByRole("listitem").nth(1)).toHaveAttribute("data-current", "true");
  });

  test("turns the talks either side of the centre away, and keeps them flat for reduced motion", async ({
    page,
  }, testInfo) => {
    await page.goto("/events#careernova-sessions");
    const cards = page.locator("article#careernova .perspective-carousel__card");
    await expect(cards).toHaveCount(7);
    const transformOf = (index: number) => cards.nth(index).evaluate((el) => getComputedStyle(el).transform);

    if (testInfo.project.name === "reduced-motion") {
      expect(await transformOf(1)).toBe("none");
    } else {
      // The centre card faces you; its neighbour is turned in 3D (a matrix3d).
      await expect.poll(() => transformOf(1)).toMatch(/^matrix3d/);
    }
  });

  test("shows photos from each day in a bento grid that opens full screen", async ({ page }) => {
    await page.goto("/events");
    const gallery = page.getByRole("list", { name: "Photos from She Leads" });
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole("listitem")).toHaveCount(8);
    await expect(page.getByRole("list", { name: "Photos from CareerNova" }).getByRole("listitem")).toHaveCount(7);

    // The lead photo is the largest tile.
    const area = (index: number) =>
      gallery
        .getByRole("listitem")
        .nth(index)
        .evaluate((el) => el.getBoundingClientRect().width * el.getBoundingClientRect().height);
    expect(await area(0)).toBeGreaterThan(await area(2));

    await gallery.getByRole("button").first().click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveAccessibleName(/She Leads panel on stage/);
    await expect(viewer.getByText("1 of 8")).toBeVisible();
    await expect(viewer.locator("img")).toHaveJSProperty("complete", true);

    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText("2 of 8")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.getByText("8 of 8")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("with nothing announced, points to the next regular meeting", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /No special event announced yet/ })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Book a guest visit" })).toHaveAttribute(
      "href",
      "/join",
    );
  });

  test("on phones the talks swipe sideways inside their row, never the page", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout");
    await page.goto("/events");
    await readDownThePage(page);
    const row = page.getByRole("list", { name: "CareerNova talks" });
    await expect.poll(() => row.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(200);
    const width = page.viewportSize()!.width;
    expect(await page.evaluate(() => window.innerWidth)).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
});
