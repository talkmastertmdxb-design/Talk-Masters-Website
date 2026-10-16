/**
 * Lists every unconfirmed piece of content so nothing placeholder ships.
 * Kept dependency-free so scripts/check-content.ts can run it with plain Node.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(value: Record<string, unknown>): string {
  if ("src" in value && value.src === null && typeof value.id === "string") {
    return ` (image slot "${value.id}" has no photo)`;
  }
  return "";
}

function walk(value: unknown, path: string): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => walk(item, `${path}[${index}]`));
  }
  if (!isRecord(value)) {
    return [];
  }

  const isEmptyImageSlot = "src" in value && value.src === null && "id" in value;
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
