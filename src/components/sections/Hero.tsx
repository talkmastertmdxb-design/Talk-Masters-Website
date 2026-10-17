import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { CountUp } from "@/components/motion/CountUp";
import { Spotlight } from "@/components/motion/Spotlight";
import { VoiceLine } from "@/components/signature/VoiceLine";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { HeroIntro } from "./HeroIntro";

/** Photos that wipe in during the first-visit intro; the last one is the hero itself. */
const INTRO_FRAMES = ["intro-1", "intro-2", "intro-3", "intro-4", "hero-speaker"] as const;

/** Rolling digit columns for the 00→100% counter (hundreds, tens, ones). */
const DIGITS: ReadonlyArray<readonly string[]> = [
  ["0", "1"],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  [..."01234567890123456789", "0"],
];

/** The Opening (Section 1): one promise, proof in numbers, and the way in. */
export function Hero() {
  const { meeting, stats } = content.settings;

  return (
    <section
      aria-labelledby="hero-title"
      className="theme-dark grain bg-ink relative isolate overflow-hidden text-white"
    >
      <HeroIntro className="relative isolate flex min-h-dvh flex-col">
        {/* Backdrop: the speaker sits right; navy carries the type on the left. */}
        <div data-hero-backdrop className="hero-media absolute inset-0 -z-20">
          <ImageSlot id="hero-speaker" variant="backdrop" tone="full" sizes="100vw" priority />
        </div>
        <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />
        <Spotlight />

        <div className="container-site flex flex-1 flex-col justify-center pt-24 pb-4 md:pt-28">
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
          <p data-hero-item className="text-lead mt-4 max-w-[46ch] text-white/80">
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
          <p data-hero-item className="text-muted mt-4 text-sm">
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
            <blockquote className="font-serif text-lg leading-snug text-white/85 italic">
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

        {/* First-visit intro (html.intro). Decorative; skippable with any key or click. */}
        <div
          data-intro-overlay
          aria-hidden="true"
          className="intro-overlay bg-ink fixed inset-0 z-[70] overflow-hidden"
        >
          <div data-intro-stack className="absolute inset-0">
            {INTRO_FRAMES.map((id) => (
              <div key={id} data-intro-frame className="intro-frame absolute inset-0">
                <ImageSlot id={id} variant="backdrop" tone="full" sizes="80vw" />
                {id === "hero-speaker" && <div className="hero-scrim absolute inset-0 -z-10" />}
              </div>
            ))}
          </div>
          <div data-intro-ui className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex items-end justify-between gap-6">
              <p className="text-eyebrow text-white/60">Talk-Masters Club</p>
              <div className="flex items-end gap-4">
                <p className="text-eyebrow pb-3 text-white/60">Loading</p>
                <p className="intro-counter font-serif tabular-nums">
                  {DIGITS.map((column, i) => (
                    <span key={i} className="intro-digit">
                      <span data-digit className="intro-digit-track">
                        {column.map((digit, j) => (
                          <span key={j} className="block">
                            {digit}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
                  <span className="text-gold">%</span>
                </p>
              </div>
            </div>
            <span data-intro-bar className="bg-gold mt-4 block h-px origin-left" />
          </div>
        </div>
      </HeroIntro>
    </section>
  );
}
