import Link from "next/link";
import type { CSSProperties } from "react";
import { content } from "@/lib/content";
import type { Testimonial } from "@/lib/content/schemas";
import { toColumns } from "@/lib/content/testimonial-columns";

/** Enough cards per column that one copy is taller than the window it drifts through. */
const MIN_CARDS_PER_COLUMN = 4;
/** Seconds each card stays in the drift, so more quotes don't mean faster scrolling. */
const SECONDS_PER_CARD = 9;

function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="bg-soft-gray rounded-lg p-6 md:p-7">
      <blockquote className="text-ink font-serif text-[1.1875rem] leading-[1.5]">
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="mt-6 flex flex-col">
        <span className="text-sm font-semibold">{testimonial.name}</span>
        <span className="text-ink-muted text-sm">{testimonial.role}</span>
      </figcaption>
    </figure>
  );
}

function Column({ quotes, reverse = false }: { quotes: readonly Testimonial[]; reverse?: boolean }) {
  const half = (copy: number) => (
    <ul className="voices__half m-0 list-none pl-0">
      {quotes.map((testimonial, index) => (
        <li key={`${copy}-${index}`}>
          <Quote testimonial={testimonial} />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`voices__track ${reverse ? "voices__track--reverse" : ""}`}
      style={{ "--voices-duration": `${quotes.length * SECONDS_PER_CARD}s` } as CSSProperties}
    >
      {half(0)}
      {half(1)}
    </div>
  );
}

/**
 * Members' own words (content/testimonials.json): quote cards drifting slowly up and down in
 * two columns (one on phones), paused on hover. The moving copy is decorative; screen readers
 * get the plain list, which is also what shows under reduced motion.
 */
export function Testimonials() {
  const { testimonials } = content;
  if (testimonials.length === 0) return null;

  const [left = [], right = []] = toColumns(testimonials, 2, MIN_CARDS_PER_COLUMN);
  const single = toColumns(testimonials, 1, MIN_CARDS_PER_COLUMN)[0] ?? [];

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="py-section bg-white">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <h2 id="testimonials-title" data-reveal="lines" className="text-h2 max-w-[13ch]">
            In our members’ words
          </h2>
          <p data-reveal="up" className="text-ink-muted mt-6 max-w-[34ch]">
            Nobody here joined as a confident speaker. This is what changed for them.
          </p>
          <Link
            href="/members"
            data-reveal="up"
            className="nav-link text-tm-blue mt-8 inline-flex min-h-11 items-center font-semibold"
          >
            Read their stories
          </Link>
        </div>

        <div className="lg:col-span-8">
          <ul className="sr-only m-0 list-none pl-0 motion-reduce:not-sr-only motion-reduce:grid motion-reduce:gap-4 md:motion-reduce:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <li key={index}>
                <Quote testimonial={testimonial} />
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="voices motion-reduce:hidden">
            <div className="voices__window md:hidden">
              <Column quotes={single} />
            </div>
            <div className="voices__window hidden md:block">
              <Column quotes={left} />
            </div>
            <div className="voices__window hidden md:block">
              <Column quotes={right} reverse />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
