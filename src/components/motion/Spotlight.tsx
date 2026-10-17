"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP);

/**
 * Stage spotlight that drifts toward the pointer (pointer devices only).
 * Elsewhere it stays as a still pool of light. Moves via CSS variables only.
 */
export function Spotlight() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const section = el?.parentElement;
      if (!el || !section) return;

      const mm = gsap.matchMedia();
      mm.add(`${media.pointerFine} and (prefers-reduced-motion: no-preference)`, () => {
        const toX = gsap.quickTo(el, "--spot-x", { duration: 1.6, ease: "power3.out" });
        const toY = gsap.quickTo(el, "--spot-y", { duration: 1.6, ease: "power3.out" });

        const onMove = (event: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          toX(((event.clientX - rect.left) / rect.width) * 100);
          toY(((event.clientY - rect.top) / rect.height) * 100);
        };
        section.addEventListener("pointermove", onMove);
        return () => section.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 -z-10" />
  );
}
