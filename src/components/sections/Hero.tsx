import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { CountUp } from "@/components/motion/CountUp";
import { Spotlight } from "@/components/motion/Spotlight";
import { VoiceLine } from "@/components/signature/VoiceLine";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { HeroIntro } from "./HeroIntro";

/** The hero photo panel: right side on desktop, full-bleed atmosphere on phones. */
function HeroPhoto({ priority = false, intro = false }: { priority?: boolean; intro?: boolean }) {
  return (
    <>
      <ImageSlot
        id="hero-speaker"
        variant="backdrop"
        tone="full"
        sizes="(min-width: 900px) 58vw, 100vw"
        priority={priority}
      />
      {/* In the intro the grade fades in as the iris opens, so the photo starts vivid. */}
      <div
        aria-hidden="true"
        data-intro-grade={intro || undefined}
        className="hero-panel-fade absolute inset-0"
      />
    </>
  );
}

/** The Opening (Section 1): one promise, proof in numbers, and the way in. */
export function Hero() {
  const { meeting, stats } = content.settings;

  return (
    <section
      aria-labelledby="hero-title"
      className="theme-dark grain bg-ink relative isolate overflow-hidden text-white"
    >
      <HeroIntro className="relative isolate flex min-h-dvh flex-col">
        <div data-hero-backdrop className="hero-panel absolute inset-y-0 right-0 isolate -z-20">
          <HeroPhoto priority />
        </div>
        <Spotlight />

        <div className="container-site relative flex flex-1 flex-col justify-center pt-24 pb-4 md:pt-28">
          <p data-hero-item className="text-eyebrow text-white/70">
            Communicate <span className="text-gold">·</span> Lead <span className="text-gold">·</span> Belong
          </p>
          <h1 id="hero-title" data-hero-reveal className="hero-title mt-5 max-w-[18ch]">
            Find Your Voice.
            <br />
            Lead With <span className="text-gold">Confidence.</span>
            <br />
            Inspire The World.
          </h1>
          {/* The Voice Line signs the headline: silence, then the first word. */}
          <div data-hero-reveal aria-hidden="true" className="text-gold mt-4 w-[min(22rem,70%)]">
            <VoiceLine variant="hero" introDelay={0.5} className="h-10 w-full" />
          </div>
          <p data-hero-item className="text-lead mt-4 max-w-[44ch] text-white/80">
            Talk-Masters Club helps people of every age and background build the confidence to speak, lead and
            be heard, one friendly meeting at a time.
          </p>

          <div data-hero-item className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/join" className="group">
              Join Our Next Meeting
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
              />
            </ButtonLink>
            <Link href="/our-story" className="group inline-flex min-h-12 items-center gap-3 font-semibold">
              <span className="group-hover:border-gold inline-flex size-12 items-center justify-center rounded-full border border-white/40 transition-colors duration-(--duration-quick)">
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </span>
              Read Our Story
            </Link>
          </div>
          <p data-hero-item className="text-muted mt-4 max-w-[52ch] text-sm">
            Next meeting: {meeting.schedule}, {meeting.startTime}, {meeting.venue}. Guests are always welcome.
          </p>

          <dl data-hero-item className="mt-8 grid max-w-2xl grid-cols-2 gap-y-6 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`hero-stat flex flex-col-reverse justify-end border-t border-white/15 pt-4 pr-4 ${index > 0 ? "sm:border-l sm:border-l-white/10 sm:pl-5" : ""}`}
              >
                <dt className="mt-2 text-sm text-white/65">{stat.label}</dt>
                <dd className="font-serif text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-none">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    suffixClassName="text-gold"
                    delay={0.9}
                    start="top bottom"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Quote sits level with the stats; neither adds height to the hero. */}
        <figure
          data-hero-item
          className="container-site pointer-events-none absolute inset-x-0 bottom-16 hidden justify-end lg:flex"
        >
          <div className="max-w-[17rem] text-right">
            <blockquote className="font-serif text-lg leading-snug text-white/90 italic">
              “Every confident speaker was once a nervous first-time guest.”
            </blockquote>
            <span aria-hidden="true" className="bg-gold mt-4 ml-auto block h-px w-12" />
          </div>
        </figure>
        <div
          data-scroll-cue
          aria-hidden="true"
          className="scroll-cue text-eyebrow absolute bottom-8 hidden flex-col items-center gap-3 text-white/55 xl:flex"
        >
          <span className="[writing-mode:vertical-rl]">Scroll to explore</span>
          <span className="scroll-cue-line block h-12 w-px bg-white/40" />
        </div>

        {/* First-visit intro (html.intro). Decorative; any key, click or scroll skips it. */}
        <div
          data-intro-overlay
          aria-hidden="true"
          className="intro-overlay bg-ink fixed inset-0 z-[70] overflow-hidden"
        >
          {/* The iris: opens from a point to exactly the hero photo panel. */}
          <div data-intro-iris className="intro-iris absolute inset-0">
            <div className="hero-panel absolute inset-y-0 right-0 isolate overflow-hidden">
              <div data-intro-zoom className="absolute inset-0">
                <HeroPhoto intro />
              </div>
            </div>
          </div>

          <div data-intro-ui className="absolute inset-0">
            <div className="intro-counter-wrap">
              <span data-intro-count className="intro-count font-serif tabular-nums">
                0
              </span>
            </div>
            <div className="absolute inset-x-6 bottom-16 md:inset-x-10 md:bottom-20">
              <span data-intro-track className="intro-track block">
                <span data-intro-fill className="intro-fill block" />
              </span>
            </div>
            <div className="absolute inset-x-6 bottom-7 flex justify-between md:inset-x-10 md:bottom-9">
              <p data-intro-mark className="text-eyebrow text-white/60">
                Talk-Masters Club
              </p>
              <p data-intro-mark className="text-eyebrow hidden text-white/60 sm:block">
                Communicate <span className="text-gold">·</span> Lead <span className="text-gold">·</span>{" "}
                Belong
              </p>
            </div>
          </div>
        </div>
      </HeroIntro>
    </section>
  );
}
