import { expect, test, type Page } from "@playwright/test";

const band = (page: Page) => page.locator("section[aria-labelledby='advice-title']");

test("the advice band sits above the directory: one card per member who agreed to appear", async ({
  page,
}) => {
  await page.goto("/members");
  const section = band(page);
  await expect(section.getByRole("heading", { name: "The advice we give every new guest" })).toBeVisible();
  const bandTop = await section.evaluate((el) => el.getBoundingClientRect().top);
  const directoryTop = await page
    .locator("section[aria-label='Member directory']")
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(bandTop).toBeLessThan(directoryTop);
  // Screen readers and keyboards get each card once: the loop's copy is hidden and unfocusable.
  await expect(section.getByRole("link")).toHaveCount(11);
  await expect(section.locator("ul[aria-hidden='true'] a:not([tabindex='-1'])")).toHaveCount(0);
  const card = section.getByRole("link", { name: /Start small: one minute on your feet/ });
  await expect(card).toHaveAttribute("href", "#tarannum-sheikh");
  // A quote and a name: no photos.
  await expect(card.locator("figcaption")).toHaveText("Tarannum Sheikh");
  await expect(section.locator("img")).toHaveCount(0);
});

test("a card opens that member's profile", async ({ page }) => {
  await page.goto("/members");
  const card = band(page).getByRole("link", { name: /found your people.*Prathiba Leo/ });
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Prathiba Leo" })).toBeVisible();
  await expect(page).toHaveURL(/#prathiba-leo$/);
});

test("one row slides past and pauses under the pointer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "reduced-motion", "Still for reduced motion: next test");
  await page.goto("/members");
  const tracks = band(page).locator(".advice-band__track");
  await expect(tracks).toHaveCount(1);
  expect(await tracks.evaluate((el) => getComputedStyle(el).animationName)).toBe("marquee");
  if (testInfo.project.name === "desktop") {
    await band(page).locator(".advice-band__row").hover();
    await expect(tracks).toHaveCSS("animation-play-state", "paused");
  }
  // The row is wider than the screen, yet the page never scrolls sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});

test("with reduced motion the cards stand still, each once", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced motion only");
  await page.goto("/members");
  const track = band(page).locator(".advice-band__track");
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await expect(band(page).locator("ul[aria-hidden='true']")).toBeHidden();
  const card = band(page).getByRole("link", { name: /Start small: one minute on your feet/ });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});
