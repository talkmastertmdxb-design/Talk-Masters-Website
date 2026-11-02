import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const openEcho = async (page: Page) => {
  await page.getByRole("button", { name: "Ask Echo", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Echo" });
  await expect(panel).toBeVisible();
  return panel;
};

test("Echo answers from the club's own question bank: topic, question, answer", async ({ page }) => {
  await page.goto("/pathways");
  const launcher = page.getByRole("button", { name: "Ask Echo", exact: true });
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  const panel = await openEcho(page);
  await expect(launcher).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByText(/Hi, I'm Echo!/)).toBeVisible();
  await expect(panel.getByRole("list", { name: "Popular questions" }).getByRole("button")).toHaveText([
    "What is Talk-Masters?",
    "What happens at Talk-Masters?",
    "How do I book a guest visit?",
  ]);
  await expect(panel.getByRole("textbox", { name: "Type a question for Echo" })).toBeFocused();

  await panel.getByRole("list", { name: "Topics" }).getByRole("button", { name: "Your first visit" }).click();
  await panel.getByRole("button", { name: "When and where do you meet?" }).click();

  const log = panel.getByRole("log");
  await expect(log.getByText("When and where do you meet?")).toBeVisible();
  // Live facts from settings, and the next meeting worked out today.
  await expect(log.getByText(/2nd & 4th Sunday of every month, 10:30 am – 12:30 pm/)).toBeVisible();
  await expect(log.getByText(/The next meeting is on \w+day \d+ \w+/)).toBeVisible();
  await expect(log.getByRole("link", { name: "Open the map" })).toHaveAttribute("href", /google\.com\/maps/);

  // Related questions follow, and "All topics" goes back.
  await panel.getByRole("button", { name: "Is there parking?" }).click();
  await expect(log.getByText("Yes, parking is free on Sundays.")).toBeVisible();
  await panel.getByRole("button", { name: "All topics" }).click();
  await expect(panel.getByRole("list", { name: "Topics" })).toBeVisible();

  // Escape closes the panel and hands focus back to the launcher.
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test("typed questions get the closest answer, a choice, or an honest 'ask us on WhatsApp'", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await openEcho(page);
  const box = panel.getByRole("textbox", { name: "Type a question for Echo" });
  const log = panel.getByRole("log");

  await box.fill("is breakfast included?");
  await box.press("Enter");
  await expect(log.getByText(/breakfast is included/)).toBeVisible();

  await box.fill("how long");
  await box.press("Enter");
  await expect(log.getByText(/Is it one of these\?/)).toBeVisible();
  await expect(panel.getByRole("button", { name: "How long is a meeting?" })).toBeVisible();

  await box.fill("what's the weather in Paris");
  await box.press("Enter");
  await expect(log.getByText(/I don't have an answer for that one yet/)).toBeVisible();
  await expect(log.getByRole("link", { name: "the guest page" }).last()).toHaveAttribute("href", "/join");
});

test("the chat is remembered while the guest moves between pages", async ({ page }) => {
  await page.goto("/");
  let panel = await openEcho(page);
  await panel.getByRole("button", { name: "Nerves & speaking" }).click();
  await panel.getByRole("button", { name: "Will I have to speak?" }).click();
  await expect(panel.getByRole("log").getByText(/Only if you want to/)).toBeVisible();

  await page.goto("/meetings");
  panel = await openEcho(page);
  await expect(panel.getByRole("log").getByText(/Only if you want to/)).toBeVisible();

  await panel.getByRole("button", { name: "Start over" }).click();
  await expect(panel.getByRole("log").getByText(/Only if you want to/)).toHaveCount(0);
  await expect(panel.getByRole("list", { name: "Topics" })).toBeVisible();
});

test("the FAQ's 'Ask Echo a question' opens the chat", async ({ page }) => {
  await page.goto("/join");
  const faq = page.locator("section[aria-labelledby='faq-title']");
  await faq.getByRole("heading", { name: "Questions guests ask" }).scrollIntoViewIfNeeded();
  await faq.getByRole("button", { name: "Ask Echo a question" }).click();
  await expect(page.getByRole("dialog", { name: "Echo" })).toBeVisible();
});

test("the shut panel is hidden from screen readers, and the open one passes an accessibility scan", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Echo" })).toHaveCount(0);
  await openEcho(page);
  const results = await new AxeBuilder({ page }).include(".echo").withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => v.id)).toEqual([]);
});

test("Echo says 'Want help?' once the page settles, and the bubble opens the chat", async ({ page }) => {
  await page.goto("/pathways");
  const bubble = page.getByRole("button", { name: "Want help?" });
  await expect(bubble).toBeVisible({ timeout: 6_000 });
  await bubble.click();
  await expect(page.getByRole("dialog", { name: "Echo" })).toBeVisible();
  await expect(bubble).toHaveCount(0);

  // Once Echo has been opened, the bubble doesn't come back this visit.
  await page.reload();
  await expect(page.getByRole("button", { name: "Ask Echo", exact: true })).toBeVisible();
  await page.waitForTimeout(3_500);
  await expect(page.getByRole("button", { name: "Want help?" })).toHaveCount(0);
});

test("the bubble can be waved away, and steps aside on its own", async ({ page }) => {
  // A paused clock moves only when the test steps it, so a slow page load can't use up Echo's
  // timers on its own. Step in small increments: the timers start once the page has hydrated.
  // Real time, so the stored "intro already seen" stamp from the test setup still counts.
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1_000);
  const stepUntil = (condition: () => Promise<boolean>) =>
    expect
      .poll(
        async () => {
          await page.clock.runFor(250);
          return condition();
        },
        { intervals: [50], timeout: 20_000 },
      )
      .toBe(true);
  const bubble = page.getByRole("button", { name: "Want help?" });
  const bubbleShown = async () => (await bubble.count()) === 1;
  const bubbleGone = async () => (await bubble.count()) === 0;

  await page.goto("/");
  // Echo waves while the page settles, then points up at his bubble while it's there.
  const figure = page.locator(".echo-launcher .echo-figure");
  await expect(figure).toHaveAttribute("data-pose", "wave");
  await stepUntil(bubbleShown);
  await expect(bubble).toBeVisible();
  await expect(figure).toHaveAttribute("data-pose", "point");
  await page.getByRole("button", { name: "Hide Echo's message" }).click();
  await stepUntil(bubbleGone);
  await expect(page.getByRole("dialog", { name: "Echo" })).toHaveCount(0);
  await expect(figure).toHaveAttribute("data-pose", "wave");

  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await stepUntil(bubbleShown);
  // It stays a while, then steps aside without being touched.
  await page.clock.runFor(5_000);
  await expect(bubble).toBeVisible();
  await stepUntil(bubbleGone);
});
