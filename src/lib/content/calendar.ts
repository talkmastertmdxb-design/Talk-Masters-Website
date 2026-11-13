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

/**
 * The calendar series starts with the first meeting on or after this date: Sunday 25 October
 * 2026, the first meeting after the "Add to calendar" links went live. Earlier dates would
 * only fill calendars with past meetings.
 */
const SERIES_FROM = "2026-10-25";
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
  /** Practical advice added to the event, e.g. "Arrive from 10:15. Parking is free on Sundays." */
  tips?: string;
}

/** "FREQ=MONTHLY;BYDAY=1SU,3SU". */
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
const description = ({ meeting, url, tips }: CalendarDetails): string =>
  [`${meetingTimeRange(meeting)}.`, tips, `Guests are always welcome. Book your seat: ${url}`]
    .filter(Boolean)
    .join(" ");

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

/** A Google Calendar link for one meeting: the date a guest has chosen. */
export function singleMeetingGoogleUrl(details: CalendarDetails, visit: MeetingOccurrence): string {
  const zone = details.meeting.timeZone;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${title(details.clubName)} (guest visit)`,
    dates: `${localStamp(visit.start, zone)}/${localStamp(visit.end, zone)}`,
    ctz: zone,
    location: location(details.meeting),
    details: description(details),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** RFC 5545 §3.3.11 text escaping. */
export const escapeText = (text: string): string =>
  text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r?\n/g, "\\n");

/** RFC 5545 §3.1: lines longer than 75 octets continue on the next line after a space. */
export function fold(line: string): string[] {
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

/** Wraps one event in a calendar with its time zone; CRLF line endings, folded lines. */
function calendarFile(details: CalendarDetails, name: string, year: number, event: string[]): string {
  const zone = details.meeting.timeZone;
  const offset = fixedOffset(zone, year);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeText(details.clubName)}//Website//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "BEGIN:VTIMEZONE",
    `TZID:${zone}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    ...event,
    `LOCATION:${escapeText(location(details.meeting))}`,
    `DESCRIPTION:${escapeText(description(details))}`,
    `URL:${details.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.flatMap(fold).join("\r\n")}\r\n`;
}

const utcStamp = (instant: Date): string => instant.toISOString().replace(/[-:]|\.\d{3}/g, "");

/** The .ics file for the recurring meeting. Identical on every build, so subscribers see no changes. */
export function meetingCalendar(details: CalendarDetails): string {
  const { meeting } = details;
  const zone = meeting.timeZone;
  const first = seriesStart(meeting);
  const startClock = localStamp(first.start, zone).slice(8);
  return calendarFile(details, `${details.clubName} meetings`, first.start.getUTCFullYear(), [
    `UID:meetings@${new URL(details.url).host}`,
    `DTSTAMP:${utcStamp(first.start)}`,
    `DTSTART;TZID=${zone}:${localStamp(first.start, zone)}`,
    `DTEND;TZID=${zone}:${localStamp(first.end, zone)}`,
    `RRULE:${meetingRRule(meeting)}`,
    ...meeting.cancelled.map((date) => `EXDATE;TZID=${zone}:${date.replaceAll("-", "")}${startClock}`),
    `SUMMARY:${escapeText(title(details.clubName))}`,
  ]);
}

/** An .ics file for one meeting: the date a guest has chosen (Apple Calendar, Outlook). */
export function singleMeetingCalendar(details: CalendarDetails, visit: MeetingOccurrence): string {
  const zone = details.meeting.timeZone;
  return calendarFile(details, `${details.clubName}: your visit`, visit.start.getUTCFullYear(), [
    `UID:guest-${visit.date}@${new URL(details.url).host}`,
    `DTSTAMP:${utcStamp(visit.start)}`,
    `DTSTART;TZID=${zone}:${localStamp(visit.start, zone)}`,
    `DTEND;TZID=${zone}:${localStamp(visit.end, zone)}`,
    `SUMMARY:${escapeText(`${title(details.clubName)} (guest visit)`)}`,
  ]);
}
