import { ArrowRight } from "lucide-react";
import { StageLight } from "@/components/motion/StageLight";
import { Ladder } from "@/components/pathways/Ladder";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

/**
 * How you'll grow (home page): the five Pathways levels as a ladder that rises into view, the six
 * paths by name, and one clear way on to /pathways (with the quiz as the quick alternative).
 */
export function PathwaysTeaser() {
  const { paths } = content.pathways;

  return (
    <section
      id="pathways"
      aria-labelledby="pathways-title"
      className="theme-dark bg-ink py-section relative isolate overflow-hidden text-white"
    >
      <StageLight preset="teaser" />
      <div className="container-site grid gap-14 md:grid-cols-12 md:items-end md:gap-x-10">
        <div className="md:col-span-5">
          <p data-reveal="up" className="text-eyebrow text-gold">
            Pathways
          </p>
          <h2 id="pathways-title" data-reveal="lines" className="text-h2 mt-5 max-w-[12ch]">
            Five levels. Six paths. Your pace.
          </h2>
          <p data-reveal="text" className="mt-6 max-w-[42ch] text-white/75">
            Your first path is included with membership. Each project is a speech or a meeting role you
            deliver at the club, followed by a fellow member&apos;s evaluation.
          </p>
          <ul
            aria-label="The six paths"
            data-reveal="up"
            className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9375rem] text-white/85"
          >
            {paths.map((path) => (
              <li key={path.slug}>{path.name}</li>
            ))}
          </ul>
          <div
            data-reveal="up"
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <ButtonLink href="/pathways" className="group">
              Explore all {paths.length} pathways
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
              />
            </ButtonLink>
            <ButtonLink href="/pathways#find-your-path" variant="ghost">
              Not sure? Take the 60-second quiz
            </ButtonLink>
          </div>
        </div>

        <Ladder tone="dark" className="md:col-span-7" />
      </div>
    </section>
  );
}
