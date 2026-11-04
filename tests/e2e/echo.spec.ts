import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const openEcho = async (page: Page) => {
  await page.getByRole("button", { name: "Ask Echo", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Echo" });
  await expect(panel).toBeVisible();
  return panel;
};

test("Echo answers from the club's own question bank: topic, question, answer", async ({ page }) => {
  await page.goto("/");
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
  // A member answers instead: WhatsApp opens with the guest's question already written.
  const ask = log.getByRole("link", { name: "Ask the club on WhatsApp" }).last();
  const href = (await ask.getAttribute("href")) ?? "";
  expect(href.startsWith("https://wa.me/971502837168?text=")).toBe(true);
  expect(new URL(href).searchParams.get("text")).toBe(
    "Hi! I have a question about Talk-Masters: what's the weather in Paris",
  );
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
  // On a new page, Echo offers that page's questions, once.
  await expect(
    panel.getByRole("log").getByText("Now you're on the meetings page. Here's what people often ask here."),
  ).toHaveCount(1);
  await expect(
    panel.getByRole("button", { name: "What do the green, amber and red lights mean?" }),
  ).toBeVisible();
  await page.reload();
  panel = await openEcho(page);
  await expect(panel.getByRole("log").getByText(/Now you're on the meetings page/)).toHaveCount(1);

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

/** Scrolls far enough through the page that Echo speaks up (30 %). */
const scrollInto = (page: Page) =>
  page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.5));

test("on each page Echo speaks to that page once the guest scrolls in, and opens on its questions", async ({
  page,
}) => {
  await page.goto("/gallery");
  const gallery = page.getByRole("button", { name: "Looking for a photo of yourself?" });
  await expect(gallery).toHaveCount(0);
  await scrollInto(page);
  await expect(gallery).toBeVisible();
  await gallery.click();
  const panel = page.getByRole("dialog", { name: "Echo" });
  await expect(panel).toBeVisible();
  await expect(gallery).toHaveCount(0);
  await expect(panel.getByText(/Every photo from our events and meetings is here/)).toBeVisible();
  await expect(panel.getByRole("list", { name: "Popular questions" }).getByRole("button")).toHaveText([
    "Where can I find photos from a meeting?",
    "How do I share a photo?",
    "Can I get a photo of me removed?",
  ]);
  await page.keyboard.press("Escape");

  // Not again on the Gallery this visit, but each other page has its own moment.
  await page.reload();
  await scrollInto(page);
  await page.waitForTimeout(1_500);
  await expect(gallery).toHaveCount(0);
  await page.goto("/events");
  await scrollInto(page);
  await expect(page.getByRole("button", { name: "Curious what our special events are like?" })).toBeVisible();
});

test("waved away twice, Echo stays quiet for the rest of the visit", async ({ page }) => {
  const dismiss = async (path: string, nudge: string) => {
    await page.goto(path);
    await scrollInto(page);
    await expect(page.getByRole("button", { name: nudge })).toBeVisible();
    await page.getByRole("button", { name: "Hide Echo's message" }).click();
    await expect(page.getByRole("button", { name: nudge })).toHaveCount(0);
  };
  await dismiss("/events", "Curious what our special events are like?");
  await dismiss("/gallery", "Looking for a photo of yourself?");

  await page.goto("/pathways");
  await scrollInto(page);
  await page.waitForTimeout(1_500);
  await expect(page.locator(".echo-bubble")).toHaveCount(0);
});

test("the bubble can be waved away, and steps aside on its own", async ({ page }) => {
  // Stepping page time in small increments is slow in real time, mostly on desktop (Lenis + GSAP).
  test.setTimeout(60_000);
  // A paused clock moves only when the test steps it, so a slow page load can't use up Echo's
  // timers on its own. Step in small increments: the timers start once the page has hydrated.
  // Real time, so the stored "intro already seen" stamp from the test setup still counts.
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1_000);
  // Check first, then step: the page redraws in real time, so stepping before it has caught up
  // would run the clock past the moment we're waiting for (seen under heavy test load).
  const stepUntil = async (condition: () => Promise<boolean>) => {
    for (let step = 0; step < 300; step++) {
      if (await condition()) return;
      await page.clock.runFor(100);
      await page.waitForTimeout(30);
    }
    expect(await condition(), "never happened within 30 s of page time").toBe(true);
  };
  const bubble = page.getByRole("button", { name: "Thinking of visiting? Ask me." });
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
  // It stays a while (9 s), then steps aside without being touched.
  await page.clock.runFor(4_000);
  await expect(bubble).toBeVisible();
  await page.clock.runFor(4_000);
  await stepUntil(bubbleGone);
});
