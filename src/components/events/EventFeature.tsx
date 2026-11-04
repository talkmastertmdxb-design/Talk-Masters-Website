import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";
import { eventDay, eventWhen } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";
import { BentoGallery } from "./BentoGallery";
import { CardFan } from "./CardFan";
import { PerspectiveCarousel } from "./PerspectiveCarousel";

interface EventFeatureProps {
  event: ClubEvent;
  timeZone: string;
  /** Whether it is still to come; past events say when they were held. */
  upcoming: boolean;
  /** The event's own heading level: 2 when it has a band of its own, 3 inside "Coming up". */
  level?: 2 | 3;
}

const slotOf = (id: string) => content.imageSlots.find((slot) => slot.id === id);

/**
 * One special event, told as a chapter: what it was, when and where, the day in a few
 * paragraphs, who took the stage (a fan of the posters that announced them, or the talks in a
 * perspective carousel) and photos from the day in a bento grid. Linkable at /events#slug.
 */
export function EventFeature({ event, timeZone, upcoming, level = 2 }: EventFeatureProps) {
  const when = eventWhen(event, timeZone);
  const titleId = `${event.slug}-title`;
  const Title = level === 2 ? "h2" : "h3";
  const Sub = level === 2 ? "h3" : "h4";
  const [lead, ...story] = event.story ?? [];
  const gallery = event.gallery.flatMap((id) => {
    const slot = slotOf(id);
    return slot?.src ? [{ id, src: slot.src, alt: slot.alt }] : [];
  });

  return (
    <article id={event.slug} aria-labelledby={titleId} className="min-w-0 scroll-mt-28">
      <header className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <p data-reveal="up">
            <span className="border-hairline text-ink-muted inline-flex rounded-full border px-3 py-1 text-sm font-medium">
              {upcoming ? "Coming up" : "Past event"}
            </span>
          </p>
          <Title id={titleId} data-reveal="lines" className="text-display mt-4">
            {event.title}
          </Title>
          {event.tagline && (
            <p data-reveal="up" className="text-maroon mt-5 max-w-[30ch] text-xl font-semibold md:text-2xl">
              {event.tagline}
            </p>
          )}
        </div>

        <dl data-reveal="stagger" className="grid content-end gap-6 md:col-span-5">
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
      </header>

      <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12">
        <p data-reveal="text" className="event-lead md:col-span-7">
          {lead ?? event.summary}
        </p>
        {story.length > 0 && (
          <div className="text-ink-muted grid content-start gap-5 text-lg leading-relaxed md:col-span-5 md:pt-2">
            {story.map((paragraph) => (
              <p key={paragraph} data-reveal="up">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {event.lineup.length > 0 && (
        <section aria-labelledby={`${event.slug}-lineup`} className="mt-24 md:mt-32">
          <Sub id={`${event.slug}-lineup`} data-reveal="up" className="text-h3">
            The line-up
          </Sub>
          <div className="mt-10">
            <CardFan
              label={`${event.title} line-up posters`}
              cards={event.lineup.map((person) => ({
                name: person.name,
                role: person.role,
                note: person.note,
                href: slotOf(person.poster)?.src ?? undefined,
                poster: (
                  <ImageSlot
                    id={person.poster}
                    sizes="(min-width: 56.25rem) 20rem, 60vw"
                    className="shadow-[0_24px_50px_-28px_rgb(11_18_32/0.6)]"
                  />
                ),
              }))}
            />
          </div>
        </section>
      )}

      {event.sessions.length > 0 && (
        <section aria-labelledby={`${event.slug}-sessions`} className="mt-24 md:mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Sub id={`${event.slug}-sessions`} data-reveal="up" className="text-h3">
              On stage
            </Sub>
            <p data-reveal="up" className="text-ink-muted">
              {event.sessions.length} talks, in running order
            </p>
          </div>
          <div className="-mx-(--site-gutter) mt-10">
            <PerspectiveCarousel
              label={`${event.title} talks`}
              cards={event.sessions.map((session) => ({
                key: session.photo,
                photo: <ImageSlot id={session.photo} sizes="(min-width: 56.25rem) 22rem, 72vw" />,
                caption: (
                  <>
                    <span className="block font-serif text-2xl leading-tight">
                      {session.title ?? session.speaker}
                    </span>
                    {session.title && (
                      <span className="text-maroon mt-1 block text-sm font-semibold">{session.speaker}</span>
                    )}
                    {session.note && (
                      <span className="text-ink-muted mt-2 block text-sm">{session.note}</span>
                    )}
                  </>
                ),
              }))}
            />
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section aria-labelledby={`${event.slug}-photos`} className="mt-24 md:mt-32">
          <Sub id={`${event.slug}-photos`} data-reveal="up" className="text-h3">
            Photos from the day
          </Sub>
          <div className="mt-10">
            <BentoGallery
              label={`Photos from ${event.title}`}
              photos={gallery.map((photo, index) => ({
                ...photo,
                tile: (
                  <ImageSlot
                    id={photo.id}
                    sizes={
                      index === 0 ? "(min-width: 56.25rem) 60vw, 100vw" : "(min-width: 56.25rem) 30vw, 50vw"
                    }
                  />
                ),
              }))}
            />
          </div>
        </section>
      )}
    </article>
  );
}
