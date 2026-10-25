import { expect, test } from "@playwright/test";

test.describe("signature moments", () => {
  test("the hero headline finishes its intro and stays readable", async ({ page }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toHaveAccessibleName(
      /Find your voice\.\s*Lead with Confidence\.\s*Inspire the world\./i,
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
      "What happens on a Sunday morning",
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

  test("Inside a meeting lists the morning from 10:30 to 12:15", async ({ page }) => {
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
    const clock = page.locator("[data-agenda-clock]").first();
    const top = await page
      .locator("#inside-a-meeting")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y + 1200), top);
    await expect.poll(async () => clock.textContent(), { timeout: 5000 }).not.toBe("10:30");
  });

  test("on phones, swiping the agenda moves the clock and the progress bar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phones swipe the row; desktop pins it");
    await page.goto("/");
    const section = page.locator("#inside-a-meeting");
    const clock = section.locator("[data-agenda-clock]").filter({ visible: true });
    await section.scrollIntoViewIfNeeded();
    await expect(clock).toHaveText("10:30");
    await expect(section.locator("[data-agenda-meridiem]").filter({ visible: true })).toHaveText("am");
    await section.locator("[data-agenda-track]").evaluate((track) => (track.scrollLeft = track.scrollWidth));
    await expect(clock).toHaveText("12:15");
    await expect(section.locator("[data-agenda-meridiem]").filter({ visible: true })).toHaveText("pm");
    await expect(section.locator(".agenda")).toHaveCSS("--agenda-progress", "1");
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

test("arriving on the home page from another page animates cleanly, with no GSAP warnings", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("GSAP target")) warnings.push(message.text());
  });
  await page.goto("/team");
  await page.locator("header a[href='/']").first().click();
  await page.waitForURL("/");
  await expect(page.locator("section[aria-labelledby='hero-title'] [data-hero-item]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await page.waitForTimeout(1000);
  expect(warnings).toEqual([]);
});

test.describe("hero photos", () => {
  test("rotate through the club photos, with a working pause button", async ({
    page,
    isMobile,
  }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "Covered by the reduced-motion test below");
    test.skip(isMobile, "Phones show only the pause button: covered below");
    await page.goto("/");
    const slides = page.locator("[data-hero-backdrop] [data-slide]");
    await expect(slides).toHaveCount(4);
    // Only the photo on show is exposed to assistive technology.
    await expect(page.locator("[data-hero-backdrop] [data-slide]:not([aria-hidden])")).toHaveCount(1);
    // The slideshow has started once it has layered the photos.
    await expect(slides.first()).toHaveCSS("z-index", "1");

    // Keyboard, not a pointer: the controls can sit below the fold, where smooth scrolling moves them mid-click.
    await page.getByRole("button", { name: "Show photo 3 of 4" }).press("Enter");
    await expect(slides.nth(2)).toHaveCSS("opacity", "1", { timeout: 3000 });
    await expect(slides.nth(2)).not.toHaveAttribute("aria-hidden");
    await expect(page.getByRole("button", { name: "Show photo 3 of 4" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    await page.getByRole("button", { name: "Pause photo slideshow" }).press("Enter");
    await expect(page.getByRole("button", { name: "Play photo slideshow" })).toBeVisible();
  });

  test("advance on their own after the hold", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "Reduced motion never advances on its own");
    await page.clock.install();
    await page.goto("/");
    await page.mouse.move(5, 5);
    await page.clock.runFor(13_000);
    await expect(page.locator("[data-hero-backdrop] [data-slide]").nth(1)).not.toHaveAttribute("aria-hidden");
  });

  test("on phones, only the pause button shows, clear of the hero's numbers", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout");
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto("/");
    const pause = page.getByRole("button", { name: /(Pause|Play) photo slideshow/ });
    await expect(pause).toBeVisible();
    await expect(page.getByRole("button", { name: "Show photo 2 of 4" })).toBeHidden();
    const button = (await pause.boundingBox())!;
    for (const stat of await page.locator(".hero-stat").all()) {
      const box = (await stat.boundingBox())!;
      const overlaps = button.y < box.y + box.height && box.y < button.y + button.height;
      expect(overlaps && button.x < box.x + box.width && box.x < button.x + button.width).toBe(false);
    }
    await pause.press("Enter");
    await expect(page.getByRole("button", { name: /(Pause|Play) photo slideshow/ })).toBeVisible();
  });

  test("show when and where we meet", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-22T08:00:00Z"));
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByText(/Next meeting: Sunday 25 October/)).toBeVisible();
    await expect(hero.getByText("10:30 am – 12:30 pm")).toBeVisible();
    await expect(hero.getByText(/Hor Al Anz Public Library, Dubai/)).toBeVisible();
  });
});

test.describe("members' video", () => {
  test("previews silently, then plays from the start with sound and native controls", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "Covered by the reduced-motion test below");
    await page.goto("/");
    const section = page.locator("section:has(#voices-title)");
    const video = section.locator("video");
    await expect(video).toHaveAttribute("preload", "none");
    await section.scrollIntoViewIfNeeded();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted), { timeout: 8000 })
      .toBe(true);

    await section.getByRole("button", { name: "Play with sound" }).press("Enter");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
    await expect(video).toHaveAttribute("controls", "");
  });

  test("the published video is the compressed cut, not the raw footage", async ({ page }) => {
    const response = await page.request.get("/videos/member-voices.mp4");
    expect(response.status()).toBe(200);
    expect(Number(response.headers()["content-length"])).toBeLessThan(8_000_000);
    expect((await page.request.get("/Video/Toastmasters%20Video.mp4")).status()).toBe(404);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the members' video never plays by itself", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section:has(#voices-title)");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("button", { name: "Play the preview without sound" })).toBeVisible();
    // Give an autoplay, if there were one, time to start.
    await page.waitForTimeout(1500);
    expect(await section.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("the hero photos start paused and change only when asked", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones have no slide buttons; the pause button is covered above");
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Play photo slideshow" })).toBeVisible();
    await page.getByRole("button", { name: "Show photo 2 of 4" }).press("Enter");
    await expect(page.locator("[data-hero-backdrop] [data-slide]").nth(1)).toHaveCSS("opacity", "1", {
      timeout: 300,
    });
  });

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
  await expect(page.getByRole("heading", { level: 1, name: /^Join us .+ as our guest$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Get directions/ })).toHaveAttribute(
    "href",
    /google\.com\/maps.*Hor%20Al%20Anz%20Public%20Library/,
  );
});
