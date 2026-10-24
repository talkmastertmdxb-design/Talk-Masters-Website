"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
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
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // A glide still in flight would drag the new page back down; settle where Next.js placed it.
  // Layout effect: runs after Next.js's own scroll (deeper in the tree), before the next frame.
  useLayoutEffect(() => {
    lenisRef.current?.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [pathname]);

  // Back/forward (button or swipe) skips the page transition: the browser or OS animates those.
  // The mark stays until the visitor's next tap or key press, which may start a link navigation.
  useEffect(() => {
    const root = document.documentElement;
    const markHistory = () => root.setAttribute("data-nav", "history");
    const clearMark = () => root.removeAttribute("data-nav");
    window.addEventListener("popstate", markHistory);
    window.addEventListener("pointerdown", clearMark, { capture: true });
    window.addEventListener("keydown", clearMark, { capture: true });
    return () => {
      window.removeEventListener("popstate", markHistory);
      window.removeEventListener("pointerdown", clearMark, { capture: true });
      window.removeEventListener("keydown", clearMark, { capture: true });
    };
  }, []);

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
    lenisRef.current = lenis;

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
      lenisRef.current = null;
    };
  }, []);

  return children;
}
