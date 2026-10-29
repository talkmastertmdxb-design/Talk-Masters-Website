import Link from "next/link";
import { content } from "@/lib/content";
import { shortTerm, splitCommittee } from "@/lib/content/people";

/** "Vice President Education" → "VP Education", so roles stay on one line. */
const shortRole = (role: string): string => role.replace(/^Vice President\b/, "VP");

/**
 * The people who run the room (home page): a slim strip of names and roles, the President first.
 * Photos and stories live on /team; the home page already shows plenty of faces.
 */
export function ExecutiveCommittee() {
  const { president, others } = splitCommittee(content.officers);
  const committee = president ? [president, ...others] : others;
  if (committee.length === 0) return null;
  const term = shortTerm(committee[0]!.term);

  return (
    <section aria-labelledby="committee-title" className="bg-white py-14 md:py-20">
      <div className="container-site">
        <div className="border-hairline grid gap-8 border-t pt-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-4">
            <h2 id="committee-title" data-reveal="lines" className="text-h3 max-w-[18ch]">
              The people who run the room, {term}
            </h2>
            <Link
              href="/team"
              data-reveal="up"
              className="nav-link text-tm-blue mt-4 inline-flex min-h-11 items-center font-semibold"
            >
              Meet the Executive Committee
            </Link>
          </div>

          <ul data-reveal="stagger" className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:col-span-8">
            {committee.map((officer) => (
              <li key={officer.slug} className="flex flex-col">
                <span className="font-serif text-[1.375rem] leading-tight">{officer.name}</span>
                <span className="text-ink-muted text-sm">{shortRole(officer.role)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
