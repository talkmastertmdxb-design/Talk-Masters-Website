import { siteUrl } from "@/lib/site";
import type { CalendarDetails } from "./calendar";
import { content } from "./index";

/** Served by src/app/meetings.ics/route.ts. */
export const CALENDAR_FILE = "/meetings.ics";

/** The club's own meeting series, for the calendar links and the .ics file. */
export function clubCalendar(): CalendarDetails {
  const { clubName, meeting } = content.settings;
  return { clubName, meeting, url: new URL("/join", siteUrl).href };
}
