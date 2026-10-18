import { ImageSlot } from "@/components/media/ImageSlot";
import { AgendaScrub } from "@/components/motion/AgendaScrub";
import { agenda } from "@/lib/motion/agenda";
import { voicePath } from "@/lib/motion/voice";

const line = voicePath({ width: 1000, height: 60, amplitude: 0.55, phase: 0.6, samples: 160 });

/** Inside a Meeting (Section 4, signature moment S3): one evening, 7:00 to 8:45. */
export function InsideMeeting() {
  return (
    <section
      id="inside-a-meeting"
      aria-labelledby="inside-title"
      className="theme-dark grain bg-ink relative isolate overflow-hidden text-white"
    >
      <AgendaScrub className="agenda flex min-h-dvh flex-col justify-center py-24 md:py-12">
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal="up" className="text-eyebrow text-muted">
              Inside a meeting
            </p>
            <h2 id="inside-title" data-reveal="lines" className="text-h2 mt-5 max-w-[18ch]">
              What actually happens on the night
            </h2>
          </div>
          <p
            aria-hidden="true"
            className="text-gold hidden font-serif text-[clamp(4rem,3rem+4vw,7.5rem)] leading-none tabular-nums md:block"
          >
            <span data-agenda-clock>{agenda[0]!.time}</span>
            <span className="text-muted ml-3 align-top font-sans text-base">pm</span>
          </p>
        </div>

        <div className="container-site mt-10 md:mt-14">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
            className="text-gold hidden h-10 w-full md:block"
          >
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-agenda-line
              d={line}
              pathLength={1}
              strokeDasharray="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="agenda-line"
            />
          </svg>
        </div>

        <ol
          data-agenda-track
          aria-label="Meeting agenda"
          tabIndex={0}
          className="agenda-track mt-6 flex snap-x snap-mandatory scroll-px-(--site-inset) gap-5 overflow-x-auto px-(--site-inset) pb-4 md:mt-8 md:overflow-visible"
        >
          {agenda.map((item, index) => (
            <li
              key={item.time}
              data-step={index}
              className="agenda-card w-[78vw] shrink-0 snap-start sm:w-[22rem] md:w-[26rem]"
            >
              <ImageSlot id={item.imageSlot} sizes="(min-width: 900px) 26rem, 78vw" />
              <p className="text-gold mt-6 font-serif text-3xl tabular-nums">
                {item.time}
                <span className="sr-only"> pm</span>
              </p>
              <h3 className="text-h3 mt-2">{item.title}</h3>
              <p className="mt-3 max-w-[36ch] text-white/70">{item.body}</p>
            </li>
          ))}
        </ol>
      </AgendaScrub>
    </section>
  );
}
