"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { activeAgendaIndex, agendaClock } from "@/lib/motion/agenda";
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
 * Expects [data-agenda-track], [data-agenda-clock], [data-agenda-line] and
 * [data-step] cards inside. Mobile / reduced motion: a swipeable row instead.
 */
export function AgendaScrub({ children, className = "" }: AgendaScrubProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const track = el?.querySelector<HTMLElement>("[data-agenda-track]");
      const clock = el?.querySelector<HTMLElement>("[data-agenda-clock]");
      const line = el?.querySelector<SVGPathElement>("[data-agenda-line]");
      if (!el || !track || !clock) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const setCurrent = (index: number) =>
        cards.forEach((card, i) => card.toggleAttribute("data-current", i === index));
      setCurrent(0);

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
              clock.textContent = agendaClock(self.progress);
              setCurrent(activeAgendaIndex(self.progress));
              if (line) line.style.strokeDashoffset = String(1 - self.progress);
            },
          },
        });

        return () => {
          delete el.dataset.pinned;
          clock.textContent = agendaClock(0);
          if (line) line.style.strokeDashoffset = "";
          setCurrent(0);
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
