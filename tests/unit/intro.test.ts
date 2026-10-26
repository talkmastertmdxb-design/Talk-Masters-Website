import { afterEach, describe, expect, it, vi } from "vitest";
import {
  afterIntro,
  finishIntro,
  INTRO_CLASS,
  INTRO_EVENT,
  INTRO_REPEAT_MS,
  INTRO_STORAGE_KEY,
  introScript,
  PHONE_INTRO_CLASS,
} from "@/lib/motion/intro";

afterEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
});

describe("afterIntro", () => {
  it("runs immediately when no intro is playing", () => {
    const run = vi.fn();
    afterIntro(run);
    expect(run).toHaveBeenCalledOnce();
  });

  it("waits for the intro to finish, then runs once", () => {
    document.documentElement.classList.add(INTRO_CLASS);
    const run = vi.fn();
    afterIntro(run);
    expect(run).not.toHaveBeenCalled();
    finishIntro();
    finishIntro();
    expect(run).toHaveBeenCalledOnce();
  });

  it("can be cancelled before the intro ends", () => {
    document.documentElement.classList.add(INTRO_CLASS);
    const run = vi.fn();
    const cancel = afterIntro(run);
    cancel();
    window.dispatchEvent(new Event(INTRO_EVENT));
    expect(run).not.toHaveBeenCalled();
  });
});

describe("finishIntro", () => {
  it("removes the intro class and remembers when it was seen (across tabs)", () => {
    document.documentElement.classList.add(INTRO_CLASS);
    finishIntro();
    expect(document.documentElement.classList.contains(INTRO_CLASS)).toBe(false);
    expect(Number(localStorage.getItem(INTRO_STORAGE_KEY))).toBeGreaterThan(Date.now() - 1000);
  });
});

describe("introScript (runs in <head> before paint)", () => {
  /** Each media query answered on its own: reduced motion, and a laptop-sized screen. */
  const run = (path: string, reduced = false, laptop = true) => {
    window.history.replaceState(null, "", path);
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes("reduced-motion") ? reduced : query.includes("min-width") ? laptop : false,
    })) as unknown as typeof window.matchMedia;
    new Function(introScript)();
    return document.documentElement.classList;
  };

  it("always marks JS as available", () => {
    expect(run("/our-story").contains("js")).toBe(true);
  });

  it("plays the intro only on a first visit to the home page", () => {
    expect(run("/").contains(INTRO_CLASS)).toBe(true);
  });

  it("skips it on other pages, on repeat visits and under reduced motion", () => {
    expect(run("/members").contains(INTRO_CLASS)).toBe(false);
    document.documentElement.className = "";
    localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
    expect(run("/").contains(INTRO_CLASS)).toBe(false);
    document.documentElement.className = "";
    localStorage.clear();
    expect(run("/", true).contains(INTRO_CLASS)).toBe(false);
  });

  it("never plays on phones, where it would hold most visitors back for four seconds", () => {
    expect(run("/", false, false).contains(INTRO_CLASS)).toBe(false);
  });

  it("gives phones the short three-word moment instead, remembers it, then clears it", () => {
    vi.useFakeTimers();
    const classes = run("/", false, false);
    expect(classes.contains(PHONE_INTRO_CLASS)).toBe(true);
    expect(localStorage.getItem(INTRO_STORAGE_KEY)).not.toBeNull();
    vi.advanceTimersByTime(2200);
    expect(classes.contains(PHONE_INTRO_CLASS)).toBe(false);
    vi.useRealTimers();
  });

  it("skips the phone moment on repeat visits, other pages and under reduced motion", () => {
    localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
    expect(run("/", false, false).contains(PHONE_INTRO_CLASS)).toBe(false);
    localStorage.clear();
    expect(run("/team", false, false).contains(PHONE_INTRO_CLASS)).toBe(false);
    expect(run("/", true, false).contains(PHONE_INTRO_CLASS)).toBe(false);
  });

  it("plays again once the repeat window has passed", () => {
    localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now() - INTRO_REPEAT_MS - 1000));
    expect(run("/").contains(INTRO_CLASS)).toBe(true);
  });
});
