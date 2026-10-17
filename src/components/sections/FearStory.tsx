import { CircleCheck, HeartHandshake, MessageCircle, Mic, Users, Waves, type LucideIcon } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { StickyStory } from "@/components/motion/StickyStory";
import { ButtonLink } from "@/components/ui/Button";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
  imageSlot: string;
}

/** Fear → Prepared Speeches → Table Topics → Evaluations → Leadership (SCROLL_ANIMATION_SYSTEM.md §3). */
const steps: readonly Step[] = [
  {
    icon: Waves,
    title: "Fear",
    body: "Your heart races and your mind goes blank. That's normal, and it's exactly where every member began.",
    imageSlot: "fear-split",
  },
  {
    icon: Mic,
    title: "Prepared Speeches",
    body: "Plan a talk and give it to a friendly room, starting with a short speech about yourself.",
    imageSlot: "agenda-prepared-speeches",
  },
  {
    icon: MessageCircle,
    title: "Table Topics",
    body: "Answer a surprise question for one or two minutes, and learn to think on your feet.",
    imageSlot: "agenda-table-topics",
  },
  {
    icon: HeartHandshake,
    title: "Evaluations",
    body: "After every speech, a fellow member gives kind, specific feedback on what to try next.",
    imageSlot: "agenda-evaluations",
  },
  {
    icon: Users,
    title: "Leadership",
    body: "Run part of the evening as timer, evaluator or host, and practise leading a room.",
    imageSlot: "journey-feature",
  },
];

/** Overcome the Fear (Section 3): reassurance first, then the path from fear to leadership. */
export function FearStory() {
  return (
    <section id="why-join" aria-labelledby="why-join-title" className="bg-white">
      <StickyStory steps={steps.length} className="sticky-story">
        <div className="container-site grid min-h-dvh gap-12 py-24 md:grid-cols-12 md:items-center md:gap-6 md:py-28">
          <div className="md:col-span-6 md:pr-8">
            <p data-reveal="up" className="text-eyebrow text-ink-muted">
              Why join
            </p>
            <h2 id="why-join-title" data-reveal="lines" className="text-h2 mt-5 max-w-[16ch]">
              Nervous about speaking? So was everyone here.
            </h2>
            <p data-reveal="up" className="text-lead text-ink-muted mt-6 max-w-[46ch]">
              Every meeting follows the same friendly structure, so you always know what&apos;s coming next.
            </p>
            <div data-reveal="up" className="mt-8 md:hidden">
              <ButtonLink href="/join" variant="dark">
                Book a guest visit
              </ButtonLink>
            </div>

            <ol data-reveal="stagger" className="relative mt-12 md:mt-10">
              <span aria-hidden="true" className="story-progress" />
              {steps.map(({ icon: Icon, title, body, imageSlot }, index) => (
                <li
                  key={title}
                  data-step={index}
                  className="story-row border-hairline border-t py-5 last:border-b"
                >
                  <div className="flex gap-5">
                    <span className="story-icon bg-soft-gray text-tm-blue inline-flex size-11 shrink-0 items-center justify-center rounded-full">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="story-body text-ink-muted mt-1 text-base">{body}</p>
                    </div>
                  </div>
                  <div className="mt-5 md:hidden">
                    <ImageSlot id={imageSlot} sizes="100vw" />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative hidden md:col-span-6 md:block">
            <div className="story-stage relative">
              {steps.map(({ title, imageSlot }, index) => (
                <div key={title} data-step={index} className="story-panel absolute inset-0">
                  <ImageSlot id={imageSlot} sizes="45vw" className="h-full" />
                </div>
              ))}
            </div>
            <aside className="bg-ink/75 absolute -bottom-6 -left-10 max-w-[19rem] rounded-2xl border border-white/10 p-5 text-white shadow-[0_20px_40px_rgb(11_18_32/0.3)] backdrop-blur-xl">
              <p className="flex items-center gap-2 font-semibold">
                <CircleCheck aria-hidden="true" className="text-gold size-5" strokeWidth={1.75} />
                Guests never have to speak.
              </p>
              <p className="mt-2 text-sm text-white/75">
                Watch your first meeting from the audience. Join in only when you&apos;re ready.
              </p>
            </aside>
          </div>
        </div>
      </StickyStory>
    </section>
  );
}
