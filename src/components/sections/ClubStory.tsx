import { ImageSlot } from "@/components/media/ImageSlot";
import type { History } from "@/lib/content/schemas";
import { voicePathVertical } from "@/lib/motion/voice";

interface ClubStoryProps {
  history: Pick<History, "numbers" | "milestones">;
  /** The club today, shown full width under the milestones, with its caption. */
  photo?: { imageSlot: string; caption: string };
}

const connector = voicePathVertical({ width: 40, height: 1000, amplitude: 0.5, phase: 0.4, samples: 180 });

/**
 * The club's story after the founder's: the journey in numbers, then every milestone on the
 * page, connected by the Voice Line, which draws as you scroll.
 */
export function ClubStory({ history, photo }: ClubStoryProps) {
  return (
    <section
      aria-labelledby="club-story-title"
      className="py-section theme-dark grain bg-ink relative isolate text-white"
    >
      <div className="container-site">
        <p className="text-eyebrow text-muted">The club&rsquo;s story</p>
        <h2 id="club-story-title" data-reveal="lines" className="text-h2 mt-4 max-w-[18ch]">
          From twelve friends to a Toastmasters club
        </h2>

        {history.numbers.length > 0 && (
          <dl
            data-reveal="stagger"
            className="border-hairline-dark mt-14 grid grid-cols-2 border-y md:grid-cols-5"
          >
            {history.numbers.map((item) => (
              <div
                key={item.label}
                className="border-hairline-dark flex flex-col border-t py-7 pr-4 first:border-t-0 md:border-t-0 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0 max-md:[&:nth-child(2)]:border-t-0"
              >
                <dt className="text-muted mt-3 text-sm">{item.label}</dt>
                <dd className="text-gold -order-1 font-serif text-[clamp(2.5rem,2rem+1.5vw,3.5rem)] leading-none">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-20 grid gap-12 md:grid-cols-12">
          <div data-draw-scope className="relative md:col-span-8 md:col-start-3">
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
              {history.milestones.map((item) => (
                <li key={item.title} data-reveal="up" className="relative pb-14 pl-16 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="bg-gold ring-ink absolute top-2 left-[15px] size-2.5 rounded-full ring-4"
                  />
                  <p className="text-gold text-sm font-semibold">{item.date}</p>
                  <h3 className="text-h3 mt-1">{item.title}</h3>
                  <p className="mt-3 max-w-[52ch] text-white/75">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {photo && (
          <figure className="mt-20">
            {/* 16/9 keeps the whole group in frame, front row's feet included. */}
            <div data-reveal="image" className="rounded-card overflow-hidden [--slot-ratio:16/9]">
              <ImageSlot id={photo.imageSlot} sizes="(min-width: 1280px) 1200px, 100vw" quality={90} />
            </div>
            <figcaption className="text-muted mt-3 text-sm">{photo.caption}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
