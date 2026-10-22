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
/** The counter's run to 100; everything else is timed from it. Whole intro: ~2.4s. */
const COUNT_S = 0.8;
const IRIS_AT_S = COUNT_S + 0.2;
/** A skip happens on pointerdown; the click that follows lands after the overlay is gone. */
const SWALLOW_CLICK_MS = 600;

/** Stops the click that ends a skip from also pressing whatever is now under the pointer. */
function swallowNextClick(): void {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), SWALLOW_CLICK_MS);
}

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
function buildReveal(chars: Element[], root: HTMLElement): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  // After client navigation Next.js can mount the hero before every child has rendered,
  // so only animate what is there (an empty target makes GSAP warn). The CSS failsafe
  // reveals anything that arrives later.
  const reveals = q("[data-hero-reveal]");
  const items = q("[data-hero-item]");
  const tl = gsap.timeline({ defaults: { ease: ease.deliver } });
  if (reveals.length > 0) tl.set(reveals, { opacity: 1 });
  tl.from(chars, { xPercent: 105, duration: 0.9, ease: "power4.out", stagger: 0.012 }, 0.05);
  if (items.length > 0) {
    tl.from(items, { opacity: 0, y: 24, duration: duration.base, stagger: stagger.item }, 0.55);
  }
  return tl;
}

/**
 * The first-visit intro (adapted from Hero_Animation_2, ~8.5s cut to ~2.4s).
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
  tl.from(q("[data-intro-mark]"), { opacity: 0, y: 10, duration: 0.4, ease: ease.deliver }, 0)
    .to(
      count,
      {
        value: 100,
        duration: COUNT_S,
        ease: "power3.out",
        onUpdate: () => {
          if (counter) counter.textContent = String(Math.floor(count.value));
        },
      },
      0,
    )
    .fromTo(counter ?? [], { scale: 0.25 }, { scale: 1, duration: COUNT_S, ease: "power3.out" }, 0)
    .fromTo(q("[data-intro-track]"), { scaleX: 0 }, { scaleX: 1, duration: COUNT_S, ease: "power3.out" }, 0);

  // 2. Digits slide away to the left, one after another.
  tl.add(() => {
    if (!counter) return;
    const digits = SplitText.create(counter, { type: "chars", mask: "chars" });
    gsap.to(digits.chars, { xPercent: -105, duration: 0.35, ease: "power3.in", stagger: 0.04 });
  }, COUNT_S + 0.05);

  // 3. Iris: closed point → held square (wait for the photo if it isn't decoded yet).
  if (iris) {
    tl.set(iris, { clipPath: irisPoint(rect, viewport) }, 0)
      .addPause(IRIS_AT_S, () => {
        void ready.then(() => tl.resume());
      })
      .to(iris, { clipPath: irisSquare(rect, viewport), duration: 0.55, ease: HOP }, IRIS_AT_S)
      .fromTo(q("[data-intro-zoom]"), { scale: 1.7 }, { scale: 1.35, duration: 0.55, ease: HOP }, IRIS_AT_S)
      // 4. Open to exactly the panel; the progress fills as the stage arrives.
      .to(iris, { clipPath: irisPanel(rect, viewport), duration: 0.8, ease: HOP }, ">")
      .to(q("[data-intro-zoom]"), { scale: 1, duration: 0.8, ease: HOP }, "<")
      .fromTo(q("[data-intro-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: HOP }, "<")
      // The brand grade arrives with the stage, so the last frame matches the hero exactly.
      .to(q("[data-intro-grade]"), { opacity: 1, duration: 0.6, ease: "power2.inOut" }, "<0.15")
      .to(q("[data-intro-ui]"), { opacity: 0, duration: 0.25, ease: "power2.out" }, ">-0.25")
      .to(q("[data-intro-overlay]"), { opacity: 0, duration: 0.25, ease: "power1.out" }, "<0.05");
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
      // Laptops only. Phones get a CSS rise instead (globals.css), so their first paint
      // never waits for SplitText and GSAP on a slow CPU.
      mm.add(`${media.desktop} and (prefers-reduced-motion: no-preference)`, () => {
        const withIntro = isIntroPlaying();
        let reveal: gsap.core.Timeline | undefined;
        let introDone = !withIntro;

        // Words keep letters together across line breaks; letters slide within a mask.
        const split = SplitText.create(title, {
          type: "words, chars",
          mask: "chars",
          autoSplit: true,
          onSplit(self) {
            reveal = buildReveal(self.chars, el);
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

        const skip = (event: Event) => {
          if (!introDone) {
            if (event.type === "pointerdown") swallowNextClick();
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
