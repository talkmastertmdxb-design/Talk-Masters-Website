import type { Metadata } from "next";
import { EventFeature } from "@/components/events/EventFeature";
import { EventsHero } from "@/components/events/EventsHero";
import { GalleryTeaser } from "@/components/events/GalleryTeaser";
import { MeetingsBand } from "@/components/events/MeetingsBand";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { renderedAt } from "@/components/meeting/renderedAt";
import { RevealScope } from "@/components/motion/RevealScope";
import { JsonLd, PageBreadcrumb } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { pastEvents, upcomingEvents } from "@/lib/content/events";
import { isMeeting } from "@/lib/content/gallery";
import { formatClock } from "@/lib/content/meeting";
import { siteUrl } from "@/lib/site";
import { clubEventJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Special events hosted by Talk-Masters Club in Dubai, beyond its regular Sunday meetings: She Leads, a morning on public speaking and leadership, and CareerNova, a career workshop.",
  alternates: { canonical: "/events" },
};

/** Plan.md: Events. Special events, coming up first, then the ones the club has hosted. */
export default async function EventsPage() {
  const { events, settings, imageSlots } = content;
  const { meeting } = settings;
  // Split on the server, from a time refreshed hourly: the page is right in its HTML, with no
  // shift when the browser takes over, and an event moves to "past" on its own once it ends.
  const now = new Date(await renderedAt());
  const special = events.filter((event) => !isMeeting(event));
  const upcoming = upcomingEvents(special, now);
  const past = pastEvents(special, now);
  // Sunday meetings with photos get a band of their own, after the special events.
  const meetings = pastEvents(events.filter(isMeeting), now).filter((event) => event.gallery.length > 0);
  const teaser = [
    "she-leads-audience",
    "meeting-2025-07-13-j365",
    "careernova-group",
    "meeting-2025-08-10-a309",
    "she-leads-token",
    "meeting-2025-07-13-j480",
  ];

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Events" path="/events" />
      {events.length > 0 && (
        <JsonLd data={events.map((event) => clubEventJsonLd(event, settings, siteUrl, imageSlots))} />
      )}
      <EventsHero
        events={[...upcoming, ...past]}
        meetings={meetings.toReversed()}
        timeZone={meeting.timeZone}
      />

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-title" className="py-section overflow-x-clip bg-white">
          <div className="container-site">
            <h2 id="upcoming-title" data-reveal="lines" className="text-h2">
              Coming up
            </h2>
            <div className="mt-14 grid gap-24">
              {upcoming.map((event) => (
                <EventFeature key={event.slug} event={event} timeZone={meeting.timeZone} upcoming level={3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Each past event is a chapter of its own, on alternating bands. */}
      {past.map((event, index) => (
        <div
          key={event.slug}
          className={`py-section overflow-x-clip ${index % 2 === 0 ? "bg-white" : "bg-soft-gray"}`}
        >
          <div className="container-site">
            <EventFeature event={event} timeZone={meeting.timeZone} upcoming={false} />
          </div>
        </div>
      ))}

      <MeetingsBand meetings={meetings} timeZone={meeting.timeZone} />

      {upcoming.length === 0 && (
        <section aria-labelledby="next-title" className="py-section bg-white">
          <div className="container-site grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <h2 id="next-title" data-reveal="lines" className="text-h2 max-w-[18ch]">
                No special event announced yet. Our meetings never stop.
              </h2>
              <p data-reveal="up" className="text-ink-muted mt-6 max-w-[52ch] text-lg">
                The next meeting is{" "}
                <span className="text-ink font-semibold">
                  <NextMeetingDate rule={meeting} />
                </span>{" "}
                at {formatClock(meeting.startTime)}, {meeting.venue}. Guests are always welcome.
              </p>
            </div>
            <div data-reveal="up" className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
              <ButtonLink href="/join">Book a guest visit</ButtonLink>
            </div>
          </div>
        </section>
      )}

      <GalleryTeaser photos={teaser} />
    </RevealScope>
  );
}
