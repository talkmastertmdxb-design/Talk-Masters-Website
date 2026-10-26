"use client";

import { useEffect, useRef } from "react";

/** Each preset is one placement's lighting, defined in globals.css (Stage light). */
export type StageLightPreset =
  "teaser" | "join" | "quiz" | "menu" | "not-found" | "mission" | "impact" | "legacy";

interface StageLightProps {
  preset: StageLightPreset;
  className?: string;
}

/**
 * A slow gradient of the club's colours (navy, club blue, maroon, gold) under a film grain:
 * Ember, Aurora or Mist, by preset. Fills its nearest positioned parent, which should be
 * `relative isolate overflow-hidden`. Moving presets pause while off screen and hold still
 * for reduced motion; Mist presets never move.
 */
export function StageLight({ preset, className = "" }: StageLightProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      el.toggleAttribute("data-paused", !entry?.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-paused=""
      className={`stage-light stage-light--${preset} ${className}`}
    >
      <div className="stage-light__flow" />
      {preset === "quiz" && <div className="stage-light__flow stage-light__warm" />}
      <div className="stage-light__grain" />
    </div>
  );
}
