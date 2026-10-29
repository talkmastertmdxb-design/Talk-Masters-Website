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
  pathways: content.pathways,
  imageSlots: [],
  meetingGuide: content.meetingGuide,
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

  it("keeps an officer's story link only when that member's profile is published", () => {
    const member = content.members[0]!;
    const officer = content.officers[0]!;
    const repo = createRepository({
      ...base,
      members: [member, { ...member, slug: "draft-member", status: "draft" as const }],
      officers: [
        { ...officer, slug: "linked", memberSlug: member.slug },
        { ...officer, slug: "draft", memberSlug: "draft-member" },
        { ...officer, slug: "missing", memberSlug: "nobody" },
      ],
    });
    expect(repo.officers.map((o) => o.memberSlug)).toEqual([member.slug, undefined, undefined]);
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

  it("links Suhayb and Nabeel's committee cards to their member stories", () => {
    const linked = Object.fromEntries(content.officers.map((o) => [o.name, o.memberSlug]));
    expect(linked.Suhayb).toBe("suhayb-shaik");
    expect(linked.Nabeel).toBe("nabeel-bava");
  });

  it("lists the six Pathways offered to new members, not the retired ones", () => {
    expect(content.pathways.paths.map((p) => p.name).sort()).toEqual([
      "Dynamic Leadership",
      "Engaging Humor",
      "Motivational Strategies",
      "Persuasive Influence",
      "Presentation Mastery",
      "Visionary Communication",
    ]);
  });

  it("links the club's Instagram and LinkedIn, without tracking parameters", () => {
    expect(content.settings.socials).toEqual([
      { network: "instagram", url: "https://www.instagram.com/talkmastersuae/" },
      { network: "linkedin", url: "https://www.linkedin.com/in/talk-masters-tm-22071837a/" },
    ]);
  });

  it("dates the club from 2016, when it began as an independent club", () => {
    expect(content.history.foundedYear).toBe(2016);
    expect(content.history.origin).toMatch(/independent/);
    expect(content.history.origin).toMatch(/Toastmasters International/);
  });

  it("states the club's tagline and mission", () => {
    expect(content.settings.tagline).toBe("A Club with a Difference");
    expect(content.settings.mission).toMatch(/^We provide a supportive and positive learning experience/);
  });

  it("links the President's committee card to his member story", () => {
    const president = content.officers.find((o) => o.role === "President");
    expect(president?.memberSlug).toBe("anees-mousafi");
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
      ...content.pathways.paths,
    ]
      .map((item) => item.imageSlot)
      .filter((id): id is string => Boolean(id));
    for (const id of referenced) expect(ids).toContain(id);
  });
});
