import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ImageSlot } from "@/components/media/ImageSlot";
import { NextMeetingDate } from "@/components/meeting/NextMeetingDate";
import { CountUp } from "@/components/motion/CountUp";
import { Spotlight } from "@/components/motion/Spotlight";
import { VoiceLine } from "@/components/signature/VoiceLine";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { meetingTimeRange } from "@/lib/content/meeting";
import { HeroIntro } from "./HeroIntro";
import { HeroSlideshow } from "./HeroSlideshow";

const PHOTO_SIZES = "(min-width: 900px) 58vw, 100vw";
/** Group photos show compression in every small face, so the hero is served sharper. */
const HERO_QUALITY = 90;

/** The intro's copy of the first hero photo. The grade fades in as the iris opens, so it starts vivid. */
function IntroPhoto({ id }: { id: string }) {
  return (
    <>
      {/* Same URL as the first slide, and it is the LCP image while the intro plays. */}
      <ImageSlot id={id} variant="backdrop" tone="full" sizes={PHOTO_SIZES} quality={HERO_QUALITY} priority />
      <div aria-hidden="true" data-intro-grade className="hero-panel-fade absolute inset-0" />
    </>
  );
}

/** The Opening (Section 1): one promise, proof in numbers, and the way in. */
export function Hero() {
  const { meeting, stats, heroSlides } = content.settings;
  // Right side on desktop, full-bleed atmosphere on phones; rotates through the club's photos.
  // Later slides load eagerly too: each becomes the largest image on screen when it rotates in.
  const slides = heroSlides.map((id, index) => (
    <ImageSlot
      key={id}
      id={id}
      variant="backdrop"
      tone="full"
      sizes={PHOTO_SIZES}
      quality={HERO_QUALITY}
      priority={index === 0}
      eager={index > 0}
    />
  ));

  return (
    <section
      aria-labelledby="hero-title"
      className="theme-dark grain bg-ink relative isolate overflow-hidden text-white"
    >
      <HeroIntro className="relative isolate flex min-h-dvh flex-col">
        {/* Spotlight measures its parent, so it stays a direct child of the hero (not inside the slideshow). */}
        <Spotlight />
        <HeroSlideshow slides={slides}>
          {/* Phones: the words start below the photo (globals.css), never on top of it. */}
          <div className="container-site relative flex flex-1 flex-col justify-start pt-[calc(var(--hero-photo-top)+var(--hero-photo-h)+0.875rem)] pb-6 sm:justify-center sm:pt-24 sm:pb-20 md:pt-28 lg:pb-4">
            <p data-hero-item className="text-eyebrow tracking-[0.24em] text-white/70">
              Communicate <span className="text-gold">·</span> Lead <span className="text-gold">·</span>{" "}
              Belong
            </p>
            <h1
              id="hero-title"
              data-hero-reveal
              className="hero-title mt-3 max-sm:text-[1.875rem] sm:mt-5 sm:max-w-[18ch]"
            >
              Find Your Voice.
              <br />
              Lead With <span className="text-gold">Confidence.</span>
              <br />
              Inspire The World.
            </h1>
            {/* The Voice Line signs the headline: silence, then the first word. */}
            <div
              data-hero-reveal
              aria-hidden="true"
              className="hero-voice text-gold mt-2 w-[min(22rem,62%)] sm:mt-3 md:mt-4"
            >
              <VoiceLine variant="hero" introDelay={0.5} className="h-6 w-full sm:h-8 md:h-10" />
            </div>
            <p
              data-hero-item
              className="hero-lead text-lead mt-2 max-w-[44ch] text-white/80 max-sm:text-[0.9375rem] max-sm:leading-[1.5] sm:mt-4"
            >
              Talk-Masters Club is a Toastmasters public speaking club in Dubai, helping people of every age
              speak, lead and be heard.
            </p>

            <div
              data-hero-item
              className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4 sm:mt-6 md:mt-7 md:gap-x-8"
            >
              <ButtonLink href="/join" className="group min-h-12! max-sm:w-full">
                Book a guest visit
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
                />
              </ButtonLink>
              {/* Phones: one clear action. "Our Story" is a tap away in the menu. */}
              <Link
                href="/our-story"
                className="group hidden min-h-12 items-center gap-3 font-semibold sm:inline-flex"
              >
                <span className="group-hover:border-gold inline-flex size-12 items-center justify-center rounded-full border border-white/40 transition-colors duration-(--duration-quick)">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
                Read Our Story
              </Link>
            </div>
            <p
              data-hero-item
              className="text-muted mt-3 max-w-[52ch] text-sm max-sm:text-center max-sm:text-[0.8125rem] sm:mt-4"
            >
              <span className="text-white/85">
                Next meeting: <NextMeetingDate rule={meeting} />,{" "}
                <span className="whitespace-nowrap">{meetingTimeRange(meeting)}</span>
              </span>
              <br />
              {meeting.venue}, {meeting.city}.
              <span className="max-sm:hidden"> Guests are always welcome.</span>
            </p>

            {/* Phones: all four numbers in one compact row, so the hero fits one screen. */}
            <dl data-hero-item className="mt-4 grid max-w-2xl grid-cols-4 gap-x-3 sm:mt-8 sm:gap-x-0">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`hero-stat flex flex-col-reverse justify-end border-t border-white/15 pt-3 sm:pt-4 sm:pr-4 ${index > 0 ? "sm:border-l sm:border-l-white/10 sm:pl-5" : ""}`}
                >
                  <dt className="mt-1.5 text-xs leading-snug text-white/70 sm:mt-2 sm:text-sm sm:text-white/65">
                    {stat.label}
                  </dt>
                  <dd className="font-serif text-[1.375rem] leading-none sm:text-[clamp(1.75rem,1.4rem+1vw,2.25rem)]">
                    <CountUp
                      value={stat.value}
                      suffix={stat.suffix}
                      suffixClassName="text-gold"
                      delay={0.9 + index * 0.25}
                      seconds={3.4}
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
                  <IntroPhoto id={heroSlides[0]!} />
                </div>
              </div>
            </div>

            <div data-intro-ui className="absolute inset-0">
              {/* Pressing it is enough: any pointer, key or scroll skips (HeroIntro). Out of the tab
                  order because the overlay is hidden from assistive tech, and any key skips anyway. */}
              <button
                type="button"
                tabIndex={-1}
                data-intro-skip
                className="hover:border-gold absolute top-6 right-6 inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white/85 transition-colors duration-(--duration-quick) md:top-8 md:right-10"
              >
                Skip intro
              </button>
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
                <p data-intro-mark className="text-eyebrow tracking-[0.24em] text-white/60">
                  Talk-Masters Club
                </p>
                <p data-intro-mark className="text-eyebrow hidden tracking-[0.24em] text-white/60 sm:block">
                  Communicate <span className="text-gold">·</span> Lead <span className="text-gold">·</span>{" "}
                  Belong
                </p>
              </div>
            </div>
          </div>
        </HeroSlideshow>
      </HeroIntro>

      {/* Phones, first visit (html.intro-phone): three words, then the hero. CSS only, about 1.3s,
          and taps pass straight through. */}
      <div
        aria-hidden="true"
        className="phone-intro bg-ink fixed inset-0 z-[70] flex-col justify-center px-6"
      >
        <p className="phone-intro__word font-serif text-[3.5rem] leading-[1.02] tracking-[-0.035em]">
          Speak.
        </p>
        <p className="phone-intro__word font-serif text-[3.5rem] leading-[1.02] tracking-[-0.035em]">Lead.</p>
        <p className="phone-intro__word text-gold font-serif text-[3.5rem] leading-[1.02] tracking-[-0.035em] italic">
          Belong.
        </p>
      </div>
    </section>
  );
}
