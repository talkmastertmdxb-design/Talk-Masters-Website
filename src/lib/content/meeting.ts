import { WEEKDAYS, type Settings } from "./schemas";

type MeetingTimes = Pick<Settings["meeting"], "startTime" | "durationMinutes">;

/** Everything needed to work out when meetings happen. */
export type MeetingRule = Pick<
  Settings["meeting"],
  "weekday" | "weeksOfMonth" | "startTime" | "durationMinutes" | "timeZone" | "cancelled"
>;

export interface MeetingOccurrence {
  /** The club's calendar date, e.g. "2026-11-07". */
  date: string;
  start: Date;
  end: Date;
}

const MINUTES_PER_DAY = 24 * 60;
const MS_PER_MINUTE = 60_000;
/** Far enough to get past any run of cancellations, near enough to stay cheap. */
const SEARCH_MONTHS = 24;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"] as const;

/** 630 → "10:30 am", 750 → "12:30 pm". */
export function clockTime(totalMinutes: number): string {
  const minutes = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(minutes / 60);
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes % 60).padStart(2, "0")} ${hours < 12 ? "am" : "pm"}`;
}

function startMinutes(startTime: string): number {
  const [hours, minutes] = startTime.split(":").map(Number);
  return hours! * 60 + minutes!;
}

/** The meeting's start and end for display, e.g. "10:30 am – 12:30 pm". */
export function meetingTimeRange({ startTime, durationMinutes }: MeetingTimes): string {
  const start = startMinutes(startTime);
  return `${clockTime(start)} – ${clockTime(start + durationMinutes)}`;
}

const capitalise = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** [1, 3] Sunday → "1st & 3rd Sunday of every month" (long) / "1st & 3rd Sun" (short). */
export function meetingSchedule(
  { weekday, weeksOfMonth }: Pick<MeetingRule, "weekday" | "weeksOfMonth">,
  style: "long" | "short" = "long",
): string {
  const weeks = weeksOfMonth.toSorted((a, b) => a - b).map((week) => ORDINALS[week - 1]);
  const list = weeks.length > 1 ? `${weeks.slice(0, -1).join(", ")} & ${weeks.at(-1)}` : weeks[0];
  const day = capitalise(weekday);
  return style === "short" ? `${list} ${day.slice(0, 3)}` : `${list} ${day} of every month`;
}

interface WallTime {
  year: number;
  /** 1-12. */
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function wallFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  formatters.set(timeZone, formatter);
  return formatter;
}

/** What a clock in `timeZone` shows at `instant`. */
export function wallTime(instant: Date, timeZone: string): WallTime {
  const parts = Object.fromEntries(
    wallFormatter(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year!,
    month: parts.month!,
    day: parts.day!,
    hour: parts.hour!,
    minute: parts.minute!,
  };
}

/** The instant a clock in `timeZone` shows the given wall time. */
export function zonedInstant(wall: WallTime, timeZone: string): Date {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const seen = wallTime(new Date(guess), timeZone);
  const offset = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute) - guess;
  return new Date(guess - offset);
}

export const isoDate = ({ year, month, day }: Pick<WallTime, "year" | "month" | "day">): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Day of the month of the nth `weekday` (0 = Sunday), or null when the month has no such day. */
function nthWeekday(year: number, month: number, weekday: number, nth: number): number | null {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth ? day : null;
}

/** The meetings in one month, in date order (cancellations included). */
function monthOccurrences(rule: MeetingRule, year: number, month: number): MeetingOccurrence[] {
  const weekday = WEEKDAYS.indexOf(rule.weekday);
  const minutes = startMinutes(rule.startTime);
  return rule.weeksOfMonth
    .map((week) => nthWeekday(year, month, weekday, week))
    .filter((day): day is number => day !== null)
    .toSorted((a, b) => a - b)
    .map((day) => {
      const wall = { year, month, day, hour: Math.floor(minutes / 60), minute: minutes % 60 };
      const start = zonedInstant(wall, rule.timeZone);
      return {
        date: isoDate(wall),
        start,
        end: new Date(start.getTime() + rule.durationMinutes * MS_PER_MINUTE),
      };
    });
}

/**
 * The next `count` meetings that haven't finished yet: today's meeting counts until it ends.
 * Cancelled dates are skipped. Searches two years ahead at most.
 */
export function upcomingMeetings(rule: MeetingRule, now: Date, count: number): MeetingOccurrence[] {
  const today = wallTime(now, rule.timeZone);
  const cancelled = new Set(rule.cancelled);
  const found: MeetingOccurrence[] = [];
  for (let offset = 0; offset < SEARCH_MONTHS && found.length < count; offset++) {
    const monthIndex = today.month - 1 + offset;
    const year = today.year + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const open = monthOccurrences(rule, year, month).filter(
      (meeting) => meeting.end > now && !cancelled.has(meeting.date),
    );
    found.push(...open.slice(0, count - found.length));
  }
  return found;
}

/** The next meeting that hasn't finished yet, or null if none is scheduled in the next two years. */
export function nextMeeting(rule: MeetingRule, now: Date): MeetingOccurrence | null {
  return upcomingMeetings(rule, now, 1)[0] ?? null;
}

/** Whole days from `now` to `start`, by the club's calendar (not 24-hour periods). */
function daysUntil(start: Date, timeZone: string, now: Date): number {
  const dayNumber = (instant: Date) => {
    const { year, month, day } = wallTime(instant, timeZone);
    return Date.UTC(year, month - 1, day) / (MINUTES_PER_DAY * MS_PER_MINUTE);
  };
  return dayNumber(start) - dayNumber(now);
}

/** "Sunday 1 November" (long) / "Sun 1 Nov" (short), on the club's calendar. */
export function formatMeetingDate(start: Date, timeZone: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: style, day: "numeric", month: style })
    .format(start)
    .replace(",", "");
}

/** "Today", "Tomorrow", or the date: "Sunday 1 November" (long) / "Sun 1 Nov" (short). */
export function meetingDayLabel(
  start: Date,
  timeZone: string,
  now: Date,
  style: "long" | "short" = "long",
): string {
  const days = daysUntil(start, timeZone, now);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatMeetingDate(start, timeZone, style);
}
