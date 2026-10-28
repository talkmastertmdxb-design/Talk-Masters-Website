import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const seriousViolations = async (page: Page, selector: string) => {
  const results = await new AxeBuilder({ page }).include(selector).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

/** Skips the first-visit moments, so tests see the page itself. */
const skipIntros = (page: Page) =>
  page.addInitScript(() => localStorage.setItem("tm-intro-v2", String(Date.now())));

test.describe("home", () => {
  test.beforeEach(({ page }) => skipIntros(page));

  test("names where members work, once for listeners and again only for the loop", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const strip = page.locator("#workplaces");
    await expect(strip.getByRole("heading", { name: "Where our members work" })).toBeVisible();
    // Two copies make the loop seamless; the second is hidden from assistive tech.
    await expect(strip.locator("ul:not([aria-hidden])").getByRole("listitem")).toHaveCount(10);
    // Each company shows its own logo, named for screen readers.
    await expect(strip.getByRole("img", { name: "IKEA" })).toHaveCount(1);
    await expect(strip.getByRole("img", { name: "Bahri & Mazroei Group" })).toBeVisible();
    const animation = await strip
      .locator(".marquee__track")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe(testInfo.project.name === "reduced-motion" ? "none" : "marquee");
  });

  test("shows real members with who they were and who they are now", async ({ page }) => {
    await page.goto("/");
    const faces = page.locator("section[aria-labelledby='faces-title']");
    await expect(
      faces.getByRole("heading", { name: "Engineers, educators, founders, first-timers." }),
    ).toBeVisible();
    await expect(faces.getByRole("listitem")).toHaveCount(6);
    await expect(faces).toContainText("Mechanical engineer, now a public speaking trainer");
    await expect(faces.getByRole("link", { name: "Hadi Abdulkader" })).toHaveAttribute(
      "href",
      "/members#hadi-abdulkader",
    );
    await expect(faces.locator("[data-image-slot] img")).toHaveCount(6);
    await expect(page.getByText("Real People. Real Growth.")).toHaveCount(0);
  });

  test("the Pathways ladder rises into place on its stage light", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#pathways");
    await expect(section.locator(".stage-light--teaser")).toBeAttached();
    const bars = section.getByRole("list", { name: "The five Pathways levels" }).getByRole("listitem");
    await bars.first().scrollIntoViewIfNeeded();
    // Tallest last, and once revealed nothing is left clipped.
    await expect(bars.last()).toHaveCSS("clip-path", "none", { timeout: 5000 });
    const heights = await bars.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(await seriousViolations(page, "#pathways")).toEqual([]);
  });

  test("the committee sits in one row of faces, with their stories", async ({ page }) => {
    await page.goto("/");
    const committee = page.locator("section[aria-labelledby='committee-title']");
    await expect(committee.getByRole("listitem")).toHaveCount(7);
    await expect(committee.getByRole("link", { name: "Meet the Executive Committee" })).toHaveAttribute(
      "href",
      "/team",
    );
  });
});

test.describe("light openings", () => {
  test.beforeEach(({ page }) => skipIntros(page));

  for (const path of ["/team", "/pathways"] as const) {
    test(`${path} opens light, and the header turns light to match`, async ({ page }) => {
      await page.goto(path);
      const bar = page.locator(".site-bar");
      await expect(bar).toHaveAttribute("data-tone", "light");
      expect(await bar.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(11, 18, 32)");
      await expect(page.locator("[data-header='light'] h1")).toBeVisible();
      expect(await seriousViolations(page, "[data-header='light']")).toEqual([]);
    });
  }

  test("the header stays dark over dark pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".site-bar")).toHaveAttribute("data-tone", "dark");
  });

  test("/team opens with all seven faces", async ({ page }) => {
    await page.goto("/team");
    const opening = page.locator("[data-header='light']");
    await expect(opening.locator("[data-image-slot] img")).toHaveCount(7);
    for (const name of ["Mansoor", "Lulu", "Suhayb", "Nabeel", "Nasar", "Noufal"]) {
      await expect(opening).toContainText(name);
    }
  });

  test("/pathways drops 'in a minute', keeps the quiz, and its path chips jump to the cards", async ({
    page,
  }) => {
    await page.goto("/pathways");
    await expect(page.getByRole("heading", { name: /in a minute/ })).toHaveCount(0);
    await expect(page.locator("#find-your-path")).toBeAttached();
    const chip = page
      .getByRole("list", { name: "The six paths" })
      .getByRole("link", { name: "Engaging Humor" });
    await expect(chip).toHaveAttribute("href", "#engaging-humor");
    // The cards are compact: each fits well inside one laptop screen.
    const card = page.locator("#engaging-humor");
    expect((await card.boundingBox())!.height).toBeLessThan(520);
  });
});

test.describe("footer", () => {
  test.beforeEach(({ page }) => skipIntros(page));

  test("books on WhatsApp in one step, with the guest's name in the message", async ({ page }) => {
    await page.goto("/team");
    await page.evaluate(() => {
      (window as unknown as { opened: string[] }).opened = [];
      window.open = ((url: string) => {
        (window as unknown as { opened: string[] }).opened.push(url);
        return { opener: null } as Window;
      }) as typeof window.open;
    });
    const footer = page.locator("footer");
    const field = footer.getByLabel("Name for a quick WhatsApp booking");
    await footer.getByRole("button", { name: "Book on WhatsApp" }).click();
    await expect(footer.getByRole("alert")).toHaveText("Please tell us your name");
    await field.fill("Sara Ahmed");
    await footer.getByRole("button", { name: "Book on WhatsApp" }).click();
    const [url] = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
    expect(url).toMatch(/^https:\/\/wa\.me\/971502837168\?text=/);
    expect(decodeURIComponent(url!.split("text=")[1]!)).toContain("I'm Sara Ahmed");
  });

  test("reads well over the stage light", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    expect(await seriousViolations(page, "footer")).toEqual([]);
  });
});

test.describe("first visit on a phone", () => {
  // A real first visit: no saved "intro seen" (the config pre-marks it for every other test).
  test.use({ storageState: { cookies: [], origins: [] } });

  test("says Speak. Lead. Belong., then gets out of the way", async ({ page, isMobile }, testInfo) => {
    test.skip(!isMobile || testInfo.project.name === "reduced-motion", "Phones with motion only");
    // The moment lasts about 1.4s, so look as soon as the HTML arrives, not after every image loads.
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveClass(/intro-phone/);
    const intro = page.locator(".phone-intro");
    await expect(intro).toContainText("Speak.Lead.Belong.");
    // Then it is gone, and remembered: the next visit goes straight to the hero.
    await expect(page.locator("html")).not.toHaveClass(/intro-phone/, { timeout: 5000 });
    await expect(intro).toBeHidden();
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/intro-phone/);
    await expect(intro).toBeHidden();
  });

  test("laptops keep their own intro and never see the phone one", async ({ page, isMobile }) => {
    test.skip(isMobile, "Laptop layout");
    await page.goto("/");
    await expect(page.locator(".phone-intro")).toBeHidden();
  });
});
