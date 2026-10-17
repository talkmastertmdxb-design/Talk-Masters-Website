"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface StickyStoryProps {
  steps: number;
  children: ReactNode;
  className?: string;
}

/** Scroll distance per step, as a fraction of the viewport height. */
const STEP_LENGTH = 0.7;

/**
 * Animation 08, "Sticky storytelling": the section pins on desktop while scroll
 * moves through its steps. Elements marked data-step="n" get data-current when
 * their step is active; the progress bar fills via --story-progress.
 * Mobile and reduced motion: no pin, every step is shown in order.
 */
export function StickyStory({ steps, children, className = "" }: StickyStoryProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const setStep = (index: number) => {
        el.querySelectorAll<HTMLElement>("[data-step]").forEach((node) => {
          node.toggleAttribute("data-current", Number(node.dataset.step) === index);
        });
      };
      setStep(0);

      const mm = gsap.matchMedia();
      mm.add(`${media.desktop} and (prefers-reduced-motion: no-preference)`, () => {
        el.dataset.pinned = "true";
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * STEP_LENGTH * (steps - 1)}`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            el.style.setProperty("--story-progress", String(self.progress));
            setStep(Math.min(steps - 1, Math.floor(self.progress * steps)));
          },
        });
        return () => {
          delete el.dataset.pinned;
          setStep(0);
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
