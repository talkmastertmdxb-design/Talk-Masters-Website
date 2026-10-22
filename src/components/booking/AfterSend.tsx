import { CalendarPlus } from "lucide-react";
import { singleMeetingCalendar, singleMeetingGoogleUrl, type CalendarDetails } from "@/lib/content/calendar";
import type { MeetingOccurrence } from "@/lib/content/meeting";

interface AfterSendProps {
  contactName: string;
  /** The WhatsApp link, in case the new tab was blocked. */
  url: string;
  calendar: CalendarDetails;
  /** The meeting they chose, or null for "Not sure yet". */
  visit: MeetingOccurrence | null;
  /** "Sunday 25 October" */
  visitLabel: string | null;
}

const button =
  "hover:border-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-4 text-sm font-semibold text-white transition-colors duration-(--duration-quick)";

/**
 * Shown once WhatsApp opens: the moment of commitment is the best time to put the visit in
 * their calendar, so they don't forget. One event, for the date they chose.
 */
export function AfterSend({ contactName, url, calendar, visit, visitLabel }: AfterSendProps) {
  return (
    <div className="rounded-card border-gold/40 border bg-white/[0.04] p-5">
      <p className="font-semibold text-white">Almost there: press send in WhatsApp.</p>
      <p className="text-muted mt-1 text-sm">
        Your message to {contactName} is ready.{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="nav-link text-gold">
          Didn&apos;t open?<span className="sr-only"> Open WhatsApp in a new tab</span>
        </a>
      </p>
      {visit && visitLabel && (
        <>
          <p className="mt-4 text-sm text-white/85">
            Add {visitLabel} to your calendar, so you don&apos;t forget:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={singleMeetingGoogleUrl(calendar, visit)}
              target="_blank"
              rel="noopener noreferrer"
              className={button}
            >
              <CalendarPlus aria-hidden="true" className="size-4" strokeWidth={1.5} />
              Google Calendar<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={`data:text/calendar;charset=utf-8,${encodeURIComponent(singleMeetingCalendar(calendar, visit))}`}
              download={`talk-masters-visit-${visit.date}.ics`}
              className={button}
            >
              <CalendarPlus aria-hidden="true" className="size-4" strokeWidth={1.5} />
              Apple or Outlook
            </a>
          </div>
        </>
      )}
    </div>
  );
}
