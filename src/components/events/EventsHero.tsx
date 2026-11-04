import { ArrowDown } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { eventDay } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";

interface EventsHeroProps {
  /** Events listed under the headline, each linking to its section. */
  events: readonly ClubEvent[];
  timeZone: string;
}

/**
 * The prints laid on the table: where each sits in the collage, how far it tilts, and how far it
 * drifts on scroll. Positions are percentages of the collage box, so it scales as one piece.
 */
const PRINTS = [
  {
    id: "events-collage-panel",
    place: "left-0 top-[8%] w-[62%]",
    tilt: "-rotate-3",
    drift: 4,
    caption: "She Leads",
  },
  { id: "events-collage-selling", place: "right-0 top-0 w-[46%]", tilt: "rotate-[4deg]", drift: 7 },
  { id: "events-collage-why", place: "left-[40%] top-[40%] w-[34%]", tilt: "-rotate-[5deg]", drift: 10 },
  { id: "events-collage-smile", place: "right-[2%] top-[52%] w-[38%]", tilt: "rotate-2", drift: 6 },
  {
    id: "events-collage-laughter",
    place: "left-[4%] bottom-0 w-[50%]",
    tilt: "rotate-[1.5deg]",
    drift: 3,
    caption: "CareerNova",
  },
] as const;

/**
 * Editorial collage hero for /events: the headline and an index of the club's special events
 * on the left, photos from those days laid over one another on the right. The prints settle in
 * one after another on load (the page's one orchestrated moment), then drift apart on scroll.
 */
export function EventsHero({ events, timeZone }: EventsHeroProps) {
  return (
    <section aria-labelledby="events-title" className="events-hero bg-ink overflow-hidden text-white">
      <div className="container-site grid gap-14 pt-32 pb-20 md:pt-40 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28">
        <div className="lg:col-span-5">
          <h1 id="events-title" data-reveal="lines" className="text-display max-w-[11ch]">
            Beyond the Sunday meeting
          </h1>
          <p data-reveal="up" className="text-muted mt-8 max-w-[44ch] text-lg leading-relaxed">
            Besides our meetings on the 2nd and 4th Sunday, Talk-Masters hosts special events, open to members
            and guests alike. Each one is here: who spoke, what was said, and how the day looked.
          </p>
          {events.length > 0 && (
            <nav aria-label="Events on this page" className="mt-12">
              <ul data-reveal="stagger" className="border-hairline-dark border-t">
                {events.map((event) => (
                  <li key={event.slug} className="border-hairline-dark border-b">
                    <a
                      href={`#${event.slug}`}
                      className="group flex items-center justify-between gap-6 py-5 focus-visible:outline-offset-4"
                    >
                      <span>
                        <span className="block font-serif text-2xl leading-tight md:text-3xl">
                          {event.title}
                        </span>
                        <span className="text-gold mt-1 block text-sm">{eventDay(event, timeZone)}</span>
                      </span>
                      <ArrowDown
                        aria-hidden="true"
                        className="text-muted size-5 shrink-0 transition-transform duration-300 group-hover:translate-y-1 group-hover:text-white"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="lg:col-span-7">
          <div
            data-reveal="stagger"
            className="events-collage relative mx-auto aspect-[6/5] w-full max-w-[44rem]"
          >
            {PRINTS.map((print, index) => (
              <div key={print.id} className={`absolute ${print.place}`} style={{ zIndex: index + 1 }}>
                <div data-parallax={print.drift}>
                  <figure className={`events-print ${print.tilt}`}>
                    <ImageSlot
                      id={print.id}
                      priority={index === 0}
                      eager={index > 0}
                      sizes="(min-width: 80rem) 28vw, (min-width: 56.25rem) 34vw, 60vw"
                    />
                    {"caption" in print && (
                      <figcaption className="events-print__caption">{print.caption}</figcaption>
                    )}
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
