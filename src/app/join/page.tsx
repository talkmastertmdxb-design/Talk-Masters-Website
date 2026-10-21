import type { Metadata } from "next";
import { WhatsAppContacts } from "@/components/ui/WhatsAppContacts";
import { content } from "@/lib/content";
import { meetingTimeRange } from "@/lib/content/meeting";

export const metadata: Metadata = {
  title: "Book a guest visit",
  description:
    "Visit a Talk-Masters Club meeting as our guest. It's free, and you only speak if you want to.",
};

/** Until the booking form ships (docs/GROWTH_PLAN.md, G1), guests book on WhatsApp. */
export default function JoinPage() {
  const { meeting, contacts } = content.settings;

  return (
    <main id="main" className="theme-dark footer-glow grain bg-ink relative isolate min-h-dvh text-white">
      <div className="container-site flex min-h-dvh flex-col justify-center py-32">
        <h1 className="text-h1 max-w-[14ch]">Book a guest visit</h1>
        <p className="text-lead mt-8 max-w-[48ch] text-white/80">
          Send us a WhatsApp message and we&apos;ll save you a seat at the next meeting. It&apos;s free, and
          you only speak if you want to.
        </p>
        <dl className="mt-12 grid max-w-xl gap-6 sm:grid-cols-2">
          <div className="border-hairline-dark border-t pt-4">
            <dt className="text-muted text-sm">When</dt>
            <dd className="mt-1">
              {meeting.schedule}
              <br />
              {meetingTimeRange(meeting)}
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
        </dl>
        <h2 className="text-eyebrow mt-14 text-white/70">Message us to book</h2>
        <div className="mt-5">
          <WhatsAppContacts contacts={contacts} variant="buttons" />
        </div>
      </div>
    </main>
  );
}
