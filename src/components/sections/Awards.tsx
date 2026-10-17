import { Award as AwardIcon } from "lucide-react";
import { content } from "@/lib/content";
import { awardsByYear, levelLabel, programmeLabel } from "@/lib/content/people";

/** Recognition from Toastmasters International, newest year first, in the editorial metrics style. */
export function Awards() {
  const groups = awardsByYear(content.awards);
  if (groups.length === 0) return null;

  return (
    <section
      id="awards"
      aria-labelledby="awards-title"
      className="theme-dark grain py-section bg-ink relative isolate text-white"
    >
      <div className="container-site grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="awards-title" className="text-h2 max-w-[12ch] md:sticky md:top-32">
            Recognised by Toastmasters International
          </h2>
        </div>

        <div className="md:col-span-8">
          {groups.map(([year, awards]) => (
            <section key={year} aria-label={`Toastmasters year ${year}`} className="mb-16 last:mb-0">
              <h3 className="text-gold font-serif text-[clamp(2.5rem,2rem+2vw,4rem)] leading-none">{year}</h3>
              <ul className="mt-6">
                {awards.map((award) => (
                  <li
                    key={award.slug}
                    className="border-hairline-dark grid gap-2 border-t py-6 sm:grid-cols-[1fr_auto]"
                  >
                    <div className="flex gap-4">
                      <AwardIcon
                        aria-hidden="true"
                        className="text-gold mt-1 size-5 shrink-0"
                        strokeWidth={1.5}
                      />
                      <div>
                        <p className="text-xl font-semibold">{award.title}</p>
                        <p className="mt-2 max-w-[56ch] text-white/70">{award.description}</p>
                        {award.recipient && (
                          <p className="text-muted mt-2 text-sm">Won by {award.recipient}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-muted pl-9 text-sm sm:pl-0 sm:text-right">
                      {programmeLabel(award)}
                      <br />
                      {levelLabel(award)} level
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
