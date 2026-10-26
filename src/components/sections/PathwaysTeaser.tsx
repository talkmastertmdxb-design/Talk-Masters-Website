import { ArrowRight, Flag, Mic, Sprout, Star, type LucideIcon } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { StageLight } from "@/components/motion/StageLight";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

const stageIcons: readonly LucideIcon[] = [Sprout, Mic, Flag, Star];

/**
 * How you'll grow (home page): the four-stage journey and one clear way on to /pathways (with the
 * quiz as the quick alternative). A taste, not a partial list: every path lives on /pathways.
 */
export function PathwaysTeaser() {
  const { stages, journeyLine, paths } = content.pathways;

  return (
    <section
      id="pathways"
      aria-labelledby="pathways-title"
      className="theme-dark bg-ink py-section relative isolate overflow-hidden text-white"
    >
      <StageLight preset="teaser" />
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div>
            <p data-reveal="up" className="text-eyebrow text-gold">
              Pathways
            </p>
            <h2 id="pathways-title" data-reveal="lines" className="text-h2 mt-5">
              Find your <em className="text-gold">growth path.</em>
            </h2>
          </div>
          <p data-reveal="text" className="text-lead max-w-[44ch] text-white/75">
            Toastmasters Pathways is a learning programme you follow at your own pace, with projects built
            around your goals: confidence, leadership or influence.
          </p>
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12 md:items-center md:gap-6">
          <div className="md:col-span-6">
            <ol aria-label="How members grow" data-reveal="stagger" className="relative flex flex-col gap-7">
              <span
                aria-hidden="true"
                className="from-gold/30 to-gold absolute top-6 bottom-6 left-[1.375rem] w-px bg-gradient-to-b"
              />
              {stages.map((stage, index) => {
                const Icon = stageIcons[index] ?? Star;
                const last = index === stages.length - 1;
                return (
                  <li key={stage.name} className="relative flex gap-5">
                    <span
                      aria-hidden="true"
                      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border ${last ? "bg-gold text-ink border-gold shadow-[0_0_32px_rgb(214_176_106/0.6)]" : "border-gold text-gold bg-ink"}`}
                    >
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.16em] text-white/65">
                        STAGE {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 font-serif text-[1.625rem] leading-tight">{stage.name}</h3>
                      <p className="mt-1 max-w-[36ch] text-white/72">{stage.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p data-reveal="up" className="text-gold mt-10 font-serif text-[1.5rem] leading-snug italic">
              {journeyLine}
            </p>
          </div>
          <figure data-reveal="image" className="md:col-span-5 md:col-start-8">
            <ImageSlot
              id="pathways-leader"
              sizes="(min-width: 900px) 38vw, 100vw"
              className="shadow-[0_30px_80px_rgb(0_0_0/0.45)]"
            />
            <figcaption className="mt-3 text-sm text-white/65">
              Leading a meeting as Toastmaster of the Day: one of the roles you practise.
            </figcaption>
          </figure>
        </div>

        {/* One clear next step: the full Pathways page, with the quiz as the quick alternative. */}
        <div
          data-reveal="up"
          className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:gap-4 md:mt-20"
        >
          <ButtonLink href="/pathways" className="group min-h-14 px-8 text-base">
            Explore all {paths.length} pathways
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
            />
          </ButtonLink>
          <ButtonLink href="/pathways#find-your-path" variant="ghost" className="min-h-14 px-7">
            Not sure? Take the 60-second quiz
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
