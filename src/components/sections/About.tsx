import Link from "next/link";
import { content } from "@/lib/content";

/**
 * Manifesto (Section 2): the club's name as big as a stage banner, then its tagline and mission
 * beneath it. The club's numbers live in the Hero, not here.
 */
export function About() {
  const { mission, tagline, parentOrganisation } = content.settings;

  return (
    <section id="about" aria-labelledby="about-title" className="py-section overflow-hidden bg-white">
      <div className="container-site">
        <p
          aria-hidden="true"
          data-reveal="up"
          className="text-maroon font-serif text-[4.5rem] leading-[0.86] font-semibold tracking-[-0.055em] whitespace-nowrap sm:text-[14.5vw] 2xl:text-[14.25rem]"
        >
          <span className="sm:hidden">
            Talk-
            <br />
            Masters
          </span>
          <span className="hidden sm:inline">Talk-Masters</span>
        </p>
        <div className="mt-10 grid gap-y-6 md:mt-16 md:grid-cols-12 md:gap-x-6">
          <h2
            id="about-title"
            data-reveal="lines"
            className="font-serif text-[clamp(2.125rem,1.6rem+2vw,3.25rem)] leading-[1.05] font-normal tracking-[-0.02em] italic md:col-span-5"
          >
            {tagline}.
          </h2>
          <div className="md:col-span-6 md:col-start-7">
            <p data-reveal="text" className="text-lead text-ink-muted max-w-[56ch]">
              {mission}
            </p>
            <p data-reveal="up" className="text-ink-muted mt-5 text-sm">
              A club of {parentOrganisation}.
            </p>
            <Link
              href="/our-story"
              data-reveal="up"
              className="text-maroon decoration-maroon/40 mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-[6px]"
            >
              Read our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
