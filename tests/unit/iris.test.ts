import { describe, expect, it } from "vitest";
import { irisPanel, irisPoint, irisSquare } from "@/lib/motion/iris";

const viewport = { width: 1440, height: 900 };
// Desktop hero panel: the right 58% of the screen.
const panel = { left: 1440 * 0.42, top: 0, width: 1440 * 0.58, height: 900 };

const corners = (clip: string) =>
  [...clip.matchAll(/([\d.]+)% ([\d.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])] as const);

describe("hero intro iris", () => {
  it("starts closed, as a point at the centre of the photo panel", () => {
    const points = corners(irisPoint(panel, viewport));
    expect(points).toHaveLength(4);
    for (const [x, y] of points) {
      expect(x).toBeCloseTo(71, 1);
      expect(y).toBeCloseTo(50, 1);
    }
  });

  it("holds as a true square (in pixels), centred on the panel and inside it", () => {
    const [[x1, y1], , [x2, y2]] = corners(irisSquare(panel, viewport)) as [
      readonly [number, number],
      unknown,
      readonly [number, number],
    ];
    const widthPx = ((x2 - x1) / 100) * viewport.width;
    const heightPx = ((y2 - y1) / 100) * viewport.height;
    expect(widthPx).toBeCloseTo(heightPx, 0);
    expect((x1 + x2) / 2).toBeCloseTo(71, 1);
    expect(x1).toBeGreaterThanOrEqual(42);
  });

  it("opens to exactly the panel, so the last intro frame matches the hero", () => {
    expect(irisPanel(panel, viewport)).toBe("polygon(42% 0%, 100% 0%, 100% 100%, 42% 100%)");
  });

  it("on phones the panel is the full screen, and the square still fits", () => {
    const phone = { width: 390, height: 844 };
    const full = { left: 0, top: 0, width: 390, height: 844 };
    expect(irisPanel(full, phone)).toBe("polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)");
    const [[x1], , [x2]] = corners(irisSquare(full, phone)) as [
      readonly [number, number],
      unknown,
      readonly [number, number],
    ];
    expect(x1).toBeGreaterThan(0);
    expect(x2).toBeLessThan(100);
  });
});
