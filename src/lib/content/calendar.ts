import {
  meetingTimeRange,
  nextMeeting,
  wallTime,
  zonedInstant,
  type MeetingOccurrence,
  type MeetingRule,
} from "./meeting";

/**
 * "Add to calendar" for the club's regular meetings: one recurring event, so the links
 * and the .ics file never go stale and never need the current date (pages are static).
 */

/** The calendar series starts with the first meeting on or after this date. */
const SERIES_FROM = "2026-11-01";
const BYDAY: Record<MeetingRule["weekday"], string> = {
  sunday: "SU",
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
};
const MAX_LINE_OCTETS = 75;

export interface CalendarDetails {
  clubName: string;
  /** Where guests book, linked from the event. */
  url: string;
  meeting: MeetingRule & { venue: string; city: string };
}

/** "FREQ=MONTHLY;BYDAY=1SA,3SA". */
export function meetingRRule({
  weekday,
  weeksOfMonth,
}: Pick<MeetingRule, "weekday" | "weeksOfMonth">): string {
  const days = weeksOfMonth.toSorted((a, b) => a - b).map((week) => `${week}${BYDAY[weekday]}`);
  return `FREQ=MONTHLY;BYDAY=${days.join(",")}`;
}

/** The first meeting of the series; cancellations are handled with EXDATE, not by moving it. */
function seriesStart(rule: MeetingRule): MeetingOccurrence {
  const [year, month, day] = SERIES_FROM.split("-").map(Number);
  const from = zonedInstant({ year: year!, month: month!, day: day!, hour: 0, minute: 0 }, rule.timeZone);
  const first = nextMeeting({ ...rule, cancelled: [] }, from);
  if (!first) throw new Error(`No meeting matches ${meetingRRule(rule)}`);
  return first;
}

const pad = (value: number): string => String(value).padStart(2, "0");

/** Floating local time in iCalendar form: "20261107T103000". */
function localStamp(instant: Date, timeZone: string): string {
  const { year, month, day, hour, minute } = wallTime(instant, timeZone);
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
}

const title = (clubName: string): string => `${clubName} meeting`;
const location = ({ venue, city }: CalendarDetails["meeting"]): string => `${venue}, ${city}`;
const description = ({ meeting, url }: CalendarDetails): string =>
  `${meetingTimeRange(meeting)}. Guests are always welcome, and never have to speak. Book your seat: ${url}`;

/** A Google Calendar link that adds the whole recurring series. */
export function googleCalendarUrl(details: CalendarDetails): string {
  const { meeting } = details;
  const first = seriesStart(meeting);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(details.clubName),
    dates: `${localStamp(first.start, meeting.timeZone)}/${localStamp(first.end, meeting.timeZone)}`,
    ctz: meeting.timeZone,
    recur: `RRULE:${meetingRRule(meeting)}`,
    location: location(meeting),
    details: description(details),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** RFC 5545 §3.3.11 text escaping. */
const escapeText = (text: string): string =>
  text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r?\n/g, "\\n");

/** RFC 5545 §3.1: lines longer than 75 octets continue on the next line after a space. */
function fold(line: string): string[] {
  const chunks = [line.slice(0, MAX_LINE_OCTETS)];
  for (let index = MAX_LINE_OCTETS; index < line.length; index += MAX_LINE_OCTETS - 1) {
    chunks.push(` ${line.slice(index, index + MAX_LINE_OCTETS - 1)}`);
  }
  return chunks;
}

/** "+0400" for a time zone with one fixed offset all year. */
function fixedOffset(timeZone: string, year: number): string {
  const offsetMinutes = (month: number) => {
    const instant = new Date(Date.UTC(year, month, 1));
    const wall = wallTime(instant, timeZone);
    return (
      (Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute) - instant.getTime()) / 60_000
    );
  };
  const winter = offsetMinutes(0);
  if (offsetMinutes(6) !== winter) {
    throw new Error(
      `${timeZone} changes its clocks; the calendar file only supports fixed-offset time zones.`,
    );
  }
  const sign = winter < 0 ? "-" : "+";
  const absolute = Math.abs(winter);
  return `${sign}${pad(Math.floor(absolute / 60))}${pad(absolute % 60)}`;
}

/** The .ics file for the recurring meeting. Identical on every build, so subscribers see no changes. */
export function meetingCalendar(details: CalendarDetails): string {
  const { meeting } = details;
  const zone = meeting.timeZone;
  const first = seriesStart(meeting);
  const offset = fixedOffset(zone, first.start.getUTCFullYear());
  const startClock = localStamp(first.start, zone).slice(8);
  const excluded = meeting.cancelled.map(
    (date) => `EXDATE;TZID=${zone}:${date.replaceAll("-", "")}${startClock}`,
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeText(details.clubName)}//Website//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`${details.clubName} meetings`)}`,
    "BEGIN:VTIMEZONE",
    `TZID:${zone}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:meetings@${new URL(details.url).host}`,
    `DTSTAMP:${first.start.toISOString().replace(/[-:]|\.\d{3}/g, "")}`,
    `DTSTART;TZID=${zone}:${localStamp(first.start, zone)}`,
    `DTEND;TZID=${zone}:${localStamp(first.end, zone)}`,
    `RRULE:${meetingRRule(meeting)}`,
    ...excluded,
    `SUMMARY:${escapeText(title(details.clubName))}`,
    `LOCATION:${escapeText(location(meeting))}`,
    `DESCRIPTION:${escapeText(description(details))}`,
    `URL:${details.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.flatMap(fold).join("\r\n")}\r\n`;
}
