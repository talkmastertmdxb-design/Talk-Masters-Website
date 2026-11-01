import { RevealScope } from "@/components/motion/RevealScope";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { ImageSlot } from "@/components/media/ImageSlot";
import { OfficerCard } from "@/components/people/OfficerCard";
import { TeamOpening } from "@/components/people/TeamOpening";
import { PageBreadcrumb } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";
import { clubFacts, shortTerm, splitCommittee } from "@/lib/content/people";
import { resolveImageSlot } from "@/lib/images/slots";

export const metadata: Metadata = {
  title: "Executive Committee",
  description: "Meet the Talk-Masters Club Executive Committee, the members who lead the club this year.",
  alternates: { canonical: "/team" },
};

const POSTER_SLOT = "excom-poster";

export default function TeamPage() {
  const { president, others } = splitCommittee(content.officers);
  const fullTerm = (president ?? others[0])?.term ?? "";
  const term = shortTerm(fullTerm);
  const poster = resolveImageSlot(content.imageSlots, POSTER_SLOT);
  const facts = clubFacts(content.history);

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Executive Committee" path="/team" />
      <TeamOpening president={president} others={others} facts={facts} />

      <section aria-label="Committee members" className="pb-section bg-white">
        <div
          data-reveal="stagger"
          className="container-site grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {others.map((officer) => (
            <OfficerCard key={officer.slug} officer={officer} showBio />
          ))}
        </div>
      </section>

      {poster.src && (
        <section aria-labelledby="poster-title" className="py-section bg-soft-gray">
          <div className="container-site grid items-center gap-12 md:grid-cols-12">
            <div data-reveal="image" className="md:col-span-5 lg:col-span-4">
              <ImageSlot id={POSTER_SLOT} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw" />
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p data-reveal="up" className="text-eyebrow text-ink-muted">
                The announcement
              </p>
              <h2 id="poster-title" data-reveal="lines" className="text-h2 mt-5">
                EXCOM {term}
              </h2>
              <p data-reveal="up" className="text-ink-muted mt-6 max-w-[44ch] text-lg">
                Share it with anyone who should meet the team, or bring it to your first meeting and say
                hello.
              </p>
              {facts.length > 0 && (
                <ul data-reveal="up" className="mt-8 flex flex-wrap gap-2" aria-label="Club details">
                  {facts.map((fact) => (
                    <li key={fact} className="rounded-full border border-current/15 px-4 py-1.5 text-sm">
                      {fact}
                    </li>
                  ))}
                </ul>
              )}
              <a
                data-reveal="up"
                href={poster.src}
                download={`Talk-Masters-EXCOM-${fullTerm}.webp`}
                className="nav-link mt-8 inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                <Download aria-hidden="true" className="size-4" />
                Download the poster
              </a>
            </div>
          </div>
        </section>
      )}
    </RevealScope>
  );
}
