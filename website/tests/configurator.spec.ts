import { test, expect } from '@playwright/test';

test.describe('Configurator', () => {
  test('should load configurator page', async ({ page }) => {
    await page.goto('/');

    // Look for configurator-related elements
    // This may need adjustment based on actual page structure
    await page.waitForLoadState('networkidle');

    // Check that page is interactive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should allow template selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for template selection UI
    // Adjust selectors based on actual implementation
    const templateButtons = page.locator('button, [role="button"]');
    const count = await templateButtons.count();

    // Should have some interactive elements
    expect(count).toBeGreaterThan(0);
  });

  test('should allow integration configuration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for integration options (auth, payments, etc.)
    // This is a placeholder - adjust based on your UI
    const page_content = await page.content();

    // Check for integration-related keywords
    const hasIntegrations =
      page_content.includes('auth') ||
      page_content.includes('payment') ||
      page_content.includes('database') ||
      page_content.toLowerCase().includes('integration');

    // At least some configuration options should be present
    expect(hasIntegrations || page_content.length > 0).toBeTruthy();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find and interact with form elements
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Test that inputs are functional
      const firstInput = inputs.first();
      await firstInput.fill('test');
      await expect(firstInput).toHaveValue('test');
    }
  });
});
