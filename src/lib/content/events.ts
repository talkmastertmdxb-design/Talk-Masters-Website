import { clockTime, wallTime } from "./meeting";
import type { ClubEvent } from "./schemas";

/** Events without an end time are shown until this long after they start. */
const DEFAULT_EVENT_MS = 2 * 60 * 60 * 1000;

const endOf = (event: ClubEvent): number =>
  event.endsAt ? Date.parse(event.endsAt) : Date.parse(event.startsAt) + DEFAULT_EVENT_MS;

/** Events that haven't ended yet, soonest first. */
export function upcomingEvents(events: readonly ClubEvent[], now: Date): ClubEvent[] {
  return events
    .filter((event) => endOf(event) > now.getTime())
    .toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/** Events that have ended, most recent first. */
export function pastEvents(events: readonly ClubEvent[], now: Date): ClubEvent[] {
  return events
    .filter((event) => endOf(event) <= now.getTime())
    .toSorted((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
}

/** "Sunday 14 September 2025": the full date, year included, in the club's time zone. */
export function eventDay(event: ClubEvent, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date(event.startsAt))
    .replace(",", "");
}

export interface EventWhen {
  /** "14" */
  day: string;
  /** "Nov" */
  month: string;
  /** "Saturday 14 November" */
  date: string;
  /** "10:30 am – 12:30 pm", or "4:00 pm" with no end time. */
  time: string;
}

function localClock(instant: Date, timeZone: string): string {
  const { hour, minute } = wallTime(instant, timeZone);
  return clockTime(hour * 60 + minute);
}

/** When an event happens, in the club's time zone. */
export function eventWhen(event: ClubEvent, timeZone: string): EventWhen {
  const start = new Date(event.startsAt);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone, ...options }).format(start);
  const startClock = localClock(start, timeZone);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    date: part({ weekday: "long", day: "numeric", month: "long" }).replace(",", ""),
    time: event.endsAt ? `${startClock} – ${localClock(new Date(event.endsAt), timeZone)}` : startClock,
  };
}
