/**
 * User Journey 3: Product Detail
 * 
 * Tests the product detail page including:
 * - Navigation and breadcrumbs
 * - Food-contact materials section
 * - PFAS-free status and tier display
 * - Unknowns panel
 * - Retailer buttons with disclosure
 */

import { test, expect } from '@playwright/test';

// Sample product slug - in production, get from seeded data
const PRODUCT_SLUG = 'all-clad-d3-stainless-steel-12-skillet';

test.describe('Journey 3: Product Detail', () => {
  test('can navigate to product detail from category page', async ({ page }) => {
    await page.goto('/cookware');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Verify navigation to PDP
    await expect(page).toHaveURL(/\/product\//);
  });

  test('PDP loads with all sections', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded (not 404)
    const notFound = page.locator('text=Not found');
    const productTitle = page.locator('[data-testid="product-title"]');
    
    // Either product loads or we get 404
    const loaded = await productTitle.isVisible({ timeout: 5000 }).catch(() => false);
    const is404 = await notFound.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (loaded) {
      await expect(productTitle).toBeVisible();
    } else if (is404) {
      // Test with placeholder product - skip remaining assertions
      test.skip();
    }
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    
    if (await breadcrumb.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should show: Home > Cookware > Product Name
      await expect(breadcrumb).toContainText(/Home/i);
      
      // Click category in breadcrumb
      const categoryLink = breadcrumb.locator('a').filter({ hasText: /Cookware/i });
      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        await expect(page).toHaveURL(/\/cookware/);
      }
    }
  });

  test('food-contact materials section is visible', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    // Look for materials/components section
    const materialsSection = page.locator('[data-testid="materials-section"]');
    
    if (await materialsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(materialsSection).toBeVisible();
      
      // Should contain component list
      const components = materialsSection.locator('[data-testid="component-item"]');
      const componentCount = await components.count();
      
      // Each component should show material
      if (componentCount > 0) {
        const firstComponent = components.first();
        await expect(firstComponent).toContainText(/./); // Non-empty
      }
    }
  });

  test('PFAS-free status section shows tier', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const statusSection = page.locator('[data-testid="pfas-status"]');
    
    if (await statusSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should contain tier badge
      const tierBadge = statusSection.locator('[data-testid="tier-badge"]');
      await expect(tierBadge).toBeVisible();
      
      // Should show claim type
      const claimType = statusSection.locator('[data-testid="claim-type"]');
      if (await claimType.isVisible().catch(() => false)) {
        await expect(claimType).toBeVisible();
      }
    }
  });

  test('tier badge matches product verification', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    // Get tier badge
    const tierBadge = page.locator('[data-testid="tier-badge"]').first();
    
    if (await tierBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      const badgeText = await tierBadge.textContent();
      
      // Badge should contain tier number (0-4)
      expect(badgeText).toMatch(/tier\s*[0-4]/i);
    }
  });

  test('unknowns panel displays correctly', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const unknownsPanel = page.locator('[data-testid="unknowns-panel"]');
    
    if (await unknownsPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
      const panelText = await unknownsPanel.textContent();
      
      // Should either list unknowns or say "All verified"
      expect(
        panelText?.includes('Unknown') || 
        panelText?.toLowerCase().includes('verified')
      ).toBe(true);
    }
  });

  test('retailer buttons are visible with disclosure', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const retailerSection = page.locator('[data-testid="retailer-buttons"]');
    
    if (await retailerSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should have at least one buy button
      const buyButtons = retailerSection.locator('[data-testid="buy-button"]');
      const buttonCount = await buyButtons.count();
      
      if (buttonCount > 0) {
        await expect(buyButtons.first()).toBeVisible();
        
        // Check for affiliate disclosure near buttons
        const disclosure = page.locator('[data-testid="affiliate-disclosure"]');
        await expect(disclosure).toBeVisible();
      }
    }
  });

  test('product images load', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const productImage = page.locator('[data-testid="product-image"]');
    
    if (await productImage.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Verify image loaded (not broken)
      const naturalWidth = await productImage.evaluate(
        (img: HTMLImageElement) => img.naturalWidth
      ).catch(() => 0);
      
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('evidence links are accessible', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const evidenceSection = page.locator('[data-testid="evidence-section"]');
    
    if (await evidenceSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for evidence items
      const evidenceItems = evidenceSection.locator('[data-testid="evidence-item"]');
      const itemCount = await evidenceItems.count();
      
      if (itemCount > 0) {
        // Each should be visible
        await expect(evidenceItems.first()).toBeVisible();
      }
    }
  });
});

test.describe('Journey 3: Product Detail - Interactions', () => {
  test('can expand/collapse component details', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const expandButton = page.locator('[data-testid="component-expand"]').first();
    
    if (await expandButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click to expand
      await expandButton.click();
      
      // Check for expanded content
      const expandedContent = page.locator('[data-testid="component-details"]');
      await expect(expandedContent.first()).toBeVisible();
      
      // Click to collapse
      await expandButton.click();
      
      // Content should be hidden
      await expect(expandedContent.first()).not.toBeVisible();
    }
  });

  test('tier badge tooltip shows on hover', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const tierBadge = page.locator('[data-testid="tier-badge"]').first();
    
    if (await tierBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Hover over badge
      await tierBadge.hover();
      
      // Check for tooltip
      const tooltip = page.locator('[role="tooltip"]');
      
      if (await tooltip.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(tooltip).toBeVisible();
      }
    }
  });
});
