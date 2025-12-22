import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title or main heading is visible
    await expect(page).toHaveTitle(/Framework/i);
  });

  test('should display main content sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hero section with main heading
    await expect(page.locator('h1').first()).toContainText('From idea to production');

    // Check for feature sections (should have multiple)
    const sectionCount = await page.locator('section').count();
    expect(sectionCount).toBeGreaterThanOrEqual(2);

    // Check for main CTA buttons
    await expect(page.locator('a[href="/configure"]')).toBeVisible();
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
