"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";
import { irisPanel, irisPoint, irisSquare } from "@/lib/motion/iris";
import { finishIntro, isIntroPlaying } from "@/lib/motion/intro";
import { duration, ease, media, stagger } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP, SplitText, CustomEase);
/** The template's signature ease: a held breath, then a decisive move. */
const HOP = CustomEase.create("hop", "0.9, 0, 0.1, 1");

interface HeroIntroProps {
  children: ReactNode;
  className?: string;
}

const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
/** Never hold the iris longer than this waiting for the hero photo. */
const IMAGE_WAIT_MS = 1200;

/**
 * React Strict Mode (development) mounts, unmounts and re-mounts every component.
 * Ending the intro on unmount would end it on that fake unmount, so cleanup only
 * ends it if nothing has mounted again by the next tick (a real navigation away).
 */
let mountedHeroes = 0;

const imageReady = (root: HTMLElement): Promise<unknown> => {
  const img = root.querySelector<HTMLImageElement>("[data-intro-iris] img");
  if (img) img.loading = "eager";
  const decoded = img?.decode().catch(() => undefined) ?? Promise.resolve();
  return Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS))]);
};

/**
 * "The first word": the headline's letters slide in from the right through a mask
 * (from Hero_Animation_2), then the supporting content settles.
 */
function buildReveal(chars: Element[], root: HTMLElement, settleBackdrop: boolean): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap
    .timeline({ defaults: { ease: ease.deliver } })
    .set(q("[data-hero-reveal]"), { opacity: 1 })
    .from(chars, { xPercent: 105, duration: 0.9, ease: "power4.out", stagger: 0.012 }, 0.05)
    .from(q("[data-hero-item]"), { opacity: 0, y: 24, duration: duration.base, stagger: stagger.item }, 0.55);
  if (settleBackdrop) {
    tl.fromTo(q("[data-hero-backdrop]"), { scale: 1.06 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0);
  }
  return tl;
}

/**
 * The first-visit intro (adapted from Hero_Animation_2, ~8.5s cut to ~4.3s).
 * 1. Count: the number grows from small to large on the left while it counts to 100.
 * 2. Exit: its digits slide away through a mask.
 * 3. Iris: the hero photo opens from a point into a held square, centred on the photo panel.
 * 4. Open: the square expands to exactly the panel as the zoom settles; the overlay hands over.
 */
function buildIntro(root: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const ready = imageReady(root);
  const counter = q<HTMLElement>("[data-intro-count]")[0];
  const iris = q<HTMLElement>("[data-intro-iris]")[0];
  const panel = root.querySelector<HTMLElement>("[data-hero-backdrop]");
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const rect = panel?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  };

  const count = { value: 0 };
  const tl = gsap.timeline({ onComplete });

  // 1. Count to 100 while the number grows and the track draws.
  tl.from(q("[data-intro-mark]"), { opacity: 0, y: 10, duration: 0.6, ease: ease.deliver }, 0)
    .to(
      count,
      {
        value: 100,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          if (counter) counter.textContent = String(Math.floor(count.value));
        },
      },
      0,
    )
    .fromTo(counter ?? [], { scale: 0.25 }, { scale: 1, duration: 1.6, ease: "power3.out" }, 0)
    .fromTo(q("[data-intro-track]"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power3.out" }, 0);

  // 2. Digits slide away to the left, one after another.
  tl.add(() => {
    if (!counter) return;
    const digits = SplitText.create(counter, { type: "chars", mask: "chars" });
    gsap.to(digits.chars, { xPercent: -105, duration: 0.55, ease: "power3.in", stagger: 0.06 });
  }, 1.75);

  // 3. Iris: closed point → held square (wait for the photo if it isn't decoded yet).
  if (iris) {
    tl.set(iris, { clipPath: irisPoint(rect, viewport) }, 0)
      .addPause(2.05, () => {
        void ready.then(() => tl.resume());
      })
      .to(iris, { clipPath: irisSquare(rect, viewport), duration: 0.9, ease: HOP }, 2.05)
      .fromTo(q("[data-intro-zoom]"), { scale: 1.7 }, { scale: 1.35, duration: 0.9, ease: HOP }, 2.05)
      // 4. Open to exactly the panel; the progress fills as the stage arrives.
      .to(iris, { clipPath: irisPanel(rect, viewport), duration: 1.2, ease: HOP }, ">+0.05")
      .to(q("[data-intro-zoom]"), { scale: 1, duration: 1.2, ease: HOP }, "<")
      .fromTo(q("[data-intro-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: HOP }, "<")
      // The brand grade arrives with the stage, so the last frame matches the hero exactly.
      .to(q("[data-intro-grade]"), { opacity: 1, duration: 0.9, ease: "power2.inOut" }, "<0.25")
      .to(q("[data-intro-ui]"), { opacity: 0, duration: 0.35, ease: "power2.out" }, ">-0.3")
      .to(q("[data-intro-overlay]"), { opacity: 0, duration: 0.3, ease: "power1.out" }, "<0.1");
  }
  return tl;
}

/**
 * First visit (html.intro, set in <head> before paint): the intro, then the reveal.
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

        // Words keep letters together across line breaks; letters slide within a mask.
        const split = SplitText.create(title, {
          type: "words, chars",
          mask: "chars",
          autoSplit: true,
          onSplit(self) {
            reveal = buildReveal(self.chars, el, !withIntro);
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
