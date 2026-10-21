/**
 * Motion tokens for GSAP. Mirrors the CSS custom properties in globals.css.
 * "Speak with pauses": a short hold, a confident delivery, then stillness
 * (docs/IMPLEMENTATION_PLAN.md §4).
 */
export const ease = {
  deliver: "expo.out",
  breath: "sine.inOut",
  scrub: "none",
} as const;

export const duration = {
  quick: 0.45,
  base: 0.9,
  slow: 1.3,
} as const;

export const stagger = {
  line: 0.09,
  item: 0.14,
} as const;

/** The hold before a key line lands. */
export const pauseBeat = 0.2;

/** Maximum parallax travel as a fraction of the element's size. */
export const parallaxMax = 0.1;

/** Hero intro must finish (or be skippable) within this many seconds. */
export const heroBudget = 1.8;

/** Hero photo rotation: each photo holds, crossfades slowly, and drifts in scale while shown. */
export const heroSlideshow = {
  hold: 12,
  crossfade: 1.6,
  drift: 1.06,
} as const;

export const media = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  pointerFine: "(hover: hover) and (pointer: fine)",
  desktop: "(min-width: 56.25rem)",
} as const;
