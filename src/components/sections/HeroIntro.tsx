"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { finishIntro, isIntroPlaying } from "@/lib/motion/intro";
import { duration, ease, media, stagger } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, SplitText);

interface HeroIntroProps {
  children: ReactNode;
  className?: string;
}

const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
/** Never wait longer than this for the first intro photo before wiping in anyway. */
const IMAGE_WAIT_MS = 1200;
const WIPE_IN = "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)";

/**
 * React Strict Mode (development) mounts, unmounts and re-mounts every component.
 * Ending the intro on unmount would end it on that fake unmount, so cleanup only
 * ends it if nothing has mounted again by the next tick (a real navigation away).
 */
let mountedHeroes = 0;

/** Only the first photo must be ready: the rest keep loading while it plays. */
const firstImageReady = (root: HTMLElement): Promise<unknown> => {
  const images = [...root.querySelectorAll<HTMLImageElement>("[data-intro-frame] img")];
  images.forEach((img) => {
    img.loading = "eager";
  });
  const first = images[0]?.decode().catch(() => undefined) ?? Promise.resolve();
  return Promise.race([first, new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS))]);
};

/** Beat 4, "The first word": lines rise through a mask, then supporting content settles. */
function buildReveal(lines: Element[], root: HTMLElement, settleBackdrop: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap
    .timeline({ defaults: { ease: ease.deliver } })
    .set(q("[data-hero-reveal]"), { opacity: 1 })
    .from(lines, { yPercent: 110, duration: duration.slow, stagger: stagger.line * 1.6 }, 0.05)
    .from(q("[data-hero-item]"), { opacity: 0, y: 24, duration: duration.base, stagger: stagger.item }, 0.5);
  if (settleBackdrop) {
    tl.fromTo(q("[data-hero-backdrop]"), { scale: 1.06 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0);
  }
  return tl;
}

/** Beats 1-3 of the first-visit intro (adapted from Hero_animation/8). */
function buildIntro(root: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const ready = firstImageReady(root);
  const frames = q<HTMLElement>("[data-intro-frame]");
  const stage = frames.at(-1);
  const moments = frames.slice(0, -1);

  const tl = gsap.timeline({ onComplete });

  // Beat 1, "House lights down": wordmark and counter arrive, digits roll to 100%.
  tl.from(q("[data-intro-mark]"), { opacity: 0, y: 12, duration: 0.6, ease: ease.deliver }, 0)
    .from(q("[data-intro-count]"), { yPercent: 100, duration: 0.6, ease: ease.deliver }, 0.05)
    .fromTo(q("[data-intro-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.15, ease: "power4.inOut" }, 0.1);
  // Hundreds tick over last; ones roll fastest (as in the original).
  const rolls = [
    { duration: 0.35, at: 0.85 },
    { duration: 1.1, at: 0.1 },
    { duration: 0.95, at: 0.1 },
  ];
  q<HTMLElement>("[data-digit]").forEach((column, i) => {
    const steps = column.children.length - 1;
    const roll = rolls[i] ?? rolls[2]!;
    tl.to(
      column,
      { yPercent: -(steps / (steps + 1)) * 100, duration: roll.duration, ease: "power2.inOut" },
      roll.at,
    );
  });

  // Hold at 100% only until the first photo can be shown (max 1.2s).
  tl.addPause(1.25, () => {
    void ready.then(() => tl.resume());
  });

  // Beat 2, "Moments from the club": the counter lifts away, photos wipe in right to left.
  // The counter clears first, so each beat has the stage to itself.
  tl.to(q("[data-intro-ui]"), { yPercent: -40, opacity: 0, duration: 0.4, ease: "power3.in" }, 1.25)
    .to(moments, { clipPath: WIPE_IN, duration: 0.9, ease: "power4.inOut", stagger: 0.22 }, 1.5)
    .fromTo(q("[data-intro-stack]"), { scale: 1.2 }, { scale: 1, duration: 2.2, ease: "power3.inOut" }, 1.5);

  // Beat 3, "Take the stage": the last frame lands exactly where the hero photo sits.
  if (stage) {
    tl.to(stage, { clipPath: WIPE_IN, duration: 1, ease: "power4.inOut" }, ">-0.55")
      // The earlier moments dim to navy, leaving the left side for the headline.
      .to(moments, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "<0.2")
      .to(q("[data-intro-overlay]"), { opacity: 0, duration: 0.5, ease: "power2.out" }, ">-0.05");
  }
  return tl;
}

/**
 * First visit (html.intro, set in <head> before paint): beats 1-3, then the reveal.
 * Later visits and client navigation: the reveal only. Any input skips ahead.
 */
export function HeroIntro({ children, className = "" }: HeroIntroProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const title = el?.querySelector("h1");
      if (!el || !title) return;
      mountedHeroes += 1;

      const mm = gsap.matchMedia();
      mm.add(`not ${media.reducedMotion}`, () => {
        const withIntro = isIntroPlaying();
        let reveal: gsap.core.Timeline | undefined;
        let introDone = !withIntro;

        const split = SplitText.create(title, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            reveal = buildReveal(self.lines, el, !withIntro);
            if (!introDone) reveal.pause(0);
            return reveal;
          },
        });

        const endIntro = () => {
          if (introDone) return;
          introDone = true;
          finishIntro();
          reveal?.play();
        };

        const intro = withIntro ? buildIntro(el, endIntro) : undefined;

        const skip = () => {
          if (!introDone) {
            intro?.progress(1);
            endIntro();
          }
          reveal?.progress(1);
        };
        SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { once: true, passive: true }));

        return () => {
          SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
          split.revert();
        };
      });

      return () => {
        mm.revert();
        mountedHeroes -= 1;
        // Real unmount (navigating away mid-intro): don't leave the nav hidden.
        setTimeout(() => {
          if (mountedHeroes === 0) finishIntro();
        }, 0);
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
