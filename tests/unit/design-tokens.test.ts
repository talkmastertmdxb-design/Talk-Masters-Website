import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/design/contrast";

// Single source of truth: the colour tokens in globals.css.
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
);

const AA_TEXT = 4.5;

// Every text/background pairing the design system allows.
const textPairs: Array<[foreground: string, background: string]> = [
  ["tm-blue", "white"],
  ["ink", "soft-gray"],
  ["ink", "white"],
  ["ink-muted", "soft-gray"],
  ["ink-muted", "white"],
  ["tm-blue", "soft-gray"],
  ["white", "tm-blue"],
  ["white", "maroon"],
  ["white", "ink"],
  ["muted", "ink"],
  ["muted", "surface"],
  ["gold", "ink"],
  ["gold", "surface"],
  ["ink", "gold"],
  ["ink", "gold-hover"],
];

describe("contrastRatio", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });
});

describe("brand colour tokens", () => {
  it.each(textPairs)("%s on %s meets WCAG AA for body text", (fg, bg) => {
    expect(tokens[fg], `missing token --color-${fg}`).toBeDefined();
    expect(tokens[bg], `missing token --color-${bg}`).toBeDefined();
    expect(contrastRatio(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("gold on light backgrounds fails, so it must never be used as text there", () => {
    expect(contrastRatio(tokens.gold!, tokens["soft-gray"]!)).toBeLessThan(AA_TEXT);
  });
});
