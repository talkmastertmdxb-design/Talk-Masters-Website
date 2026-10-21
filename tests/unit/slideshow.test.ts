import { describe, expect, it } from "vitest";
import { wrapSlide } from "@/lib/motion/slideshow";
import { heroSlideshow } from "@/lib/motion/tokens";

describe("hero slideshow", () => {
  it("moves forward and wraps from the last photo to the first", () => {
    expect(wrapSlide(1, 4)).toBe(1);
    expect(wrapSlide(4, 4)).toBe(0);
  });

  it("wraps backwards from the first photo to the last", () => {
    expect(wrapSlide(-1, 4)).toBe(3);
  });

  it("stays on the only photo when there is one", () => {
    expect(wrapSlide(1, 1)).toBe(0);
    expect(wrapSlide(3, 0)).toBe(0);
  });

  it("holds each photo for 10-15 seconds with a slow crossfade", () => {
    expect(heroSlideshow.hold).toBeGreaterThanOrEqual(10);
    expect(heroSlideshow.hold).toBeLessThanOrEqual(15);
    expect(heroSlideshow.crossfade).toBeLessThan(heroSlideshow.hold / 4);
  });
});
