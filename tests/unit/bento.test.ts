import { describe, expect, it } from "vitest";
import { bentoSpan } from "@/lib/bento";

const layout = (count: number) => Array.from({ length: count }, (_, index) => bentoSpan(index, count));
/** Every wide row after the lead pair must add up to the 6 columns. */
const wideRowsFill = (count: number) => {
  const rest = layout(count).slice(2).map((span) => span.wide[0]);
  let row = 0;
  for (const columns of rest) {
    row += columns;
    if (row > 6) return false;
    if (row === 6) row = 0;
  }
  return row === 0;
};

describe("bentoSpan", () => {
  it("leads with a 4×2 photo and a 2×2 one beside it", () => {
    expect(bentoSpan(0, 8)).toEqual({ wide: [4, 2], narrow: 2 });
    expect(bentoSpan(1, 8)).toEqual({ wide: [2, 2], narrow: 1 });
  });

  it("fills every wide row, whatever the number of photos", () => {
    for (const count of [3, 4, 5, 6, 7, 8, 9, 10]) expect(wideRowsFill(count), `${count} photos`).toBe(true);
  });

  it("widens a last row of two to half each, and a lone last photo to the full width", () => {
    expect(layout(7).slice(5).map((span) => span.wide[0])).toEqual([3, 3]);
    expect(bentoSpan(5, 6).wide[0]).toBe(6);
  });

  it("on phones, stretches a lone last photo across both columns", () => {
    expect(bentoSpan(7, 8).narrow).toBe(2);
    expect(layout(7).slice(1).every((span) => span.narrow === 1)).toBe(true);
  });

  it("gives a single photo the whole width", () => {
    expect(bentoSpan(0, 1)).toEqual({ wide: [6, 2], narrow: 2 });
  });
});
