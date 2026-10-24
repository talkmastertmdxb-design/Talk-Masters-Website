import { expect, test, type Page } from "@playwright/test";

interface Played {
  name: string;
  duration: number;
}

/** Records, for every view transition the page starts, the page-transition animations it plays. */
async function recordTransitions(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as Window & { __played?: Played[][] };
    w.__played = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg: StartViewTransitionOptions) => {
      const transition = start(arg);
      transition.ready.then(() => {
        const played = document.documentElement
          .getAnimations({ subtree: true })
          .filter((a) => (a.effect as KeyframeEffect).pseudoElement?.startsWith("::view-transition"))
          .map((a) => ({
            name: (a as CSSAnimation).animationName,
            duration: Number(a.effect?.getTiming().duration),
          }))
          .filter((a) => ["page-in", "page-out", "page-fade"].includes(a.name));
        w.__played!.push(played);
      }, () => w.__played!.push([]));
      return transition;
    }) as typeof document.startViewTransition;
  });
}

const played = (page: Page): Promise<Played[][]> =>
  page.evaluate(() => (window as Window & { __played?: Played[][] }).__played ?? []);

const footerLink = (page: Page, name: string) =>
  page.locator("footer").getByRole("link", { name, exact: true });

test("following a link plays the page transition: old page lifts away, new page wipes up", async ({
  page,
}, testInfo) => {
  await page.goto("/team");
  await recordTransitions(page);
  await footerLink(page, "Members").click();
  await expect(page).toHaveURL(/\/members$/);

  const reduced = testInfo.project.name === "reduced-motion";
  const expected = reduced ? ["page-fade", "page-fade"] : ["page-in", "page-out"];
  await expect.poll(async () => (await played(page)).map((t) => t.map((a) => a.name).sort())).toContainEqual(
    expected,
  );
  // Fast enough to feel instant on phones, never longer than ~0.65s anywhere.
  const limit = reduced ? 200 : testInfo.project.name === "mobile" ? 460 : 650;
  for (const { duration } of (await played(page)).flat()) expect(duration).toBeLessThanOrEqual(limit);
});

test("every link navigation animates, even to a page that wasn't prefetched", async ({ page }) => {
  await page.goto("/achievements");
  await recordTransitions(page);
  for (const [name, url] of [
    ["Our Story", /\/our-story$/],
    ["Team", /\/team$/],
  ] as const) {
    await footerLink(page, name).click();
    await expect(page).toHaveURL(url);
  }
  await expect.poll(async () => (await played(page)).filter((t) => t.length > 0).length).toBe(2);
});

test("a link clicked mid-scroll opens the next page at the top, not where the glide was heading", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 2400);
  // Click while the smooth scroll is still gliding towards 2400.
  await page.waitForFunction(() => window.scrollY > 500);
  await page.getByRole("link", { name: "Team" }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/team$/);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("browser back swaps instantly, so it never fights a swipe-back gesture", async ({ page }) => {
  await page.goto("/team");
  await footerLink(page, "Members").click();
  await expect(page).toHaveURL(/\/members$/);
  await page.waitForTimeout(800);
  await recordTransitions(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/team$/);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-nav"))).toBe("history");
  expect((await played(page)).flat()).toEqual([]);

  // The next tap clears the mark, so link navigations animate again.
  await footerLink(page, "Members").click();
  await expect(page).toHaveURL(/\/members$/);
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-nav"))).toBe(false);
});

test("the header stays put and the page stays clickable during a transition", async ({ page }) => {
  await page.goto("/team");
  const header = await page
    .locator("header.site-header")
    .evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(header).toBe("site-header");
  const overlay = await page.evaluate(
    () => getComputedStyle(document.documentElement, "::view-transition").pointerEvents,
  );
  expect(overlay).toBe("none");
});
