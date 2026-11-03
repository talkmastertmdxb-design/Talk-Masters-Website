import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";
import { eventDay, eventWhen } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";

interface EventFeatureProps {
  event: ClubEvent;
  timeZone: string;
  /** Whether it is still to come; past events say when they were held. */
  upcoming: boolean;
}

const slotSrc = (id: string): string | undefined => content.imageSlots.find((slot) => slot.id === id)?.src ?? undefined;

/**
 * One special event, told in full: what it was, when and where, who took the stage (with the
 * posters that announced them) and, once added, photos from the day. Linkable at /events#slug.
 */
export function EventFeature({ event, timeZone, upcoming }: EventFeatureProps) {
  const when = eventWhen(event, timeZone);
  const titleId = `${event.slug}-title`;

  return (
    <article id={event.slug} aria-labelledby={titleId} className="min-w-0 scroll-mt-28">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <p data-reveal="up">
            <span className="border-hairline text-ink-muted inline-flex rounded-full border px-3 py-1 text-sm font-medium">
              {upcoming ? "Coming up" : "Past event"}
            </span>
          </p>
          <h3 id={titleId} data-reveal="lines" className="text-h1 mt-6">
            {event.title}
          </h3>
          {event.tagline && (
            <p data-reveal="up" className="text-maroon mt-4 text-xl font-semibold md:text-2xl">
              {event.tagline}
            </p>
          )}
          <p data-reveal="up" className="text-ink-muted mt-6 max-w-[52ch] text-lg leading-relaxed">
            {event.summary}
          </p>
        </div>

        <dl data-reveal="stagger" className="grid content-start gap-6 md:col-span-5 md:pt-14">
          <div className="border-hairline border-t pt-4">
            <dt className="text-ink-muted text-sm">When</dt>
            <dd className="mt-1 font-semibold">
              <time dateTime={event.startsAt}>{eventDay(event, timeZone)}</time>
            </dd>
          </div>
          <div className="border-hairline border-t pt-4">
            <dt className="text-ink-muted text-sm">Time</dt>
            <dd className="mt-1 font-semibold">{when.time}</dd>
          </div>
          <div className="border-hairline border-t pt-4">
            <dt className="text-ink-muted text-sm">Where</dt>
            <dd className="mt-1 font-semibold">{event.venue}</dd>
          </div>
        </dl>
      </div>

      {event.lineup.length > 0 && (
        <section aria-labelledby={`${event.slug}-lineup`} className="mt-16 md:mt-20">
          <h4 id={`${event.slug}-lineup`} data-reveal="up" className="text-h3">
            The line-up
          </h4>
          {/* Phones and tablets swipe through the posters; desktops see them all in a row. */}
          <ul
            data-reveal="stagger"
            className="slider-track relative -mx-(--site-gutter) mt-8 flex snap-x snap-mandatory scroll-px-(--site-gutter) gap-5 overflow-x-auto px-(--site-gutter) pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {event.lineup.map((person) => {
              const full = slotSrc(person.poster);
              const poster = (
                <ImageSlot
                  id={person.poster}
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 72vw"
                  className="rounded-card overflow-hidden shadow-[0_18px_40px_-24px_rgb(11_18_32/0.45)]"
                />
              );
              return (
                <li
                  key={person.poster}
                  className="w-[72vw] max-w-80 shrink-0 snap-start sm:w-[40vw] lg:w-auto"
                >
                  {full ? (
                    <a
                      href={full}
                      target="_blank"
                      rel="noopener"
                      className="rounded-card block transition-transform duration-300 hover:-translate-y-1"
                    >
                      {poster}
                      <span className="sr-only">
                        Open {person.name}&apos;s poster full size (opens in a new tab)
                      </span>
                    </a>
                  ) : (
                    poster
                  )}
                  <p className="text-maroon mt-4 text-sm font-semibold">{person.role}</p>
                  <p className="mt-0.5 text-lg font-semibold">{person.name}</p>
                  {person.note && <p className="text-ink-muted mt-0.5 text-sm">{person.note}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {event.gallery.length > 0 && (
        <section aria-labelledby={`${event.slug}-photos`} className="mt-16 md:mt-20">
          <h4 id={`${event.slug}-photos`} data-reveal="up" className="text-h3">
            Photos from the day
          </h4>
          <ul data-reveal="stagger" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.gallery.map((id) => (
              <li key={id} className="rounded-card overflow-hidden">
                <ImageSlot id={id} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
