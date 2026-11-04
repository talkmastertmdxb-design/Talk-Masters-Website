"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { media } from "@/lib/motion/tokens";

export interface PerspectiveCard {
  key: string;
  /** The photo, rendered on the server (an ImageSlot). */
  photo: ReactNode;
  /** The words under it. */
  caption: ReactNode;
}

interface PerspectiveCarouselProps {
  label: string;
  cards: readonly PerspectiveCard[];
}

/** Beyond this many card widths from the centre, a card turns no further. */
const MAX_DISTANCE = 2;

/**
 * Inverted perspective carousel: a native scroll-snap row (swipe, trackpad, arrows), where the
 * card in the middle faces you and the ones either side turn away, as if wrapped round a drum.
 * Each card's distance from the centre is written to --d on scroll; the turn itself is CSS
 * (globals.css, .perspective-carousel), and reduced motion keeps every card flat.
 */
export function PerspectiveCarousel({ label, cards }: PerspectiveCarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const still = window.matchMedia(media.reducedMotion);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const centre = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;
      items.forEach((item, index) => {
        const distance = (item.offsetLeft + item.offsetWidth / 2 - centre) / item.offsetWidth;
        if (Math.abs(distance) < nearestDistance) {
          nearest = index;
          nearestDistance = Math.abs(distance);
        }
        const turn = still.matches ? 0 : Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, distance));
        item.style.setProperty("--d", turn.toFixed(3));
        item.style.setProperty("--d-abs", Math.abs(turn).toFixed(3));
      });
      setCurrent(nearest);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    still.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      still.removeEventListener("change", schedule);
    };
  }, []);

  const goTo = (index: number) => {
    const el = track.current;
    const item = el?.children[index] as HTMLElement | undefined;
    if (!el || !item) return;
    const still = window.matchMedia(media.reducedMotion).matches;
    el.scrollTo({
      left: item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2,
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <div className="perspective-carousel">
      <ul ref={track} aria-label={label} className="perspective-carousel__track slider-track">
        {cards.map((card, index) => (
          <li
            key={card.key}
            className="perspective-carousel__item"
            data-current={index === current || undefined}
          >
            <figure className="perspective-carousel__card">
              {card.photo}
              <figcaption className="mt-5">{card.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="container-site mt-8 flex items-center justify-end gap-4">
        <span className="text-ink-muted text-sm tabular-nums">
          {current + 1} of {cards.length}
        </span>
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label="Previous session"
          className="slider-btn"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === cards.length - 1}
          aria-label="Next session"
          className="slider-btn"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
