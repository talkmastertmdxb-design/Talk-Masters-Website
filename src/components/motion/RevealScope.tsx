"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { blockWipe, duration, ease, media, parallaxMax, stagger, textRise } from "@/lib/motion/tokens";

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
 *   data-reveal="text"     the same rise for lead paragraphs, split without any aria attributes
 *   data-reveal="block"    a solid block wipes across each line and uncovers it (big statements
 *                          only; colour from --reveal-block, gold by default)
 *   data-reveal="stagger"  direct children settle one after another
 *   data-reveal="image"    image unmasks from a soft inset
 *   data-reveal="rise"     direct children grow up from their baseline, one after another
 *                          (the Pathways ladder: bars rise like steps)
 *   data-parallax          soft parallax, ±5% (Animation 07)
 *   data-draw              SVG path draws with scroll (needs pathLength="1")
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
      // Anything that starts on the page's first screen plays at once. Its usual trigger line
      // (85-88% down the screen) can sit below the fold-in point on a tall phone, which left a
      // visible block blank until the first scroll (the member grid under the /members hero).
      const fold = window.innerHeight;
      const startAt = (el: Element, line: string): string =>
        el.getBoundingClientRect().top + window.scrollY < fold ? "top bottom" : line;

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
              scrollTrigger: { trigger: el, start: startAt(el, "top 88%"), once: true },
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
              scrollTrigger: { trigger: group, start: startAt(group, "top 85%"), once: true },
            },
          );
        });

        const riseLines = (el: HTMLElement, aria: "auto" | "none") =>
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            aria,
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: textRise.duration,
                ease: textRise.ease,
                stagger: textRise.stagger,
                scrollTrigger: { trigger: el, start: startAt(el, "top 88%"), once: true },
              }),
          });
        all("[data-reveal='lines']").forEach((el) => riseLines(el, "auto"));
        all("[data-reveal='text']").forEach((el) => riseLines(el, "none"));

        all("[data-reveal='block']").forEach((el) => {
          const split = SplitText.create(el, { type: "lines" });
          const blocks = split.lines.map((line) => {
            const wrapper = document.createElement("div");
            wrapper.className = "reveal-block-line";
            line.before(wrapper);
            wrapper.append(line);
            const block = document.createElement("span");
            block.className = "reveal-block";
            block.setAttribute("aria-hidden", "true");
            wrapper.append(block);
            return block;
          });
          gsap.set(split.lines, { opacity: 0 });
          const tl = gsap.timeline({
            paused: true,
            // Back to the server's markup once revealed: no wrappers, and text reflows on resize.
            onComplete: () => split.revert(),
          });
          split.lines.forEach((line, index) => {
            const block = blocks[index]!;
            const at = index * blockWipe.stagger;
            tl.fromTo(
              block,
              { scaleX: 0, transformOrigin: "left center" },
              { scaleX: 1, duration: blockWipe.duration, ease: blockWipe.ease },
              at,
            )
              .set(line, { opacity: 1 }, at + blockWipe.duration)
              .set(block, { transformOrigin: "right center" }, at + blockWipe.duration)
              .to(
                block,
                { scaleX: 0, duration: blockWipe.duration, ease: blockWipe.ease },
                at + blockWipe.duration,
              );
          });
          ScrollTrigger.create({
            trigger: el,
            start: startAt(el, "top 85%"),
            once: true,
            onEnter: () => tl.play(),
          });
        });

        all("[data-reveal='image']").forEach((el) => {
          gsap.from(el, {
            clipPath: "inset(12% 8% 12% 8% round 28px)",
            scale: 1.04,
            duration: duration.slow,
            ease: ease.deliver,
            scrollTrigger: { trigger: el, start: startAt(el, "top 85%"), once: true },
          });
        });

        all("[data-reveal='rise']").forEach((group) => {
          gsap.fromTo(
            group.children,
            // A clip, not a scale: the bar grows from its baseline without squashing its label.
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: duration.slow,
              ease: ease.deliver,
              stagger: stagger.item,
              clearProps: "clipPath",
              scrollTrigger: { trigger: group, start: startAt(group, "top 80%"), once: true },
            },
          );
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
