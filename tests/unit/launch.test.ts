import { describe, expect, it } from "vitest";
import {
  isConcept,
  isLaunched,
  parseLaunchAt,
  phase,
  previewSeconds,
  remaining,
  remainingSentence,
} from "@/lib/launch/launch";

const AT = new Date("2026-12-13T10:30:00+04:00");
const before = (seconds: number) => AT.getTime() - seconds * 1000;

describe("parseLaunchAt", () => {
  it("prefers the environment over settings", () => {
    expect(parseLaunchAt({ env: "2026-12-01T00:00:00Z", settings: AT.toISOString() })?.toISOString()).toBe(
      "2026-12-01T00:00:00.000Z",
    );
  });
  it("falls back to settings when the environment is empty or invalid", () => {
    expect(parseLaunchAt({ env: "", settings: AT.toISOString() })).toEqual(AT);
    expect(parseLaunchAt({ env: "soon", settings: AT.toISOString() })).toEqual(AT);
  });
  it("LAUNCH_AT=off opens the site even when settings name a date", () => {
    expect(parseLaunchAt({ env: "off", settings: AT.toISOString() })).toBeNull();
    expect(parseLaunchAt({ env: " OFF ", settings: AT.toISOString() })).toBeNull();
  });
  it("returns null when nothing is configured, so the site stays open", () => {
    expect(parseLaunchAt({})).toBeNull();
    expect(isLaunched(null, Date.now())).toBe(true);
  });
});

describe("isLaunched", () => {
  it("opens at the launch instant, not a moment before", () => {
    expect(isLaunched(AT, before(0.001))).toBe(false);
    expect(isLaunched(AT, AT.getTime())).toBe(true);
  });
});

describe("remaining", () => {
  it("splits the time into days, hours, minutes and seconds", () => {
    expect(remaining(AT, before(2 * 86_400 + 3 * 3_600 + 4 * 60 + 5))).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      total: 183_845,
    });
  });
  it("rounds up partial seconds and never goes negative", () => {
    expect(remaining(AT, before(0.2)).total).toBe(1);
    expect(remaining(AT, AT.getTime() + 5_000).total).toBe(0);
  });
});

describe("phase: the timing lights of the final minute", () => {
  it.each([
    [61, "waiting"],
    [60, "green"],
    [31, "green"],
    [30, "amber"],
    [11, "amber"],
    [10, "red"],
    [1, "red"],
    [0, "live"],
  ] as const)("%i seconds left is %s", (seconds, expected) => {
    expect(phase(seconds)).toBe(expected);
  });
});

describe("remainingSentence", () => {
  it("reads naturally", () => {
    expect(remainingSentence(remaining(AT, before(27 * 86_400 + 14 * 3_600 + 9 * 60)))).toBe(
      "27 days, 14 hours and 9 minutes",
    );
    expect(remainingSentence(remaining(AT, before(3_600 + 60)))).toBe("1 hour and 1 minute");
    expect(remainingSentence(remaining(AT, before(42)))).toBe("42 seconds");
  });
});

describe("preview and concepts", () => {
  it("accepts a positive whole number of seconds up to a week", () => {
    expect(previewSeconds("300")).toBe(300);
    expect(previewSeconds(["90"])).toBe(90);
    for (const bad of [undefined, "", "0", "-5", "1.5", "abc", String(8 * 86_400)]) {
      expect(previewSeconds(bad)).toBeNull();
    }
  });
  it("knows the launch concept", () => {
    expect(isConcept("speech")).toBe(true);
    expect(isConcept("flip-clock")).toBe(false);
  });
});
