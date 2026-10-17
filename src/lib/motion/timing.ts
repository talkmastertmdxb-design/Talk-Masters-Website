/**
 * The Timing Light. Toastmasters speeches are timed with lights: green at the
 * minimum time, amber halfway, red at the maximum. Scrolling the home page is
 * "giving the speech": a standard 5-7 minute speech mapped onto scroll progress.
 */

export type TimingSignal = "off" | "green" | "amber" | "red";

export const SPEECH = {
  green: 300,
  amber: 360,
  red: 420,
} as const;

/** Scroll progress (0-1) → elapsed speech time in seconds. */
export function speechTime(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.round(clamped * SPEECH.red);
}

export function timingSignal(seconds: number): TimingSignal {
  if (seconds >= SPEECH.red) return "red";
  if (seconds >= SPEECH.amber) return "amber";
  if (seconds >= SPEECH.green) return "green";
  return "off";
}

export function formatSpeechTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}
