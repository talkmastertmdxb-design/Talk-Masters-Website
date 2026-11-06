import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Content checks: run without motion so reveals and pins never hide what is being checked.
test.use({ contextOptions: { reducedMotion: "reduce" } });

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
};

test("Our Story tells the founder's story first, then the club's, all on the page", async ({ page }) => {
  await page.goto("/our-story");
  // The hero stays as it was.
  await expect(
    page.getByRole("heading", { level: 1, name: "Every great speaker starts with a single conversation." }),
  ).toBeVisible();
  await expect(page.getByText(/Talk-Masters began the same way, in 2014/)).toBeVisible();

  const founder = page.locator("section[aria-labelledby='founder-title']");
  await expect(founder.getByRole("heading", { level: 2 })).toHaveText(
    "From one minute of fear to a movement",
  );
  await expect(founder.getByText("As remembered and shared by its founder, Faizal Rahman")).toBeVisible();
  await expect(founder.locator('[data-image-slot="founder-one"] img')).toHaveAttribute(
    "alt",
    "Faizal Rahman, founder of Talk-Masters",
  );
  await expect(
    founder.getByRole("link", { name: "Faizal Rahman on LinkedIn (opens in a new tab)" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/coachfaizalrahman/");
  await expect(founder.getByRole("heading", { level: 3 })).toHaveText([
    "One minute in Deira",
    "83 phone calls, 12 people",
    "The first step",
    "A name with a simple purpose",
    "Exactly 150 sessions, and one important decision",
    "More than a club",
  ]);
  await expect(founder.getByText("Come here. Talk. Practise. Become a master at talking.")).toBeVisible();
  // Only one founder now.
  await expect(page.getByRole("heading", { name: "Meet the founders" })).toHaveCount(0);

  // The club's story comes after the founder's, and every word is already on the page.
  const club = page.locator("section[aria-labelledby='club-story-title']");
  await expect(club.getByRole("heading", { level: 3 }).first()).toHaveText("The minute that started it");
  await expect(club.getByText("Joining Toastmasters International")).toBeVisible();
  const order = await page.evaluate(() => {
    const founderTop = document.querySelector("#founder-title")!.getBoundingClientRect().top;
    const clubTop = document.querySelector("#club-story-title")!.getBoundingClientRect().top;
    return clubTop > founderTop;
  });
  expect(order).toBe(true);
  await expect(page.locator("main [aria-expanded], main details")).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "Legacy" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("/about permanently redirects to /our-story", async ({ request }) => {
  const response = await request.get("/about", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/our-story");
});

test("Achievements shows club awards, member achievements, a timeline and impact", async ({ page }) => {
  await page.goto("/achievements");
  await expect(page.getByRole("heading", { name: "Club awards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Smedley Award" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Member achievements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Achievement timeline" })).toBeVisible();
  await expect(page.getByText("This recognition reflects the commitment")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("Members: a card opens a full-screen profile, Escape closes it, and there are no individual pages", async ({
  page,
  request,
}) => {
  await page.goto("/members");
  await expect(
    page.getByRole("heading", { level: 1, name: "Meet the people behind the voices" }),
  ).toBeVisible();
  const card = page.getByRole("button", { name: "Open Prathiba Leo's profile" });
  await card.click();
  const profile = page.getByRole("dialog", { name: "Prathiba Leo" });
  await expect(profile).toBeVisible();
  await expect(page).toHaveURL(/#prathiba-leo$/);
  for (const heading of [
    "Where it started",
    "What Prathiba brings to the club",
    "Prathiba's Toastmasters journey",
    "What changed",
  ]) {
    await expect(profile.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(profile.getByRole("heading", { name: /advice for new guests/ })).toBeVisible();
  await expect(
    profile.getByRole("link", { name: "Prathiba Leo on Instagram (opens in a new tab)" }),
  ).toBeVisible();
  // The page behind the profile doesn't scroll.
  await expect(page.locator("html")).toHaveClass(/profile-open/);
  expect(await seriousViolations(page)).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(profile).toBeHidden();
  await expect(page).not.toHaveURL(/#prathiba-leo$/);
  await expect(page.locator("html")).not.toHaveClass(/profile-open/);
  await expect(card).toBeFocused();

  const oldDetailPage = await request.get("/members/member-one");
  expect(oldDetailPage.status()).not.toBe(200);
});

test("the close button closes the profile too", async ({ page }) => {
  await page.goto("/members");
  await page.getByRole("button", { name: "Open Hadi Abdulkader's profile" }).click();
  const profile = page.getByRole("dialog", { name: "Hadi Abdulkader" });
  await expect(profile).toBeVisible();
  await profile.getByRole("button", { name: "Close profile" }).click();
  await expect(profile).toBeHidden();
});

test("a Spotlight 'Read more' link opens that member's profile, with its portrait loaded first", async ({
  page,
}) => {
  await page.goto("/members#prathiba-leo");
  const profile = page.getByRole("dialog", { name: "Prathiba Leo" });
  await expect(profile).toBeVisible();
  // The portrait is the largest thing on screen: it must load eagerly, at high priority.
  const portrait = profile.locator("[data-profile-portrait] img");
  await expect(portrait).toHaveAttribute("loading", "eager");
  await expect(portrait).toHaveAttribute("fetchpriority", "high");
  await expect(profile.getByRole("list", { name: "At Talk-Masters" })).toContainText(
    "Moderator, She Leads panel, 2025",
  );
});

test("a profile leads to the next and previous member without closing", async ({ page }) => {
  await page.goto("/members#prathiba-leo");
  const prathiba = page.getByRole("dialog", { name: "Prathiba Leo" });
  await expect(prathiba).toBeVisible();
  const more = prathiba.getByRole("navigation", { name: "More members" });
  await expect(more).toContainText("3 of 13");

  await more.getByRole("link", { name: /Next member/ }).click();
  const tarannum = page.getByRole("dialog", { name: "Tarannum Sheikh" });
  await expect(tarannum).toBeVisible();
  await expect(prathiba).toBeHidden();
  await expect(page).toHaveURL(/#tarannum-sheikh$/);
  await expect(page.locator("dialog[open]")).toHaveCount(1);

  await tarannum
    .getByRole("navigation", { name: "More members" })
    .getByRole("link", { name: /Previous member/ })
    .click();
  await expect(prathiba).toBeVisible();
  await expect(tarannum).toBeHidden();

  // Closing after switching still hands the page back.
  await page.keyboard.press("Escape");
  await expect(prathiba).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/profile-open/);
});

test("wide screens list the profile's chapters beside the portrait; phones get no side scrollbar", async ({
  page,
}) => {
  await page.goto("/members#prathiba-leo");
  const profile = page.getByRole("dialog", { name: "Prathiba Leo" });
  await expect(profile).toBeVisible();
  const chapters = profile.getByRole("navigation", { name: "In Prathiba Leo's profile" });
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;

  if (wide) {
    await expect(chapters.getByRole("button")).toHaveText([
      "Story",
      "Journey",
      "What changed",
      "Advice for guests",
    ]);
    await chapters.getByRole("button", { name: "Advice for guests" }).click();
    await expect(profile.getByRole("heading", { name: "Prathiba's advice for new guests" })).toBeInViewport();
  } else {
    await expect(chapters).toBeHidden();
    expect(await profile.evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe("none");
  }
});

test("a member's own quoted words become the profile's pull quote", async ({ page }) => {
  await page.goto("/members#prathiba-leo");
  const profile = page.getByRole("dialog", { name: "Prathiba Leo" });
  await expect(profile.locator("blockquote")).toHaveText(
    "There was something almost enigmatic about the vibe of Talk-Masters: the energy, the warmth and, most importantly, the people.",
  );
});

test("the members page downloads card photos only, not every profile portrait", async ({ page }) => {
  await page.goto("/members");
  await expect(page.locator("[data-profile-portrait] img")).toHaveCount(0);
});

test("Team lists the Executive Committee with leadership statements", async ({ page }) => {
  await page.goto("/team");
  await expect(
    page.getByRole("heading", { level: 1, name: "Seven volunteers. One job: a better room every meeting." }),
  ).toBeVisible();
  await expect(page.getByText("Vice President Education")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("Team shows the 2026-27 committee, the President first, and the poster to download", async ({
  page,
}) => {
  await page.goto("/team");
  // The opening: the President's tall tile, with their story one tap away.
  await expect(page.getByText("Club President, 2026–27")).toBeVisible();
  await expect(page.getByRole("link", { name: "Read Anees's story" })).toHaveAttribute(
    "href",
    "/members#anees-mousafi",
  );
  for (const name of ["Mansoor", "Lulu", "Suhayb", "Nabeel", "Nasar", "Noufal"]) {
    await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "EXCOM 2026–27" })).toBeVisible();
  const download = page.getByRole("link", { name: "Download the poster" });
  await expect(download).toHaveAttribute("download", "Talk-Masters-EXCOM-2026-2027.webp");
  const poster = await page.request.get((await download.getAttribute("href"))!);
  expect(poster.status()).toBe(200);
  expect(await seriousViolations(page)).toEqual([]);
});

test("Achievements leads with the Smedley Award, filed under 2026", async ({ page }) => {
  await page.goto("/achievements");
  await expect(page.getByRole("heading", { level: 2, name: "Smedley Award, Bronze" })).toBeVisible();
  await expect(page.getByText("District 127, 2026–27")).toBeVisible();
  const year2026 = page.getByRole("region", { name: "2026" });
  await expect(year2026.getByText("Smedley Award, Bronze")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("Achievements celebrates the 2026-27 Triple Crowns and the club's 2025-26 DCP points", async ({
  page,
}) => {
  await page.goto("/achievements");
  const members = page.locator("section[aria-labelledby='member-achievements-title']");
  for (const [name, slot] of [
    ["Ganesan Venkatachalam, DTM", "award-triple-crown-ganesan"],
    ["Mohammed Jabir", "award-triple-crown-jabir"],
  ]) {
    const card = members.getByRole("listitem").filter({ has: page.getByRole("heading", { name }) });
    await expect(card).toContainText("Triple Crown · District level · 2026-2027");
    await expect(card.locator(`[data-image-slot='${slot}'] img`)).toHaveAttribute("alt", /Triple Crown/);
  }
  const clubAwards = page.locator("section[aria-labelledby='club-awards-title']");
  await expect(
    clubAwards.getByRole("heading", { name: "6 Distinguished Club Program points" }),
  ).toBeVisible();
  await expect(clubAwards.locator("[data-image-slot='award-dcp-points-2025-26'] img")).toBeAttached();
  // This year's awards sit under 2026, never under 2027 (a year that hasn't started).
  const year2026 = page.getByRole("region", { name: "2026" });
  await expect(year2026.getByText("Triple Crown Award")).toHaveCount(2);
  await expect(page.getByRole("region", { name: "2027" })).toHaveCount(0);
  expect(await seriousViolations(page)).toEqual([]);
});

test("Jassim's profile tells the 100-day story, in Jassim's own words", async ({ page }) => {
  await page.goto("/members");
  await page.getByRole("button", { name: "Open Jassim Eranhole's profile" }).click();
  const profile = page.getByRole("dialog", { name: "Jassim Eranhole" });
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("Digital Content (UX/UI) Specialist at IKEA");
  await expect(profile.getByRole("list", { name: "At Talk-Masters" })).toContainText(
    "Toastmaster of the Day, Meeting #101",
  );
  await expect(profile.locator("blockquote")).toHaveText(
    "Whenever I am in Dubai, I will be there at Toastmasters.",
  );
  await expect(profile.getByRole("heading", { name: "Jassim's Toastmasters journey" })).toBeVisible();
  await expect(profile.getByRole("heading", { name: "What changed" })).toBeVisible();
  await expect(profile.getByRole("heading", { name: "Jassim's advice for new guests" })).toBeVisible();
  await expect(profile).toContainText("You do not need perfect English or confidence to begin.");
  await expect(profile.locator("[data-image-slot='member-jassim'] img")).toHaveAttribute(
    "alt",
    "Jassim Eranhole, smiling, in a blue blazer",
  );
  expect(await seriousViolations(page)).toEqual([]);
});

test("Nabeel's profile tells his story as Treasurer, in his own words", async ({ page }) => {
  await page.goto("/members");
  await page.getByRole("button", { name: "Open Nabeel Bava's profile" }).click();
  const profile = page.getByRole("dialog", { name: "Nabeel Bava" });
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("Job Controller at Al Nabooda Automobiles, Volkswagen Aftersales");
  await expect(profile.getByRole("list", { name: "At Talk-Masters" })).toContainText("Treasurer");
  await expect(profile.getByRole("heading", { name: "What changed" })).toBeVisible();
  await expect(profile).toContainText("Don’t wait for confidence before you begin.");
  expect(await seriousViolations(page)).toEqual([]);
});

for (const [path, name, slug] of [
  ["/team", "Nabeel", "nabeel-bava"],
  ["/team", "Suhayb", "suhayb-shaik"],
] as const) {
  test(`${name}'s committee card on ${path} opens his member story`, async ({ page }) => {
    await page.goto(path);
    const link = page.getByRole("link", { name: `Read ${name}'s story` });
    await expect(link).toHaveAttribute("href", `/members#${slug}`);
    await link.click();
    await expect(page.getByRole("dialog", { name: new RegExp(`^${name} `) })).toBeVisible();
  });
}

test("committee members without a story have no story link", async ({ page }) => {
  await page.goto("/team");
  await expect(page.getByRole("link", { name: "Read Nasar's story" })).toHaveCount(0);
});

test("the footer names the club in Toastmasters terms", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("footer").getByText("Club 07956953 · Area 11 · Division C · District 127"),
  ).toBeVisible();
});

test("Members shows each member's LinkedIn on their card, with every other profile they shared", async ({
  page,
}) => {
  await page.goto("/members");
  const profiles = {
    "Hadi Abdulkader": "https://www.linkedin.com/in/hadiabdulkader/",
    "Prathiba Leo": "https://www.linkedin.com/in/prathibaleo12/",
    "Tarannum Sheikh": "https://www.linkedin.com/in/tarannum-sheikh-381309171/",
    "Suhayb Muzammil Shaik": "https://www.linkedin.com/in/suhayb-shaik-13985231a",
    "Jassim Eranhole": "https://www.linkedin.com/in/jassim-eranhole-90300b76/",
    "Nabeel Bava": "https://www.linkedin.com/in/nabeel-kizhakkeveettil-001651334",
    "Noufal Aboobacker": "https://www.linkedin.com/in/noufal-aboobacker/",
  };
  for (const [name, href] of Object.entries(profiles)) {
    // LinkedIn sits on the card's photo (the closed profile holds a hidden copy too).
    const link = page
      .getByRole("link", { name: `${name} on LinkedIn (opens in a new tab)` })
      .filter({ visible: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(
    page
      .getByRole("link", { name: "Hadi Abdulkader on YouTube (opens in a new tab)", includeHidden: true })
      .first(),
  ).toHaveAttribute("href", "https://www.youtube.com/c/hadiabdulkader");
  await expect(
    page.getByRole("link", { name: "Prathiba Leo on X (opens in a new tab)", includeHidden: true }).first(),
  ).toHaveAttribute("href", "https://x.com/prathibal");
  await expect(
    page
      .getByRole("link", { name: "Tarannum Sheikh's website (opens in a new tab)", includeHidden: true })
      .first(),
  ).toHaveAttribute("href", "https://activekidsonline.com/");
  expect(await seriousViolations(page)).toEqual([]);
});

test("guests book on WhatsApp with the VP Membership or VP Education", async ({ page }) => {
  await page.goto("/join");
  const main = page.locator("main");
  await expect(main.getByRole("link", { name: /WhatsApp Lulu/ })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/971502837168\?text=/,
  );
  await expect(main.getByRole("link", { name: /WhatsApp Mansoor/ })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/971501600212\?text=/,
  );
  // Booking stays on WhatsApp; the club inbox is offered for questions (decided 2026-11-02).
  await expect(main.getByRole("link", { name: /Email the club/ })).toHaveAttribute(
    "href",
    /^mailto:talkmastertmdxb@gmail\.com/,
  );
  await expect(page.locator("footer").getByText("+971 50 283 7168", { exact: false })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
