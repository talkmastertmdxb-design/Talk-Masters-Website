import { describe, expect, it } from "vitest";
import { content } from "@/lib/content";
import {
  meetingDayLabel,
  meetingSchedule,
  meetingTimeRange,
  nextMeeting,
  type MeetingRule,
} from "@/lib/content/meeting";

/** An example rule (the club meets on Sundays; the logic is the same): 1st and 3rd Saturday, 10:30 to 12:30, Dubai time. */
const club: MeetingRule = {
  weekday: "saturday",
  weeksOfMonth: [1, 3],
  startTime: "10:30",
  durationMinutes: 120,
  timeZone: "Asia/Dubai",
  cancelled: [],
};

const at = (iso: string) => new Date(iso);

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

describe("meetingSchedule", () => {
  it("names the weeks in plain English", () => {
    expect(meetingSchedule(club)).toBe("1st & 3rd Saturday of every month");
  });

  it("has a short form for tight spaces", () => {
    expect(meetingSchedule(club, "short")).toBe("1st & 3rd Sat");
  });

  it("handles one week and three weeks", () => {
    expect(meetingSchedule({ ...club, weeksOfMonth: [2] })).toBe("2nd Saturday of every month");
    expect(meetingSchedule({ ...club, weekday: "tuesday", weeksOfMonth: [5, 1, 3] })).toBe(
      "1st, 3rd & 5th Tuesday of every month",
    );
  });
});

describe("nextMeeting", () => {
  it("finds the 1st Saturday of next month from a Thursday after the 3rd Saturday", () => {
    const next = nextMeeting(club, at("2026-10-22T08:00:00Z"));
    expect(next?.date).toBe("2026-11-07");
    expect(next?.start.toISOString()).toBe("2026-11-07T06:30:00.000Z");
    expect(next?.end.toISOString()).toBe("2026-11-07T08:30:00.000Z");
  });

  it("still shows today's meeting while it is running", () => {
    expect(nextMeeting(club, at("2026-11-07T08:29:00Z"))?.date).toBe("2026-11-07");
  });

  it("moves to the 3rd Saturday once the 1st Saturday's meeting ends", () => {
    expect(nextMeeting(club, at("2026-11-07T08:30:00Z"))?.date).toBe("2026-11-21");
  });

  it("rolls over into the next year", () => {
    expect(nextMeeting(club, at("2026-12-19T09:00:00Z"))?.date).toBe("2027-01-02");
  });

  it("counts a Saturday on the 1st as the 1st Saturday", () => {
    // August 2026 starts on a Saturday.
    expect(nextMeeting(club, at("2026-07-30T00:00:00Z"))?.date).toBe("2026-08-01");
    expect(nextMeeting(club, at("2026-08-02T00:00:00Z"))?.date).toBe("2026-08-15");
  });

  it("starts at the club's local time, whatever the time zone", () => {
    const london = { ...club, timeZone: "Europe/London" };
    expect(nextMeeting(london, at("2026-10-22T08:00:00Z"))?.start.toISOString()).toBe(
      "2026-11-07T10:30:00.000Z",
    );
    // Summer time: 10:30 in London is 09:30 UTC.
    expect(nextMeeting(london, at("2026-07-30T00:00:00Z"))?.start.toISOString()).toBe(
      "2026-08-01T09:30:00.000Z",
    );
  });

  it("skips cancelled meetings", () => {
    expect(nextMeeting({ ...club, cancelled: ["2026-11-07"] }, at("2026-10-22T08:00:00Z"))?.date).toBe(
      "2026-11-21",
    );
  });

  it("skips months without a 5th weekday", () => {
    const fifth = { ...club, weeksOfMonth: [5] };
    // November 2026 has five Saturdays (the 28th); December 2026 has four, January 2027 has five (the 30th).
    expect(nextMeeting(fifth, at("2026-11-29T00:00:00Z"))?.date).toBe("2027-01-30");
  });
});

describe("meetingDayLabel", () => {
  const start = at("2026-11-07T06:30:00Z");

  it("says Today and Tomorrow by the club's calendar day", () => {
    expect(meetingDayLabel(start, club.timeZone, at("2026-11-06T19:59:00Z"))).toBe("Tomorrow");
    expect(meetingDayLabel(start, club.timeZone, at("2026-11-06T20:00:00Z"))).toBe("Today");
  });

  it("gives the date further ahead, long or short", () => {
    expect(meetingDayLabel(start, club.timeZone, at("2026-10-22T08:00:00Z"))).toBe("Saturday 7 November");
    expect(meetingDayLabel(start, club.timeZone, at("2026-10-22T08:00:00Z"), "short")).toBe("Sat 7 Nov");
  });
});

describe("the club's own schedule (content/settings.json)", () => {
  it("is the 1st and 3rd Sunday, 10:30 am to 12:30 pm, in Dubai", () => {
    const { meeting } = content.settings;
    expect(meetingSchedule(meeting)).toBe("1st & 3rd Sunday of every month");
    expect(meetingTimeRange(meeting)).toBe("10:30 am – 12:30 pm");
    expect(meeting.timeZone).toBe("Asia/Dubai");
    expect(nextMeeting(meeting, at("2026-10-22T08:00:00Z"))?.date).toBe("2026-11-01");
  });
});
