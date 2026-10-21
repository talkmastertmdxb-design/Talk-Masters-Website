import { describe, expect, it } from "vitest";
import { meetingTimeRange } from "@/lib/content/meeting";

describe("meetingTimeRange", () => {
  it("shows a morning meeting that ends after noon", () => {
    expect(meetingTimeRange({ startTime: "10:30", durationMinutes: 120 })).toBe("10:30 am – 12:30 pm");
  });

  it("shows an evening meeting", () => {
    expect(meetingTimeRange({ startTime: "19:00", durationMinutes: 105 })).toBe("7:00 pm – 8:45 pm");
  });

  it("uses 12 for noon and midnight", () => {
    expect(meetingTimeRange({ startTime: "12:00", durationMinutes: 720 })).toBe("12:00 pm – 12:00 am");
  });
});
