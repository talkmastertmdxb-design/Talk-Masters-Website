import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

const EMAIL = "talkmastertmdxb@gmail.com";
const MAILTO = `mailto:${EMAIL}?subject=Question%20about%20Talk-Masters%20Club`;

test("the phone menu puts WhatsApp and email one tap away on every page", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Phone menu");
  for (const path of ["/", "/meetings"]) {
    await page.goto(path);
    await page.getByRole("button", { name: "Open menu" }).click();
    const talk = page.getByRole("dialog", { name: "Menu" }).getByRole("group", { name: "Talk to us" });
    const whatsapp = talk.getByRole("link", { name: /^WhatsApp .*opens WhatsApp in a new tab/ });
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/971\d+\?text=Hi!%20I%20have%20a%20question/);
    await expect(talk.getByRole("link", { name: `Email the club at ${EMAIL}` })).toHaveAttribute("href", MAILTO);
    await page.getByRole("button", { name: "Close menu" }).click();
  }
});

test("the phone menu still fits a small phone with the contact row", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "One small-phone check");
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  // Every item and the booking button sit inside the screen: nothing is cut off at the bottom.
  const book = menu.getByRole("link", { name: "Book a guest visit" });
  await expect(book).toBeInViewport({ ratio: 1 });
  await expect(menu.getByRole("group", { name: "Talk to us" })).toBeInViewport({ ratio: 1 });
  await expect(menu.getByRole("link", { name: /Achievements/ })).toBeInViewport({ ratio: 1 });
  await context.close();
});

test("the footer lists the club email beside the WhatsApp contacts", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("heading", { name: "Contact us" })).toBeVisible();
  await expect(footer.getByRole("link", { name: `Email: ${EMAIL}` })).toHaveAttribute("href", MAILTO);
});

test("the guest page offers email next to WhatsApp", async ({ page }) => {
  await page.goto("/join");
  await expect(page.getByRole("link", { name: `Email the club ${EMAIL}` })).toHaveAttribute("href", MAILTO);
});
