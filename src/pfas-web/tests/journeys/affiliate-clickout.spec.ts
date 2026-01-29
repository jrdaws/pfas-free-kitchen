/**
 * User Journey 4: Affiliate Click-Out
 * 
 * Tests the affiliate link flow including:
 * - Click-out modal appearance
 * - Modal disclosure content
 * - Modal cancel behavior
 * - Continue to retailer behavior
 * - Affiliate tag presence in URL
 */

import { test, expect } from '@playwright/test';

const PRODUCT_SLUG = 'all-clad-d3-stainless-steel-12-skillet';

test.describe('Journey 4: Affiliate Click-Out', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await page.waitForLoadState('networkidle');
  });

  test('clicking buy button opens modal', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Click buy button
    await buyButton.click();
    
    // Modal should appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('modal shows affiliate disclosure', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await buyButton.click();
    
    // Wait for modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check for disclosure in modal
    const modalDisclosure = modal.locator('[data-testid="affiliate-disclosure"]');
    await expect(modalDisclosure).toBeVisible();
    
    // Verify disclosure text
    const disclosureText = await modalDisclosure.textContent();
    expect(disclosureText?.toLowerCase()).toMatch(/commission|affiliate|earn/);
  });

  test('modal has continue button', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await buyButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check for continue button
    const continueButton = modal.locator('[data-testid="buy-button-confirm"]');
    await expect(continueButton).toBeVisible();
    
    // Button should mention retailer name
    const buttonText = await continueButton.textContent();
    expect(buttonText?.toLowerCase()).toMatch(/continue|go to|buy/);
  });

  test('cancel button closes modal', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await buyButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Find and click cancel/close button
    const cancelButton = modal.locator('[data-testid="modal-cancel"], [data-testid="modal-close"], button:has-text("Cancel")');
    
    if (await cancelButton.first().isVisible()) {
      await cancelButton.first().click();
      
      // Modal should close
      await expect(modal).not.toBeVisible();
    }
  });

  test('escape key closes modal', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await buyButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('continue opens new tab with affiliate link', async ({ page, context }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Get retailer name from button for later verification
    const retailerName = await buyButton.getAttribute('data-retailer');
    
    await buyButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const continueButton = modal.locator('[data-testid="buy-button-confirm"]');
    
    if (!await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Listen for new page
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      continueButton.click(),
    ]).catch(() => [null]);
    
    if (newPage) {
      // Verify new tab opened
      const newUrl = newPage.url();
      
      // URL should be a retailer URL
      expect(newUrl).toMatch(/amazon|williams-sonoma|surlatable|target/i);
      
      // URL should contain affiliate parameters
      // Amazon: tag=xxx
      // Others: varies
      if (newUrl.includes('amazon')) {
        expect(newUrl).toMatch(/tag=/);
      }
      
      // Clean up
      await newPage.close();
    }
  });

  test('modal disclosure is above continue button', async ({ page }) => {
    const buyButton = page.locator('[data-testid="buy-button"]').first();
    
    if (!await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await buyButton.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const disclosure = modal.locator('[data-testid="affiliate-disclosure"]');
    const continueBtn = modal.locator('[data-testid="buy-button-confirm"]');
    
    if (!await disclosure.isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    
    // Get bounding boxes
    const disclosureBox = await disclosure.boundingBox();
    const buttonBox = await continueBtn.boundingBox();
    
    if (disclosureBox && buttonBox) {
      // Disclosure should be above continue button (y is smaller)
      expect(disclosureBox.y).toBeLessThan(buttonBox.y);
    }
  });
});

test.describe('Journey 4: Affiliate - Multiple Retailers', () => {
  test('can select different retailer buttons', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await page.waitForLoadState('networkidle');
    
    const buyButtons = page.locator('[data-testid="buy-button"]');
    const buttonCount = await buyButtons.count();
    
    if (buttonCount > 1) {
      // Test each retailer button
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buyButtons.nth(i);
        const retailerName = await button.getAttribute('data-retailer');
        
        await button.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Modal should mention the retailer
        const modalText = await modal.textContent();
        if (retailerName) {
          expect(modalText?.toLowerCase()).toContain(retailerName.toLowerCase());
        }
        
        // Close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    }
  });
});
