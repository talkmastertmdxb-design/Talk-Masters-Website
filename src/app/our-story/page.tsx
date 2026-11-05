import { RevealScope } from "@/components/motion/RevealScope";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StageLight } from "@/components/motion/StageLight";
import { ClubStory } from "@/components/sections/ClubStory";
import { FounderStory } from "@/components/sections/FounderStory";
import { ButtonLink } from "@/components/ui/Button";
import { PageBreadcrumb } from "@/components/seo/JsonLd";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How Talk-Masters began in 2014 with one nervous minute and twelve friends, told by its founder, Faizal Rahman, and how it grew into a Toastmasters International club.",
  alternates: { canonical: "/our-story" },
};

/** The founder's story first, then the club's: everything on the page, nothing behind a click. */
export default function OurStoryPage() {
  const { history, founders } = content;
  const founder = founders[0];

  return (
    <RevealScope as="main" id="main">
      <PageBreadcrumb name="Our story" path="/our-story" />
      <PageHeader
        title="Every great speaker starts with a single conversation."
        lead={`Talk-Masters began the same way, in ${history.foundedYear}: a few people who wanted to speak with confidence, and a room where anyone could practise.`}
        imageSlot="story-hero"
      />

      {founder && (
        <FounderStory
          founder={founder}
          interlude={{
            afterChapter: 2,
            imageSlot: "statement-fullbleed",
            caption: "From twelve to a full hall: guests of all ages at CareerNova, 29 June 2025.",
          }}
        />
      )}

      <ClubStory
        history={history}
        photo={{ imageSlot: "story-club-group", caption: "Session 80, 10 August 2025." }}
      />

      <section
        aria-labelledby="legacy-title"
        className="py-section bg-soft-gray relative isolate overflow-hidden"
      >
        <StageLight preset="legacy" />
        <div className="container-site text-center">
          <h2 id="legacy-title" className="text-eyebrow text-ink-muted">
            Legacy
          </h2>
          <p data-reveal="up" className="text-h2 mx-auto mt-6 max-w-[24ch]">
            {history.legacy}
          </p>
          <p data-reveal="up" className="text-ink-muted mx-auto mt-6 max-w-[52ch] text-lg">
            Afraid of speaking in front of others, or not sure you&rsquo;re confident enough to begin? This is
            the room for that first step.
          </p>
          <div data-reveal="up" className="mt-10 flex justify-center">
            <ButtonLink href="/join" variant="dark">
              Book a guest visit
            </ButtonLink>
          </div>
        </div>
      </section>
    </RevealScope>
  );
}
