/**
 * The Timing Light. Toastmasters speeches are timed with lights: green at the
 * minimum time, amber halfway, red at the maximum. Scrolling the home page is
 * "giving the speech": a standard 5-7 minute speech mapped onto scroll progress.
 */

export type TimingSignal = "off" | "green" | "amber" | "red";

export interface TimingThresholds {
  green: number;
  amber: number;
  red: number;
}

/** A standard 5-7 minute prepared speech. */
export const SPEECH: TimingThresholds = { green: 300, amber: 360, red: 420 };

/** Table Topics: 1-2 minutes. */
export const TABLE_TOPIC: TimingThresholds = { green: 60, amber: 90, red: 120 };

/** Scroll progress (0-1) → elapsed speech time in seconds. */
export function speechTime(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.round(clamped * SPEECH.red);
}

export function timingSignal(seconds: number, thresholds: TimingThresholds = SPEECH): TimingSignal {
  if (seconds >= thresholds.red) return "red";
  if (seconds >= thresholds.amber) return "amber";
  if (seconds >= thresholds.green) return "green";
  return "off";
}

export function formatSpeechTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}
