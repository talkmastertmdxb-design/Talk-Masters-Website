import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { createRepository, type RawContent } from "@/lib/content/repository";
import {
  awardSchema,
  founderSchema,
  historySchema,
  memberSchema,
  officerSchema,
  FOUNDING_STAGES,
} from "@/lib/content/schemas";
import { achievementYear, achievementsByYear, firstName, isMemberAchievement } from "@/lib/content/people";

const member = {
  slug: "aisha-rahman",
  name: "Aisha Rahman",
  position: "Vice President Education",
  occupation: "Civil engineer",
  organisation: "Example Engineering",
  links: [{ network: "linkedin", url: "https://www.linkedin.com/in/example" }],
  segment: "professional",
  challenge: "I used to avoid speaking in meetings.",
  transformation: "Today I confidently present to clients across the region.",
  journey: [
    { milestone: "first-meeting", text: "Came along with a colleague and just watched." },
    { milestone: "first-speech", text: "Gave my Ice Breaker three weeks later." },
  ],
  impact: { career: "Promoted to lead engineer.", confidence: "I volunteer to present now." },
  advice: "Come once and just listen. That's enough to start.",
  story: "The club became her weekly practice room, and then her community.",
  imageSlot: "member-hadi",
  consent: true,
  spotlight: true,
  status: "published",
};

const award = {
  slug: "presidents-distinguished-2024-25",
  title: "President's Distinguished Club",
  programme: "distinguished-club",
  level: "club",
  year: "2024-2025",
  description: "Our highest recognition for meeting club goals.",
};

const timeline = FOUNDING_STAGES.map((stage) => ({ stage, text: `${stage} happened.` }));

describe("memberSchema (Plan.md member directory + journey cards)", () => {
  it("accepts a complete member journey", () => {
    expect(memberSchema.safeParse(member).success).toBe(true);
  });

  it("keeps position, work, company and LinkedIn optional", () => {
    const minimal = Object.fromEntries(
      Object.entries(member).filter(
        ([key]) => !["position", "occupation", "organisation", "links", "segment"].includes(key),
      ),
    );
    expect(memberSchema.safeParse(minimal).success).toBe(true);
  });

  it("only accepts links that match their network, once each", () => {
    const withLinks = (links: unknown) => memberSchema.safeParse({ ...member, links }).success;
    expect(withLinks([{ network: "linkedin", url: "https://example.com/me" }])).toBe(false);
    expect(withLinks([{ network: "youtube", url: "https://www.youtube.com/c/someone" }])).toBe(true);
    expect(withLinks([{ network: "x", url: "https://twitter.com/someone" }])).toBe(true);
    expect(withLinks([{ network: "website", url: "http://insecure.example" }])).toBe(false);
    expect(
      withLinks([
        { network: "x", url: "https://x.com/a" },
        { network: "x", url: "https://x.com/b" },
      ]),
    ).toBe(false);
  });

  it("needs at least one journey milestone and one area of impact", () => {
    expect(memberSchema.safeParse({ ...member, journey: [] }).success).toBe(false);
    expect(memberSchema.safeParse({ ...member, impact: {} }).success).toBe(false);
  });
});

describe("founderSchema", () => {
  it("accepts a founder with role, degree/profession, story and quote", () => {
    const founder = {
      slug: "founder-one",
      name: "Founder name",
      role: "Founding President",
      profession: "MBA, Marketing Manager",
      quote: "Creating Talk-Masters became my way of helping others overcome that same fear.",
      story: ["How it began."],
      consent: true,
    };
    expect(founderSchema.safeParse(founder).success).toBe(true);
  });
});

describe("historySchema (Our Story)", () => {
  const history = {
    foundedYear: 2019,
    why: ["Why the club was created."],
    timeline,
    legacy: "Today the club continues the mission.",
  };

  it("keeps the founders timeline exactly: Idea → Planning → … → Today", () => {
    expect(FOUNDING_STAGES).toEqual([
      "idea",
      "planning",
      "club-formation",
      "chartering",
      "first-meeting",
      "first-achievement",
      "today",
    ]);
    expect(historySchema.safeParse(history).success).toBe(true);
  });

  it("rejects a timeline that skips or reorders a stage", () => {
    expect(historySchema.safeParse({ ...history, timeline: timeline.slice(1) }).success).toBe(false);
    const swapped = [timeline[1], timeline[0], ...timeline.slice(2)];
    expect(historySchema.safeParse({ ...history, timeline: swapped }).success).toBe(false);
  });
});

describe("awardSchema", () => {
  it("accepts a Toastmasters club award", () => {
    expect(awardSchema.safeParse(award).success).toBe(true);
  });

  it("uses Toastmasters programme years (July to June)", () => {
    expect(awardSchema.safeParse({ ...award, year: "2024" }).success).toBe(false);
    expect(awardSchema.safeParse({ ...award, year: "2024-2026" }).success).toBe(false);
  });
});

describe("officerSchema (Executive Committee)", () => {
  it("requires a personal leadership statement", () => {
    const officer = {
      slug: "president",
      name: "Officer name",
      role: "President",
      term: "2026-2027",
      statement: "Helping people turn confidence into leadership.",
      consent: true,
    };
    expect(officerSchema.safeParse(officer).success).toBe(true);
    expect(officerSchema.safeParse({ ...officer, statement: "" }).success).toBe(false);
  });
});

describe("repository rules for people", () => {
  const base: RawContent = { ...content, members: [], founders: [], awards: [], officers: [] };

  it("never publishes members or founders without consent, nor drafts", () => {
    const repo = createRepository({
      ...base,
      members: [
        memberSchema.parse(member),
        memberSchema.parse({ ...member, slug: "no-consent", consent: false }),
        memberSchema.parse({ ...member, slug: "draft", status: "draft" }),
      ],
      founders: [
        founderSchema.parse({
          slug: "a",
          name: "A",
          role: "Founder",
          quote: "q",
          story: ["s"],
          consent: false,
        }),
      ],
    });
    expect(repo.members.map((m) => m.slug)).toEqual(["aisha-rahman"]);
    expect(repo.founders).toEqual([]);
  });

  it("sorts awards newest programme year first", () => {
    const repo = createRepository({
      ...base,
      awards: [
        awardSchema.parse({ ...award, slug: "old", year: "2021-2022" }),
        awardSchema.parse({ ...award, slug: "new", year: "2024-2025" }),
      ],
    });
    expect(repo.awards.map((a) => a.slug)).toEqual(["new", "old"]);
  });
});

describe("achievement helpers", () => {
  it("splits club awards from member achievements", () => {
    expect(isMemberAchievement(awardSchema.parse(award))).toBe(false);
    expect(isMemberAchievement(awardSchema.parse({ ...award, recipient: "A member" }))).toBe(true);
  });

  it("places an achievement in the calendar year it happened", () => {
    expect(achievementYear(awardSchema.parse({ ...award, achievedOn: "2024-11-02" }))).toBe(2024);
    // Without a date, use the year the Toastmasters year ends (results are announced then).
    expect(achievementYear(awardSchema.parse(award))).toBe(2025);
    // Except the Smedley Award, which is earned in August and September: the year's first half.
    expect(achievementYear(awardSchema.parse({ ...award, programme: "smedley", year: "2026-2027" }))).toBe(
      2026,
    );
  });

  it("groups the achievement timeline by year, newest first", () => {
    const awards = [
      awardSchema.parse({ ...award, slug: "a", achievedOn: "2023-05-01" }),
      awardSchema.parse({ ...award, slug: "b", achievedOn: "2025-06-01" }),
      awardSchema.parse({ ...award, slug: "c", achievedOn: "2025-02-01" }),
    ];
    expect(achievementsByYear(awards).map(([year, items]) => [year, items.map((i) => i.slug)])).toEqual([
      [2025, ["b", "c"]],
      [2023, ["a"]],
    ]);
  });

  it("finds a first name for 'Read Aisha's journey' links", () => {
    expect(firstName("Aisha Rahman")).toBe("Aisha");
    expect(firstName("  Mary-Jane  O'Neil ")).toBe("Mary-Jane");
  });
});
