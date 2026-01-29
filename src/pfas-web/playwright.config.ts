/**
 * Playwright Configuration for PFAS-Free Kitchen Frontend E2E Tests
 * 
 * Run all tests: npx playwright test
 * Run specific project: npx playwright test --project=chromium
 * Run specific file: npx playwright test tests/journeys/browse.spec.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Accessibility settings
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  },

  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /mobile\.spec\.ts/,
    },
    
    // Accessibility project
    {
      name: 'accessibility',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /accessibility\.spec\.ts/,
    },
    
    // Performance project
    {
      name: 'performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /performance\.spec\.ts/,
    },
    
    // Integration tests (pages, links, content)
    {
      name: 'integration',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /(pages|links|content|product-data)\.spec\.ts/,
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
