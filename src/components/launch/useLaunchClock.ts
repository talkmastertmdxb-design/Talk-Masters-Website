"use client";

import { useEffect, useState } from "react";
import { phase, remaining, type LaunchPhase, type Remaining } from "@/lib/launch/launch";

const TICK_MS = 250;
/** The spotlight and lamp warm up over the final hour (or the whole run, if shorter). */
const GLOW_HORIZON_S = 3_600;

export interface LaunchClock {
  remaining: Remaining;
  phase: LaunchPhase;
  /** 0 at the start of the warm-up, 1 at the launch moment. */
  glow: number;
}

/**
 * Counts down on the server's clock, not the device's: a phone set five minutes fast would
 * otherwise reach zero early and reload into the countdown. The first render uses the server
 * time exactly, so the HTML and the hydrated page match.
 */
export function useLaunchClock(launchAtIso: string, serverNow: number): LaunchClock {
  const launchAt = new Date(launchAtIso);
  const startTotal = remaining(launchAt, serverNow).total;
  const horizon = Math.max(1, Math.min(GLOW_HORIZON_S, startTotal));
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const offset = serverNow - Date.now();
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [serverNow]);

  const left = remaining(launchAt, now);
  return {
    remaining: left,
    phase: phase(left.total),
    glow: 1 - Math.min(left.total, horizon) / horizon,
  };
}
