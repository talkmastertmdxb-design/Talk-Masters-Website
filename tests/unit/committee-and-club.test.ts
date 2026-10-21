import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { clubFacts, clubLine, featuredAward, shortTerm, splitCommittee } from "@/lib/content/people";
import { awardSchema, officerSchema, settingsSchema, videoSchema } from "@/lib/content/schemas";

const officer = (slug: string, role: string) =>
  officerSchema.parse({
    slug,
    name: slug,
    role,
    term: "2026-2027",
    statement: "A statement.",
    consent: true,
  });

const award = (slug: string, extra: Record<string, unknown> = {}) =>
  awardSchema.parse({
    slug,
    title: slug,
    programme: "smedley",
    level: "district",
    year: "2026-2027",
    description: "An award.",
    ...extra,
  });

describe("splitCommittee", () => {
  it("puts the President first and keeps everyone else in order", () => {
    const { president, others } = splitCommittee([
      officer("vp-education", "Vice President Education"),
      officer("president", "President"),
      officer("treasurer", "Treasurer"),
    ]);
    expect(president?.slug).toBe("president");
    expect(others.map((o) => o.slug)).toEqual(["vp-education", "treasurer"]);
  });

  it("copes with no President", () => {
    expect(splitCommittee([officer("treasurer", "Treasurer")]).president).toBeUndefined();
  });
});

describe("shortTerm", () => {
  it("writes a Toastmasters year the short way, and leaves anything else alone", () => {
    expect(shortTerm("2026-2027")).toBe("2026–27");
    expect(shortTerm("Since 2019")).toBe("Since 2019");
  });
});

describe("clubFacts", () => {
  it("lists only what is known, in Toastmasters order", () => {
    expect(clubFacts({ clubNumber: "07956953", area: "11", division: "C", district: "127" })).toEqual([
      "Club 07956953",
      "Area 11",
      "Division C",
      "District 127",
    ]);
    expect(clubFacts({ district: "127" })).toEqual(["District 127"]);
  });
});

describe("featuredAward", () => {
  it("picks the first confirmed club award with an image", () => {
    const awards = [
      award("no-image"),
      award("unconfirmed", { imageSlot: "a", placeholder: true }),
      award("member", { imageSlot: "b", recipient: "A member" }),
      award("smedley", { imageSlot: "c" }),
    ];
    expect(featuredAward(awards)?.slug).toBe("smedley");
    expect(featuredAward([award("no-image")])).toBeUndefined();
  });
});

describe("highlight video", () => {
  const video = {
    src: "/videos/member-voices.mp4",
    poster: "/images/member-voices-poster.webp",
    title: "Members on what changed",
    durationSeconds: 71,
    captionsBurnedIn: true,
  };

  it("accepts a compressed video in /videos with a poster", () => {
    expect(videoSchema.safeParse(video).success).toBe(true);
  });

  it("rejects raw footage, remote files and uncaptioned video", () => {
    expect(videoSchema.safeParse({ ...video, src: "/Video/Toastmasters Video.mp4" }).success).toBe(false);
    expect(videoSchema.safeParse({ ...video, src: "https://example.com/a.mp4" }).success).toBe(false);
    expect(videoSchema.safeParse({ ...video, captionsBurnedIn: false }).success).toBe(false);
  });

  it("is optional in settings", () => {
    const { highlightVideo, ...rest } = content.settings;
    expect(highlightVideo).toBeDefined();
    expect(settingsSchema.safeParse(rest).success).toBe(true);
  });
});

describe("club content", () => {
  it("has the full 2026-27 committee, President first", () => {
    expect(content.officers.map((o) => o.role)).toEqual([
      "President",
      "Vice President Education",
      "Vice President Membership",
      "Vice President Public Relations",
      "Treasurer",
      "Secretary",
      "Sergeant at Arms",
    ]);
    expect(content.officers.every((o) => o.imageSlot)).toBe(true);
  });

  it("features the confirmed Smedley Award", () => {
    expect(featuredAward(content.awards)?.title).toBe("Smedley Award, Bronze");
  });
});

describe("clubLine", () => {
  it("leads with membership, then the club role, then highlights", () => {
    expect(
      clubLine({
        memberSince: 2024,
        position: "Vice President Education",
        clubHighlights: ["100+ speeches"],
      }),
    ).toEqual(["Member since 2024", "Vice President Education", "100+ speeches"]);
  });

  it("shows only what is known", () => {
    expect(clubLine({ clubHighlights: ["Featured speaker, 100th meeting"] })).toEqual([
      "Featured speaker, 100th meeting",
    ]);
    expect(clubLine({ clubHighlights: [] })).toEqual([]);
  });

  it("gives every member on the site something club-specific under their name", () => {
    for (const member of content.members) expect(clubLine(member).length).toBeGreaterThan(0);
  });
});
