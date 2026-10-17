/**
 * Lists every unconfirmed piece of content so nothing placeholder ships.
 * Kept dependency-free so scripts/check-content.ts can run it with plain Node.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isStockPhoto = (value: Record<string, unknown>): boolean =>
  typeof value.src === "string" && value.src.startsWith("https://images.unsplash.com/");

function describe(value: Record<string, unknown>): string {
  if (typeof value.id !== "string") return "";
  if ("src" in value && value.src === null) return ` (image slot "${value.id}" has no photo)`;
  if (isStockPhoto(value)) return ` (image slot "${value.id}" uses a temporary Unsplash photo)`;
  return "";
}

function walk(value: unknown, path: string): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => walk(item, `${path}[${index}]`));
  }
  if (!isRecord(value)) {
    return [];
  }

  const isEmptyImageSlot = "src" in value && "id" in value && (value.src === null || isStockPhoto(value));
  const here =
    value.placeholder === true || isEmptyImageSlot ? [`${path || "(root)"}${describe(value)}`] : [];
  const children = Object.entries(value).flatMap(([key, child]) =>
    walk(child, path ? `${path}.${key}` : key),
  );
  return [...here, ...children];
}

/** @param files map of file name → parsed JSON */
export function findPlaceholders(files: Readonly<Record<string, unknown>>): string[] {
  return Object.entries(files).flatMap(([file, data]) =>
    walk(data, "").map((location) => `${file} → ${location.replace(/^\./, "")}`),
  );
}

export type { JsonValue };
