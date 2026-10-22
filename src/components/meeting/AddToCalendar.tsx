import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl } from "@/lib/content/calendar";
import { CALENDAR_FILE, clubCalendar } from "@/lib/content/club-calendar";

const linkClass = "nav-link text-gold inline-flex min-h-11 items-center gap-2";

/** Adds every future meeting (the recurring series) to the visitor's calendar. */
export function AddToCalendar() {
  return (
    <ul aria-label="Add the meetings to your calendar" className="flex flex-wrap gap-x-6">
      <li>
        <a
          href={googleCalendarUrl(clubCalendar())}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <CalendarPlus aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Google Calendar<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </li>
      <li>
        <a href={CALENDAR_FILE} download className={linkClass}>
          <CalendarPlus aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Apple or Outlook (.ics)
        </a>
      </li>
    </ul>
  );
}
