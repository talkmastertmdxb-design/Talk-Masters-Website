import { OfficerCard } from "@/components/people/OfficerCard";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

/** Plan.md: Executive Committee, immediately before the final CTA. Leadership, humanised. */
export function ExecutiveCommittee() {
  const { officers } = content;
  if (officers.length === 0) return null;

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
        <div data-reveal="stagger" className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
          {officers.map((officer) => (
            <OfficerCard key={officer.slug} officer={officer} />
          ))}
        </div>
      </div>
    </section>
  );
}
