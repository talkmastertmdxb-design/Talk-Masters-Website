/**
 * Deals quotes into drifting columns for the testimonials marquee. Each column repeats its
 * quotes until it holds at least `minPerColumn` cards, so one copy of the column is taller
 * than the window it scrolls through and the loop never shows a gap.
 */
export function toColumns<T>(items: readonly T[], columns: number, minPerColumn: number): T[][] {
  if (items.length === 0 || columns < 1) return [];

  const dealt = Array.from({ length: columns }, (_, column) =>
    items.filter((_, index) => index % columns === column),
  );
  // With fewer quotes than columns, the empty columns borrow from the start of the list.
  const filled = dealt.map((column, index) => {
    const start = index % items.length;
    return column.length > 0 ? column : items.slice(start, start + 1);
  });

  return filled.map((column) => {
    const copies = Math.ceil(minPerColumn / column.length);
    return Array.from({ length: Math.max(1, copies) }, () => column)
      .flat()
      .slice(0, Math.max(minPerColumn, column.length));
  });
}
