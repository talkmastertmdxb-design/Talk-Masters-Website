"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { duration, ease, media, parallaxMax, stagger } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

interface RevealScopeProps {
  children: ReactNode;
  /** Rendered element. Pages use "main" so the scope is also the skip-link target. */
  as?: "main" | "div";
  id?: string;
  className?: string;
}

/**
 * Scroll reveals for everything inside this element (SCROLL_ANIMATION_SYSTEM.md).
 * Server components opt in with attributes, so content stays server-rendered:
 *
 *   data-reveal="up"       fade + rise ("Settle")
 *   data-reveal="lines"    headline lines rise through a mask (SplitText). Headings only:
 *                          SplitText adds aria-label, which is not allowed on <p>.
 *   data-reveal="stagger"  direct children settle one after another
 *   data-reveal="image"    image unmasks from a soft inset
 *   data-parallax          soft parallax, ±5% (Animation 07)
 *   data-draw              SVG path draws with scroll (needs pathLength="1")
 *   data-scroll-cue        fades away as soon as scrolling begins (Animation 05)
 *
 * Why a scope and not one global controller: React must finish hydrating DOM before
 * GSAP writes to it. This component's effect runs only after its own subtree has
 * hydrated, and it only touches elements inside that subtree. A document-wide
 * controller in the root layout ran before the page segment hydrated and caused
 * hydration attribute mismatches (inline styles, SplitText aria-labels).
 *
 * Elements are visible until JS runs, and stay visible under reduced motion.
 */
export function RevealScope({ children, as: Tag = "div", id, className }: RevealScopeProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const all = <T extends Element = HTMLElement>(selector: string) =>
        gsap.utils.toArray<T>(selector, scope);

      const mm = gsap.matchMedia();
      mm.add(`not ${media.reducedMotion}`, () => {
        // Explicit end values plus clearProps: nothing is left inline afterwards, so
        // CSS states (e.g. dimmed rows in a pinned section) always win once revealed.
        all("[data-reveal='up']").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: duration.base,
              ease: ease.deliver,
              clearProps: "opacity,transform",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });

        all("[data-reveal='stagger']").forEach((group) => {
          gsap.fromTo(
            group.children,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: duration.base,
              ease: ease.deliver,
              stagger: stagger.item,
              clearProps: "opacity,transform",
              scrollTrigger: { trigger: group, start: "top 85%", once: true },
            },
          );
        });

        all("[data-reveal='lines']").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: duration.slow,
                ease: ease.deliver,
                stagger: stagger.line,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        all("[data-reveal='image']").forEach((el) => {
          gsap.from(el, {
            clipPath: "inset(12% 8% 12% 8% round 28px)",
            scale: 1.04,
            duration: duration.slow,
            ease: ease.deliver,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        all("[data-parallax]").forEach((el) => {
          const range = Number(el.dataset.parallax || parallaxMax * 50);
          gsap.fromTo(
            el,
            { yPercent: -range },
            {
              yPercent: range,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        all<SVGPathElement>("[data-draw]").forEach((path) => {
          gsap.fromTo(
            path,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: path.closest("[data-draw-scope]") ?? path,
                start: "top 70%",
                end: "bottom 60%",
                scrub: 0.6,
              },
            },
          );
        });

        all("[data-scroll-cue]").forEach((el) => {
          gsap.to(el, {
            opacity: 0,
            y: 12,
            ease: "none",
            scrollTrigger: { start: 0, end: 160, scrub: true },
          });
        });

        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Tag ref={root as React.Ref<HTMLElement & HTMLDivElement>} id={id} className={className}>
      {children}
    </Tag>
  );
}
