import { describe, expect, it } from "vitest";
import { toColumns } from "@/lib/content/testimonial-columns";

describe("toColumns", () => {
  it("deals items across columns in turn", () => {
    expect(toColumns([1, 2, 3, 4], 2, 1)).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it("repeats a short column until it reaches the minimum", () => {
    expect(toColumns([1, 2, 3], 2, 4)).toEqual([
      [1, 3, 1, 3],
      [2, 2, 2, 2],
    ]);
  });

  it("fills an empty column from the start of the list", () => {
    expect(toColumns(["a"], 2, 2)).toEqual([
      ["a", "a"],
      ["a", "a"],
    ]);
  });

  it("returns no columns for no items", () => {
    expect(toColumns([], 2, 4)).toEqual([]);
  });

  it("does not change the input", () => {
    const items = [1, 2, 3];
    toColumns(items, 2, 4);
    expect(items).toEqual([1, 2, 3]);
  });
});
