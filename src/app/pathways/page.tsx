import type { Metadata } from "next";
import { ImageSlot } from "@/components/media/ImageSlot";
import { RevealScope } from "@/components/motion/RevealScope";
import { StageLight } from "@/components/motion/StageLight";
import { Ladder } from "@/components/pathways/Ladder";
import { PathQuiz } from "@/components/pathways/PathQuiz";
import { ButtonLink } from "@/components/ui/Button";
import { PageBreadcrumb } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pathways",
  description:
    "Toastmasters Pathways at Talk-Masters Club: six learning paths, five levels each, practised at friendly meetings in Dubai. Find the path that fits your goals.",
  alternates: { canonical: "/pathways" },
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
      <PageBreadcrumb name="Pathways" path="/pathways" />
      {/* Redesign opening: the words and three plain facts beside the ladder. Light, so the header goes light. */}
      <section
        data-header="light"
        aria-labelledby="pathways-title"
        className="bg-white pt-28 pb-16 md:pt-32 md:pb-24"
      >
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              Toastmasters Pathways
            </p>
            <h1 id="pathways-title" data-reveal="lines" className="text-h1">
              Grow at your own pace.
            </h1>
            <p data-reveal="text" className="text-ink-muted max-w-[46ch] text-lg leading-relaxed">
              {intro}
            </p>
            <dl data-reveal="up" className="mt-2">
              {facts.slice(0, 3).map((fact) => (
                <div
                  key={fact.title}
                  className="border-hairline grid gap-1 border-t py-3 last:border-b sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="font-semibold">{fact.title}</dt>
                  <dd className="text-ink-muted">{fact.text}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal="up" className="flex flex-wrap gap-3">
              <ButtonLink href="#find-your-path" variant="dark">
                Find your path in two questions
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-7">
            <Ladder tone="light" detailed heightClass="md:h-[32rem]" />
            <ul
              aria-label="The six paths"
              data-reveal="stagger"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {paths.map((path) => (
                <li key={path.slug}>
                  <a
                    href={`#${path.slug}`}
                    className="bg-soft-gray hover:bg-stone flex min-h-12 items-center rounded-lg px-4 py-3 font-serif text-[1.0625rem] leading-tight transition-colors duration-(--duration-quick)"
                  >
                    {path.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="levels-title" className="py-section bg-soft-gray">
        <div className="container-site grid gap-y-10 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-4">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              How it works
            </p>
            <h2 id="levels-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
              How does Pathways work? <em className="text-tm-blue">Five levels, one step at a time.</em>
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
          {/* Compact cards: a short photo band, then name, focus, skills and the final project. */}
          <ul data-reveal="stagger" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path, index) => (
              <li
                key={path.slug}
                id={path.slug}
                className="flex scroll-mt-28 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-(--duration-quick) hover:border-white/20"
              >
                <div className="relative isolate aspect-[16/7] overflow-hidden">
                  <ImageSlot
                    id={path.imageSlot}
                    variant="backdrop"
                    tone="full"
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline gap-3">
                    <span aria-hidden="true" className="text-gold text-xs font-semibold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif text-[1.375rem] leading-tight">{path.name}</h3>
                  </div>
                  <p className="mt-2 text-[0.9375rem] leading-snug text-white/78">{path.focus}</p>
                  <p className="mt-3 text-[0.8125rem] text-white/70">
                    <span className="font-semibold text-white">Best for:</span> {path.bestFor}
                  </p>
                  <ul aria-label={`Skills in ${path.name}`} className="mt-4 flex flex-wrap gap-1.5">
                    {path.skills.map((skill) => (
                      <li key={skill} className="rounded-full border border-white/18 px-2.5 py-0.5 text-xs">
                        {skill}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-4 text-[0.8125rem] text-white/70">
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
        className="theme-dark bg-surface py-section relative isolate scroll-mt-20 overflow-hidden text-white"
      >
        <StageLight preset="quiz" />
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
