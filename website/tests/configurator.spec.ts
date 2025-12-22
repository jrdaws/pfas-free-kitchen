import { test, expect } from '@playwright/test';

test.describe('Configurator', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check hero section loads
    await expect(page.locator('h1')).toContainText('From idea to production');
    await expect(page.locator('body')).toBeVisible();
  });

  test('homepage displays terminal animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for terminal to appear
    const terminal = page.locator('.terminal-window').first();
    await expect(terminal).toBeVisible();

    // Check for the install command (use first match)
    await expect(page.locator('text=npm install').first()).toBeVisible({ timeout: 10000 });
  });

  test('Configure Project link navigates to configure page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the Configure Project link
    const configureLink = page.locator('a[href="/configure"]');
    await expect(configureLink).toBeVisible();
    await configureLink.click();

    // Should navigate to configure page
    await expect(page).toHaveURL('/configure');
    await page.waitForLoadState('networkidle');
  });

  test('GitHub link is present and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find GitHub link (the main CTA button)
    const githubLink = page.locator('a[href*="github.com"]').first();
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('homepage displays feature grid', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for key features section
    await expect(page.locator('text=Built for Speed, Trust & Scale')).toBeVisible();

    // Check for feature cards (should have 6)
    const featureCards = page.locator('.feature-card');
    const count = await featureCards.count();
    expect(count).toBeGreaterThanOrEqual(6);

    // Verify specific features are mentioned
    await expect(page.locator('text=Template Registry')).toBeVisible();
    await expect(page.locator('text=Plugin System')).toBeVisible();
    await expect(page.locator('text=Provider Integrations')).toBeVisible();
  });

  test('beginner/advanced toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find toggle buttons
    const beginnerBtn = page.locator('button:has-text("Beginner")');
    const advancedBtn = page.locator('button:has-text("Advanced")');

    await expect(beginnerBtn).toBeVisible();
    await expect(advancedBtn).toBeVisible();

    // Click advanced and verify content changes
    await advancedBtn.click();
    await expect(page.locator('text=framework templates search saas')).toBeVisible();

    // Click beginner and verify content changes
    await beginnerBtn.click();
    await expect(page.locator('text=framework export saas ./my-app')).toBeVisible();
  });

  test('configure page loads', async ({ page }) => {
    await page.goto('/configure');
    await page.waitForLoadState('networkidle');

    // Check the test page content
    await expect(page.locator('h1')).toContainText('Test Page');
    await expect(page.locator('text=Testing Button component')).toBeVisible();
  });
});
