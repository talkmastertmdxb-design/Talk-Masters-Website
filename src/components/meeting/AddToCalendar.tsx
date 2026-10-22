import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl } from "@/lib/content/calendar";
import { CALENDAR_FILE, clubCalendar } from "@/lib/content/club-calendar";

interface AddToCalendarProps {
  /** links: quiet text links; buttons: pill buttons, for where the calendar is a main action. */
  variant?: "links" | "buttons";
}

const styles = {
  links: "nav-link text-gold inline-flex min-h-11 items-center gap-2",
  buttons:
    "hover:border-gold hover:bg-white/[0.04] inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-5 font-semibold text-white transition-colors duration-(--duration-quick)",
} as const;

/** Adds every future meeting (the recurring series) to the visitor's calendar. */
export function AddToCalendar({ variant = "links" }: AddToCalendarProps) {
  const className = styles[variant];
  return (
    <ul
      aria-label="Add the meetings to your calendar"
      className={`flex flex-wrap ${variant === "buttons" ? "gap-3" : "gap-x-6"}`}
    >
      <li>
        <a
          href={googleCalendarUrl(clubCalendar())}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <CalendarPlus aria-hidden="true" className="text-gold size-4" strokeWidth={1.5} />
          Google Calendar<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </li>
      <li>
        <a href={CALENDAR_FILE} download className={className}>
          <CalendarPlus aria-hidden="true" className="text-gold size-4" strokeWidth={1.5} />
          Apple or Outlook (.ics)
        </a>
      </li>
    </ul>
  );
}
