import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { content } from "@/lib/content";
import type { Officer } from "@/lib/content/schemas";
import { shortTerm } from "@/lib/content/people";

interface TeamOpeningProps {
  president?: Officer;
  others: readonly Officer[];
  facts: readonly string[];
}

const shortRole = (role: string): string => role.replace(/^Vice President\b/, "VP");

/**
 * /team's first screen (redesign 2026-10-26): the seven faces are the hero. The President takes
 * the tall tile with their story link; everyone else sits in a grid beside them. A light opening,
 * so it asks the header for its light state (data-header).
 */
export function TeamOpening({ president, others, facts }: TeamOpeningProps) {
  const term = shortTerm((president ?? others[0])?.term ?? "");

  return (
    <section
      data-header="light"
      aria-labelledby="team-title"
      className="bg-white pt-28 pb-16 md:pt-32 md:pb-24"
    >
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col justify-between gap-8 lg:col-span-4">
          <div>
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              Executive committee {term}
            </p>
            <h1 id="team-title" data-reveal="lines" className="text-h1 mt-5">
              Seven volunteers. One job: a better room every meeting.
            </h1>
            <p data-reveal="up" className="text-ink-muted mt-6 max-w-[44ch] text-lg leading-relaxed">
              The Executive Committee is the team of volunteers who run {content.settings.clubName}
              {term ? ` for ${term}` : ""}. They plan every meeting, welcome every guest and look after every
              member&apos;s progress. Each of them started where you might be now: in the audience, deciding
              whether to speak.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {facts.length > 0 && (
              <p data-reveal="up" className="text-ink-muted text-sm">
                {facts.join(" · ")}
              </p>
            )}
            <LastUpdated date={content.updates.team} className="text-ink-muted" />
          </div>
        </div>

        <ul
          data-reveal="stagger"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2 lg:col-span-8 lg:h-[clamp(32rem,58vh,40rem)]"
        >
          {president?.imageSlot && (
            <li className="relative isolate col-span-2 aspect-[4/5] overflow-hidden rounded-lg sm:col-span-1 sm:row-span-2 sm:aspect-auto">
              <ImageSlot
                id={president.imageSlot}
                variant="backdrop"
                tone="full"
                sizes="(min-width: 1280px) 18vw, (min-width: 640px) 25vw, 90vw"
                priority
              />
              <div className="absolute inset-x-3 bottom-3 flex flex-col rounded-lg bg-white/92 px-4 py-3">
                <span className="text-ink-muted text-xs font-semibold">Club President, {term}</span>
                <span className="font-serif text-[1.375rem] leading-tight">{president.name}</span>
                {president.memberSlug && (
                  <Link
                    href={`/members#${president.memberSlug}`}
                    className="nav-link text-tm-blue mt-1 inline-flex min-h-11 w-fit items-center gap-1 text-sm font-semibold"
                  >
                    Read {president.name}&apos;s story
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                )}
              </div>
            </li>
          )}
          {others.map((officer) =>
            officer.imageSlot ? (
              <li
                key={officer.slug}
                className="relative isolate aspect-[4/5] overflow-hidden rounded-lg lg:aspect-auto"
              >
                <ImageSlot
                  id={officer.imageSlot}
                  variant="backdrop"
                  tone="full"
                  sizes="(min-width: 1280px) 14vw, (min-width: 640px) 25vw, 45vw"
                />
                <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] rounded-full bg-white/92 px-3 py-1.5 text-[0.8125rem] leading-tight">
                  <span className="font-semibold">{officer.name}</span>
                  <span className="text-ink-muted"> · {shortRole(officer.role)}</span>
                </span>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}
