/** Pure logic for the Table Topics booth (signature moment S4). */

/**
 * Picks a random topic, never the one just shown.
 * @param random injectable for tests; returns [0, 1)
 */
export function nextTopicIndex(
  current: number | null,
  count: number,
  random: () => number = Math.random,
): number {
  if (count <= 1) return 0;
  if (current === null) return Math.floor(random() * count);
  // Choose among the other count-1 topics, then shift past the current one.
  const pick = Math.floor(random() * (count - 1));
  return pick >= current ? pick + 1 : pick;
}

/** SVG stroke-dashoffset for a ring that fills as the countdown runs. */
export function ringOffset(elapsed: number, total: number, circumference: number): number {
  const progress = Math.max(0, Math.min(1, elapsed / total));
  return circumference * (1 - progress);
}
