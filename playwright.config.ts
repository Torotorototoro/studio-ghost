import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "on",
    launchOptions: {
      args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"],
    },
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
