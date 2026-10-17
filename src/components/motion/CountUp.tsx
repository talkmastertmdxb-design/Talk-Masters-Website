"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { duration, media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CountUpProps {
  value: number;
  suffix?: string;
  /** Colour of the suffix. Gold only on dark bands; it fails contrast on light ones. */
  suffixClassName?: string;
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
  className = "",
}: CountUpProps) {
  const number = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`not ${media.reducedMotion}`, () => {
      const el = number.current;
      if (!el) return;
      const state = { n: 0 };
      el.textContent = "0";
      gsap.to(state, {
        n: value,
        duration: duration.slow * 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(state.n));
        },
      });
      return () => {
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
