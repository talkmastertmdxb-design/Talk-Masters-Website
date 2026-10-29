import type { CSSProperties } from "react";
import { content } from "@/lib/content";
import type { Testimonial } from "@/lib/content/schemas";
import { toColumns } from "@/lib/content/testimonial-columns";

/** Enough cards that one copy is taller than the window it drifts through. */
const MIN_CARDS = 4;
/** Seconds each card stays in the drift, so more quotes don't mean faster scrolling. */
const SECONDS_PER_CARD = 9;

function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <blockquote className="font-serif text-[1.1875rem] leading-[1.5] text-white">
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="mt-5 flex flex-col">
        <span className="text-sm font-semibold text-white">{testimonial.name}</span>
        <span className="text-sm text-white/60">{testimonial.role}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Members' own words (content/testimonials.json) for the dark video section: one column of
 * quote cards drifting slowly upwards, paused on hover. The moving copy is decorative; screen
 * readers get the plain list, which is also what shows under reduced motion.
 */
export function QuoteDrift() {
  const { testimonials } = content;
  if (testimonials.length === 0) return null;

  const [column = []] = toColumns(testimonials, 1, MIN_CARDS);
  const half = (copy: number) => (
    <ul className="voices__half m-0 list-none pl-0">
      {column.map((testimonial, index) => (
        <li key={`${copy}-${index}`}>
          <Quote testimonial={testimonial} />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <ul className="sr-only m-0 list-none pl-0 motion-reduce:not-sr-only motion-reduce:grid motion-reduce:gap-4">
        {testimonials.map((testimonial) => (
          <li key={testimonial.name}>
            <Quote testimonial={testimonial} />
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="voices motion-reduce:hidden">
        <div
          className="voices__track"
          style={{ "--voices-duration": `${column.length * SECONDS_PER_CARD}s` } as CSSProperties}
        >
          {half(0)}
          {half(1)}
        </div>
      </div>
    </>
  );
}
