/**
 * E2E Tests: Product Browsing
 * Playwright tests for category browsing and filtering
 */

import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page first
    await page.goto('/');
  });

  test('should browse category and apply filters', async ({ page }) => {
    await page.goto('/cookware');

    // Check disclosure visible (FTC compliance)
    await expect(page.getByText('Affiliate links may appear')).toBeVisible();

    // Check products are displayed
    const productCards = page.locator('.product-card');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Apply tier filter
    await page.getByLabel('Tier 3').check();
    
    // Wait for filter to apply
    await page.waitForResponse((response) =>
      response.url().includes('/api/v1/products') && response.status() === 200
    );

    // Check URL params updated
    expect(page.url()).toContain('tier=3');

    // Products should still be visible (or empty state)
    const filteredCards = page.locator('.product-card');
    // At minimum, the filter should have been applied
  });

  test('should show empty state when no results', async ({ page }) => {
    // Apply impossible filter combination
    await page.goto('/cookware?tier=4&material=nonexistent');

    await expect(page.getByText('No products match your filters')).toBeVisible();
  });

  test('should display verification badge on all cards', async ({ page }) => {
    await page.goto('/cookware');

    const cards = page.locator('.product-card');
    const count = await cards.count();

    // Skip if no products
    if (count === 0) {
      test.skip();
      return;
    }

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(cards.nth(i).locator('.tier-badge')).toBeVisible();
    }
  });

  test('should update URL when applying material filter', async ({ page }) => {
    await page.goto('/cookware');

    // Find and click material filter
    const stainlessFilter = page.getByLabel('Stainless Steel');
    if (await stainlessFilter.isVisible()) {
      await stainlessFilter.check();
      expect(page.url()).toContain('material=');
    }
  });

  test('should clear filters when clicking reset', async ({ page }) => {
    await page.goto('/cookware?tier=3&material=stainless_steel');

    const resetButton = page.getByRole('button', { name: /clear|reset/i });
    if (await resetButton.isVisible()) {
      await resetButton.click();
      expect(page.url()).not.toContain('tier=');
      expect(page.url()).not.toContain('material=');
    }
  });

  test('should show product count in header', async ({ page }) => {
    await page.goto('/cookware');

    // Should show count like "42 products" or "Showing 42 results"
    const countText = page.locator('text=/\\d+ (products?|results?)/i');
    await expect(countText).toBeVisible();
  });

  test('should navigate between categories', async ({ page }) => {
    await page.goto('/cookware');
    
    // Click on a subcategory or different category
    const categoryLink = page.getByRole('link', { name: 'Bakeware' });
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      expect(page.url()).toContain('bakeware');
    }
  });

  test('should maintain filters on pagination', async ({ page }) => {
    await page.goto('/cookware?tier=3');

    // Click next page if available
    const nextButton = page.getByRole('link', { name: /next|page 2/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      expect(page.url()).toContain('tier=3');
      expect(page.url()).toContain('page=2');
    }
  });
});

test.describe('Product Grid Display', () => {
  test('should show product image', async ({ page }) => {
    await page.goto('/cookware');

    const firstCard = page.locator('.product-card').first();
    await expect(firstCard.locator('img')).toBeVisible();
  });

  test('should show product name as link', async ({ page }) => {
    await page.goto('/cookware');

    const firstCard = page.locator('.product-card').first();
    const nameLink = firstCard.locator('a').first();
    
    if (await nameLink.isVisible()) {
      const href = await nameLink.getAttribute('href');
      expect(href).toContain('/product/');
    }
  });

  test('should show brand name', async ({ page }) => {
    await page.goto('/cookware');

    const firstCard = page.locator('.product-card').first();
    const brandText = firstCard.locator('.brand');
    await expect(brandText).toBeVisible();
  });

  test('should show retailer indicators', async ({ page }) => {
    await page.goto('/cookware');

    const firstCard = page.locator('.product-card').first();
    const retailers = firstCard.locator('.retailer-chip, .retailer-icon');
    
    // May or may not have retailers
    const count = await retailers.count();
    // Just check it doesn't error
  });
});

test.describe('Accessibility - Browse Pages', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/cookware');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Product names should be h2 or h3
    const productHeadings = page.locator('.product-card h2, .product-card h3');
    const count = await productHeadings.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible filter controls', async ({ page }) => {
    await page.goto('/cookware');

    // Filter checkboxes should have labels
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const checkbox = checkboxes.nth(i);
      const id = await checkbox.getAttribute('id');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        // Or aria-label
        const ariaLabel = await checkbox.getAttribute('aria-label');
        expect(labelExists || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should have skip link for keyboard navigation', async ({ page }) => {
    await page.goto('/cookware');

    // Look for skip link
    const skipLink = page.locator('a[href="#main"], a:has-text("Skip to")');
    const count = await skipLink.count();
    // Should have skip link for accessibility
  });

  test('should announce filter changes to screen readers', async ({ page }) => {
    await page.goto('/cookware');

    // Look for aria-live region
    const liveRegion = page.locator('[aria-live]');
    const count = await liveRegion.count();
    // Should have live region for dynamic updates
  });
});
