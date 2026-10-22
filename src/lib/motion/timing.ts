/**
 * Toastmasters timing lights: green at the minimum time, amber halfway, red at the
 * maximum. Used by the Table Topics booth's stopwatch.
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
