import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    ...devices["Pixel 7"],
    browserName: "chromium",
    baseURL: "http://localhost:8092",
    timezoneId: "Asia/Kolkata",
  },
  webServer: {
    command: "npx expo start --web --port 8092 --clear",
    env: { CI: "1" },
    url: "http://localhost:8092",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
