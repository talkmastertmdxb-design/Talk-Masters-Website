import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so reveals and pins never hide what is being checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

/** A Thursday in Dubai: the next meeting is Sunday 25 October (the 4th Sunday). */
const THURSDAY = new Date("2026-10-22T08:00:00Z");

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("/join names the next meeting's date and the schedule", async ({ page }) => {
  await page.clock.setFixedTime(THURSDAY);
  await page.goto("/join");
  const main = page.locator("main");
  await expect(main.locator("[data-next-meeting]").first()).toHaveText("Sunday 25 October");
  await expect(main.getByText("2nd & 4th Sunday of every month")).toBeVisible();
  await expect(main.getByText("10:30 am – 12:30 pm").first()).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("the next meeting moves on once today's meeting ends", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-25T08:30:00Z"));
  await page.goto("/join");
  await expect(page.locator("main [data-next-meeting]").first()).toHaveText("Sunday 8 November");
});

test("the hero gives the next meeting's date", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-24T09:00:00Z"));
  await page.goto("/");
  const hero = page.locator("section[aria-labelledby='hero-title']");
  await expect(hero.locator("[data-next-meeting]")).toHaveText("Tomorrow");
});

test("guests can add every meeting to their calendar", async ({ page, request }) => {
  await page.goto("/join");
  const google = page.getByRole("link", { name: /Google Calendar/ });
  const href = new URL((await google.getAttribute("href"))!);
  expect(href.hostname).toBe("calendar.google.com");
  expect(href.searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;BYDAY=2SU,4SU");
  expect(href.searchParams.get("ctz")).toBe("Asia/Dubai");

  const ics = page.getByRole("link", { name: /Apple or Outlook/ });
  await expect(ics).toHaveAttribute("href", "/meetings.ics");
  const response = await request.get("/meetings.ics");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/calendar");
  const body = await response.text();
  expect(body).toContain("RRULE:FREQ=MONTHLY;BYDAY=2SU,4SU");
  expect(body).toContain("DTSTART;TZID=Asia/Dubai:20261025T103000");
});

// No special events are confirmed yet (content/events.json is empty); which events show, and
// until when, is covered by tests/unit/events.test.ts.
test("with no upcoming events, the events strip stays hidden", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-01T08:00:00Z"));
  await page.goto("/join");
  await expect(page.locator("main [data-next-meeting]").first()).toHaveText("Sunday 13 December");
  await expect(page.getByRole("heading", { name: "Also coming up" })).toHaveCount(0);
});

test("the home page answers guests' questions, one at a time", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator("section[aria-labelledby='faq-title']");
  await expect(faq.getByRole("heading", { name: "Questions guests ask" })).toBeVisible();
  const speak = faq.getByText("Will I be called on to speak?");
  const cost = faq.getByText("Does it cost anything to visit?");
  const speakAnswer = faq.getByText(/we always ask before calling on a guest/);
  const costAnswer = faq.getByText(/Visiting as a guest is free/);

  await expect(speakAnswer).toBeHidden();
  await speak.click();
  await expect(speakAnswer).toBeVisible();
  await cost.click();
  await expect(costAnswer).toBeVisible();
  await expect(speakAnswer).toBeHidden();
});

test.describe("header", () => {
  test("wide screens show the next meeting instead of a speech timer", async ({ page, isMobile }) => {
    test.skip(isMobile, "The chip is for wide screens");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.clock.setFixedTime(THURSDAY);
    await page.goto("/");
    const chip = page.locator("header").getByRole("link", { name: /Next meeting/ });
    await expect(chip).toHaveText(/Sun 25 Oct/);
    await expect(chip).toHaveAttribute("href", "/join");
    await expect(page.locator("header [data-signal]")).toHaveCount(0);
  });

  test("phones keep the booking button beside the menu", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    const book = page.locator("header").getByRole("link", { name: "Book a visit" });
    await expect(book).toBeVisible();
    await expect(book).toHaveAttribute("href", "/join");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
