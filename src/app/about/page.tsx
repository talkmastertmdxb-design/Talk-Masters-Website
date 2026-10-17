import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/media/ImageSlot";
import { Awards } from "@/components/sections/Awards";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How Talk-Masters Club began, the founders who started it, and the awards it has won from Toastmasters International.",
};

export default function AboutPage() {
  const { history, founders } = content;

  return (
    <main id="main">
      <PageHeader
        title="Our story"
        lead="How a few people who wanted to speak with confidence started a club for everyone."
      />

      <section aria-labelledby="beginning-title" className="py-section bg-soft-gray">
        <div className="container-site grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <h2 id="beginning-title" className="text-eyebrow text-ink-muted">
                Founded
              </h2>
              <p className="text-display mt-4">{history.foundedYear}</p>
              {history.clubNumber && (
                <p className="text-ink-muted mt-4 text-sm">
                  Club {history.clubNumber}
                  {history.district && `, District ${history.district}`}
                </p>
              )}
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <div className="flex max-w-[62ch] flex-col gap-6 font-serif text-[1.3125rem] leading-[1.7]">
              {history.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ImageSlot id="club-history" sizes="(min-width: 900px) 55vw, 100vw" className="mt-14" />
          </div>
        </div>
      </section>

      {founders.length > 0 && (
        <section aria-labelledby="founders-title" className="py-section bg-white">
          <div className="container-site">
            <h2 id="founders-title" className="text-h2 max-w-[16ch]">
              The people who started it
            </h2>
            <div className="mt-16 grid gap-x-6 gap-y-20 md:grid-cols-2">
              {founders.map((founder) => (
                <article key={founder.slug} aria-labelledby={`founder-${founder.slug}`}>
                  {founder.imageSlot && (
                    <ImageSlot id={founder.imageSlot} sizes="(min-width: 900px) 45vw, 100vw" />
                  )}
                  <h3 id={`founder-${founder.slug}`} className="text-h3 mt-8">
                    {founder.name}
                  </h3>
                  <p className="text-ink-muted mt-1">
                    {founder.role}
                    {founder.occupation && `, ${founder.occupation}`}
                  </p>
                  <blockquote className="mt-6 max-w-[40ch] font-serif text-2xl leading-snug italic">
                    “{founder.quote}”
                  </blockquote>
                  <div className="text-ink-muted mt-6 flex max-w-[58ch] flex-col gap-4">
                    {founder.story.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Awards />
    </main>
  );
}
