import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'test -d node_modules || npm install; npm run dev -- --port 4173',
      cwd: '../frontend',
      url: 'http://127.0.0.1:4173/',
      reuseExistingServer: false,
      timeout: 180000,
    },
  ],
});
