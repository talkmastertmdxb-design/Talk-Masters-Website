import { foundingStageLabels } from "@/lib/content/people";
import type { History } from "@/lib/content/schemas";
import { voicePathVertical } from "@/lib/motion/voice";

interface FoundersTimelineProps {
  timeline: History["timeline"];
}

const connector = voicePathVertical({ width: 40, height: 1000, amplitude: 0.5, phase: 0.4, samples: 180 });

/**
 * Plan.md: Idea → Planning → Club Formation → Chartering → First Meeting →
 * First Achievement → Today, connected by the Voice Line, which draws as you scroll.
 */
export function FoundersTimeline({ timeline }: FoundersTimelineProps) {
  return (
    <section
      aria-labelledby="timeline-title"
      className="py-section theme-dark grain bg-ink relative isolate text-white"
    >
      <div className="container-site grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="timeline-title" data-reveal="lines" className="text-h2 max-w-[12ch] md:sticky md:top-32">
            From an idea to a club
          </h2>
        </div>

        <div data-draw-scope className="relative md:col-span-7 md:col-start-6">
          <svg
            aria-hidden="true"
            viewBox="0 0 40 1000"
            preserveAspectRatio="none"
            className="text-gold absolute top-0 left-0 h-full w-10"
          >
            <path
              d={connector}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-draw
              d={connector}
              pathLength={1}
              strokeDasharray="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative">
            {timeline.map((item) => (
              <li key={item.stage} data-reveal="up" className="relative pb-14 pl-16 last:pb-0">
                <span
                  aria-hidden="true"
                  className="bg-gold ring-ink absolute top-2 left-[15px] size-2.5 rounded-full ring-4"
                />
                <p className="text-muted text-sm">{item.date}</p>
                <h3 className="text-h3 mt-1">{foundingStageLabels[item.stage]}</h3>
                <p className="mt-3 max-w-[52ch] text-white/75">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
