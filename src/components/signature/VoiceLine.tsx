"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { duration, ease, media } from "@/lib/motion/tokens";
import { voicePath, type VoiceShape } from "@/lib/motion/voice";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Variant = "hero" | "underline";

interface VoiceLineProps {
  variant: Variant;
  /** Seconds before silence turns into voice (hero intro choreography). */
  introDelay?: number;
  className?: string;
}

const BOX = { width: 1000, height: 100 } as const;
const SAMPLES: Record<Variant, number> = { hero: 220, underline: 60 };

const shape = (variant: Variant, amplitude: number, phase: number): VoiceShape => ({
  ...BOX,
  amplitude,
  phase,
  samples: SAMPLES[variant],
});

/**
 * The single motif of the site (docs/IMPLEMENTATION_PLAN.md §1.2): a flat line
 * (silence) that becomes a voice. Server-rendered as a finished wave, so it
 * reads correctly with no JavaScript and under reduced motion.
 */
export function VoiceLine({ variant, introDelay = 0, className = "" }: VoiceLineProps) {
  const root = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${media.reducedMotion}`, () => {
        const state = { amplitude: 0, phase: 0 };
        const draw = () =>
          path.current?.setAttribute("d", voicePath(shape(variant, state.amplitude, state.phase)));
        draw();

        const intro = gsap.to(state, {
          amplitude: 1,
          duration: duration.base,
          delay: introDelay,
          ease: ease.deliver,
          onUpdate: draw,
          paused: variant === "underline",
        });

        // After speaking, the line keeps breathing gently. Paused off-screen.
        const breath = gsap
          .timeline({ repeat: -1, paused: true, onUpdate: draw })
          .to(state, { phase: Math.PI * 2, duration: 7, ease: "none" }, 0)
          .to(state, { amplitude: 0.72, duration: 3.5, ease: ease.breath, yoyo: true, repeat: 1 }, 0);

        intro.eventCallback("onComplete", () => {
          breath.play();
        });

        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => intro.play(),
          onToggle: (self) => {
            if (intro.progress() < 1) return;
            if (self.isActive) breath.play();
            else breath.pause();
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      preserveAspectRatio="none"
      className={`block overflow-visible ${className}`}
    >
      <path
        ref={path}
        d={voicePath(shape(variant, 1, 0))}
        fill="none"
        stroke="currentColor"
        strokeWidth={variant === "hero" ? 1.5 : 1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
