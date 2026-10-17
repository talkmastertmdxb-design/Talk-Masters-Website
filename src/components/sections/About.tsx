import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { CountUp } from "@/components/motion/CountUp";
import { content } from "@/lib/content";

/** Who we are, and who it's for: everyone. */
export function About() {
  const { stats } = content.settings;

  return (
    <section id="about" aria-labelledby="about-title" className="py-section bg-soft-gray">
      <div className="container-site grid gap-y-10 md:grid-cols-12 md:gap-x-6">
        <p className="text-eyebrow text-ink-muted md:col-span-3 md:pt-3">About the club</p>
        <div className="md:col-span-9">
          <h2 id="about-title" className="text-h2 max-w-[22ch]">
            Talk-Masters is where nervous first words become confident speeches.
          </h2>
          <p className="text-lead text-ink-muted mt-8 max-w-[56ch]">
            Students and retirees, engineers and artists, people new to the city and people who&apos;ve lived
            here all their lives. Everyone practises together, and everyone improves at their own pace.
          </p>
          <Link href="/about" className="nav-link text-tm-blue mt-8 inline-block font-semibold">
            Read how the club began
          </Link>
        </div>

        <div className="mt-6 md:col-span-5 md:mt-16">
          <ImageSlot id="manifesto-bento" sizes="(min-width: 900px) 40vw, 100vw" />
        </div>

        <dl className="grid grid-cols-2 self-end md:col-span-6 md:col-start-7 md:mt-16">
          {stats.map((stat) => (
            <div key={stat.label} className="border-hairline border-t py-6 pr-4">
              <dt className="text-ink-muted text-sm">{stat.label}</dt>
              <dd className="mt-2 font-serif text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tracking-[-0.02em]">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
