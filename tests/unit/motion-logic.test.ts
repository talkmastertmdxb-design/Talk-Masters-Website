import { describe, expect, it } from "vitest";
import { voicePath, voicePoints } from "@/lib/motion/voice";
import { timingSignal, formatSpeechTime } from "@/lib/motion/timing";

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

describe("voicePathVertical (founders timeline connector)", () => {
  it("runs top to bottom, centred, with the same wave as the horizontal line", async () => {
    const { voicePathVertical } = await import("@/lib/motion/voice");
    const d = voicePathVertical({ width: 40, height: 1000, amplitude: 0, phase: 0, samples: 4 });
    expect(d).toBe("M20,0L20,250L20,500L20,750L20,1000");
  });
});
