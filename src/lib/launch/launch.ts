/**
 * The website launch countdown: when the site opens, how long is left, and which stage of the
 * finale we are in. Pure functions only, so the proxy, the page and the tests share one truth.
 *
 * The launch moment comes from the LAUNCH_AT environment variable first (an ISO date with its
 * offset, e.g. "2026-12-13T10:30:00+04:00"), then from content/settings.json → launch.at.
 * With neither set there is no countdown and the site is open. LAUNCH_AT=off turns the countdown
 * off even when the settings file has a date (the main test suite runs that way).
 */

export const LAUNCH_CONCEPTS = ["speech"] as const;
export type LaunchConcept = (typeof LAUNCH_CONCEPTS)[number];

/** Toastmasters timing lights for the final minute, then the moment itself. */
export type LaunchPhase = "waiting" | "green" | "amber" | "red" | "live";

export const PHASE_STARTS = { green: 60, amber: 30, red: 10 } as const;

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Whole seconds left, never negative. */
  total: number;
}

export interface LaunchSource {
  env?: string | undefined;
  settings?: string | undefined;
}

/** The launch instant, or null when no valid launch time is configured. */
export function parseLaunchAt({ env, settings }: LaunchSource): Date | null {
  if (env?.trim().toLowerCase() === "off") return null;
  for (const value of [env, settings]) {
    if (!value?.trim()) continue;
    const time = Date.parse(value);
    if (!Number.isNaN(time)) return new Date(time);
  }
  return null;
}

export function isLaunched(launchAt: Date | null, now: number): boolean {
  return launchAt === null || now >= launchAt.getTime();
}

export function remaining(launchAt: Date, now: number): Remaining {
  // Round up: "1 second" stays on screen until the instant itself, never a premature 0.
  const total = Math.max(0, Math.ceil((launchAt.getTime() - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
    total,
  };
}

export function phase(totalSeconds: number): LaunchPhase {
  if (totalSeconds <= 0) return "live";
  if (totalSeconds <= PHASE_STARTS.red) return "red";
  if (totalSeconds <= PHASE_STARTS.amber) return "amber";
  if (totalSeconds <= PHASE_STARTS.green) return "green";
  return "waiting";
}

export function isConcept(value: unknown): value is LaunchConcept {
  return typeof value === "string" && (LAUNCH_CONCEPTS as readonly string[]).includes(value);
}

/** The countdown as one plain sentence, for screen readers: "27 days, 14 hours and 9 minutes". */
export function remainingSentence({ days, hours, minutes, seconds }: Remaining): string {
  const parts = [
    [days, "day"],
    [hours, "hour"],
    [minutes, "minute"],
  ] as const;
  const words = parts.filter(([n]) => n > 0).map(([n, unit]) => `${n} ${unit}${n === 1 ? "" : "s"}`);
  if (words.length === 0) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  return words.length === 1 ? words[0]! : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** Preview mode (non-production only): "/launch?in=300" counts down 300 seconds from page load. */
export const PREVIEW_MAX_SECONDS = 7 * 86_400;

export function previewSeconds(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const seconds = Number(raw);
  return seconds > 0 && seconds <= PREVIEW_MAX_SECONDS ? seconds : null;
}
