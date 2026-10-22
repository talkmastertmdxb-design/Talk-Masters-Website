"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { media } from "@/lib/motion/tokens";

gsap.registerPlugin(ScrollTrigger);

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Owns smooth scrolling (Lenis) and keeps ScrollTrigger in sync with it.
 * Desktop: full smoothing. Touch: lightweight (native momentum, no syncTouch).
 * Reduced motion: Lenis is never created. It keeps running while a form field has focus
 * (stopping it froze the page); a field that scrolls itself carries data-lenis-prevent.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  useEffect(() => {
    if (window.matchMedia(media.reducedMotion).matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      syncTouch: false,
      anchors: { offset: -96 },
      autoRaf: false,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Images and fonts change page height; re-measure triggers once they settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    void document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return children;
}
