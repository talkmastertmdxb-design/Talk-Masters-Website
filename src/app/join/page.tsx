import type { Metadata } from "next";
import { GuestForm } from "@/components/booking/GuestForm";
import { AddToCalendar } from "@/components/meeting/AddToCalendar";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { UpcomingEvents } from "@/components/meeting/UpcomingEvents";
import { Faq } from "@/components/sections/Faq";
import { WhatsAppContacts } from "@/components/ui/WhatsAppContacts";
import { content } from "@/lib/content";
import { meetingSchedule, meetingTimeRange } from "@/lib/content/meeting";

export const metadata: Metadata = {
  title: "Book a guest visit",
  description:
    "Visit a Talk-Masters Club meeting as our guest. It's free, and you only speak if you want to.",
};

/**
 * Guests book on WhatsApp, the club's most active channel (decided 2026-10-22): the form
 * writes their message and opens WhatsApp with it ready to send to an officer.
 */
export default function JoinPage() {
  const { meeting, contacts } = content.settings;

  return (
    <main id="main" className="theme-dark footer-glow grain bg-ink relative isolate min-h-dvh text-white">
      <div className="container-site pt-24 pb-8 md:pt-28">
        <GuestForm contacts={contacts} meeting={meeting} />

        <dl className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Next meeting</dt>
            <dd className="mt-1">
              <span className="text-gold font-semibold">
                <NextMeetingDate rule={meeting} />
              </span>
              <br />
              {meetingTimeRange(meeting)}
              <br />
              <span className="text-white/70">{meetingSchedule(meeting)}</span>
            </dd>
          </div>
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Where</dt>
            <dd className="mt-1">
              {meeting.venue}, {meeting.city}
              {meeting.mapUrl && (
                <>
                  <br />
                  <a
                    href={meeting.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-gold inline-flex min-h-11 items-center"
                  >
                    Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
                  </a>
                </>
              )}
            </dd>
          </div>
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">Add to your calendar</dt>
            <dd className="mt-1">
              <AddToCalendar />
            </dd>
          </div>
        </dl>

        <h2 className="text-eyebrow mt-14 text-white/70">Rather just say hello?</h2>
        <div className="mt-5">
          <WhatsAppContacts contacts={contacts} variant="buttons" />
        </div>
        <UpcomingEvents events={content.events} timeZone={meeting.timeZone} />
      </div>
      <Faq tone="dark" showContactLink={false} />
    </main>
  );
}
