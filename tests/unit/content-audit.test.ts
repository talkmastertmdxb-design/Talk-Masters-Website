import { describe, expect, it } from "vitest";
import { findPlaceholders } from "@/lib/content/audit";

describe("findPlaceholders", () => {
  it("returns nothing for real content", () => {
    expect(findPlaceholders({ "settings.json": { clubName: "Talk-Masters Club" } })).toEqual([]);
  });

  it("reports every placeholder flag with its location", () => {
    const report = findPlaceholders({
      "settings.json": {
        meeting: { placeholder: true },
        stats: [{ placeholder: false }, { placeholder: true }],
      },
    });
    expect(report).toEqual(["settings.json → meeting", "settings.json → stats[1]"]);
  });

  it("reports image slots that still have no photo", () => {
    const report = findPlaceholders({
      "images.json": [
        { id: "hero-stage", src: null },
        { id: "venue-entrance", src: "/images/venue-entrance.jpg" },
      ],
    });
    expect(report).toEqual(['images.json → [0] (image slot "hero-stage" has no photo)']);
  });
});
