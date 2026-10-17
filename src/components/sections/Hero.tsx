import { ImageSlot } from "@/components/media/ImageSlot";
import { Spotlight } from "@/components/motion/Spotlight";
import { VoiceLine } from "@/components/signature/VoiceLine";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";
import { HeroIntro } from "./HeroIntro";

/** The Opening (Section 1): one promise, and the next meeting, in the first screen on any device. */
export function Hero() {
  const { meeting } = content.settings;

  return (
    <section
      aria-labelledby="hero-title"
      className="theme-dark grain hero-stage bg-ink relative isolate overflow-hidden text-white"
    >
      <ImageSlot id="hero-stage" variant="backdrop" sizes="100vw" priority />
      <Spotlight />

      <HeroIntro className="flex min-h-dvh flex-col justify-end pt-32 pb-10 md:pb-14">
        <div className="container-site">
          <h1 id="hero-title" data-hero-reveal className="text-h1 max-w-[15ch]">
            Find your voice.
            <br />
            Lead with <em className="text-gold">Confidence.</em>
            <br />
            Inspire the world.
          </h1>
        </div>

        <div data-hero-reveal className="text-gold mt-8 md:mt-12">
          <VoiceLine variant="hero" introDelay={0.95} className="h-20 w-full md:h-28" />
        </div>

        <div className="container-site mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end">
          <p data-hero-item className="text-lead max-w-[44ch] text-white/80 md:col-span-6">
            A public speaking and leadership club for everyone. Come as a guest: watch, listen, and only speak
            if you want to.
          </p>

          <div className="flex flex-col gap-4 md:col-span-6 md:items-end">
            <p data-hero-item className="text-muted text-sm">
              Next meeting: {meeting.schedule}, {meeting.startTime}, {meeting.venue}
            </p>
            <div className="flex flex-wrap gap-3">
              <span data-hero-item>
                <ButtonLink href="/join">Book a guest visit</ButtonLink>
              </span>
              <span data-hero-item>
                <ButtonLink href="/#inside-a-meeting" variant="ghost">
                  What happens at a meeting
                </ButtonLink>
              </span>
            </div>
          </div>
        </div>

        <div
          data-scroll-cue
          aria-hidden="true"
          className="text-muted mt-10 hidden flex-col items-center gap-3 text-xs md:flex"
        >
          <span>Scroll to explore</span>
          <span className="scroll-cue-line block h-10 w-px bg-white/30" />
        </div>
      </HeroIntro>
    </section>
  );
}
