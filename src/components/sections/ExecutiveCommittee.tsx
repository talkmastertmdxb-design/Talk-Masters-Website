import { OfficerCard } from "@/components/people/OfficerCard";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { splitCommittee } from "@/lib/content/people";

/**
 * Plan.md: Executive Committee, immediately before the final CTA. Leadership, humanised:
 * the President leads with their photo and words; the rest of the committee sits beside them.
 */
export function ExecutiveCommittee() {
  const { president, others } = splitCommittee(content.officers);
  if (!president && others.length === 0) return null;

  return (
    <section aria-labelledby="committee-title" className="py-section bg-white">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              Leadership
            </p>
            <h2 id="committee-title" data-reveal="lines" className="text-h2 mt-5 max-w-[16ch]">
              The people who run the room
            </h2>
          </div>
          <div data-reveal="up">
            <ButtonLink href="/team" variant="dark">
              Meet the Executive Committee
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-14 lg:grid-cols-12">
          {president && (
            <div data-reveal="up" className="sm:max-w-md lg:col-span-5 lg:max-w-none">
              <OfficerCard officer={president} size="feature" />
            </div>
          )}
          <div
            data-reveal="stagger"
            className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:col-span-7 lg:self-end"
          >
            {others.map((officer) => (
              <OfficerCard key={officer.slug} officer={officer} size="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
