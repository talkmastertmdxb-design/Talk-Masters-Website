import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

const INSTAGRAM = "https://www.instagram.com/talkmastersuae/";
const LINKEDIN = "https://www.linkedin.com/in/talk-masters-tm-22071837a/";

test("the footer links the club's Instagram and LinkedIn, with their logos", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  for (const [name, href] of [
    ["Instagram", INSTAGRAM],
    ["LinkedIn", LINKEDIN],
  ] as const) {
    const link = footer.getByRole("link", { name: `Talk-Masters Club on ${name} (opens in a new tab)` });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link.locator("svg")).toBeAttached();
  }
});

test("the phone menu offers the club's socials too", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Phone menu");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu.getByRole("link", { name: /on Instagram/ })).toHaveAttribute("href", INSTAGRAM);
  await expect(menu.getByRole("link", { name: /on LinkedIn/ })).toHaveAttribute("href", LINKEDIN);
});

test("Our Story dates the club from 2016 and tells how it joined Toastmasters", async ({ page }) => {
  await page.goto("/our-story");
  await expect(page.locator("section[aria-labelledby='why-title'] .text-display")).toHaveText("2016");
  await expect(page.getByText(/began in 2016 as an independent speaking club/)).toBeVisible();
});
