"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

export interface FanCard {
  name: string;
  role: string;
  note?: string;
  /** The full-size poster, opened in a new tab from the caption. */
  href?: string;
  /** The poster itself, rendered on the server (an ImageSlot). */
  poster: ReactNode;
}

interface CardFanProps {
  label: string;
  cards: readonly FanCard[];
}

/** How far a swipe must travel before it turns the fan. */
const SWIPE_PX = 40;

/**
 * Card fan carousel: the posters fanned out like a hand of cards, one held up in front.
 * Click a card, use the arrows, swipe, or press ←/→ to bring the next one forward; the caption
 * underneath follows. The cards' offsets are CSS variables, so the fan is laid out and animated
 * in CSS (globals.css, .card-fan), and stays a plain still row under reduced motion.
 */
export function CardFan({ label, cards }: CardFanProps) {
  const [active, setActive] = useState(Math.floor((cards.length - 1) / 2));
  const swipeStart = useRef<number | null>(null);
  const current = cards[active];
  if (!current) return null;

  const go = (index: number) => setActive(Math.min(cards.length - 1, Math.max(0, index)));

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(active - 1);
    else if (event.key === "ArrowRight") go(active + 1);
    else return;
    event.preventDefault();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const travel = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(travel) >= SWIPE_PX) go(active + (travel < 0 ? 1 : -1));
  };

  return (
    <div className="card-fan" onKeyDown={onKeyDown}>
      <ul
        aria-label={label}
        className="card-fan__deck"
        onPointerDown={(event) => (swipeStart.current = event.clientX)}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
      >
        {cards.map((card, index) => {
          const offset = index - active;
          return (
            <li
              key={card.name}
              className="card-fan__card"
              data-active={offset === 0 || undefined}
              style={
                {
                  "--o": offset,
                  "--d": Math.abs(offset),
                  zIndex: cards.length - Math.abs(offset),
                } as CSSProperties
              }
            >
              <button
                type="button"
                onClick={() => go(index)}
                aria-current={offset === 0 || undefined}
                aria-label={`${card.role}: ${card.name}`}
                className="card-fan__button"
              >
                {card.poster}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div aria-live="polite" className="min-h-[5.5rem]">
          <p className="text-maroon text-sm font-semibold">{current.role}</p>
          <p className="mt-1 font-serif text-3xl leading-tight">{current.name}</p>
          {current.note && <p className="text-ink-muted mt-1">{current.note}</p>}
          {current.href && (
            <a
              href={current.href}
              target="_blank"
              rel="noopener"
              className="text-tm-blue mt-3 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Open the poster full size
              <span className="sr-only"> ({current.name}, opens in a new tab)</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-ink-muted text-sm tabular-nums">
            {active + 1} of {cards.length}
          </span>
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous poster"
            className="slider-btn"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === cards.length - 1}
            aria-label="Next poster"
            className="slider-btn"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
