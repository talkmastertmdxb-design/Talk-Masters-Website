import { expect, test } from "@playwright/test";

const GOLD = "rgb(214, 176, 106)";

test.describe("home", () => {
  test("the hero keeps its headline and numbers, with About straight after it", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("Find Your Voice.");
    await expect(hero.locator(".hero-stat")).toHaveCount(4);
    await expect(page.locator("#acts")).toHaveCount(0);
    const next = await page.evaluate(
      () => document.querySelector("section[aria-labelledby='hero-title']")?.nextElementSibling?.id,
    );
    expect(next).toBe("about");
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
    const book = page.locator("header").getByRole("link", { name: /Book a (guest )?visit/ }).first();
    expect(await book.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(GOLD);
    const footerBook = page.locator("footer").getByRole("link", { name: "Book a guest visit" }).first();
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
    await page.locator(".hero-stat").first().evaluate((el) => el.scrollIntoView({ block: "center" }));
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
