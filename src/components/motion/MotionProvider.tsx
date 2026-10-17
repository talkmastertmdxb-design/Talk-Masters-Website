"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { media } from "@/lib/motion/tokens";
import { ScrollReveals } from "./ScrollReveals";

gsap.registerPlugin(ScrollTrigger);

interface MotionProviderProps {
  children: ReactNode;
}

const isFormField = (el: Element | null): boolean =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;

/**
 * Owns smooth scrolling (Lenis) and keeps ScrollTrigger in sync with it.
 * Desktop: full smoothing. Touch: lightweight (native momentum, no syncTouch).
 * Reduced motion: Lenis is never created. Paused while someone types in a form.
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

    const onFocusIn = () => (isFormField(document.activeElement) ? lenis.stop() : lenis.start());
    document.addEventListener("focusin", onFocusIn);

    // Images and fonts change page height; re-measure triggers once they settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    void document.fonts?.ready.then(refresh);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {children}
      <ScrollReveals />
    </>
  );
}
