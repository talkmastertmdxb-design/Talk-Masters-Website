import { escapeText, fold } from "../content/calendar";

/** The launch as a calendar event: a 30-minute reminder from the launch moment. */
export interface LaunchEvent {
  clubName: string;
  at: Date;
  /** The site's address, opened from the event. */
  url: string;
}

const EVENT_MINUTES = 30;

const utcStamp = (instant: Date): string => instant.toISOString().replace(/[-:]|\.\d{3}/g, "");
const end = ({ at }: LaunchEvent): Date => new Date(at.getTime() + EVENT_MINUTES * 60_000);
const title = ({ clubName }: LaunchEvent): string => `${clubName}: new website launch`;
const details = ({ url }: LaunchEvent): string => `The new Talk-Masters website opens. Visit ${url}`;

export function launchGoogleUrl(event: LaunchEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(event),
    dates: `${utcStamp(event.at)}/${utcStamp(end(event))}`,
    details: details(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** An .ics file (Apple Calendar, Outlook). UTC times, so no time zone block is needed. */
export function launchCalendar(event: LaunchEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeText(event.clubName)}//Website//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:launch-${utcStamp(event.at)}@${new URL(event.url).host}`,
    `DTSTAMP:${utcStamp(event.at)}`,
    `DTSTART:${utcStamp(event.at)}`,
    `DTEND:${utcStamp(end(event))}`,
    `SUMMARY:${escapeText(title(event))}`,
    `DESCRIPTION:${escapeText(details(event))}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.flatMap(fold).join("\r\n")}\r\n`;
}

/** "Sunday 13 December at 10:30 am", in the club's time zone. */
export function launchDateLine(at: Date, timeZone: string): string {
  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(at);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(at)
    .replace(/\s?(AM|PM)$/, (_, period: string) => ` ${period.toLowerCase()}`);
  return `${day.replace(",", "")} at ${time}`;
}
