import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { createRepository, type RawContent } from "@/lib/content/repository";
import { awardSchema, founderSchema, historySchema, memberSchema } from "@/lib/content/schemas";
import { awardsByYear, firstName } from "@/lib/content/people";

const member = {
  slug: "aisha-rahman",
  name: "Aisha Rahman",
  role: "Vice President Education",
  occupation: "Civil engineer",
  organisation: "Example Engineering",
  memberSince: 2022,
  quote: "I stopped dreading Monday meetings.",
  before: "Froze whenever she had to present.",
  today: "Leads site briefings for 40 people.",
  story: ["First paragraph.", "Second paragraph."],
  imageSlot: "member-one",
  consent: true,
  featured: true,
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

describe("memberSchema", () => {
  it("accepts a complete member story", () => {
    expect(memberSchema.safeParse(member).success).toBe(true);
  });

  it("keeps workplace optional, so members can choose not to share it", () => {
    const withoutWork = Object.fromEntries(
      Object.entries(member).filter(([key]) => key !== "organisation" && key !== "occupation"),
    );
    expect(memberSchema.safeParse(withoutWork).success).toBe(true);
  });

  it("requires at least one story paragraph", () => {
    expect(memberSchema.safeParse({ ...member, story: [] }).success).toBe(false);
  });

  it("rejects an implausible membership year", () => {
    expect(memberSchema.safeParse({ ...member, memberSince: 1850 }).success).toBe(false);
  });
});

describe("founderSchema", () => {
  it("accepts a founder with their part of the founding story", () => {
    const founder = {
      slug: "founder-one",
      name: "Founder name",
      role: "Founding President",
      quote: "We wanted a room where anyone could practise.",
      story: ["How it began."],
      consent: true,
    };
    expect(founderSchema.safeParse(founder).success).toBe(true);
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

  it("accepts the Smedley Award and contest wins", () => {
    expect(awardSchema.safeParse({ ...award, programme: "smedley" }).success).toBe(true);
    expect(
      awardSchema.safeParse({ ...award, programme: "contest", level: "district", recipient: "A member" })
        .success,
    ).toBe(true);
  });
});

describe("historySchema", () => {
  it("requires a founding year and at least one paragraph", () => {
    expect(historySchema.safeParse({ foundedYear: 2019, story: ["It began…"] }).success).toBe(true);
    expect(historySchema.safeParse({ foundedYear: 2019, story: [] }).success).toBe(false);
  });
});

describe("repository rules for people", () => {
  const base: RawContent = {
    settings: content.settings,
    history: content.history,
    events: [],
    members: [],
    founders: [],
    awards: [],
    testimonials: [],
    officers: [],
    faqs: [],
    tableTopics: [],
    imageSlots: [],
  };

  it("never publishes members or founders without consent", () => {
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

describe("people helpers", () => {
  it("groups awards by programme year, keeping order", () => {
    const awards = [
      awardSchema.parse({ ...award, slug: "a", year: "2024-2025" }),
      awardSchema.parse({ ...award, slug: "b", year: "2024-2025" }),
      awardSchema.parse({ ...award, slug: "c", year: "2023-2024" }),
    ];
    expect(awardsByYear(awards).map(([year, items]) => [year, items.length])).toEqual([
      ["2024-2025", 2],
      ["2023-2024", 1],
    ]);
  });

  it("finds a first name for 'Read Aisha's story' links", () => {
    expect(firstName("Aisha Rahman")).toBe("Aisha");
    expect(firstName("  Mary-Jane  O'Neil ")).toBe("Mary-Jane");
  });
});
