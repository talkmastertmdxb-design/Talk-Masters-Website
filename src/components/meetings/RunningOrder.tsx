import { Coffee } from "lucide-react";
import { content } from "@/lib/content";
import { formatClock } from "@/lib/content/meeting";
import { meetingSpan, sessionSpan } from "@/lib/content/meeting-guide";

/** One colour per session, in running order, so the ribbon and the list read together. */
const SESSION_TONES = [
  "bg-cool-gray text-ink",
  "bg-tm-blue text-white",
  "bg-maroon text-white",
  "bg-gold text-ink",
  "bg-signal-green text-ink",
  "bg-ink text-white",
] as const;

const tone = (index: number): string => SESSION_TONES[index % SESSION_TONES.length]!;

const longDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** A real meeting's agenda: a ribbon of its sessions by length, then every item in order. */
export function RunningOrder() {
  const { example, sessions, roles } = content.meetingGuide;
  const total = meetingSpan(content.meetingGuide);
  const roleName = new Map(roles.map((role) => [role.slug, role.name]));
  const spans = sessions.map((session) => sessionSpan(session));
  const summary = sessions.map((session, i) => `${session.name}, ${spans[i]!.minutes} minutes`).join("; ");

  return (
    <section
      id="running-order"
      data-header="light"
      aria-labelledby="running-order-title"
      className="py-section bg-white"
    >
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              The running order
            </p>
            <h2 id="running-order-title" data-reveal="lines" className="text-h2 mt-5 max-w-[16ch]">
              Meeting #{example.number}, <em className="text-tm-blue">minute by minute.</em>
            </h2>
          </div>
          <p data-reveal="text" className="text-ink-muted max-w-[42ch] md:col-span-5">
            A real agenda, from {longDate(example.date)}. The theme was &ldquo;{example.theme}&rdquo;. Themes
            change every meeting; the shape stays the same.
          </p>
        </div>

        <figure className="mt-14 md:mt-20">
          <div
            role="img"
            aria-label={`${total.minutes} minutes in all: ${summary}.`}
            data-reveal="stagger"
            className="flex h-4 gap-1 md:h-24 md:gap-1.5"
          >
            {sessions.map((session, i) => (
              <div
                key={session.name}
                style={{ flexGrow: spans[i]!.minutes }}
                className={`flex min-w-0 basis-0 flex-col justify-end overflow-hidden rounded-full px-0 md:rounded-2xl md:px-4 md:py-3 ${tone(i)}`}
              >
                <span aria-hidden="true" className="hidden truncate text-sm font-semibold md:block">
                  {session.name}
                </span>
                <span aria-hidden="true" className="hidden text-xs tabular-nums md:block">
                  {spans[i]!.minutes} min
                </span>
              </div>
            ))}
          </div>
          <figcaption className="text-ink-muted mt-4 flex flex-wrap justify-between gap-2 text-sm tabular-nums">
            <span>{formatClock(total.start)}</span>
            <span className="text-ink font-semibold">{total.minutes} minutes, start to finish</span>
            <span>{formatClock(total.end)}</span>
          </figcaption>
        </figure>

        <ol className="mt-16 grid gap-12 md:mt-24 md:gap-24">
          {sessions.map((session, i) => (
            <li key={session.name} className="grid gap-8 md:grid-cols-12 md:gap-x-6">
              <div data-reveal="up" className="md:sticky md:top-28 md:col-span-4 md:self-start">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex size-11 items-center justify-center rounded-full font-serif text-lg ${tone(i)}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-ink-muted text-sm tabular-nums">
                    {formatClock(spans[i]!.start)} – {formatClock(spans[i]!.end)}
                  </span>
                </div>
                <h3 className="text-h3 mt-5">{session.name}</h3>
                <p className="text-ink-muted mt-3 max-w-[34ch]">{session.summary}</p>
              </div>

              <ol data-reveal="stagger" className="md:col-span-8">
                {session.items.map((item) => (
                  <li
                    key={`${item.start}-${item.title}`}
                    className={`border-hairline grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t py-3.5 last:border-b md:grid-cols-[6rem_minmax(0,1fr)_auto] md:gap-x-4 md:py-5 ${
                      item.kind === "break" ? "bg-soft-gray -mx-3 rounded-xl border-transparent px-3" : ""
                    }`}
                  >
                    <span className="text-ink-muted text-sm tabular-nums md:text-base">
                      {formatClock(item.start)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-serif text-[1.125rem] leading-snug md:text-[1.25rem]">
                        {item.kind === "break" && (
                          <Coffee
                            aria-hidden="true"
                            className="text-tm-blue size-4 shrink-0"
                            strokeWidth={1.75}
                          />
                        )}
                        {item.title}
                      </span>
                      {item.role && (
                        <a
                          href={`#role-${item.role}`}
                          className="text-tm-blue hover:text-tm-blue-hover relative mt-1 inline-flex min-h-6 text-sm font-semibold underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-[''] hover:underline"
                        >
                          {roleName.get(item.role)}
                        </a>
                      )}
                    </span>
                    <span
                      className={`text-ink rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                        item.kind === "break" ? "bg-white" : "bg-soft-gray"
                      }`}
                    >
                      {item.minutes} min
                    </span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
