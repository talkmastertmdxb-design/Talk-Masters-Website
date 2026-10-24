"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { afterIntro } from "@/lib/motion/intro";
import { duration, media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CountUpProps {
  value: number;
  suffix?: string;
  /** Colour of the suffix. Gold only on dark bands; it fails contrast on light ones. */
  suffixClassName?: string;
  /** Seconds to wait once in view (e.g. to follow the hero headline). */
  delay?: number;
  /** ScrollTrigger start. Hero stats use "top bottom": count as soon as they are visible at all. */
  start?: string;
  /** How long the count takes. Longer draws the eye; the hero uses a slow, steady count. */
  seconds?: number;
  className?: string;
}

/**
 * The final number is in the HTML (correct without JS and for screen readers);
 * the count-up only plays once, when the number scrolls into view.
 */
export function CountUp({
  value,
  suffix = "",
  suffixClassName = "text-maroon",
  delay = 0,
  start = "top 85%",
  seconds = duration.slow * 1.4,
  className = "",
}: CountUpProps) {
  const number = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`not ${media.reducedMotion}`, (context) => {
      const el = number.current;
      if (!el) return;
      const state = { n: 0 };
      el.textContent = "0";
      // Hero stats wait for the first-visit intro; everywhere else this runs at once.
      const cancel = afterIntro(() =>
        context.add(() => {
          gsap.to(state, {
            n: value,
            duration: seconds,
            delay,
            // A gentler ease for long counts, so the digits keep visibly ticking to the end.
            ease: seconds > 3 ? "power1.out" : "power2.out",
            scrollTrigger: { trigger: el, start, once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(state.n));
            },
          });
        }),
      );
      return () => {
        cancel();
        el.textContent = String(value);
      };
    });
    return () => mm.revert();
  });

  return (
    <span className={className}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        <span ref={number}>{value}</span>
        <span className={suffixClassName}>{suffix}</span>
      </span>
    </span>
  );
}
