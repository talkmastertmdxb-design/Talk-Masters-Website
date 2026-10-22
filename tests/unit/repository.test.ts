import { describe, expect, it } from "vitest";
import { createRepository, type RawContent } from "@/lib/content/repository";
import { content } from "@/lib/content";

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
  culture: [],
  tableTopics: [],
  imageSlots: [],
};

const event = (slug: string, startsAt: string, status: "draft" | "published" = "published") => ({
  slug,
  title: slug,
  type: "meeting" as const,
  startsAt,
  venue: "TBC",
  summary: "x",
  status,
  placeholder: false,
});

describe("createRepository", () => {
  it("sorts published events soonest first and drops drafts", () => {
    const repo = createRepository({
      ...base,
      events: [
        event("later", "2026-12-01T19:00:00+04:00"),
        event("draft", "2026-10-01T19:00:00+04:00", "draft"),
        event("sooner", "2026-11-01T19:00:00+04:00"),
      ],
    });
    expect(repo.events.map((e) => e.slug)).toEqual(["sooner", "later"]);
  });

  it("does not mutate the raw input", () => {
    const events = [event("b", "2026-12-01T19:00:00+04:00"), event("a", "2026-11-01T19:00:00+04:00")];
    createRepository({ ...base, events });
    expect(events.map((e) => e.slug)).toEqual(["b", "a"]);
  });
});

describe("content in /content", () => {
  it("passes validation and names the club correctly", () => {
    expect(content.settings.clubName).toBe("Talk-Masters Club");
    expect(content.settings.parentOrganisation).toBe("Toastmasters International");
  });

  it("has unique image slot ids, and every referenced slot exists", () => {
    const ids = content.imageSlots.map((slot) => slot.id);
    expect(new Set(ids).size).toBe(ids.length);
    const referenced = [
      ...content.events,
      ...content.members,
      ...content.founders,
      ...content.awards,
      ...content.testimonials,
      ...content.officers,
    ]
      .map((item) => item.imageSlot)
      .filter((id): id is string => Boolean(id));
    for (const id of referenced) expect(ids).toContain(id);
  });
});
