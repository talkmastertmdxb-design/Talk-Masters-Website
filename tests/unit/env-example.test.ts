import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** .env.example is committed: it must document keys, never contain real secrets. */
describe(".env.example", () => {
  const lines = readFileSync(join(process.cwd(), ".env.example"), "utf8").split(/\r?\n/);
  const entries = lines
    .map((line) => /^\s*#?\s*([A-Z0-9_]+)=(.*)$/.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map(([, key, value]) => ({ key: key!, value: value!.trim() }));

  it("documents the Unsplash key", () => {
    expect(entries.map((e) => e.key)).toContain("UNSPLASH_ACCESS_KEY");
  });

  it.each(entries.filter((e) => /KEY|SECRET|TOKEN|JSON|ID$/.test(e.key)))(
    "$key has no value (real values go in .env.local)",
    ({ value }) => {
      expect(value).toBe("");
    },
  );
});
