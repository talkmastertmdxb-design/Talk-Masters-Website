import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { content } from "@/lib/content";

/**
 * Manifesto (Section 2): who we are, and who it's for. Bento grid of culture cards around
 * a photo (content/culture.json), settling in one after another (Animation 06); the photo
 * drifts with soft parallax (Animation 07). The club's numbers live in the Hero, not here.
 */
export function About() {
  const cards = content.culture;
  const { mission, tagline } = content.settings;
  const isOdd = cards.length % 2 === 1;

  return (
    <section id="about" aria-labelledby="about-title" className="py-section bg-soft-gray">
      <div className="container-site">
        <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
          <p data-reveal="up" className="text-eyebrow text-ink-muted md:col-span-3 md:pt-3">
            About the club
          </p>
          <div className="md:col-span-9">
            <h2
              id="about-title"
              data-reveal="block"
              className="text-h2 max-w-[22ch] [--reveal-block:var(--color-tm-blue)]"
            >
              Talk-Masters is where nervous first words become confident speeches.
            </h2>
            <p data-reveal="text" className="text-lead text-ink-muted mt-8 max-w-[56ch]">
              Students and retirees, engineers and artists, people new to the city and people who&apos;ve
              lived here all their lives. Everyone practises together, and everyone improves at their own
              pace.
            </p>
            <Link
              href="/our-story"
              data-reveal="up"
              className="nav-link text-tm-blue mt-6 inline-flex min-h-11 items-center font-semibold"
            >
              Read how the club began
            </Link>
          </div>
        </div>

        <div
          data-reveal="stagger"
          className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-24 lg:grid-cols-3 lg:grid-rows-3"
        >
          <div className="rounded-panel bg-surface relative isolate overflow-hidden sm:col-span-2 lg:row-span-3">
            <div data-parallax="5" className="absolute inset-x-0 -inset-y-[8%]">
              <ImageSlot
                id="manifesto-bento"
                variant="backdrop"
                tone="full"
                sizes="(min-width: 1280px) 50vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="from-ink/80 via-ink/10 relative flex h-full min-h-80 items-end bg-gradient-to-t to-transparent p-6 text-white">
              <p className="max-w-[28ch] font-serif text-2xl leading-snug">
                Every age. Every background. One room where everyone gets to speak.
              </p>
            </div>
          </div>
          {cards.map((card, index) => (
            <CultureCard
              key={card.title}
              number={index + 1}
              wide={isOdd && index === cards.length - 1}
              {...card}
            />
          ))}
        </div>

        {/* The club's mission, signed with its tagline. */}
        <figure className="border-hairline mt-20 grid gap-y-6 border-t pt-12 md:mt-28 md:grid-cols-12 md:gap-x-6 md:pt-16">
          <p data-reveal="up" className="text-eyebrow text-ink-muted md:col-span-3 md:pt-3">
            Our mission
          </p>
          <div className="md:col-span-9">
            <blockquote>
              <p
                data-reveal="text"
                className="max-w-[34ch] font-serif text-[clamp(1.6rem,1.2rem+1.6vw,2.75rem)] leading-[1.2] tracking-[-0.01em]"
              >
                {mission}
              </p>
            </blockquote>
            <figcaption data-reveal="up" className="mt-8 flex items-center gap-4">
              <span aria-hidden="true" className="bg-tm-blue h-px w-12" />
              <span className="text-eyebrow text-tm-blue">{tagline}</span>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

interface CultureCardProps {
  number: number;
  title: string;
  text: string;
  wide: boolean;
}

function CultureCard({ number, title, text, wide }: CultureCardProps) {
  return (
    <div
      className={`rounded-panel flex min-h-44 flex-col justify-between bg-white p-6 shadow-[0_10px_30px_rgb(0_0_0/0.04)] ${wide ? "sm:col-span-2 lg:col-span-1" : ""}`}
    >
      <p aria-hidden="true" className="text-maroon font-serif text-lg tabular-nums">
        {String(number).padStart(2, "0")}
      </p>
      <div className="mt-8">
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.01em]">{title}</h3>
        <p className="text-ink-muted mt-2">{text}</p>
      </div>
    </div>
  );
}
