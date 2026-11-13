import { defineConfig, devices } from "@playwright/test";

/**
 * Development-mode checks. Hydration mismatches are only reported by React in
 * development, so production E2E (playwright.config.ts) cannot catch them.
 * Reuses a running `next dev` on :3000 (Next.js allows one dev server per project).
 */
export default defineConfig({
  testDir: "./tests/dev",
  timeout: 120_000,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3000", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npx next dev -p 3000",
    url: "http://localhost:3000",
    // The site is under test: launch countdown off (a reused dev server must be started the same way).
    env: { LAUNCH_AT: "off" },
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
