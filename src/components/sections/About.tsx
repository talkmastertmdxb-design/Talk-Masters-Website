import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { CountUp } from "@/components/motion/CountUp";
import { content } from "@/lib/content";

/**
 * Manifesto (Section 2): who we are, and who it's for. Bento grid of stat / photo /
 * stat / stat cards that settle in one after another (Animation 06); the photo
 * drifts with soft parallax (Animation 07).
 */
export function About() {
  const { stats } = content.settings;
  const [first, ...rest] = stats;

  return (
    <section id="about" aria-labelledby="about-title" className="py-section bg-soft-gray">
      <div className="container-site">
        <div className="grid gap-y-8 md:grid-cols-12 md:gap-x-6">
          <p data-reveal="up" className="text-eyebrow text-ink-muted md:col-span-3 md:pt-3">
            About the club
          </p>
          <div className="md:col-span-9">
            <h2 id="about-title" data-reveal="lines" className="text-h2 max-w-[22ch]">
              Talk-Masters is where nervous first words become confident speeches.
            </h2>
            <p data-reveal="up" className="text-lead text-ink-muted mt-8 max-w-[56ch]">
              Students and retirees, engineers and artists, people new to the city and people who&apos;ve
              lived here all their lives. Everyone practises together, and everyone improves at their own
              pace.
            </p>
            <Link
              href="/our-story"
              data-reveal="up"
              className="nav-link text-tm-blue mt-8 inline-block font-semibold"
            >
              Read how the club began
            </Link>
          </div>
        </div>

        <div
          data-reveal="stagger"
          className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-24 lg:grid-cols-4 lg:grid-rows-2"
        >
          {first && <StatCard {...first} />}
          <div className="rounded-panel bg-surface relative isolate overflow-hidden sm:row-span-2 lg:col-span-2 lg:row-span-2">
            <div data-parallax="5" className="absolute inset-x-0 -inset-y-[8%]">
              <ImageSlot
                id="manifesto-bento"
                variant="backdrop"
                sizes="(min-width: 1280px) 50vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="from-ink/80 via-ink/10 relative flex h-full min-h-80 items-end bg-gradient-to-t to-transparent p-6 text-white">
              <p className="max-w-[28ch] font-serif text-2xl leading-snug">
                Every age. Every background. One room where everyone gets to speak.
              </p>
            </div>
          </div>
          {rest.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  suffix: string;
}

function StatCard({ label, value, suffix }: StatCardProps) {
  return (
    <div className="rounded-panel flex min-h-44 flex-col justify-between bg-white p-6 shadow-[0_10px_30px_rgb(0_0_0/0.04)]">
      <p className="text-ink-muted text-sm">{label}</p>
      <p className="mt-6 font-serif text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tracking-[-0.02em]">
        <CountUp value={value} suffix={suffix} />
      </p>
    </div>
  );
}
