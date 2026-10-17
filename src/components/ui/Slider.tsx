"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface SliderProps {
  label: string;
  children: ReactNode;
}

/**
 * Horizontal editorial slider: scroll-snap track (swipe on touch, shift-scroll or
 * arrows on desktop). Native scrolling keeps it accessible and fast.
 */
export function Slider({ label, children }: SliderProps) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={track}
        aria-label={label}
        className="slider-track flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-6 md:scroll-px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {children}
      </ul>
      <div className="container-site mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={edges.start}
          aria-label="Previous stories"
          className="slider-btn"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={edges.end}
          aria-label="Next stories"
          className="slider-btn"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
