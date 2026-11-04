import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { eventDay } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";

interface MeetingsBandProps {
  /** Sunday meetings with photos, most recent first. */
  meetings: readonly ClubEvent[];
  timeZone: string;
}

/**
 * /events, between the special events: a dark band with one card per Sunday meeting, its best
 * photo large and three more beneath, and a link to all of its photos in the Gallery.
 */
export function MeetingsBand({ meetings, timeZone }: MeetingsBandProps) {
  if (meetings.length === 0) return null;

  return (
    <section
      id="meetings"
      aria-labelledby="meetings-title"
      className="py-section theme-dark bg-ink scroll-mt-20 text-white"
    >
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 id="meetings-title" data-reveal="lines" className="text-h1 max-w-[14ch] md:col-span-7">
            From our Sunday meetings
          </h2>
          <p data-reveal="up" className="text-muted max-w-[44ch] text-lg md:col-span-5">
            Between the big events, the club meets on the 2nd and 4th Sunday. Here are some of those mornings,
            as the camera saw them.
          </p>
        </div>

        <div data-reveal="stagger" className="mt-14 grid gap-8 md:mt-16 lg:grid-cols-2">
          {meetings.map((meeting) => {
            const [lead, ...rest] = meeting.gallery;
            const photoCount = (meeting.album.length > 0 ? meeting.album : meeting.gallery).length;
            const titleId = `${meeting.slug}-title`;
            return (
              <article
                key={meeting.slug}
                id={meeting.slug}
                aria-labelledby={titleId}
                className="meeting-card scroll-mt-24"
              >
                <div className="meeting-card__photos">
                  {lead && (
                    <ImageSlot
                      id={lead}
                      sizes="(min-width: 80rem) 36rem, (min-width: 56.25rem) 46vw, 92vw"
                      className="meeting-card__lead"
                    />
                  )}
                  {rest.slice(0, 3).map((id) => (
                    <ImageSlot key={id} id={id} sizes="(min-width: 56.25rem) 12rem, 30vw" />
                  ))}
                </div>
                <div className="px-2 pt-6 pb-2">
                  <p className="text-gold text-sm font-semibold">
                    <time dateTime={meeting.startsAt}>{eventDay(meeting, timeZone)}</time>
                  </p>
                  <h3 id={titleId} className="mt-1.5 font-serif text-[2rem] leading-tight">
                    {meeting.title}
                    {meeting.tagline && <span className="text-muted">: {meeting.tagline}</span>}
                  </h3>
                  <p className="text-muted mt-3 max-w-[56ch] leading-relaxed">{meeting.summary}</p>
                  <Link
                    href={`/gallery?from=${meeting.slug}`}
                    className="text-gold group mt-5 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline"
                  >
                    See all {photoCount} photos
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
