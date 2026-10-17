/**
 * The Voice Line: a flat line (silence) that becomes a speech-like waveform.
 * Every call returns the same number of points, so any two shapes can morph.
 */

export interface VoiceShape {
  width: number;
  height: number;
  /** 0 = silence (flat), 1 = full voice */
  amplitude: number;
  /** Shifts the wave sideways; animate it for a gentle "breathing" motion */
  phase: number;
  /** Number of segments; points returned = samples + 1 */
  samples: number;
}

export type Point = readonly [x: number, y: number];

/** Syllable-like bursts: a few overlapping humps rather than a regular sine. */
const syllables = [
  { centre: 0.18, spread: 0.07, weight: 0.55 },
  { centre: 0.36, spread: 0.09, weight: 1 },
  { centre: 0.55, spread: 0.06, weight: 0.7 },
  { centre: 0.72, spread: 0.08, weight: 0.9 },
  { centre: 0.88, spread: 0.05, weight: 0.45 },
] as const;

function envelope(t: number): number {
  const bursts = syllables.reduce(
    (sum, s) => sum + s.weight * Math.exp(-((t - s.centre) ** 2) / (2 * s.spread ** 2)),
    0,
  );
  // Taper to exactly zero at both ends.
  return Math.min(1, bursts) * Math.sin(Math.PI * t);
}

export function voicePoints({ width, height, amplitude, phase, samples }: VoiceShape): Point[] {
  const mid = height / 2;
  const reach = mid * 0.92 * Math.max(0, Math.min(1, amplitude));

  return Array.from({ length: samples + 1 }, (_, i) => {
    const t = i / samples;
    const carrier =
      Math.sin(t * Math.PI * 22 + phase) * 0.75 + Math.sin(t * Math.PI * 9 - phase * 0.6) * 0.25;
    const y = reach === 0 ? mid : mid + carrier * envelope(t) * reach;
    return [t * width, y] as const;
  });
}

export function voicePath(shape: VoiceShape): string {
  const round = (n: number): number => Math.round(n * 100) / 100;
  return voicePoints(shape)
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)},${round(y)}`)
    .join("");
}

/** The same voice, running down the page: x and y swapped, for vertical timelines. */
export function voicePathVertical({ width, height, ...rest }: VoiceShape): string {
  const round = (n: number): number => Math.round(n * 100) / 100;
  return voicePoints({ width: height, height: width, ...rest })
    .map(([along, across], i) => `${i === 0 ? "M" : "L"}${round(across)},${round(along)}`)
    .join("");
}
