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

/** Only the first photo must be ready: the rest keep loading while it plays. */
const firstImageReady = (root: HTMLElement): Promise<unknown> => {
  const images = [...root.querySelectorAll<HTMLImageElement>("[data-intro-frame] img")];
  images.forEach((img) => {
    img.loading = "eager";
  });
  const first = images[0]?.decode().catch(() => undefined) ?? Promise.resolve();
  return Promise.race([first, new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS))]);
};

/** Signature moment S1 reveal: lines rise through a mask, then supporting content settles. */
function buildReveal(lines: Element[], root: HTMLElement, settleBackdrop: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap
    .timeline({ defaults: { ease: ease.deliver } })
    .set(q("[data-hero-reveal]"), { opacity: 1 })
    .from(lines, { yPercent: 110, duration: duration.slow, stagger: stagger.line * 1.6 }, 0.1)
    .from(q("[data-hero-item]"), { opacity: 0, y: 24, duration: duration.base, stagger: stagger.item }, 0.55);
  if (settleBackdrop) {
    tl.fromTo(q("[data-hero-backdrop]"), { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0);
  }
  return tl;
}

/**
 * First visit (html.intro, set before paint): a preloader counts 00→100%, speaking
 * photos wipe in as the stage settles from a zoom, the overlay fades into the hero,
 * then the headline is delivered. Adapted from Hero_animation/8, cut from ~12s to ~3s.
 * Later visits and client navigation: the headline reveal only. Any input skips ahead.
 */
export function HeroIntro({ children, className = "" }: HeroIntroProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const title = el?.querySelector("h1");
      if (!el || !title) return;

      const mm = gsap.matchMedia();
      mm.add(`not ${media.reducedMotion}`, () => {
        const withIntro = isIntroPlaying();
        const q = gsap.utils.selector(el);
        let reveal: gsap.core.Timeline | undefined;
        let intro: gsap.core.Timeline | undefined;
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

        if (withIntro) {
          const ready = firstImageReady(el);
          const columns = q<HTMLElement>("[data-digit]");
          intro = gsap.timeline({ onComplete: endIntro });
          columns.forEach((column, i) => {
            const steps = column.children.length - 1;
            // Ones roll fastest, the hundreds digit ticks over last, as in the original.
            const timing = [
              { duration: 0.35, at: 0.8 },
              { duration: 1.15, at: 0 },
              { duration: 1, at: 0 },
            ][i] ?? { duration: 1, at: 0 };
            intro!.to(
              column,
              { yPercent: -(steps / (steps + 1)) * 100, duration: timing.duration, ease: "power2.inOut" },
              timing.at,
            );
          });
          intro
            .fromTo(
              q("[data-intro-bar]"),
              { scaleX: 0 },
              { scaleX: 1, duration: 1.1, ease: "power4.inOut" },
              0.1,
            )
            .addPause(1.2, () => {
              void ready.then(() => intro?.resume());
            })
            .to(q("[data-intro-ui]"), { opacity: 0, duration: 0.35, ease: "power2.out" }, 1.2)
            .to(
              q("[data-intro-frame]"),
              { clipPath: WIPE_IN, duration: 0.9, ease: "power4.inOut", stagger: 0.2 },
              1.25,
            )
            .fromTo(
              q("[data-intro-stack]"),
              { scale: 1.25 },
              { scale: 1, duration: 2, ease: "power3.inOut" },
              1.25,
            )
            .to(q("[data-intro-overlay]"), { opacity: 0, duration: 0.6, ease: "power2.out" }, ">-0.35");
        }

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
          endIntro();
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
