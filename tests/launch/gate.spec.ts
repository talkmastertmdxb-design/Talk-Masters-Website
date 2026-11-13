import { expect, test } from "@playwright/test";

/** Runs with a launch far in the future (playwright.launch.config.ts): the gate is closed. */

const PAGES = ["/", "/members", "/join", "/meetings", "/our-story", "/no-such-page"];

for (const path of PAGES) {
  test(`${path} shows the countdown, never the site`, async ({ page, request }) => {
    const html = await (await request.get(path)).text();
    expect(html).toContain("Talk-Masters Club is preparing a brand new website");
    expect(html).not.toContain("Meet the people behind the voices");

    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: "Something big is about to take the stage." }),
    ).toBeVisible();
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator("#contact")).toBeHidden();
    // The address bar keeps the page the visitor asked for, so the reload at zero lands there.
    expect(new URL(page.url()).pathname).toBe(path);
  });
}

test("photos, share images, the sitemap and the meetings calendar still load", async ({ request }) => {
  for (const path of [
    "/images/members/ganesan.webp",
    "/opengraph-image.jpg",
    "/sitemap.xml",
    "/meetings.ics",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).not.toContain("text/html");
  }
});

test("rehearsal links are ignored while the gate is closed", async ({ page }) => {
  await page.goto("/launch?in=5");
  await page.waitForTimeout(7_000);
  await expect(
    page.getByRole("heading", { level: 1, name: "Something big is about to take the stage." }),
  ).toBeVisible();
});

test("the launch calendar file uses the scheduled date", async ({ request }) => {
  const body = await (await request.get("/launch.ics")).text();
  expect(body).toContain("DTSTART:20981231T200000Z");
});
