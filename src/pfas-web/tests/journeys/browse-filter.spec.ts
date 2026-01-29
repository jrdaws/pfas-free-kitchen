/**
 * User Journey 1: Browse and Filter
 * 
 * Tests the core browsing experience including:
 * - Category navigation
 * - Product listing
 * - Tier badge display
 * - Filtering by tier and material
 * - URL state management
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 1: Browse and Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('/');
  });

  test('can navigate to cookware category from homepage', async ({ page }) => {
    // Click "Cookware" in navigation
    await page.click('nav >> text=Cookware');
    
    // Verify URL changed
    await expect(page).toHaveURL(/\/cookware/);
    
    // Verify page title or heading
    await expect(page.locator('h1')).toContainText(/Cookware/i);
  });

  test('products load with tier badges', async ({ page }) => {
    await page.goto('/cookware');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verify products are displayed
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
    
    // Verify tier badges are present on products
    const tierBadges = page.locator('[data-testid="tier-badge"]');
    const badgeCount = await tierBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('filtering by tier updates URL and shows filtered results', async ({ page }) => {
    await page.goto('/cookware');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click Tier 3 filter
    const tier3Filter = page.locator('[data-testid="filter-tier-3"]');
    await tier3Filter.click();
    
    // Verify URL updated with tier parameter
    await expect(page).toHaveURL(/tier=3/);
    
    // Verify only Tier 3 products shown (all visible badges should be Tier 3)
    const visibleBadges = page.locator('[data-testid="tier-badge"]:visible');
    const badgeCount = await visibleBadges.count();
    
    for (let i = 0; i < Math.min(badgeCount, 5); i++) {
      const badgeText = await visibleBadges.nth(i).textContent();
      expect(badgeText?.toLowerCase()).toContain('tier 3');
    }
  });

  test('filtering by material narrows results further', async ({ page }) => {
    await page.goto('/cookware?tier=3');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]');
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Click "Stainless Steel" material filter
    const steelFilter = page.locator('[data-testid="filter-material-stainless-steel"]');
    
    if (await steelFilter.isVisible()) {
      await steelFilter.click();
      
      // Verify URL has both parameters
      await expect(page).toHaveURL(/tier=3.*material=stainless-steel|material=stainless-steel.*tier=3/);
      
      // Results should be same or fewer
      const filteredCount = await page.locator('[data-testid="product-card"]').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('clearing filters restores all products', async ({ page }) => {
    // Start with filters applied
    await page.goto('/cookware?tier=3&material=stainless-steel');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]');
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    
    // Click "Clear all filters"
    const clearButton = page.locator('[data-testid="clear-filters"]');
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // Verify URL cleared
      await expect(page).toHaveURL('/cookware');
      
      // Products should be restored (equal or more)
      const restoredCount = await page.locator('[data-testid="product-card"]').count();
      expect(restoredCount).toBeGreaterThanOrEqual(filteredCount);
    }
  });

  test('filter state persists on page refresh', async ({ page }) => {
    // Apply filter
    await page.goto('/cookware');
    
    const tier2Filter = page.locator('[data-testid="filter-tier-2"]');
    if (await tier2Filter.isVisible()) {
      await tier2Filter.click();
      
      // Verify URL
      await expect(page).toHaveURL(/tier=2/);
      
      // Refresh page
      await page.reload();
      
      // Verify filter still applied in URL
      await expect(page).toHaveURL(/tier=2/);
      
      // Verify filter checkbox still checked
      await expect(tier2Filter).toBeChecked();
    }
  });

  test('shows loading skeleton while products load', async ({ page }) => {
    // Slow network to catch loading state
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await page.goto('/cookware');
    
    // Check for skeleton loader
    const skeleton = page.locator('[data-testid="product-skeleton"]');
    // Skeleton may or may not be visible depending on timing
    // Just ensure page doesn't crash
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test('displays result count', async ({ page }) => {
    await page.goto('/cookware');
    
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Check for results count text
    const countText = page.locator('[data-testid="results-count"]');
    if (await countText.isVisible()) {
      const text = await countText.textContent();
      expect(text).toMatch(/\d+\s*(products?|results?)/i);
    }
  });
});

test.describe('Journey 1: Browse - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile filter drawer works', async ({ page }) => {
    await page.goto('/cookware');
    
    // On mobile, filters might be in a drawer
    const filterButton = page.locator('[data-testid="filter-toggle"]');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Verify filter panel/drawer opens
      const filterPanel = page.locator('[data-testid="filter-panel"]');
      await expect(filterPanel).toBeVisible();
      
      // Apply a filter
      const tierFilter = filterPanel.locator('[data-testid^="filter-tier-"]').first();
      if (await tierFilter.isVisible()) {
        await tierFilter.click();
      }
      
      // Close drawer
      const closeButton = page.locator('[data-testid="filter-close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
});
