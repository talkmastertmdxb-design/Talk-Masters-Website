"use client";

import { useId, useMemo, type ComponentProps, type ReactNode } from "react";

/* Adapted from a 21st.dev component ("image stream hero"), restyled to our tokens.
 *
 * Two rails of cards ride from far behind the screen toward the viewer. Perspective alone does
 * what looks like two animations: as a card's z grows it gets bigger and its screen x sweeps
 * outward, because the projection scales position and size by the same factor.
 *
 * - Depth is authored as apparent size, geometrically: each card is a constant ratio bigger than
 *   the one behind it, so near cards never tear apart.
 * - The rails open hard first and then hold (`fan` > 1): the ribbon leaves the centre as a flat
 *   band, bends once, then runs out on the diagonal.
 * - Neither end of the loop is on screen: a card dies past the edge and is born across the axis
 *   (`railBirth` < 0), so the centre is always covered and a newborn needs no fade in.
 *
 * Every length is in cqw (a share of the container's width), so the corridor keeps its shape at
 * any size. Reduced motion pauses it as a finished still; the corridor is decorative throughout.
 */

export interface CorridorPath {
  /** Strength of the projection; lower is a wider-angle rush. */
  perspective: number;
  cardWidth: number;
  cardHeight: number;
  cardRadius: number;
  /** On-screen card height at the waist, where a card is born. */
  birthHeight: number;
  /** On-screen card height as a card leaves the frame. */
  exitHeight: number;
  /** Lateral offset at birth; negative starts the card across the axis. */
  railBirth: number;
  /** Lateral offset once the rails have opened. */
  railExit: number;
  /** How front-loaded the opening is; > 1 opens early then holds. */
  fan: number;
  turnBirth: number;
  turnExit: number;
  /** Keyframe stops used to trace the curve. */
  stops: number;
}

const PATH: CorridorPath = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.6,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

/** Samples the path once, so the CSS keyframes trace the real curve. */
function keyframes(dir: 1 | -1, name: string, p: CorridorPath): string {
  const steps: string[] = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;
    const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
    const z = p.perspective * (1 - 1 / scale);
    const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(
        2,
      )}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`,
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export interface StreamImage {
  src: string;
}

interface ImageStreamHeroProps extends ComponentProps<"div"> {
  /** Cycled onto both rails, so the corridor reads as one mirrored stream. */
  images: readonly StreamImage[];
  /** Cards on each rail at once: denser, not faster. Far below 9 tears the ribbon. */
  cards?: number;
  /** Seconds for one card to travel the whole corridor. */
  speed?: number;
  /** Vertical placement of the corridor's axis, as a percentage of height. */
  axis?: number;
  path?: Partial<CorridorPath>;
  children?: ReactNode;
}

export function ImageStreamHero({
  images,
  cards = 9,
  speed = 18,
  axis = 55,
  path,
  children,
  className = "",
  style,
  ...props
}: ImageStreamHeroProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const right = `ish-r-${id}`;
  const left = `ish-l-${id}`;
  const card = `ish-c-${id}`;
  const p = useMemo(() => ({ ...PATH, ...path }), [path]);

  const css = useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      // Paused rather than removed: every card is already placed mid-flight by its negative
      // delay, so the corridor freezes as a finished still instead of collapsing onto the axis.
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`,
    [right, left, card, p],
  );

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      {...props}
      style={{ containerType: "inline-size", ...style }}
    >
      <style>{css}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ perspective: `${p.perspective}cqw`, perspectiveOrigin: `50% ${axis}%` }}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {[right, left].map((name) =>
            Array.from({ length: cards }, (_, i) => {
              const img = images[i % Math.max(images.length, 1)];
              return (
                <div
                  key={`${name}-${i}`}
                  className={`${card} bg-card absolute overflow-hidden`}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    animation: `${name} ${speed}s linear infinite`,
                    animationDelay: `${-(i * speed) / cards}s`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element -- already sized by next/image's loader
                    <img
                      src={img.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
