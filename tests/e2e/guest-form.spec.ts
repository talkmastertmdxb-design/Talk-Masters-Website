import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so nothing is mid-transition when it is checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const THURSDAY = new Date("2026-10-22T08:00:00Z");

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test.beforeEach(async ({ page, context }) => {
  // Never leave the test machine: answer WhatsApp links locally.
  await context.route("https://wa.me/**", (route) => route.fulfill({ body: "<title>WhatsApp</title>" }));
  await page.clock.setFixedTime(THURSDAY);
  await page.goto("/join");
  // The date choices appear once the form has hydrated; before that the button can't hand off yet.
  await expect(page.locator("input[name='meeting'][value='2026-11-01']")).toBeAttached();
});

const visiblePreview = (page: Page) => page.locator("[data-chat-message]").filter({ visible: true });

test("the message is written live and opens in WhatsApp, ready for the chosen officer", async ({ page }) => {
  await page.getByLabel("Your name").fill("Sara Ahmed");
  await page.getByText("A job interview").click();
  await page.getByText("Sun 15 Nov").click();
  await page.getByText("Mansoor", { exact: true }).click();
  await page.getByLabel(/Anything we should know/).fill("I'm a little nervous!");

  const expected =
    "Hi Mansoor! I'm Sara Ahmed, and I'd like to visit Talk-Masters as a guest at the meeting on Sunday 15 November. Could you save me a seat?\n\n" +
    "I have a job interview coming up.\n\nI'm a little nervous!";
  await expect(visiblePreview(page)).toHaveText(expected, { useInnerText: true });

  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Open in WhatsApp/ }).click();
  const url = new URL((await popup).url());
  expect(url.origin + url.pathname).toBe("https://wa.me/971501600212");
  expect(url.searchParams.get("text")).toBe(expected);
  await expect(page.getByRole("status")).toContainText("WhatsApp is opening with your message to Mansoor");
});

test("a guest's chair is reserved in their name", async ({ page, isMobile }) => {
  await expect(page.locator(".stage-art")).toHaveAttribute("data-reserved", "false");
  await page.getByLabel("Your name").fill("Sara Ahmed");
  await expect(page.locator(".stage-art")).toHaveAttribute("data-reserved", "true");
  await expect(page.locator(".stage-tag")).toHaveText("Reserved for Sara");
  // Wide screens show the phone preview over the stage; phones show the bubble above the button.
  await expect(page.locator("figure[aria-label^='Preview']").filter({ visible: true })).toHaveCount(1);
  expect(isMobile).toBeDefined();
});

test("asks for a name before opening WhatsApp", async ({ page }) => {
  let opened = false;
  page.on("popup", () => (opened = true));
  await page.getByRole("button", { name: /Open in WhatsApp/ }).click();
  await expect(page.getByText("Please tell us your name")).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeFocused();
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
  expect(opened).toBe(false);
});

test("guests who aren't sure of the date can still ask", async ({ page }) => {
  await page.getByLabel("Your name").fill("Omar");
  await page.getByText("Not sure yet").click();
  await expect(visiblePreview(page)).toHaveText(
    "Hi Lulu! I'm Omar, and I'd like to visit Talk-Masters as a guest. I'm not sure which date yet.",
  );
});

test.describe("with smooth scrolling", () => {
  test("the page still scrolls while a form field has focus", async ({ browser, isMobile }, testInfo) => {
    test.skip(isMobile, "Smooth scrolling is a desktop feature; phones scroll natively");
    // A context of its own: the fixed clock from beforeEach would also freeze Lenis's animation frames.
    const context = await browser.newContext({ ...testInfo.project.use, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/join");
    await expect(page.locator("input[name='meeting']").first()).toBeAttached();
    for (const field of [page.getByLabel("Your name"), page.locator("input[name='moment']").first()]) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await field.focus();
      const before = await page.evaluate(() => window.scrollY);
      await page.mouse.move(400, 400);
      await page.mouse.wheel(0, 600);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 200);
    }
    await context.close();
  });
});

test("the guest form has no serious accessibility violations", async ({ page }) => {
  await page.getByLabel("Your name").fill("Sara Ahmed");
  expect(await seriousViolations(page)).toEqual([]);
});
