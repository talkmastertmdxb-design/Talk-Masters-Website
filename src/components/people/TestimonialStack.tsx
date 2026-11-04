"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface StackedQuote {
  quote: string;
  name: string;
  role: string;
  /** Their portrait, rendered on the server (an ImageSlot), or nothing. */
  portrait?: ReactNode;
}

interface TestimonialStackProps {
  quotes: readonly StackedQuote[];
}

/** Portraits fanned behind the one in front. */
const BEHIND = 2;

/**
 * Members' own words beside the home video, one at a time: a small stack of tilted portraits
 * with the speaker's on top, their quote, and arrows (or ←/→) to the next. The stack reshuffles
 * on change; reduced motion swaps it without the movement.
 */
export function TestimonialStack({ quotes }: TestimonialStackProps) {
  const [active, setActive] = useState(0);
  const count = quotes.length;
  const current = quotes[active];
  if (!current) return null;

  const go = (by: number) => setActive((index) => (index + by + count) % count);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(-1);
    else if (event.key === "ArrowRight") go(1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Members in their own words"
      onKeyDown={onKeyDown}
      className="quote-stack"
    >
      <div aria-hidden="true" className="quote-stack__photos">
        {quotes.map((quote, index) => {
          const place = (index - active + count) % count;
          return (
            <div
              key={quote.name}
              className="quote-stack__photo"
              data-place={place <= BEHIND ? place : "hidden"}
              style={{ "--place": place, zIndex: count - place } as CSSProperties}
            >
              {quote.portrait}
            </div>
          );
        })}
      </div>

      <figure aria-live="polite" className="m-0 min-w-0">
        <blockquote className="m-0 font-serif text-[1.25rem] leading-[1.5] text-pretty text-white md:text-[1.375rem]">
          <p>“{current.quote}”</p>
        </blockquote>
        <figcaption className="mt-5">
          <span className="block font-semibold text-white">{current.name}</span>
          <span className="block text-sm text-white/60">{current.role}</span>
        </figcaption>
      </figure>

      <div className="quote-stack__nav">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous member"
          className="quote-stack__btn"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next member" className="quote-stack__btn">
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
        <span className="text-sm text-white/60 tabular-nums">
          {active + 1} of {count}
        </span>
      </div>
    </div>
  );
}
