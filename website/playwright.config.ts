import { defineConfig, devices } from '@playwright/test';

// Check if running smoke tests against a remote URL
const isSmoke = process.env.SMOKE_TEST === 'true';
const baseURL = process.env.SMOKE_TEST_URL || process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  
  // Smoke tests have a shorter timeout
  timeout: isSmoke ? 30000 : 60000,
  
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    // Smoke tests only run in Chromium for speed
    ...(isSmoke ? [] : [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ]),
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start local server if not running against remote URL or if SKIP_WEBSERVER is set
  webServer: (isSmoke && baseURL !== 'http://localhost:3000') || process.env.SKIP_WEBSERVER === 'true' ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
