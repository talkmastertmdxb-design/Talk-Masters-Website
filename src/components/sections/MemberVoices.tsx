import { ArrowRight } from "lucide-react";
import { HighlightVideo } from "@/components/media/HighlightVideo";
import { ButtonLink } from "@/components/ui/Button";
import { content } from "@/lib/content";

/**
 * Opening, proof: members on camera, in their own words, straight after the manifesto.
 * The video previews silently with burned-in captions; the quotes beside it are lifted from it.
 */
export function MemberVoices() {
  const video = content.settings.highlightVideo;
  if (!video) return null;

  return (
    <section
      aria-labelledby="voices-title"
      className="py-section theme-dark grain bg-ink relative isolate overflow-hidden text-white"
    >
      {/*
        Phones: heading, video, then quotes. From md: one centred composition, the text beside the
        video at a fixed gap, so the two read as a pair however wide the screen is.
      */}
      <div className="container-site grid gap-12 md:grid-cols-[minmax(0,32rem)_auto] md:grid-rows-[auto_auto] md:justify-center md:gap-x-16 md:gap-y-0 lg:gap-x-24">
        <div className="md:col-start-1 md:self-end">
          <p data-reveal="up" className="text-eyebrow text-white/70">
            In their own words
          </p>
          <h2 id="voices-title" data-reveal="lines" className="text-h2 mt-5 max-w-[14ch]">
            What really changed?
          </h2>
          <p data-reveal="up" className="text-lead mt-6 max-w-[42ch] text-white/80">
            Members, unscripted, on what changed once they started showing up and speaking up.
          </p>
        </div>

        <div
          data-reveal="up"
          className="md:col-start-2 md:row-span-2 md:row-start-1 md:w-[min(24rem,calc(80svh*9/16))] md:self-center"
        >
          <HighlightVideo video={video} />
        </div>

        <div className="md:col-start-1 md:self-start">
          {video.quotes.length > 0 && (
            <ul data-reveal="stagger" className="max-w-[40ch] md:mt-10">
              {video.quotes.map((quote) => (
                <li
                  key={quote}
                  className="border-hairline-dark border-t py-5 font-serif text-xl leading-snug"
                >
                  “{quote}”
                </li>
              ))}
            </ul>
          )}

          <div data-reveal="up" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/join" className="group">
              Book a guest visit
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
              />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
