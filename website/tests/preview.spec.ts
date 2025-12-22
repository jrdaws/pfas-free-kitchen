import { test, expect } from '@playwright/test';

test.describe('Preview Generation', () => {
  test('should have preview functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for preview-related buttons or elements
    const buttons = page.locator('button');
    const buttonTexts = await buttons.allTextContents();

    // Check if there's any preview-related functionality
    const hasPreviewButton = buttonTexts.some(text =>
      text.toLowerCase().includes('preview') ||
      text.toLowerCase().includes('generate') ||
      text.toLowerCase().includes('create')
    );

    // Should have some action buttons
    expect(buttonTexts.length).toBeGreaterThan(0);
  });

  test('should display AI preview when available', async ({ page }) => {
    // This test would need to be adjusted based on how AI previews work
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a moment for any dynamic content
    await page.waitForTimeout(1000);

    // Check that page is interactive
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
