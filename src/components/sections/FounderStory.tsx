import { Fragment } from "react";
import { ImageSlot } from "@/components/media/ImageSlot";
import type { Founder } from "@/lib/content/schemas";

interface FounderStoryProps {
  founder: Founder;
  /** A photo set full width after this chapter (1-based), with its caption. */
  interlude?: { afterChapter: number; imageSlot: string; caption: string };
}

/**
 * The founder's story, told in full on the page: the portrait stays beside the reading on
 * wide screens, each chapter has a date label, and pull quotes break the reading.
 * Nothing hides behind a click.
 */
export function FounderStory({ founder, interlude }: FounderStoryProps) {
  return (
    <section aria-labelledby="founder-title" className="py-section bg-white">
      <div className="container-site grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            {founder.imageSlot && (
              <div data-reveal="image" className="rounded-card max-w-sm overflow-hidden">
                <ImageSlot id={founder.imageSlot} sizes="(min-width: 900px) 24rem, 100vw" />
              </div>
            )}
            <p className="text-h3 mt-6">{founder.name}</p>
            <p className="text-maroon mt-1 text-sm font-semibold">{founder.role}, Talk-Masters</p>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <p className="text-eyebrow text-ink-muted">The founder&rsquo;s story</p>
          <h2 id="founder-title" data-reveal="lines" className="text-h2 mt-4 max-w-[16ch]">
            From one minute of fear to a movement
          </h2>
          {founder.byline && <p className="text-ink-muted mt-5">{founder.byline}</p>}

          {founder.chapters.map((chapter, index) => (
            <Fragment key={chapter.title}>
              <article
                aria-labelledby={`chapter-${index + 1}`}
                className="border-hairline mt-16 border-t pt-10"
              >
                <p className="text-maroon text-sm font-semibold tracking-[0.14em] uppercase">
                  {chapter.label}
                </p>
                <h3 id={`chapter-${index + 1}`} className="text-h3 mt-2">
                  {chapter.title}
                </h3>
                <div className="text-ink mt-6 flex max-w-[62ch] flex-col gap-5 font-serif text-[1.25rem] leading-[1.7]">
                  {chapter.paragraphs.map((paragraph) => (
                    <p key={paragraph} data-reveal="up">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {chapter.pullQuote && (
                  <blockquote
                    data-reveal="up"
                    className="border-gold mt-12 max-w-[24ch] border-l-2 pl-6 font-serif text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] leading-[1.2] italic"
                  >
                    &ldquo;{chapter.pullQuote}&rdquo;
                  </blockquote>
                )}
              </article>

              {interlude && interlude.afterChapter === index + 1 && (
                <figure className="mt-16">
                  <div data-reveal="image" className="rounded-card overflow-hidden">
                    <ImageSlot id={interlude.imageSlot} sizes="(min-width: 900px) 55vw, 100vw" />
                  </div>
                  <figcaption className="text-ink-muted mt-3 text-sm">{interlude.caption}</figcaption>
                </figure>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
