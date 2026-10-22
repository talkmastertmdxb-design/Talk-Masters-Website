"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { activeAgendaIndex, agendaClock, meridiem, swipeProgress } from "@/lib/motion/agenda";
import { media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface AgendaScrubProps {
  children: ReactNode;
  className?: string;
}

/**
 * Signature moment S3. Desktop: the section pins and scroll moves the meeting
 * along: the card track slides (Animation 10), the clock counts (11) and the
 * Voice Line draws through the meeting (12).
 * Expects [data-agenda-track], [data-agenda-clock] (with [data-agenda-meridiem]),
 * [data-agenda-line] and [data-step] cards inside. Phones / reduced motion: a swipeable
 * row, and swiping it moves the clock, the current card and the progress bar instead.
 */
export function AgendaScrub({ children, className = "" }: AgendaScrubProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const track = el?.querySelector<HTMLElement>("[data-agenda-track]");
      const line = el?.querySelector<SVGPathElement>("[data-agenda-line]");
      if (!el || !track) return;

      const clocks = gsap.utils.toArray<HTMLElement>("[data-agenda-clock]", el);
      const meridiems = gsap.utils.toArray<HTMLElement>("[data-agenda-meridiem]", el);
      const cards = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const setCurrent = (index: number) =>
        cards.forEach((card, i) => card.toggleAttribute("data-current", i === index));
      /** Moves the whole meeting to `progress` (0-1): clock, am/pm, current card, progress bar. */
      const show = (progress: number) => {
        const time = agendaClock(progress);
        clocks.forEach((clock) => (clock.textContent = time));
        meridiems.forEach((label) => (label.textContent = meridiem(time)));
        setCurrent(activeAgendaIndex(progress));
        el.style.setProperty("--agenda-progress", String(progress));
      };
      show(0);

      // Phones and reduced motion: the row scrolls natively; follow it (a no-op while pinned).
      const onSwipe = () => show(swipeProgress(track));
      track.addEventListener("scroll", onSwipe, { passive: true });

      const mm = gsap.matchMedia();
      mm.add(`${media.desktop} and (prefers-reduced-motion: no-preference)`, () => {
        el.dataset.pinned = "true";
        if (line) line.style.strokeDashoffset = "1";
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              show(self.progress);
              if (line) line.style.strokeDashoffset = String(1 - self.progress);
            },
          },
        });

        return () => {
          delete el.dataset.pinned;
          if (line) line.style.strokeDashoffset = "";
          show(0);
        };
      });
      return () => {
        track.removeEventListener("scroll", onSwipe);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
