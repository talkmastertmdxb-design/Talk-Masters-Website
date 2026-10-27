import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import { meetingGuideSchema } from "@/lib/content/schemas";
import { addMinutes, meetingSpan, sessionSpan } from "@/lib/content/meeting-guide";

const role = { slug: "timer", name: "Timer", group: "functionary", text: "Times every speech." };
const guide = {
  example: { number: 112, theme: "How to talk to a caveman", date: "2026-10-25" },
  sessions: [
    {
      name: "Opening",
      summary: "The gavel comes down.",
      items: [
        { start: "10:45", minutes: 2, title: "Call to order" },
        { start: "10:47", minutes: 4, title: "Timer's report", role: "timer" },
      ],
    },
  ],
  roles: [role],
  timing: [{ label: "Table Topic", detail: "On the spot", green: 60, amber: 90, red: 120 }],
};

describe("meetingGuideSchema (/meetings)", () => {
  it("accepts a running order whose roles are all described", () => {
    expect(meetingGuideSchema.safeParse(guide).success).toBe(true);
  });

  it("rejects an agenda item naming a role the page doesn't describe", () => {
    const sessions = [
      { ...guide.sessions[0]!, items: [{ start: "10:45", minutes: 2, title: "X", role: "ghost" }] },
    ];
    expect(meetingGuideSchema.safeParse({ ...guide, sessions }).success).toBe(false);
  });

  it("rejects timing lights out of order", () => {
    const timing = [{ label: "Odd", detail: "x", green: 90, amber: 60, red: 120 }];
    expect(meetingGuideSchema.safeParse({ ...guide, timing }).success).toBe(false);
  });
});

describe("meeting guide times", () => {
  it("adds minutes across the hour", () => {
    expect(addMinutes("11:58", 4)).toBe("12:02");
  });

  it("spans a session from its first item to the end of its last", () => {
    expect(sessionSpan(guide.sessions[0]!)).toEqual({ start: "10:45", end: "10:51", minutes: 6 });
  });

  it("the real Meeting #112 runs 10:30 to 12:33, 123 minutes in all", () => {
    expect(meetingSpan(content.meetingGuide)).toEqual({ start: "10:30", end: "12:33", minutes: 123 });
  });
});
