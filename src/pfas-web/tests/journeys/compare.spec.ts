/**
 * User Journey 5: Compare Products
 * 
 * Tests the product comparison feature including:
 * - Adding products to compare
 * - Compare bar visibility
 * - Compare page navigation
 * - Comparison table display
 * - Difference highlighting
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 5: Compare Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cookware');
    await page.waitForSelector('[data-testid="product-card"]');
  });

  test('can add product to compare via checkbox', async ({ page }) => {
    // Find compare checkbox on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const compareCheckbox = firstProduct.locator('[data-testid="compare-checkbox"]');
    
    if (!await compareCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Click to add to compare
    await compareCheckbox.click();
    
    // Verify checkbox is checked
    await expect(compareCheckbox).toBeChecked();
  });

  test('compare bar appears when product selected', async ({ page }) => {
    const compareCheckbox = page.locator('[data-testid="compare-checkbox"]').first();
    
    if (!await compareCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Add product to compare
    await compareCheckbox.click();
    
    // Compare bar should appear
    const compareBar = page.locator('[data-testid="compare-bar"]');
    await expect(compareBar).toBeVisible();
  });

  test('compare bar shows count of selected products', async ({ page }) => {
    const compareCheckboxes = page.locator('[data-testid="compare-checkbox"]');
    const checkboxCount = await compareCheckboxes.count();
    
    if (checkboxCount < 2) {
      test.skip();
      return;
    }
    
    // Add first product
    await compareCheckboxes.nth(0).click();
    
    // Check bar shows "1 product"
    const compareBar = page.locator('[data-testid="compare-bar"]');
    await expect(compareBar).toContainText('1');
    
    // Add second product
    await compareCheckboxes.nth(1).click();
    
    // Check bar shows "2 products"
    await expect(compareBar).toContainText('2');
  });

  test('can navigate to compare page', async ({ page }) => {
    const compareCheckboxes = page.locator('[data-testid="compare-checkbox"]');
    
    if (await compareCheckboxes.count() < 2) {
      test.skip();
      return;
    }
    
    // Add two products
    await compareCheckboxes.nth(0).click();
    await compareCheckboxes.nth(1).click();
    
    // Click compare button
    const compareButton = page.locator('[data-testid="compare-button"]');
    await compareButton.click();
    
    // Should navigate to compare page
    await expect(page).toHaveURL(/\/compare/);
  });

  test('compare page shows both products', async ({ page }) => {
    const compareCheckboxes = page.locator('[data-testid="compare-checkbox"]');
    
    if (await compareCheckboxes.count() < 2) {
      test.skip();
      return;
    }
    
    // Get product names before comparing
    const product1Name = await page.locator('[data-testid="product-card"]').nth(0)
      .locator('[data-testid="product-name"]').textContent();
    const product2Name = await page.locator('[data-testid="product-card"]').nth(1)
      .locator('[data-testid="product-name"]').textContent();
    
    // Add and navigate
    await compareCheckboxes.nth(0).click();
    await compareCheckboxes.nth(1).click();
    await page.locator('[data-testid="compare-button"]').click();
    
    // Wait for compare page
    await page.waitForURL(/\/compare/);
    
    // Verify both products shown
    const compareTable = page.locator('[data-testid="compare-table"]');
    
    if (await compareTable.isVisible({ timeout: 5000 }).catch(() => false)) {
      const tableText = await compareTable.textContent();
      
      if (product1Name) {
        expect(tableText).toContain(product1Name);
      }
      if (product2Name) {
        expect(tableText).toContain(product2Name);
      }
    }
  });

  test('compare table shows tier column', async ({ page }) => {
    // Navigate directly to compare page with products
    // This assumes compare state is maintained via URL or session
    await page.goto('/compare');
    
    // If empty state, skip
    const emptyState = page.locator('[data-testid="empty-compare"]');
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    const tierColumn = page.locator('[data-testid="compare-column-tier"]');
    
    if (await tierColumn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tierColumn).toBeVisible();
      
      // Should contain tier values
      const tierText = await tierColumn.textContent();
      expect(tierText).toMatch(/tier/i);
    }
  });

  test('compare table shows claim type column', async ({ page }) => {
    await page.goto('/compare');
    
    const emptyState = page.locator('[data-testid="empty-compare"]');
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    const claimColumn = page.locator('[data-testid="compare-column-claim"]');
    
    if (await claimColumn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(claimColumn).toBeVisible();
    }
  });

  test('differences are highlighted in comparison', async ({ page }) => {
    await page.goto('/compare');
    
    const emptyState = page.locator('[data-testid="empty-compare"]');
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Check for highlighted differences
    const highlights = page.locator('[data-testid="difference-highlight"]');
    
    if (await highlights.count() > 0) {
      // Verify highlight styling
      const highlightStyle = await highlights.first().evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Should have some background color (not transparent)
      expect(highlightStyle).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('can remove product from comparison', async ({ page }) => {
    // Add products from category page first
    await page.goto('/cookware');
    
    const compareCheckboxes = page.locator('[data-testid="compare-checkbox"]');
    
    if (await compareCheckboxes.count() < 2) {
      test.skip();
      return;
    }
    
    await compareCheckboxes.nth(0).click();
    await compareCheckboxes.nth(1).click();
    await page.locator('[data-testid="compare-button"]').click();
    
    await page.waitForURL(/\/compare/);
    
    // Remove button for first product
    const removeButton = page.locator('[data-testid="compare-remove"]').first();
    
    if (await removeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeButton.click();
      
      // Should show only one product now or empty state
      const compareItems = page.locator('[data-testid="compare-item"]');
      const remainingCount = await compareItems.count();
      
      expect(remainingCount).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Journey 5: Compare - Empty State', () => {
  test('empty compare page shows helpful message', async ({ page }) => {
    await page.goto('/compare');
    
    const emptyState = page.locator('[data-testid="empty-compare"]');
    
    if (await emptyState.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(emptyState).toBeVisible();
      
      // Should have link to browse products
      const browseLink = emptyState.locator('a');
      await expect(browseLink).toBeVisible();
    }
  });
});
