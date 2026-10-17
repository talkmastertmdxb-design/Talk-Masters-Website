import { CircleCheck, HeartHandshake, Mic, MessageCircle, Users, type LucideIcon } from "lucide-react";
import { ImageSlot } from "@/components/media/ImageSlot";
import { ButtonLink } from "@/components/ui/Button";

interface Practice {
  icon: LucideIcon;
  title: string;
  body: string;
}

const practices: readonly Practice[] = [
  {
    icon: Mic,
    title: "Prepared speeches",
    body: "Plan a talk and deliver it to a friendly room, starting with a short speech about yourself.",
  },
  {
    icon: MessageCircle,
    title: "Table Topics",
    body: "Answer a surprise question for one or two minutes, and learn to think on your feet.",
  },
  {
    icon: HeartHandshake,
    title: "Evaluations",
    body: "After every speech, a fellow member gives kind, specific feedback on what to try next.",
  },
  {
    icon: Users,
    title: "Leadership roles",
    body: "Run part of the evening as timer, evaluator or host, and practise leading a room.",
  },
];

/** Reassurance before ambition: the fear is normal, and the format is gentle. */
export function WhyJoin() {
  return (
    <section id="why-join" aria-labelledby="why-join-title" className="py-section bg-white">
      <div className="container-site grid gap-16 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-6 md:pr-8">
          <p className="text-eyebrow text-ink-muted">Why join</p>
          <h2 id="why-join-title" className="text-h2 mt-5 max-w-[16ch]">
            Nervous about speaking? So was everyone here.
          </h2>
          <p className="text-lead text-ink-muted mt-6 max-w-[46ch]">
            Every meeting follows the same friendly structure, so you always know what&apos;s coming next.
          </p>
          <ButtonLink href="/join" variant="dark" className="mt-8">
            Book a guest visit
          </ButtonLink>

          <ul className="mt-14">
            {practices.map(({ icon: Icon, title, body }) => (
              <li key={title} className="border-hairline flex gap-5 border-t py-6 last:border-b">
                <span className="bg-soft-gray text-tm-blue inline-flex size-11 shrink-0 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-ink-muted mt-1 text-base">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative md:col-span-6 md:self-center">
          <ImageSlot id="fear-split" sizes="(min-width: 900px) 45vw, 100vw" />
          <aside className="bg-ink/70 absolute -bottom-6 left-4 max-w-[19rem] rounded-2xl border border-white/10 p-5 text-white shadow-[0_20px_40px_rgb(11_18_32/0.3)] backdrop-blur-xl md:-left-10">
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
    </section>
  );
}
