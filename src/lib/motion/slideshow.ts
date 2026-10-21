/** Keeps a slide index in range, wrapping at both ends: -1 is the last slide, `count` is the first. */
export function wrapSlide(index: number, count: number): number {
  if (count < 1) return 0;
  return ((index % count) + count) % count;
}
