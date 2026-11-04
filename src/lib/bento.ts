export interface BentoSpan {
  /** Columns and rows on the wide grid (6 columns). */
  wide: [columns: number, rows: number];
  /** Columns on the phone grid (2 columns). */
  narrow: number;
}

/**
 * Where tile `index` of `count` sits in a bento gallery. Wide screens: the first photo leads at
 * 4×2 with the second standing beside it at 2×2, then rows of three; a last row of two or one
 * widens to fill. Phones: the lead spans both columns, and a lone last tile does too.
 */
export function bentoSpan(index: number, count: number): BentoSpan {
  if (index === 0) return { wide: [count === 1 ? 6 : 4, 2], narrow: 2 };
  if (index === 1) return { wide: [2, 2], narrow: 1 };
  const rest = count - 2;
  const lastRow = rest % 3;
  const inLastRow = lastRow > 0 && index - 2 >= rest - lastRow;
  const aloneOnPhones = (count - 1) % 2 === 1 && index === count - 1;
  return { wide: [inLastRow ? 6 / lastRow : 2, 1], narrow: aloneOnPhones ? 2 : 1 };
}
