import os from 'node:os';
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/** `smoke` = critical path on every push; `full` = all viewports before deploy */
const MODE = (process.env.PLAYWRIGHT_MODE ?? 'smoke').toLowerCase();
const isSmoke = MODE === 'smoke';
const cpuCount = Math.max(1, os.cpus()?.length ?? 2);

/**
 * BabyArtist automated E2E suite.
 *
 * Fast (default):  `npm run test:auto` / `npm run test:auto:smoke`
 * Full (pre-prod): `npm run test:auto:full`
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Smoke: stop on first failure to save CI minutes
  maxFailures: isSmoke ? 1 : undefined,
  retries: process.env.CI ? (isSmoke ? 1 : 2) : 0,
  workers: process.env.PLAYWRIGHT_WORKERS
    ? Number(process.env.PLAYWRIGHT_WORKERS)
    : cpuCount,
  timeout: isSmoke ? 45_000 : 60_000,
  expect: { timeout: isSmoke ? 10_000 : 15_000 },
  reporter: process.env.CI
    ? [['github'], ['list']]
    : [['list'], ['html', { open: 'never' }]],
  // Smoke only runs @smoke-tagged specs; full runs everything
  grep: isSmoke ? /@smoke/ : undefined,
  use: {
    baseURL: BASE_URL,
    browserName: 'chromium',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: isSmoke
    ? [
        {
          name: 'desktop-smoke',
          use: {
            browserName: 'chromium',
            viewport: { width: 1440, height: 900 },
          },
        },
      ]
    : [
        {
          name: 'desktop',
          use: {
            browserName: 'chromium',
            viewport: { width: 1440, height: 900 },
          },
        },
        {
          name: 'ipad',
          use: {
            browserName: 'chromium',
            viewport: { width: 768, height: 1024 },
            isMobile: true,
            hasTouch: true,
          },
        },
        {
          name: 'iphone',
          use: {
            browserName: 'chromium',
            viewport: { width: 390, height: 844 },
            isMobile: true,
            hasTouch: true,
          },
        },
      ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
