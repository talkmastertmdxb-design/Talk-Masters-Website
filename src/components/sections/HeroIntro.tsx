"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { duration, ease, media, pauseBeat, stagger } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, SplitText);

interface HeroIntroProps {
  children: ReactNode;
  className?: string;
}

const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Signature moment S1, "The first word" (docs/IMPLEMENTATION_PLAN.md §4.4):
 * headline lines rise through a mask, a beat, then the supporting content
 * settles. Under 1.8s, and any input jumps straight to the end.
 */
export function HeroIntro({ children, className = "" }: HeroIntroProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${media.reducedMotion}`, () => {
        const reveal = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
        const items = gsap.utils.toArray<HTMLElement>("[data-hero-item]");
        const title = root.current?.querySelector("h1");
        if (!title) return;

        let timeline: gsap.core.Timeline | undefined;
        const skip = () => timeline?.progress(1);

        const split = SplitText.create(title, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            timeline = gsap
              .timeline({ defaults: { ease: ease.deliver } })
              .set(reveal, { opacity: 1 })
              .from(self.lines, { yPercent: 110, duration: duration.slow, stagger: stagger.line * 1.6 }, 0.35)
              .from(
                items,
                { opacity: 0, y: 24, duration: duration.base, stagger: stagger.item },
                `>-${duration.slow - pauseBeat * 2}`,
              );
            return timeline;
          },
        });

        SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { once: true, passive: true }));
        return () => {
          SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
