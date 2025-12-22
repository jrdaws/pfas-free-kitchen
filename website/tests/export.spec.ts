import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test('homepage shows export command in terminal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for the export command example (use first match)
    await expect(page.locator('text=framework export saas ./my-app').first()).toBeVisible();
  });

  test('homepage displays multiple export examples', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to advanced mode to see more commands
    const advancedBtn = page.locator('button:has-text("Advanced")');
    await advancedBtn.click();

    // Check for various framework commands
    await expect(page.locator('text=framework templates search saas')).toBeVisible();
    await expect(page.locator('text=framework health')).toBeVisible();
    await expect(page.locator('text=framework drift')).toBeVisible();
    await expect(page.locator('text=framework plugin add')).toBeVisible();
  });

  test('homepage shows before/after comparison with export', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for the comparison section
    await expect(page.locator('text=The Before & After')).toBeVisible();

    // Verify export command is shown in "after" section
    await expect(page.locator('text=framework export saas ./my-app')).toBeVisible();

    // Check for benefits listed
    await expect(page.locator('text=✓ Next.js 15 + App Router')).toBeVisible();
    await expect(page.locator('text=✓ TypeScript configured')).toBeVisible();
    await expect(page.locator('text=✓ Supabase auth integrated')).toBeVisible();
    await expect(page.locator('text=✓ Stripe billing connected')).toBeVisible();
  });

  test('homepage displays provider integrations info', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for provider integrations feature
    await expect(page.locator('text=Provider Integrations')).toBeVisible();

    // Verify integration examples are shown
    await expect(page.locator('text=auth.supabase, billing.stripe')).toBeVisible();
  });

  test('homepage shows quick start commands', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check beginner mode commands (default)
    await expect(page.locator('text=npm install -g @jrdaws/framework')).toBeVisible();
    await expect(page.locator('text=npm run dev')).toBeVisible();
  });

  test('homepage displays template examples', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for template registry feature
    await expect(page.locator('text=Template Registry')).toBeVisible();
    await expect(page.locator('text=framework templates list')).toBeVisible();
  });

  test('homepage shows CLI commands feature', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for CLI feature card
    await expect(page.locator('text=Powerful CLI')).toBeVisible();

    // Verify CLI commands are documented
    const featureCards = page.locator('.feature-card');
    const count = await featureCards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('homepage explains trust primitives', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for trust features
    await expect(page.locator('text=Trust Primitives')).toBeVisible();
    await expect(page.locator('text=framework drift')).toBeVisible();
  });

  test('code examples use consistent command format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // All framework commands should start with "framework"
    const codeBlocks = page.locator('code');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(5);

    // Check that multiple framework commands are present
    await expect(page.locator('code:has-text("framework")')).toHaveCount({ timeout: 5000 });
  });
});
