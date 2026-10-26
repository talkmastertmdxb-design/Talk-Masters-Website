import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";
import { shortTerm, splitCommittee } from "@/lib/content/people";

/** "Vice President Education" → "VP Education", so seven roles fit one row. */
const shortRole = (role: string): string => role.replace(/^Vice President\b/, "VP");

/**
 * The people who run the room (home page): one row of faces, the President first, each with a
 * link to their member story where they have one. The full committee lives on /team.
 */
export function ExecutiveCommittee() {
  const { president, others } = splitCommittee(content.officers);
  const committee = president ? [president, ...others] : others;
  if (committee.length === 0) return null;
  const term = shortTerm(committee[0]!.term);

  return (
    <section aria-labelledby="committee-title" className="py-section bg-white">
      <div className="container-site">
        <div className="border-hairline flex flex-col gap-4 border-t pt-10 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="committee-title" data-reveal="lines" className="text-h3">
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

        <ul
          data-reveal="stagger"
          className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:grid-cols-7"
        >
          {committee.map((officer) => (
            <li key={officer.slug} className="flex flex-col gap-2">
              {officer.imageSlot && (
                <div className="relative isolate aspect-[4/5] overflow-hidden rounded-lg">
                  <ImageSlot
                    id={officer.imageSlot}
                    variant="backdrop"
                    tone="full"
                    sizes="(min-width: 1280px) 13vw, (min-width: 640px) 23vw, 45vw"
                  />
                </div>
              )}
              <h3 className="font-semibold">{officer.name}</h3>
              <p className="text-ink-muted -mt-2 text-sm">{shortRole(officer.role)}</p>
              {officer.memberSlug && (
                <Link
                  href={`/members#${officer.memberSlug}`}
                  className="nav-link text-tm-blue inline-flex min-h-11 w-fit items-center gap-1 text-sm font-semibold"
                >
                  Read {officer.name}&apos;s story
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
