import { describe, expect, it } from "vitest";
import {
  cultureSchema,
  eventSchema,
  imageSlotSchema,
  parseContent,
  pathwaysSchema,
  settingsSchema,
  ContentError,
} from "@/lib/content/schemas";

const validSettings = {
  clubName: "Talk-Masters Club",
  parentOrganisation: "Toastmasters International",
  tagline: "A Club with Difference",
  mission: "We provide a supportive and positive learning experience.",
  description: "A public speaking and leadership club open to everyone.",
  meeting: {
    weekday: "tuesday",
    weeksOfMonth: [2, 4],
    startTime: "19:00",
    durationMinutes: 120,
    venue: "Venue to be confirmed",
    city: "Dubai",
  },
  contactEmail: "hello@example.com",
  contacts: [{ name: "Lulu", role: "Vice President Membership", whatsapp: "+971502837168" }],
  socials: [],
  stats: [{ label: "Speeches delivered", value: 500, suffix: "+" }],
  heroSlides: ["hero-speaker", "hero-audience"],
};

describe("settingsSchema", () => {
  it("accepts valid settings and defaults placeholder to false", () => {
    const parsed = settingsSchema.parse(validSettings);
    expect(parsed.meeting.placeholder).toBe(false);
    expect(parsed.stats[0]?.placeholder).toBe(false);
  });

  it("needs one to five hero photos, by slot id", () => {
    const withSlides = (heroSlides: string[]) => settingsSchema.safeParse({ ...validSettings, heroSlides });
    expect(withSlides([]).success).toBe(false);
    expect(withSlides(["a", "b", "c", "d", "e", "f"]).success).toBe(false);
    expect(withSlides(["Hero Speaker"]).success).toBe(false);
    expect(withSlides(["hero-speaker"]).success).toBe(true);
  });

  it("rejects a malformed meeting time", () => {
    const bad = { ...validSettings, meeting: { ...validSettings.meeting, startTime: "7pm" } };
    expect(settingsSchema.safeParse(bad).success).toBe(false);
  });

  it("defaults the meeting to Dubai time with no cancellations", () => {
    const { meeting } = settingsSchema.parse(validSettings);
    expect(meeting.timeZone).toBe("Asia/Dubai");
    expect(meeting.cancelled).toEqual([]);
  });

  it("rejects an impossible meeting rule", () => {
    const withMeeting = (change: object) =>
      settingsSchema.safeParse({ ...validSettings, meeting: { ...validSettings.meeting, ...change } })
        .success;
    expect(withMeeting({ weeksOfMonth: [] })).toBe(false);
    expect(withMeeting({ weeksOfMonth: [6] })).toBe(false);
    expect(withMeeting({ weeksOfMonth: [1, 1] })).toBe(false);
    expect(withMeeting({ weekday: "Saturday" })).toBe(false);
    expect(withMeeting({ timeZone: "Dubai" })).toBe(false);
    expect(withMeeting({ cancelled: ["19/12/2026"] })).toBe(false);
  });

  it("accepts the guest's practical details and officer photos", () => {
    const parsed = settingsSchema.parse({
      ...validSettings,
      meeting: {
        ...validSettings.meeting,
        arriveTime: "18:45",
        guestInfo: [
          { kind: "parking", text: "Free parking" },
          { kind: "food", text: "Breakfast included" },
        ],
      },
      contacts: [{ ...validSettings.contacts[0]!, imageSlot: "officer-vp-membership" }],
    });
    expect(parsed.meeting.arriveTime).toBe("18:45");
    expect(parsed.meeting.guestInfo).toHaveLength(2);
    expect(parsed.contacts[0]?.imageSlot).toBe("officer-vp-membership");
  });

  it("rejects an arrival time after the start, and unknown info kinds", () => {
    const withMeeting = (change: object) =>
      settingsSchema.safeParse({ ...validSettings, meeting: { ...validSettings.meeting, ...change } })
        .success;
    expect(withMeeting({ arriveTime: "19:30" })).toBe(false);
    expect(withMeeting({ guestInfo: [{ kind: "wifi", text: "Free wifi" }] })).toBe(false);
  });

  it("rejects an invalid contact email", () => {
    expect(settingsSchema.safeParse({ ...validSettings, contactEmail: "nope" }).success).toBe(false);
  });
});

describe("eventSchema", () => {
  const event = {
    slug: "open-house-evening",
    title: "Open House Evening",
    type: "meeting",
    startsAt: "2026-11-10T19:00:00+04:00",
    endsAt: "2026-11-10T21:00:00+04:00",
    venue: "Venue to be confirmed",
    summary: "Watch a real meeting.",
    status: "published",
  };

  it("accepts a valid event", () => {
    expect(eventSchema.safeParse(event).success).toBe(true);
  });

  it("rejects a slug that is not kebab-case", () => {
    expect(eventSchema.safeParse({ ...event, slug: "Open House" }).success).toBe(false);
  });

  it("rejects an event that ends before it starts", () => {
    const bad = { ...event, endsAt: "2026-11-10T18:00:00+04:00" };
    expect(eventSchema.safeParse(bad).success).toBe(false);
  });
});

describe("imageSlotSchema", () => {
  const slot = {
    id: "hero-stage",
    alt: "A speaker at the lectern under warm stage light",
    aspectRatio: "4/5",
    brief: "Speaker at the lectern, three-quarter angle, warm light",
    src: null,
  };

  it("accepts an empty slot (placeholder) and a filled slot", () => {
    expect(imageSlotSchema.safeParse(slot).success).toBe(true);
    expect(imageSlotSchema.safeParse({ ...slot, src: "/images/hero-stage.webp" }).success).toBe(true);
    // Club photos must be converted to WebP first.
    expect(imageSlotSchema.safeParse({ ...slot, src: "/images/hero-stage.jpg" }).success).toBe(false);
  });

  it("only allows images served from /images/", () => {
    expect(imageSlotSchema.safeParse({ ...slot, src: "https://drive.google.com/x.jpg" }).success).toBe(false);
  });

  it("rejects a malformed aspect ratio", () => {
    expect(imageSlotSchema.safeParse({ ...slot, aspectRatio: "portrait" }).success).toBe(false);
  });
});

describe("parseContent", () => {
  it("throws a readable ContentError naming the source file", () => {
    expect(() => parseContent(settingsSchema, { clubName: "" }, "content/settings.json")).toThrow(
      ContentError,
    );
    try {
      parseContent(settingsSchema, { clubName: "" }, "content/settings.json");
    } catch (error) {
      expect((error as Error).message).toContain("content/settings.json");
    }
  });
});

describe("cultureSchema", () => {
  const card = { title: "Feedback that's kind", text: "Every speech gets an evaluation." };

  it("fills the About bento's three card slots, or fewer", () => {
    expect(cultureSchema.safeParse([card]).success).toBe(true);
    expect(cultureSchema.safeParse([card, card, card]).success).toBe(true);
    expect(cultureSchema.safeParse([]).success).toBe(false);
    expect(cultureSchema.safeParse([card, card, card, card]).success).toBe(false);
  });

  it("keeps each card short enough for its tile", () => {
    expect(cultureSchema.safeParse([{ ...card, title: "x".repeat(41) }]).success).toBe(false);
    expect(cultureSchema.safeParse([{ ...card, text: "x".repeat(141) }]).success).toBe(false);
  });
});

describe("pathwaysSchema", () => {
  const path = (slug: string) => ({
    slug,
    name: slug,
    focus: "What it focuses on.",
    bestFor: "Who it suits",
    skills: ["One", "Two", "Three"],
    finalProject: "Capstone",
    imageSlot: `path-${slug}`,
  });
  const valid = {
    intro: "Intro.",
    journeyLine: "Your journey evolves as your goals evolve.",
    audiences: [{ label: "Students", reason: "Presentations" }],
    stages: ["First-timer", "Confident speaker", "Leader", "Mentor"].map((name) => ({ name, text: "x" })),
    levels: ["L1", "L2", "L3", "L4", "L5"].map((name) => ({ name, text: "x" })),
    facts: [{ title: "First path included", text: "x" }],
    paths: [path("presentation-mastery"), path("dynamic-leadership")],
    retired: "Some paths were retired.",
    quiz: {
      goals: [{ id: "speak", label: "Speaking", hint: "x", path: "presentation-mastery" }],
      places: [{ id: "work", label: "At work", line: "x" }],
    },
    source: "https://www.toastmasters.org/pathways-overview",
    checkedOn: "2026-10-25",
  };

  it("accepts a complete Pathways description", () => {
    expect(pathwaysSchema.safeParse(valid).success).toBe(true);
  });

  it("has four journey stages and five levels, as the design shows", () => {
    expect(pathwaysSchema.safeParse({ ...valid, stages: valid.stages.slice(0, 3) }).success).toBe(false);
    expect(pathwaysSchema.safeParse({ ...valid, levels: valid.levels.slice(0, 4) }).success).toBe(false);
  });

  it("gives every path a unique slug, so its #anchor is unique", () => {
    const paths = [path("same"), path("same")];
    expect(pathwaysSchema.safeParse({ ...valid, paths }).success).toBe(false);
  });

  it("only recommends paths that exist", () => {
    const quiz = { ...valid.quiz, goals: [{ id: "x", label: "x", hint: "x", path: "retired-path" }] };
    expect(pathwaysSchema.safeParse({ ...valid, quiz }).success).toBe(false);
  });
});
