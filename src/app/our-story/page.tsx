import { RevealScope } from "@/components/motion/RevealScope";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/media/ImageSlot";
import { FoundersTimeline } from "@/components/sections/FoundersTimeline";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Why Talk-Masters Club was created, the founders who started it, and the journey from an idea to a Toastmasters International club.",
};

/** Plan.md: Founders Story Page. Turns the club from an organisation into a human story. */
export default function OurStoryPage() {
  const { history, founders } = content;

  return (
    <RevealScope as="main" id="main">
      <PageHeader
        title="Every great speaker starts with a single conversation."
        lead="Talk-Masters began the same way: a few people who wanted to speak with confidence, and a room where anyone could practise."
        imageSlot="story-hero"
      />

      <section aria-labelledby="why-title" className="py-section bg-soft-gray">
        <div className="container-site grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <p className="text-eyebrow text-ink-muted">Founded</p>
              <p data-reveal="up" className="text-display mt-4">
                {history.foundedYear}
              </p>
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2 id="why-title" data-reveal="lines" className="text-h2 max-w-[18ch]">
              Why Talk-Masters was created
            </h2>
            <div className="mt-10 flex max-w-[62ch] flex-col gap-6 font-serif text-[1.3125rem] leading-[1.7]">
              {history.why.map((paragraph) => (
                <p key={paragraph} data-reveal="up">
                  {paragraph}
                </p>
              ))}
            </div>
            <div data-reveal="image" className="rounded-card mt-14 overflow-hidden">
              <ImageSlot id="club-history" sizes="(min-width: 900px) 55vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      <FoundersTimeline timeline={history.timeline} />

      {founders.length > 0 && (
        <section aria-labelledby="founders-title" className="py-section bg-white">
          <div className="container-site">
            <h2 id="founders-title" data-reveal="lines" className="text-h2 max-w-[16ch]">
              Meet the founders
            </h2>
            <div className="mt-16 grid gap-x-6 gap-y-20 md:grid-cols-2">
              {founders.map((founder) => (
                <article key={founder.slug} aria-labelledby={`founder-${founder.slug}`}>
                  {founder.imageSlot && (
                    <div data-reveal="image" className="rounded-card overflow-hidden">
                      <ImageSlot id={founder.imageSlot} sizes="(min-width: 900px) 45vw, 100vw" />
                    </div>
                  )}
                  <div data-reveal="up">
                    <h3 id={`founder-${founder.slug}`} className="text-h3 mt-8">
                      {founder.name}
                    </h3>
                    <p className="text-maroon mt-1 text-sm font-semibold">{founder.role}</p>
                    {founder.profession && <p className="text-ink-muted mt-1">{founder.profession}</p>}
                    <div className="text-ink-muted mt-6 flex max-w-[58ch] flex-col gap-4">
                      {founder.story.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <blockquote className="border-gold mt-8 max-w-[40ch] border-l-2 pl-5 font-serif text-2xl leading-snug italic">
                      “{founder.quote}”
                    </blockquote>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="legacy-title" className="py-section bg-soft-gray">
        <div className="container-site text-center">
          <h2 id="legacy-title" className="text-eyebrow text-ink-muted">
            Legacy
          </h2>
          <p data-reveal="up" className="text-h2 mx-auto mt-6 max-w-[24ch]">
            {history.legacy}
          </p>
          <div data-reveal="up" className="mt-10 flex justify-center">
            <ButtonLink href="/members" variant="dark">
              Meet the members carrying it on
            </ButtonLink>
          </div>
        </div>
      </section>
    </RevealScope>
  );
}
