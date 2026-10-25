import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/media/ImageSlot";
import { RevealScope } from "@/components/motion/RevealScope";
import { PathQuiz } from "@/components/pathways/PathQuiz";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pathways",
  description:
    "Toastmasters Pathways at Talk-Masters Club: six learning paths, five levels each, practised at friendly meetings in Dubai. Find the path that fits your goals.",
};

const checkedOn = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Pathways in depth (content/pathways.json): what it is, how it works, every path, and the quiz. */
export default function PathwaysPage() {
  const { intro, facts, levels, paths, quiz, retired, source, journeyLine } = content.pathways;

  return (
    <RevealScope as="main" id="main">
      <PageHeader title="Grow at your own pace" lead={intro} imageSlot="pathways-hero" />

      <section aria-labelledby="facts-title" className="py-section bg-white">
        <div className="container-site">
          <h2 id="facts-title" data-reveal="lines" className="text-h2 max-w-[20ch]">
            Pathways, <em className="text-tm-blue">in a minute.</em>
          </h2>
          <ul data-reveal="stagger" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <li key={fact.title} className="bg-soft-gray rounded-3xl p-6 md:p-7">
                <h3 className="font-serif text-[1.5rem] leading-tight">{fact.title}</h3>
                <p className="text-ink-muted mt-2">{fact.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="levels-title" className="py-section bg-soft-gray">
        <div className="container-site grid gap-y-10 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-4">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              How it works
            </p>
            <h2 id="levels-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
              Five levels. <em className="text-tm-blue">One step at a time.</em>
            </h2>
            <p data-reveal="text" className="text-ink-muted mt-6 max-w-[36ch]">
              Every path follows the same five levels. Each project is a speech or a meeting role you deliver
              at the club, followed by a fellow member&apos;s evaluation.
            </p>
          </div>
          <ol data-reveal="stagger" className="md:col-span-7 md:col-start-6">
            {levels.map((level, index) => (
              <li
                key={level.name}
                className="border-hairline grid grid-cols-[4rem_1fr] gap-4 border-t py-6 last:border-b md:grid-cols-[5.5rem_1fr] md:py-7"
              >
                <span className="text-tm-blue font-serif text-[2.25rem] leading-none md:text-[2.75rem]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-[1.5rem] leading-tight md:text-[1.75rem]">
                    <span className="sr-only">Level {index + 1}: </span>
                    {level.name}
                  </h3>
                  <p className="text-ink-muted mt-2">{level.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="paths-title" className="theme-dark bg-ink py-section text-white">
        <div className="container-site">
          <p data-reveal="up" className="text-eyebrow text-gold">
            The {paths.length} paths
          </p>
          <h2 id="paths-title" data-reveal="lines" className="text-h2 mt-5 max-w-[18ch]">
            Pick the one that fits <em className="text-gold">your goal.</em>
          </h2>
          <ul data-reveal="stagger" className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paths.map((path, index) => (
              <li
                key={path.slug}
                id={path.slug}
                className="flex scroll-mt-28 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-3"
              >
                <ImageSlot
                  id={path.imageSlot}
                  sizes="(min-width: 1280px) 30vw, (min-width: 900px) 45vw, 100vw"
                  className="rounded-2xl"
                />
                <div className="flex flex-1 flex-col px-3 pt-6 pb-4 md:px-5 md:pb-5">
                  <span aria-hidden="true" className="text-gold text-sm tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-serif text-[1.875rem] leading-tight">{path.name}</h3>
                  <p className="mt-3 text-white/78">{path.focus}</p>
                  <p className="mt-5 text-sm text-white/65">
                    <span className="font-semibold text-white">Best for:</span> {path.bestFor}
                  </p>
                  <ul aria-label={`Skills in ${path.name}`} className="mt-5 flex flex-wrap gap-2">
                    {path.skills.map((skill) => (
                      <li key={skill} className="rounded-full border border-white/18 px-3.5 py-1 text-sm">
                        {skill}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-6 text-sm text-white/65">
                    Final project: <span className="text-gold">{path.finalProject}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="find-your-path"
        aria-labelledby="quiz-title"
        className="theme-dark bg-surface py-section scroll-mt-20 text-white"
      >
        <div className="container-site grid gap-y-10 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-4">
            <p data-reveal="up" className="text-eyebrow text-gold">
              Find your path
            </p>
            <h2 id="quiz-title" data-reveal="lines" className="text-h2 mt-5 max-w-[12ch]">
              Two questions. <em className="text-gold">One path.</em>
            </h2>
            <p data-reveal="text" className="mt-6 max-w-[34ch] text-white/72">
              {journeyLine}
            </p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <PathQuiz goals={quiz.goals} places={quiz.places} paths={paths} />
          </div>
        </div>
      </section>

      <section aria-label="About these paths" className="bg-white py-14">
        <div className="container-site text-ink-muted flex flex-col gap-4 text-sm md:flex-row md:items-start md:justify-between md:gap-12">
          <p className="max-w-[70ch]">{retired}</p>
          <p className="shrink-0">
            Source:{" "}
            <a href={source} className="text-tm-blue nav-link" rel="noopener noreferrer" target="_blank">
              toastmasters.org<span className="sr-only"> (opens in a new tab)</span>
            </a>
            , checked {checkedOn(content.pathways.checkedOn)}.
          </p>
        </div>
      </section>
    </RevealScope>
  );
}
