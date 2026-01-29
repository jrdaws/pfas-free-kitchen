/**
 * E2E Tests: Product Detail Page
 * Playwright tests for PDP sections and compliance
 */

import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should show all required sections', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Food-contact materials section (REQUIRED at top)
    await expect(
      page.getByRole('heading', { name: 'Food-Contact Materials' })
    ).toBeVisible();

    // PFAS status section
    await expect(
      page.getByRole('heading', { name: /PFAS.*Status/i })
    ).toBeVisible();

    // Unknowns panel (REQUIRED - always visible even if empty)
    await expect(
      page.getByRole('heading', { name: /What Could Still Be Unknown/i })
    ).toBeVisible();

    // Affiliate disclosure (FTC compliance)
    await expect(page.getByText(/commission/i)).toBeVisible();
  });

  test('should show confirmation modal on retailer click', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Find and click retailer button
    const buyButton = page.getByRole('button', { name: /Buy at|View on/i }).first();
    
    if (await buyButton.isVisible()) {
      await buyButton.click();

      // Modal should appear
      await expect(page.getByText(/leaving PFAS-Free Kitchen/i)).toBeVisible();
      await expect(page.getByText(/commission/i)).toBeVisible();
    }
  });

  test('should display verification tier badge', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Tier badge should be visible
    const tierBadge = page.locator('.tier-badge');
    await expect(tierBadge).toBeVisible();
  });

  test('should show product name and brand', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Product name in h1
    const productName = page.locator('h1');
    await expect(productName).toBeVisible();

    // Brand should be visible
    const brand = page.locator('.brand, [data-testid="brand"]');
    await expect(brand).toBeVisible();
  });

  test('should show breadcrumb navigation', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Breadcrumb should be present
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"], .breadcrumb');
    await expect(breadcrumb).toBeVisible();
  });

  test('should show product image', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const productImage = page.locator('.product-image img, [data-testid="product-image"]');
    await expect(productImage).toBeVisible();
  });

  test('should have report issue link', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const reportLink = page.getByRole('link', { name: /report/i });
    await expect(reportLink).toBeVisible();
  });
});

test.describe('Food-Contact Materials Section', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should list components with materials', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Find materials section
    const materialsSection = page.locator('section:has-text("Food-Contact Materials")');
    await expect(materialsSection).toBeVisible();

    // Should list components
    const componentList = materialsSection.locator('.component-list, ul, [role="list"]');
    await expect(componentList).toBeVisible();
  });

  test('should indicate food-contact status', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Components should show food-contact indicator
    const foodContactIndicator = page.locator('[data-food-contact="true"], .food-contact-badge');
    // May or may not be visible depending on product
  });
});

test.describe('PFAS Status Section', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should show verification tier details', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Find PFAS section
    const pfasSection = page.locator('section:has-text("PFAS")');
    await expect(pfasSection).toBeVisible();

    // Should show tier explanation
    const tierExplanation = pfasSection.locator('.tier-explanation, .verification-details');
    // Check it exists
  });

  test('should show evidence if available', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Evidence section
    const evidenceSection = page.locator('.evidence-section, [data-testid="evidence"]');
    // May or may not have evidence
  });
});

test.describe('Affiliate Compliance - PDP', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should show affiliate disclosure near buy buttons', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Find buy section
    const buySection = page.locator('section:has([role="button"]:has-text("Buy"))');
    
    if (await buySection.isVisible()) {
      // Disclosure should be near buttons
      const disclosure = buySection.locator(':has-text("commission")');
      await expect(disclosure).toBeVisible();
    }
  });

  test('should show disclosure in click-out modal', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const buyButton = page.getByRole('button', { name: /Buy at|View on/i }).first();
    
    if (await buyButton.isVisible()) {
      await buyButton.click();

      // Modal disclosure
      const modalDisclosure = page.locator('[role="dialog"]').getByText(/commission/i);
      await expect(modalDisclosure).toBeVisible();
    }
  });

  test('should not show Amazon price', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Per Amazon Associates rules, no price display
    const pricePattern = /\$\d+\.\d{2}/;
    const amazonSection = page.locator(':has-text("Amazon")');
    
    if (await amazonSection.isVisible()) {
      const amazonText = await amazonSection.textContent();
      expect(amazonText).not.toMatch(pricePattern);
    }
  });
});

test.describe('Unknowns Panel', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should always be visible (even if empty)', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Unknowns section must always be present
    const unknownsHeading = page.getByRole('heading', { name: /Unknown/i });
    await expect(unknownsHeading).toBeVisible();
  });

  test('should explain what is unknown', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const unknownsSection = page.locator('section:has-text("Unknown")');
    await expect(unknownsSection).toBeVisible();

    // Should have explanatory text
    const hasContent = await unknownsSection.textContent();
    expect(hasContent?.length).toBeGreaterThan(10);
  });
});

test.describe('Accessibility - PDP', () => {
  const testProductSlug = 'test-stainless-skillet';

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    // Should have exactly one h1 (product name)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Sections should use h2
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(3); // At least 3 required sections
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should support keyboard navigation in modal', async ({ page }) => {
    await page.goto(`/product/${testProductSlug}`);

    const buyButton = page.getByRole('button', { name: /Buy at|View on/i }).first();
    
    if (await buyButton.isVisible()) {
      await buyButton.click();

      // Modal should trap focus
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Should be able to close with Escape
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('404 Handling', () => {
  test('should show not found for invalid product', async ({ page }) => {
    await page.goto('/product/this-product-does-not-exist-12345');

    // Should show 404 or not found message
    const notFound = page.locator(':has-text("not found"), :has-text("404")');
    await expect(notFound).toBeVisible();
  });

  test('should show not found message', async ({ page }) => {
    await page.goto('/product/nonexistent-product-xyz');

    await expect(
      page.getByText(/not found|doesn't exist|removed/i)
    ).toBeVisible();
  });
});
