import { describe, expect, it } from "vitest";
import {
  googleCalendarUrl,
  meetingCalendar,
  meetingRRule,
  singleMeetingCalendar,
  singleMeetingGoogleUrl,
} from "@/lib/content/calendar";
import { nextMeeting } from "@/lib/content/meeting";
import type { MeetingRule } from "@/lib/content/meeting";

const meeting: MeetingRule & { venue: string; city: string } = {
  weekday: "saturday",
  weeksOfMonth: [3, 1],
  startTime: "10:30",
  durationMinutes: 120,
  timeZone: "Asia/Dubai",
  cancelled: ["2026-12-19"],
  venue: "Hor Al Anz Public Library",
  city: "Dubai",
};

const details = { clubName: "Talk-Masters Club", url: "https://example.com/join", meeting };

describe("meetingRRule", () => {
  it("repeats monthly on the given weeks, in order", () => {
    expect(meetingRRule(meeting)).toBe("FREQ=MONTHLY;BYDAY=1SA,3SA");
  });
});

describe("googleCalendarUrl", () => {
  it("adds the recurring meeting in the club's time zone, from the first meeting of the series", () => {
    const url = new URL(googleCalendarUrl(details));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Talk-Masters Club meeting");
    expect(url.searchParams.get("dates")).toBe("20261107T103000/20261107T123000");
    expect(url.searchParams.get("ctz")).toBe("Asia/Dubai");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;BYDAY=1SA,3SA");
    expect(url.searchParams.get("location")).toBe("Hor Al Anz Public Library, Dubai");
  });
});

describe("meetingCalendar", () => {
  const ics = meetingCalendar(details);
  const lines = ics.split("\r\n");

  it("is an iCalendar file with CRLF line endings", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-2)).toBe("END:VCALENDAR");
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replaceAll("\r\n", "")).not.toContain("\n");
  });

  it("describes the recurring meeting in local time", () => {
    expect(lines).toContain("DTSTART;TZID=Asia/Dubai:20261107T103000");
    expect(lines).toContain("DTEND;TZID=Asia/Dubai:20261107T123000");
    expect(lines).toContain("RRULE:FREQ=MONTHLY;BYDAY=1SA,3SA");
    expect(lines).toContain("SUMMARY:Talk-Masters Club meeting");
  });

  it("leaves out cancelled meetings", () => {
    expect(lines).toContain("EXDATE;TZID=Asia/Dubai:20261219T103000");
  });

  it("defines the time zone so every calendar app agrees", () => {
    expect(lines).toContain("BEGIN:VTIMEZONE");
    expect(lines).toContain("TZID:Asia/Dubai");
    expect(lines).toContain("TZOFFSETTO:+0400");
  });

  it("escapes commas in text fields", () => {
    expect(lines).toContain("LOCATION:Hor Al Anz Public Library\\, Dubai");
  });

  it("is the same on every build, so calendars don't see a new event", () => {
    expect(meetingCalendar(details)).toBe(ics);
    expect(lines.some((line) => line.startsWith("UID:"))).toBe(true);
  });
});

describe("one meeting (the guest's chosen date)", () => {
  const visit = nextMeeting(meeting, new Date("2026-11-10T08:00:00Z"))!;

  it("adds just that meeting to Google Calendar, no repeat", () => {
    const url = new URL(singleMeetingGoogleUrl(details, visit));
    expect(url.searchParams.get("dates")).toBe("20261121T103000/20261121T123000");
    expect(url.searchParams.get("ctz")).toBe("Asia/Dubai");
    expect(url.searchParams.get("recur")).toBeNull();
    expect(url.searchParams.get("text")).toBe("Talk-Masters Club meeting (guest visit)");
  });

  it("is a one-event .ics file with its own id", () => {
    const lines = singleMeetingCalendar(details, visit).split("\r\n");
    expect(lines).toContain("DTSTART;TZID=Asia/Dubai:20261121T103000");
    expect(lines).toContain("DTEND;TZID=Asia/Dubai:20261121T123000");
    expect(lines.some((line) => line.startsWith("RRULE"))).toBe(false);
    expect(lines).toContain("UID:guest-2026-11-21@example.com");
  });

  it("can carry arrival advice", () => {
    const withTips = { ...details, tips: "Arrive from 10:15. Parking is free on Sundays." };
    const url = new URL(singleMeetingGoogleUrl(withTips, visit));
    expect(url.searchParams.get("details")).toContain("Arrive from 10:15. Parking is free on Sundays.");
  });
});
