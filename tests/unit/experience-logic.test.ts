import { describe, expect, it } from "vitest";
import { agenda, agendaClock, activeAgendaIndex, meridiem, swipeProgress } from "@/lib/motion/agenda";
import { SPEECH, TABLE_TOPIC, timingSignal } from "@/lib/motion/timing";
import { nextTopicIndex, ringOffset } from "@/lib/booth/booth";

describe("agenda (Inside a meeting)", () => {
  it("follows the meeting order from the plan", () => {
    expect(agenda.map((item) => `${item.time} ${item.title}`)).toEqual([
      "10:30 Welcome",
      "10:40 Prepared Speeches",
      "11:15 Table Topics",
      "11:45 Evaluations",
      "12:15 Awards",
    ]);
  });

  it("runs the clock from 10:30 to 12:15 as the section scrolls", () => {
    expect(agendaClock(0)).toBe("10:30");
    expect(agendaClock(1)).toBe("12:15");
  });

  it("shows each agenda time exactly when its card becomes active", () => {
    const step = 1 / (agenda.length - 1);
    agenda.forEach((item, index) => {
      expect(agendaClock(index * step)).toBe(item.time);
      expect(activeAgendaIndex(index * step)).toBe(index);
    });
  });

  it("clamps progress outside 0-1", () => {
    expect(agendaClock(-0.5)).toBe("10:30");
    expect(agendaClock(3)).toBe("12:15");
    expect(activeAgendaIndex(3)).toBe(agenda.length - 1);
  });
});

describe("meridiem (a Saturday-morning meeting)", () => {
  it("is am before noon and pm from noon", () => {
    expect(meridiem("10:30")).toBe("am");
    expect(meridiem("11:59")).toBe("am");
    expect(meridiem("12:15")).toBe("pm");
  });
});

describe("swipeProgress (the agenda row on phones)", () => {
  it("maps the row's scroll position to 0-1", () => {
    expect(swipeProgress({ scrollLeft: 0, scrollWidth: 1300, clientWidth: 390 })).toBe(0);
    expect(swipeProgress({ scrollLeft: 455, scrollWidth: 1300, clientWidth: 390 })).toBe(0.5);
    expect(swipeProgress({ scrollLeft: 910, scrollWidth: 1300, clientWidth: 390 })).toBe(1);
  });

  it("is 0 when the row doesn't scroll, and clamps overscroll", () => {
    expect(swipeProgress({ scrollLeft: 0, scrollWidth: 390, clientWidth: 390 })).toBe(0);
    expect(swipeProgress({ scrollLeft: -20, scrollWidth: 1300, clientWidth: 390 })).toBe(0);
    expect(swipeProgress({ scrollLeft: 960, scrollWidth: 1300, clientWidth: 390 })).toBe(1);
  });
});

describe("Table Topics booth", () => {
  it("uses Table Topics timing: green at 1:00, amber at 1:30, red at 2:00", () => {
    expect(TABLE_TOPIC).toEqual({ green: 60, amber: 90, red: 120 });
    expect(timingSignal(59, TABLE_TOPIC)).toBe("off");
    expect(timingSignal(60, TABLE_TOPIC)).toBe("green");
    expect(timingSignal(90, TABLE_TOPIC)).toBe("amber");
    expect(timingSignal(120, TABLE_TOPIC)).toBe("red");
  });

  it("still defaults to speech timing", () => {
    expect(timingSignal(SPEECH.green)).toBe("green");
  });

  it("never gives the same topic twice in a row", () => {
    expect(nextTopicIndex(3, 10, () => 0.35)).not.toBe(3);
    for (let r = 0; r < 1; r += 0.05) {
      const next = nextTopicIndex(4, 10, () => r);
      expect(next).not.toBe(4);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(10);
    }
  });

  it("handles the first pick and a single-topic list", () => {
    expect(nextTopicIndex(null, 5, () => 0.99)).toBe(4);
    expect(nextTopicIndex(0, 1, () => 0.5)).toBe(0);
  });

  it("fills the countdown ring as time passes", () => {
    const circumference = 100;
    expect(ringOffset(0, 120, circumference)).toBe(100);
    expect(ringOffset(60, 120, circumference)).toBe(50);
    expect(ringOffset(200, 120, circumference)).toBe(0);
  });
});
