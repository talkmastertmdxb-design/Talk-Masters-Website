"use client";

import { eventWhen, upcomingEvents } from "@/lib/content/events";
import type { ClubEvent } from "@/lib/content/schemas";
import { useNow } from "./useNow";

interface UpcomingEventsProps {
  events: readonly ClubEvent[];
  timeZone: string;
}

/**
 * Special events (content/events.json) that haven't happened yet. Rendered after hydration
 * only, so a static page built weeks ago never shows an event that's already over.
 */
export function UpcomingEvents({ events, timeZone }: UpcomingEventsProps) {
  const now = useNow();
  const upcoming = now ? upcomingEvents(events, now) : [];
  if (upcoming.length === 0) return null;

  return (
    <section aria-labelledby="events-title" className="mt-16">
      <h2 id="events-title" className="text-eyebrow text-white/70">
        Also coming up
      </h2>
      <ul className="mt-5 grid max-w-3xl gap-4">
        {upcoming.map((event) => {
          const when = eventWhen(event, timeZone);
          return (
            <li
              key={event.slug}
              className="border-hairline-dark rounded-card flex gap-5 border bg-white/[0.03] p-5 sm:p-6"
            >
              <time
                dateTime={event.startsAt}
                className="border-hairline-dark flex w-16 shrink-0 flex-col items-center justify-center border-r pr-5"
              >
                <span className="font-serif text-3xl leading-none">{when.day}</span>
                <span className="text-gold mt-1 text-sm font-semibold uppercase">{when.month}</span>
              </time>
              <div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="mt-1 text-sm text-white/70">
                  {when.date}, {when.time} · {event.venue}
                </p>
                <p className="mt-3 text-white/80">{event.summary}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
