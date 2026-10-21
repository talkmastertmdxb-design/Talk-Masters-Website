import { RevealScope } from "@/components/motion/RevealScope";
import { Award as AwardIcon, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";
import {
  achievementsByYear,
  featuredAward,
  isMemberAchievement,
  levelLabel,
  programmeLabel,
  shortTerm,
} from "@/lib/content/people";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Awards Talk-Masters Club has earned from Toastmasters International, and the contest achievements of its members.",
};

/** Plan.md: Achievements Page. Builds credibility and shows the club's impact. */
export default function AchievementsPage() {
  const { awards, history } = content;
  const featured = featuredAward(awards);
  const clubAwards = awards.filter((award) => !isMemberAchievement(award) && award !== featured);
  const memberAchievements = awards.filter(isMemberAchievement);
  const timeline = achievementsByYear(awards);

  return (
    <RevealScope as="main" id="main">
      <PageHeader
        title="Recognised for growth"
        lead="Awards from Toastmasters International, and the members who have represented the club on bigger stages."
        imageSlot="achievements-hero"
      />

      {featured?.imageSlot && (
        <section aria-labelledby="featured-award-title" className="py-section bg-white">
          <div className="container-site grid items-center gap-12 md:grid-cols-12">
            <div data-reveal="image" className="md:col-span-6 lg:col-span-5">
              <ImageSlot
                id={featured.imageSlot}
                sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 90vw"
              />
            </div>
            <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
              <p data-reveal="up" className="text-eyebrow text-ink-muted">
                Latest recognition
              </p>
              <h2 id="featured-award-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
                {featured.title}
              </h2>
              <p data-reveal="up" className="text-maroon mt-4 font-semibold">
                {history.district ? `District ${history.district}` : `${levelLabel(featured)} level`},{" "}
                {shortTerm(featured.year)}
              </p>
              <p data-reveal="up" className="text-ink-muted mt-6 max-w-[46ch] text-lg">
                {featured.description}
              </p>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="club-awards-title" className="py-section bg-soft-gray">
        <div className="container-site">
          <h2 id="club-awards-title" data-reveal="lines" className="text-h2">
            Club awards
          </h2>
          <ul data-reveal="stagger" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubAwards.map((award) => (
              <li key={award.slug} className="rounded-panel flex flex-col bg-white p-7">
                <AwardIcon aria-hidden="true" className="text-maroon size-7" strokeWidth={1.5} />
                <h3 className="mt-8 font-serif text-2xl">{award.title}</h3>
                <p className="text-ink-muted mt-1 text-sm">
                  {programmeLabel(award)}, {award.year}
                </p>
                <p className="text-ink-muted mt-4">{award.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {memberAchievements.length > 0 && (
        <section aria-labelledby="member-achievements-title" className="py-section bg-white">
          <div className="container-site grid gap-12 md:grid-cols-12">
            <h2
              id="member-achievements-title"
              data-reveal="lines"
              className="text-h2 max-w-[12ch] md:col-span-4"
            >
              Member achievements
            </h2>
            <ul className="md:col-span-8">
              {memberAchievements.map((award) => (
                <li
                  key={award.slug}
                  data-reveal="up"
                  className="border-hairline grid gap-2 border-t py-6 last:border-b sm:grid-cols-[1fr_auto] sm:gap-8"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{award.title}</h3>
                    <p className="text-ink-muted mt-1">{award.recipient}</p>
                    <p className="text-ink-muted mt-3 max-w-[56ch] text-base">{award.description}</p>
                  </div>
                  <p className="text-ink-muted text-sm sm:text-right">
                    {levelLabel(award)} level
                    <br />
                    {award.year}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section
        aria-labelledby="timeline-title"
        className="py-section theme-dark grain bg-ink relative isolate text-white"
      >
        <div className="container-site grid gap-12 md:grid-cols-12">
          <h2 id="timeline-title" data-reveal="lines" className="text-h2 max-w-[10ch] md:col-span-4">
            Achievement timeline
          </h2>
          <div className="md:col-span-8">
            {timeline.map(([year, items]) => (
              <section key={year} aria-label={String(year)} className="mb-16 last:mb-0">
                <h3
                  data-reveal="up"
                  className="text-gold font-serif text-[clamp(3rem,2rem+3vw,5rem)] leading-none"
                >
                  {year}
                </h3>
                <ul className="mt-6">
                  {items.map((award) => (
                    <li
                      key={award.slug}
                      data-reveal="up"
                      className="border-hairline-dark flex gap-4 border-t py-5"
                    >
                      <Trophy
                        aria-hidden="true"
                        className="text-gold mt-1 size-5 shrink-0"
                        strokeWidth={1.5}
                      />
                      <div>
                        <p className="font-semibold">{award.title}</p>
                        <p className="text-muted mt-1 text-sm">
                          {award.recipient ?? "Talk-Masters Club"}, {levelLabel(award)} level
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Impact" className="py-section bg-soft-gray">
        <div className="container-site">
          <blockquote data-reveal="up" className="text-h2 mx-auto max-w-[26ch] text-center">
            “This recognition reflects the commitment, consistency and growth of our members.”
          </blockquote>
        </div>
      </section>
    </RevealScope>
  );
}
