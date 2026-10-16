/**
 * Lists every placeholder still in /content (unconfirmed facts, missing photos).
 *   npm run check:content          → report only
 *   npm run check:content -- --strict → exit 1 if anything remains (use before launch)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findPlaceholders } from "../src/lib/content/audit.ts";

const contentDir = join(import.meta.dirname, "..", "content");
const strict = process.argv.includes("--strict");

const files = Object.fromEntries(
  readdirSync(contentDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => [name, JSON.parse(readFileSync(join(contentDir, name), "utf8")) as unknown]),
);

const report = findPlaceholders(files);

if (report.length === 0) {
  process.stdout.write("✓ No placeholders left. Content is ready to publish.\n");
  process.exit(0);
}

process.stdout.write(`${report.length} placeholder(s) still to replace:\n`);
for (const line of report) process.stdout.write(`  • ${line}\n`);
process.exit(strict ? 1 : 0);
