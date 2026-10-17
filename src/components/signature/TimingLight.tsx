"use client";

import { useEffect, useState } from "react";
import { formatSpeechTime, speechTime, timingSignal, type TimingSignal } from "@/lib/motion/timing";

const lamp: Record<TimingSignal, string> = {
  off: "bg-white/20",
  green: "bg-signal-green shadow-[0_0_12px_2px_rgb(60_141_90/0.7)]",
  amber: "bg-gold shadow-[0_0_12px_2px_rgb(214_176_106/0.7)]",
  red: "bg-maroon shadow-[0_0_12px_2px_rgb(119_36_50/0.9)]",
};

function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

/**
 * Signature moment S2: reading the page is giving a 7-minute speech. The lamp
 * turns green, amber and red like a real Toastmasters timer. Decorative, so it
 * is hidden from assistive tech; the explanation lives in the title tooltip.
 */
export function TimingLight() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSeconds(speechTime(readProgress())));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const signal = timingSignal(seconds);

  return (
    <span
      aria-hidden="true"
      data-signal={signal}
      title="Toastmasters speeches are timed with lights: green at the minimum time, amber halfway, red when time is up."
      className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 tabular-nums sm:inline-flex"
    >
      <span
        className={`size-2 rounded-full transition-[background-color,box-shadow] duration-(--duration-quick) ${lamp[signal]}`}
      />
      {formatSpeechTime(seconds)}
    </span>
  );
}
