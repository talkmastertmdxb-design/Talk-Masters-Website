import { meetingCalendar } from "@/lib/content/calendar";
import { clubCalendar } from "@/lib/content/club-calendar";

/** The recurring meeting as an .ics file (Apple Calendar, Outlook). Prerendered at build time. */
export function GET(): Response {
  return new Response(meetingCalendar(clubCalendar()), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="talk-masters-meetings.ics"',
    },
  });
}
