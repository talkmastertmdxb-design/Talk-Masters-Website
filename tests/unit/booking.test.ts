import { describe, expect, it } from "vitest";
import { guestMessage, guestRequestSchema, MOMENTS } from "@/lib/booking/message";
import { upcomingMeetings, type MeetingRule } from "@/lib/content/meeting";

const rule: MeetingRule = {
  weekday: "saturday",
  weeksOfMonth: [1, 3],
  startTime: "10:30",
  durationMinutes: 120,
  timeZone: "Asia/Dubai",
  cancelled: ["2026-11-21"],
};

describe("upcomingMeetings", () => {
  it("lists the next meetings in order, skipping cancellations", () => {
    expect(upcomingMeetings(rule, new Date("2026-10-22T08:00:00Z"), 3).map((m) => m.date)).toEqual([
      "2026-11-07",
      "2026-12-05",
      "2026-12-19",
    ]);
  });

  it("includes today's meeting until it ends", () => {
    expect(upcomingMeetings(rule, new Date("2026-11-07T08:00:00Z"), 1)[0]?.date).toBe("2026-11-07");
  });
});

describe("guestRequestSchema", () => {
  const valid = { name: "  Sara Ahmed ", meeting: "2026-11-07", contact: "+971502837168" };

  it("trims the name and accepts optional fields", () => {
    const parsed = guestRequestSchema.parse({ ...valid, moment: "interview", note: " I'm nervous " });
    expect(parsed.name).toBe("Sara Ahmed");
    expect(parsed.note).toBe("I'm nervous");
  });

  it("needs a real name", () => {
    expect(guestRequestSchema.safeParse({ ...valid, name: " " }).success).toBe(false);
    expect(guestRequestSchema.safeParse({ ...valid, name: "S" }).success).toBe(false);
    expect(guestRequestSchema.safeParse({ ...valid, name: "x".repeat(81) }).success).toBe(false);
  });

  it("accepts a meeting date or 'not sure yet', nothing else", () => {
    expect(guestRequestSchema.safeParse({ ...valid, meeting: "unsure" }).success).toBe(true);
    expect(guestRequestSchema.safeParse({ ...valid, meeting: "next Saturday" }).success).toBe(false);
  });

  it("rejects an unknown moment and a long note", () => {
    expect(guestRequestSchema.safeParse({ ...valid, moment: "wedding" }).success).toBe(false);
    expect(guestRequestSchema.safeParse({ ...valid, note: "x".repeat(501) }).success).toBe(false);
  });

  it("treats empty optional fields as left out", () => {
    const parsed = guestRequestSchema.parse({ ...valid, moment: "", note: "   " });
    expect(parsed.moment).toBeUndefined();
    expect(parsed.note).toBeUndefined();
  });
});

describe("guestMessage", () => {
  const base = { name: "Sara", contactName: "Lulu", meetingLabel: "Saturday 7 November" };

  it("greets the officer and names the meeting", () => {
    expect(guestMessage(base)).toBe(
      "Hi Lulu! I'm Sara, and I'd like to visit Talk-Masters as a guest at the meeting on Saturday 7 November. Could you save me a seat?",
    );
  });

  it("says when the guest isn't sure of the date yet", () => {
    expect(guestMessage({ ...base, meetingLabel: null })).toContain(
      "I'd like to visit Talk-Masters as a guest. I'm not sure which date yet.",
    );
  });

  it("adds what they're preparing for and their note, each on its own paragraph", () => {
    const message = guestMessage({ ...base, moment: "interview", note: "I'm a bit nervous!" });
    expect(message.split("\n\n")).toEqual([
      "Hi Lulu! I'm Sara, and I'd like to visit Talk-Masters as a guest at the meeting on Saturday 7 November. Could you save me a seat?",
      MOMENTS.interview.sentence,
      "I'm a bit nervous!",
    ]);
  });

  it("uses a placeholder until the name is typed", () => {
    expect(guestMessage({ ...base, name: "" })).toContain("I'm [your name]");
  });
});
