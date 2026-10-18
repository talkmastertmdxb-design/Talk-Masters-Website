/**
 * Geometry for the hero intro "iris" (adapted from Hero_Animation_2): the photo opens
 * from a point, holds as a small square, then expands to exactly the hero photo panel.
 * All shapes are clip-path polygons in viewport percentages.
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const round = (n: number): number => Math.round(n * 100) / 100;

const polygon = (x1: number, y1: number, x2: number, y2: number): string =>
  `polygon(${round(x1)}% ${round(y1)}%, ${round(x2)}% ${round(y1)}%, ${round(x2)}% ${round(y2)}%, ${round(x1)}% ${round(y2)}%)`;

/** Panel rect (px) → percentages of the viewport. */
function toPercent(panel: Rect, viewport: { width: number; height: number }) {
  return {
    x1: (panel.left / viewport.width) * 100,
    y1: (panel.top / viewport.height) * 100,
    x2: ((panel.left + panel.width) / viewport.width) * 100,
    y2: ((panel.top + panel.height) / viewport.height) * 100,
  };
}

/** A point at the centre of the panel: the closed iris. */
export function irisPoint(panel: Rect, viewport: { width: number; height: number }): string {
  const { x1, y1, x2, y2 } = toPercent(panel, viewport);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return polygon(cx, cy, cx, cy);
}

/**
 * The held square, centred on the panel. `size` is a fraction of the viewport's
 * shorter side, so it stays square on any screen and never leaves the panel.
 */
export function irisSquare(panel: Rect, viewport: { width: number; height: number }, size = 0.32): string {
  const { x1, y1, x2, y2 } = toPercent(panel, viewport);
  const side = Math.min(viewport.width, viewport.height) * size;
  const halfW = Math.min(((side / viewport.width) * 100) / 2, (x2 - x1) / 2);
  const halfH = Math.min(((side / viewport.height) * 100) / 2, (y2 - y1) / 2);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return polygon(cx - halfW, cy - halfH, cx + halfW, cy + halfH);
}

/** The open iris: exactly the hero photo panel. */
export function irisPanel(panel: Rect, viewport: { width: number; height: number }): string {
  const { x1, y1, x2, y2 } = toPercent(panel, viewport);
  return polygon(x1, y1, x2, y2);
}
