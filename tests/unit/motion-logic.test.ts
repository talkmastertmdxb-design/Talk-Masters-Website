import { describe, expect, it } from "vitest";
import { voicePath, voicePoints } from "@/lib/motion/voice";
import { speechTime, timingSignal, formatSpeechTime } from "@/lib/motion/timing";

describe("voicePoints", () => {
  it("is perfectly flat at zero amplitude (silence)", () => {
    const points = voicePoints({ width: 1000, height: 100, amplitude: 0, phase: 0, samples: 50 });
    expect(points.every(([, y]) => y === 50)).toBe(true);
  });

  it("always returns the same number of points so the path can morph", () => {
    const quiet = voicePoints({ width: 1000, height: 100, amplitude: 0, phase: 0, samples: 80 });
    const loud = voicePoints({ width: 1000, height: 100, amplitude: 1, phase: 2, samples: 80 });
    expect(quiet).toHaveLength(81);
    expect(loud).toHaveLength(81);
  });

  it("starts and ends at the centre line, like a breath in and out", () => {
    const points = voicePoints({ width: 1000, height: 100, amplitude: 1, phase: 0, samples: 80 });
    expect(points[0]![1]).toBeCloseTo(50, 5);
    expect(points.at(-1)![1]).toBeCloseTo(50, 5);
  });

  it("stays inside the box at full amplitude", () => {
    const points = voicePoints({ width: 1000, height: 100, amplitude: 1, phase: 1.3, samples: 200 });
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1000);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });
});

describe("voicePath", () => {
  it("produces an SVG path starting with a move command", () => {
    const d = voicePath({ width: 100, height: 20, amplitude: 0.5, phase: 0, samples: 4 });
    expect(d.startsWith("M0,10")).toBe(true);
    expect(d.match(/L/g)).toHaveLength(4);
  });
});

describe("speech timing (Toastmasters 5-7 minute speech)", () => {
  it("maps scroll progress onto a 7-minute speech", () => {
    expect(speechTime(0)).toBe(0);
    expect(speechTime(1)).toBe(420);
    expect(speechTime(0.5)).toBe(210);
  });

  it("clamps out-of-range progress", () => {
    expect(speechTime(-1)).toBe(0);
    expect(speechTime(2)).toBe(420);
  });

  it("shows no light before the minimum time, then green, amber, red", () => {
    expect(timingSignal(0)).toBe("off");
    expect(timingSignal(299)).toBe("off");
    expect(timingSignal(300)).toBe("green");
    expect(timingSignal(360)).toBe("amber");
    expect(timingSignal(420)).toBe("red");
  });

  it("formats seconds as m:ss", () => {
    expect(formatSpeechTime(0)).toBe("0:00");
    expect(formatSpeechTime(65)).toBe("1:05");
    expect(formatSpeechTime(420)).toBe("7:00");
  });
});
