"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";
import { media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP);

export type FinaleBuilder = (q: gsap.utils.SelectorFunc, root: HTMLElement) => gsap.core.Timeline;

/**
 * Plays a scene's finale once the countdown reaches zero, then calls `onDone`.
 * Reduced motion: no curtain, flood or spotlight, just a short fade.
 */
export function useFinale(
  scope: RefObject<HTMLElement | null>,
  active: boolean,
  build: FinaleBuilder,
  onDone: () => void,
): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!active || !root) return;
      const mm = gsap.matchMedia();
      mm.add({ reduce: media.reducedMotion, full: `not ${media.reducedMotion}` }, (context) => {
        if (context.conditions?.reduce) {
          gsap.to(root, { opacity: 0, duration: 0.4, ease: "none", onComplete: onDone });
          return;
        }
        build(gsap.utils.selector(root), root).eventCallback("onComplete", onDone);
      });
      return () => mm.revert();
    },
    { scope, dependencies: [active] },
  );
}
