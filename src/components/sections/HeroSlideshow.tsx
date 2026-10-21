"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Pause, Play } from "lucide-react";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { afterIntro, isIntroPlaying } from "@/lib/motion/intro";
import { wrapSlide } from "@/lib/motion/slideshow";
import { ease, heroSlideshow, media } from "@/lib/motion/tokens";

gsap.registerPlugin(useGSAP);

interface HeroSlideshowProps {
  /** Backdrop photos, first one first (it is also the intro photo and the LCP image). */
  slides: readonly ReactNode[];
  /** The rest of the hero, rendered between the photos and the controls. */
  children: ReactNode;
}

interface SlideshowControls {
  show: (index: number) => void;
  sync: () => void;
}

const subscribeReducedMotion = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(media.reducedMotion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const prefersReducedMotion = (): boolean => window.matchMedia(media.reducedMotion).matches;

/**
 * The hero photo panel, rotating through club photos: each holds, then crossfades
 * slowly while it drifts in scale. Rotation waits for the intro, and pauses while the
 * hero is off screen, the tab is hidden, or the controls are hovered or focused.
 * Under reduced motion it starts paused and photos swap without fading or drifting.
 * The pause button meets WCAG 2.2.2 (Pause, Stop, Hide).
 */
export function HeroSlideshow({ slides, children }: HeroSlideshowProps) {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<SlideshowControls | null>(null);
  /** The visitor's choice (true = paused); null until they press the button. */
  const choice = useRef<boolean | null>(null);
  const hovering = useRef(false);
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const paused = userPaused ?? reducedMotion;
  const count = slides.length;

  useGSAP(
    (_context, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;
      const q = gsap.utils.selector(el);
      const panel = q<HTMLElement>("[data-hero-backdrop]")[0];
      const reduce = (): boolean => window.matchMedia(media.reducedMotion).matches;

      // The panel settles into place as the headline arrives. After the first-visit intro
      // the iris has already opened it, so it stays put.
      if (panel && !isIntroPlaying() && !reduce()) {
        gsap.fromTo(panel, { scale: 1.06 }, { scale: 1, duration: 2.4, ease: "power3.out" });
      }
      if (count < 2) return;

      const layers = q<HTMLElement>("[data-slide]");
      const fills = q<HTMLElement>("[data-slide-fill]");
      let current = 0;
      let introDone = false;
      let onScreen = true;
      let timer: gsap.core.Tween | undefined;
      let drift: gsap.core.Tween | undefined;

      const shouldRun = (): boolean =>
        introDone && onScreen && !document.hidden && !hovering.current && !(choice.current ?? reduce());

      const sync = (): void => {
        const run = shouldRun();
        [timer, drift].forEach((tween) => (run ? tween?.play() : tween?.pause()));
      };

      const startDrift = (layer: HTMLElement): void => {
        drift?.kill();
        drift = reduce()
          ? undefined
          : gsap.fromTo(
              layer,
              { scale: 1 },
              {
                scale: heroSlideshow.drift,
                duration: heroSlideshow.hold + heroSlideshow.crossfade,
                ease: "none",
                paused: true,
              },
            );
      };

      // The timer is the active indicator's fill: when it is full, the next photo comes in.
      const startTimer = (): void => {
        timer?.kill();
        gsap.set(fills, { scaleX: 0 });
        timer = gsap.to(fills[current]!, {
          scaleX: 1,
          duration: heroSlideshow.hold,
          ease: "none",
          paused: true,
          onComplete: () => show(current + 1),
        });
        sync();
      };

      const show = contextSafe((index: number): void => {
        const target = wrapSlide(index, layers.length);
        if (target !== current) {
          const incoming = layers[target]!;
          layers.forEach((layer, i) => gsap.set(layer, { zIndex: i === target ? 2 : i === current ? 1 : 0 }));
          current = target;
          setActive(target);
          gsap.killTweensOf(incoming);
          gsap.fromTo(
            incoming,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: reduce() ? 0 : heroSlideshow.crossfade,
              ease: ease.breath,
              // Hide the rest only if no newer photo has been chosen meanwhile.
              onComplete: () => {
                if (layers[current] !== incoming) return;
                layers.forEach((layer) => layer !== incoming && gsap.set(layer, { autoAlpha: 0 }));
              },
            },
          );
          startDrift(incoming);
        }
        startTimer();
      }) as (index: number) => void;

      gsap.set(layers, {
        autoAlpha: (i: number) => (i === 0 ? 1 : 0),
        zIndex: (i: number) => (i === 0 ? 1 : 0),
      });
      startDrift(layers[0]!);
      startTimer();

      const observer = new IntersectionObserver(([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
        sync();
      });
      if (panel) observer.observe(panel);
      document.addEventListener("visibilitychange", sync);

      const cancelIntro = afterIntro(() => {
        introDone = true;
        // The first paint is done: fetch the other photos now so each is ready before its turn.
        q<HTMLImageElement>("[data-slide] img").forEach((img) => (img.loading = "eager"));
        sync();
      });

      controls.current = { show, sync };

      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
        cancelIntro();
        controls.current = null;
      };
    },
    { scope: root, dependencies: [count] },
  );

  const togglePause = (): void => {
    const next = !paused;
    choice.current = next;
    setUserPaused(next);
    controls.current?.sync();
  };

  const setHovering = (value: boolean): void => {
    hovering.current = value;
    controls.current?.sync();
  };

  return (
    <div ref={root} className="contents">
      <div data-hero-backdrop className="hero-panel absolute inset-y-0 right-0 isolate -z-20">
        {/* Clipped, so the drift never spills a photo edge past the panel. */}
        <div className="absolute inset-0 isolate overflow-hidden">
          {slides.map((slide, index) => (
            <div
              // The list is fixed for the page's lifetime, so the index is a stable key.
              key={index}
              data-slide
              aria-hidden={index === active ? undefined : true}
              className="absolute inset-0 isolate"
              style={index === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
            >
              {slide}
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="hero-panel-fade absolute inset-0" />
      </div>

      {children}

      {count > 1 && (
        <div className="container-site pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-end md:bottom-6">
          <div
            data-hero-item
            role="group"
            aria-label="Hero photos"
            className="pointer-events-auto flex items-center gap-1"
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show photo ${index + 1} of ${count}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => controls.current?.show(index)}
                className="group flex h-11 w-11 items-center"
              >
                <span
                  className={`relative block h-0.5 w-full overflow-hidden rounded-full transition-colors duration-(--duration-quick) ${
                    index === active ? "bg-white/55" : "bg-white/25 group-hover:bg-white/50"
                  }`}
                >
                  <span data-slide-fill className="bg-gold absolute inset-0 origin-left scale-x-0" />
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={togglePause}
              aria-label={paused ? "Play photo slideshow" : "Pause photo slideshow"}
              className="hover:border-gold ml-2 inline-flex size-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-(--duration-quick)"
            >
              {paused ? (
                <Play aria-hidden="true" className="size-3.5" />
              ) : (
                <Pause aria-hidden="true" className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
