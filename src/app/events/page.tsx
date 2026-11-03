import type { Metadata } from "next";
import { EventFeature } from "@/components/events/EventFeature";
import { PageHeader } from "@/components/layout/PageHeader";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { renderedAt } from "@/components/meeting/renderedAt";
import { RevealScope } from "@/components/motion/RevealScope";
import { JsonLd, PageBreadcrumb } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { pastEvents, upcomingEvents } from "@/lib/content/events";
import { formatClock } from "@/lib/content/meeting";
import { siteUrl } from "@/lib/site";
import { clubEventJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Special events hosted by Talk-Masters Club in Dubai, beyond its regular Sunday meetings, such as She Leads: a morning on public speaking and leadership.",
  alternates: { canonical: "/events" },
};

/** Plan.md: Events. Special events, coming up first, then the ones the club has hosted. */
export default async function EventsPage() {
  const { events, settings, imageSlots } = content;
  const { meeting } = settings;
  // Split on the server, from a time refreshed hourly: the page is right in its HTML, with no
  // shift when the browser takes over, and an event moves to "past" on its own once it ends.
  const now = new Date(await renderedAt());
  const upcoming = upcomingEvents(events, now);
  const past = pastEvents(events, now);

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Events" path="/events" />
      {events.length > 0 && (
        <JsonLd data={events.map((event) => clubEventJsonLd(event, settings, siteUrl, imageSlots))} />
      )}
      <PageHeader
        title="Beyond the Sunday meeting"
        lead="Besides our meetings on the 2nd and 4th Sunday, Talk-Masters hosts special events, open to members and guests alike. Here is what's coming up, and what we've hosted so far."
        imageSlot="event-featured"
      />

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-title" className="py-section bg-white">
          <div className="container-site">
            <h2 id="upcoming-title" data-reveal="lines" className="text-h2">
              Coming up
            </h2>
            <div className="mt-14 grid gap-24">
              {upcoming.map((event) => (
                <EventFeature key={event.slug} event={event} timeZone={meeting.timeZone} upcoming />
              ))}
            </div>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section aria-labelledby="past-title" className="py-section bg-soft-gray">
          <div className="container-site">
            <h2 id="past-title" data-reveal="lines" className="text-h2">
              Events we&apos;ve hosted
            </h2>
            <div className="mt-14 grid gap-24 md:mt-20">
              {past.map((event) => (
                <EventFeature key={event.slug} event={event} timeZone={meeting.timeZone} upcoming={false} />
              ))}
            </div>
          </div>
        </section>
      )}

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
    </RevealScope>
  );
}
