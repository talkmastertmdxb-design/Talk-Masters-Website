import { expect, test } from "@playwright/test";

const GOLD = "rgb(214, 176, 106)";

test.describe("home", () => {
  test("the hero keeps its headline and numbers, then where members work, then About", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("Find Your Voice.");
    await expect(hero.locator(".hero-stat")).toHaveCount(4);
    await expect(page.locator("#acts")).toHaveCount(0);
    const next = await page.evaluate(() => {
      const strip = document.querySelector("section[aria-labelledby='hero-title']")?.nextElementSibling;
      return [strip?.id, strip?.nextElementSibling?.id];
    });
    expect(next).toEqual(["workplaces", "about"]);
  });

  test("on a phone the whole hero, numbers included, fits the first screen", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout");
    // A short phone screen (iPhone 13/14 with Safari's bars) is the hardest case.
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto("/");
    const stats = page.locator(".hero-stat");
    await expect(stats).toHaveCount(4);
    const lastBottom = await stats.last().evaluate((el) => el.getBoundingClientRect().bottom);
    expect(lastBottom).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight));
    const tops = await stats.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );
    expect(new Set(tops).size).toBe(1);
  });

  test("a big statement is wiped in by a block, then left as plain text", async ({ page }, testInfo) => {
    await page.goto("/");
    const heading = page.locator("#about-title");
    await heading.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(heading).toContainText("nervous first words become confident speeches");
    // Once revealed (or straight away with reduced motion) the wipe's wrappers are gone.
    await expect(heading.locator(".reveal-block")).toHaveCount(0, { timeout: 5_000 });
    if (testInfo.project.name !== "reduced-motion") {
      await expect(heading).toBeVisible();
    }
  });
});

test.describe("navbar", () => {
  test("is a full-width translucent bar, not a floating pill", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("[data-frosted]");
    const { width, viewport, radius, background } = await bar.evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      viewport: document.documentElement.clientWidth,
      radius: getComputedStyle(el).borderTopLeftRadius,
      background: getComputedStyle(el).backgroundColor,
    }));
    expect(Math.abs(width - viewport)).toBeLessThan(1);
    expect(radius).toBe("0px");
    expect(background).toMatch(/rgba\(11, 18, 32, 0\.\d+\)/);
  });

  test("on phones it hides while scrolling down and returns on scrolling up", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Hiding is for phones and tablets");
    await page.goto("/team");
    const header = page.locator("header.site-header");
    const bottom = () => header.evaluate((el) => el.getBoundingClientRect().bottom);
    // Phones scroll by touch, not wheel: step the page as a reader's thumb would.
    const scrollTo = async (y: number) => {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(120);
    };
    for (const y of [200, 500, 900]) await scrollTo(y);
    await expect.poll(bottom).toBeLessThanOrEqual(1);
    for (const y of [800, 650]) await scrollTo(y);
    await expect.poll(bottom).toBeGreaterThan(40);
  });

  test("on desktop it stays in view while scrolling", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop keeps the bar");
    await page.goto("/team");
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(800);
    expect(await page.locator("header.site-header").evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
  });

  test("numbers its links and marks the current page", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones use the menu");
    await page.goto("/team");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: /Team/ })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: /Members/ })).not.toHaveAttribute("aria-current", "page");
    await expect(nav.locator("li").first()).toContainText("01");
  });

  test("the guest booking button is gold everywhere", async ({ page }) => {
    await page.goto("/");
    const book = page
      .locator("header")
      .getByRole("link", { name: /Book a (guest )?visit/ })
      .first();
    expect(await book.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(GOLD);
    const footerBook = page.locator("footer").getByRole("button", { name: "Book on WhatsApp" });
    expect(await footerBook.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(GOLD);
  });

  test("shows reading progress as the page scrolls", async ({ page }) => {
    await page.goto("/team");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await expect
      .poll(() =>
        page.locator("[data-nav-progress]").evaluate((el) => {
          const value = getComputedStyle(el.closest("[data-frosted]")!).getPropertyValue("--nav-progress");
          return Number(value);
        }),
      )
      .toBeGreaterThan(0.2);
  });

  test("the phone menu lists numbered pages, the next meeting and a gold booking button", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Phone menu");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu.getByRole("link", { name: /Members/ })).toBeVisible();
    await expect(menu).toContainText("02");
    await expect(menu).toContainText("Next meeting");
    const book = menu.getByRole("link", { name: "Book a guest visit" });
    expect(await book.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(GOLD);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
});

test.describe("hero numbers", () => {
  test("count up slowly enough to catch the eye", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "Numbers show at once with reduced motion");
    await page.goto("/");
    const first = page.locator(".hero-stat dd [aria-hidden='true'] > span").first();
    const final = await page.locator(".hero-stat dd .sr-only").first().innerText();
    // On short screens the numbers sit just below the fold; they count once they are in view.
    await page
      .locator(".hero-stat")
      .first()
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    const target = final.replace(/\D+$/, "");
    // Mid-count: neither the starting 0 nor the final number.
    await expect
      .poll(
        async () => {
          const now = await first.innerText();
          return now !== "0" && now !== target;
        },
        { timeout: 10_000 },
      )
      .toBe(true);
    // Still counting well over a second after it starts.
    await page.waitForTimeout(1200);
    expect(await first.innerText()).not.toBe(target);
    await expect.poll(() => first.innerText(), { timeout: 10_000 }).toBe(target);
  });
});

test.describe("scroll reveals", () => {
  // Reveals wait for their block to cross a line 85-88% down the screen. A block that already
  // starts on the first screen, below that line, used to sit blank until the visitor scrolled
  // (the member grid under the /members hero on a tall phone).
  const pages = ["/members", "/team", "/our-story", "/meetings", "/pathways", "/achievements"];
  const screens = [
    { width: 390, height: 664 },
    { width: 430, height: 932 },
  ];
  for (const path of pages)
    for (const screen of screens)
      test(`${path} at ${screen.width}×${screen.height}: the first screen shows without scrolling`, async ({
        page,
      }, testInfo) => {
        test.skip(testInfo.project.name === "reduced-motion", "Nothing animates in");
        await page.setViewportSize(screen);
        await page.goto(path);
        await expect
          .poll(
            () =>
              page.evaluate(() =>
                [
                  ...document.querySelectorAll(
                    "main [data-reveal], main [data-reveal='stagger'] > *, main [data-reveal='rise'] > *",
                  ),
                ]
                  .filter((el) => {
                    const box = el.getBoundingClientRect();
                    return box.width > 0 && box.top < window.innerHeight && box.bottom > 0;
                  })
                  .filter((el) => {
                    for (let node: Element | null = el; node; node = node.parentElement) {
                      const style = getComputedStyle(node);
                      if (Number(style.opacity) < 0.05 || style.clipPath.startsWith("inset(100%"))
                        return true;
                    }
                    return false;
                  })
                  .map((el) => el.textContent?.trim().slice(0, 30)),
              ),
            { timeout: 5_000 },
          )
          .toEqual([]);
      });
});
