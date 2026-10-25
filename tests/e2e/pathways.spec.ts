import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so reveals never hide what is being checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

const CURRENT_PATHS = [
  "Presentation Mastery",
  "Dynamic Leadership",
  "Persuasive Influence",
  "Motivational Strategies",
  "Visionary Communication",
  "Engaging Humor",
];

test.describe("home page", () => {
  test("flows: About (with the mission) → Who it's for … Inside a meeting → Pathways", async ({ page }) => {
    await page.goto("/");
    const order = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main > section"))
        .map((s) => s.id)
        .filter(Boolean),
    );
    expect(order.indexOf("who-its-for")).toBe(order.indexOf("about") + 1);
    expect(order.indexOf("pathways")).toBe(order.indexOf("inside-a-meeting") + 1);
  });

  test("states the mission, signed with the tagline", async ({ page }) => {
    await page.goto("/");
    const about = page.locator("#about");
    await expect(about.getByText(/^We provide a supportive and positive learning experience/)).toBeVisible();
    await expect(about.getByText("A Club with Difference")).toBeVisible();
  });

  test("Who it's for names every audience, with the club's own photo", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: "Talk-Masters is for" });
    for (const label of [
      "Students",
      "Working professionals",
      "Entrepreneurs",
      "Managers",
      "Educators",
      "Retirees",
    ]) {
      await expect(list).toContainText(label);
    }
    await expect(page.locator("#who-its-for")).not.toContainText("anyone who wants to communicate better");
    await expect(page.locator("#who-its-for [data-image-slot='audience-meeting-room'] img")).toBeAttached();
    await expect(page.locator("#who-its-for").getByRole("link", { name: /Pathways/ })).toHaveAttribute(
      "href",
      "/pathways",
    );
  });

  test("the Pathways teaser shows the journey and one clear way on, not a partial list", async ({ page }) => {
    await page.goto("/");
    const teaser = page.locator("#pathways");
    for (const stage of ["First-timer", "Confident speaker", "Leader", "Mentor"]) {
      await expect(teaser.getByRole("heading", { name: stage })).toBeVisible();
    }
    await expect(teaser).toContainText("Your Toastmasters journey evolves as your goals evolve.");
    await expect(teaser.getByText("Presentation Mastery")).toHaveCount(0);
    await expect(teaser.getByRole("link", { name: /Explore all 6 pathways/ })).toHaveAttribute(
      "href",
      "/pathways",
    );
    await expect(teaser.getByRole("link", { name: /60-second quiz/ })).toHaveAttribute(
      "href",
      "/pathways#find-your-path",
    );
  });
});

test.describe("/pathways", () => {
  test("explains the six current paths, the five levels and the key facts", async ({ page }) => {
    await page.goto("/pathways");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Grow at your own pace");
    for (const name of CURRENT_PATHS) {
      const card = page
        .locator("li")
        .filter({ has: page.getByRole("heading", { level: 3, name, exact: true }) });
      await expect(card).toBeVisible();
      await expect(card.locator("[data-image-slot] img")).toBeAttached();
    }
    // Retired paths are mentioned once, as retired, and never offered as a card.
    await expect(page.getByRole("heading", { name: "Effective Coaching" })).toHaveCount(0);
    await expect(page.getByText(/withdrawn for new members on 23 October 2024/)).toBeVisible();
    for (const level of ["Mastering Fundamentals", "Demonstrating Expertise"]) {
      await expect(page.getByRole("heading", { name: level })).toBeVisible();
    }
    await expect(page.getByText("Your first path is included")).toBeVisible();
    await expect(page.getByRole("link", { name: /toastmasters\.org/ })).toHaveAttribute(
      "href",
      "https://www.toastmasters.org/pathways-overview",
    );
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("the quiz suggests a path in two taps, and can start again", async ({ page }) => {
    await page.goto("/pathways#find-your-path");
    const quiz = page.locator("#find-your-path");
    await quiz.getByRole("button", { name: /Persuading people/ }).click();
    await expect(quiz.getByRole("heading", { name: "Where will you use it most?" })).toBeFocused();
    await quiz.getByRole("button", { name: "In my own business" }).click();
    const result = quiz.getByRole("heading", { name: "Persuasive Influence" });
    await expect(result).toBeFocused();
    await expect(quiz).toContainText("pitches and client conversations");
    await expect(quiz.getByRole("link", { name: "Book a guest visit" })).toHaveAttribute("href", "/join");
    await expect(quiz.getByRole("link", { name: "Read about Persuasive Influence" })).toHaveAttribute(
      "href",
      "#persuasive-influence",
    );
    await quiz.getByRole("button", { name: "Start again" }).click();
    await expect(
      quiz.getByRole("heading", { name: "What do you most want to get better at?" }),
    ).toBeFocused();
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("the quiz works from the keyboard alone", async ({ page }) => {
    await page.goto("/pathways#find-your-path");
    const quiz = page.locator("#find-your-path");
    await quiz.getByRole("button", { name: /Sharing a vision/ }).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(quiz.getByRole("heading", { name: "Visionary Communication" })).toBeVisible();
  });

  test("is in the footer and the sitemap", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer").getByRole("link", { name: "Pathways" })).toHaveAttribute(
      "href",
      "/pathways",
    );
    expect(await (await page.request.get("/sitemap.xml")).text()).toContain("/pathways");
  });
});

test("Pathways is in the main navbar, marked current on its own page", async ({ page, isMobile }) => {
  await page.goto("/pathways");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu.getByRole("link", { name: /Pathways/ })).toHaveAttribute("aria-current", "page");
    return;
  }
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: /Pathways/ })).toHaveAttribute("aria-current", "page");
});

test("Hadi's profile tells his story from engineer to trainer, in his words", async ({ page }) => {
  await page.goto("/members#hadi-abdulkader");
  const profile = page.getByRole("dialog", { name: "Hadi Abdulkader" });
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("Director – Trainings at Public Speaking Gym");
  await expect(profile).toContainText("helping others find theirs");
  await expect(profile).toContainText(
    "Division level in the Humorous Speech, International Speech and Table Topics",
  );
  await expect(profile).toContainText("Start speaking, and confidence will follow.");
  await expect(profile.getByRole("list", { name: "At Talk-Masters" })).toContainText(
    "In Toastmasters since 2016",
  );
});

test("the President's story opens from his committee card", async ({ page }) => {
  await page.goto("/team");
  await page.getByRole("link", { name: "Read Anees's story" }).first().click();
  const profile = page.getByRole("dialog", { name: "Muhamed Anees K Mousafi" });
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("Sales Manager – Middle East at Energy Recovery Inc.");
  await expect(profile).toContainText("You already have the knowledge.");
  await expect(profile.getByRole("list", { name: "At Talk-Masters" })).toContainText(
    "Sergeant at Arms 2025–26",
  );
});
