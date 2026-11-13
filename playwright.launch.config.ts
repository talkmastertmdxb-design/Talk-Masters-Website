import { defineConfig, devices } from "@playwright/test";

/**
 * The launch gate, closed: the server starts with LAUNCH_AT far in the future, so every page
 * must answer with the countdown (tests/launch). The main suite runs with no launch scheduled.
 */
const port = 3400;

export default defineConfig({
  testDir: "./tests/launch",
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${port}`, ...devices["Desktop Chrome"] },
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    url: `http://localhost:${port}/launch`,
    env: { LAUNCH_AT: "2099-01-01T00:00:00+04:00" },
    // Never reuse a server: one started without the gate would pass nothing through these tests.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
