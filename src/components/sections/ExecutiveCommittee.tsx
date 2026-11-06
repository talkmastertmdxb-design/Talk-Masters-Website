import type { CSSProperties } from "react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";
import { shortTerm, splitCommittee } from "@/lib/content/people";
import type { Officer } from "@/lib/content/schemas";

/** Seconds each portrait takes to drift past, so a bigger committee doesn't mean faster sliding. */
const SECONDS_PER_PORTRAIT = 9;

/** "Vice President Education" → "VP Education", so roles stay on one line. */
const shortRole = (role: string): string => role.replace(/^Vice President\b/, "VP");

function Portrait({ officer }: { officer: Officer }) {
  return (
    <li className="w-52 shrink-0 motion-reduce:w-auto motion-reduce:shrink sm:w-60">
      {officer.imageSlot && (
        <ImageSlot id={officer.imageSlot} sizes="(min-width: 640px) 240px, 208px" className="media-zoom" />
      )}
      <p className="mt-4 font-serif text-[1.375rem] leading-tight">{officer.name}</p>
      <p className="text-ink-muted text-sm">{shortRole(officer.role)}</p>
    </li>
  );
}

/**
 * The people who run the room (home page): the committee's portraits drifting slowly past, the
 * President first. Hover pauses the reel; under reduced motion it is a still, wrapped row.
 * Their full statements and stories live on /team.
 */
export function ExecutiveCommittee() {
  const { president, others } = splitCommittee(content.officers);
  const committee = president ? [president, ...others] : others;
  if (committee.length === 0) return null;
  const term = shortTerm(committee[0]!.term);

  // Two identical halves make the loop seamless; the copy is hidden from assistive tech.
  const half = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="committee-reel__half m-0 list-none pl-0">
      {committee.map((officer) => (
        <Portrait key={officer.slug} officer={officer} />
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="committee-title" className="overflow-hidden bg-white py-14 md:py-20">
      <div className="container-site">
        <div className="border-hairline flex flex-col gap-4 border-t pt-10 md:flex-row md:items-end md:justify-between">
          <h2 id="committee-title" data-reveal="lines" className="text-h3 max-w-[18ch]">
            The people who run the room, {term}
          </h2>
          <Link
            href="/team"
            data-reveal="up"
            className="nav-link text-tm-blue inline-flex min-h-11 items-center font-semibold"
          >
            Meet the Executive Committee
          </Link>
        </div>
      </div>
      <div data-reveal="up" className="committee-reel mt-10 md:mt-12">
        <div
          className="committee-reel__track"
          style={{ "--reel-duration": `${committee.length * SECONDS_PER_PORTRAIT}s` } as CSSProperties}
        >
          {half(false)}
          {half(true)}
        </div>
      </div>
    </section>
  );
}
