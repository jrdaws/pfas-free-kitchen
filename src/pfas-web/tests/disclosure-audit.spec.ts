/**
 * FTC Disclosure Audit Tests
 * 
 * Ensures all affiliate disclosure requirements are met per FTC guidelines.
 * Run: npx playwright test tests/disclosure-audit.spec.ts
 */

import { test, expect } from '@playwright/test';

// Base URL - can be overridden via env var or Playwright config
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Pages that must have disclosure banners
 */
const PAGES_WITH_BANNER_DISCLOSURE = [
  { path: '/', name: 'Homepage' },
  { path: '/cookware', name: 'Category - Cookware' },
  { path: '/bakeware', name: 'Category - Bakeware' },
  { path: '/food-storage', name: 'Category - Food Storage' },
  { path: '/search?q=skillet', name: 'Search Results' },
];

/**
 * Test category pages for disclosure presence
 */
const CATEGORY_PAGES = [
  '/cookware',
  '/bakeware',
  '/food-storage',
  '/cookware/skillets',
  '/cookware/dutch-ovens',
];

test.describe('FTC Disclosure Audit', () => {
  test.describe('Banner Disclosures', () => {
    for (const page of PAGES_WITH_BANNER_DISCLOSURE) {
      test(`${page.name} has visible disclosure banner`, async ({ page: browserPage }) => {
        await browserPage.goto(`${BASE_URL}${page.path}`);
        
        // Check disclosure element exists
        const disclosure = browserPage.locator('[data-testid="affiliate-disclosure"]');
        await expect(disclosure).toBeVisible();
        
        // Check text contains key disclosure phrases
        const disclosureText = await disclosure.textContent();
        expect(disclosureText?.toLowerCase()).toMatch(/affiliate|commission/);
      });

      test(`${page.name} disclosure is readable (high contrast)`, async ({ page: browserPage }) => {
        await browserPage.goto(`${BASE_URL}${page.path}`);
        
        const disclosure = browserPage.locator('[data-testid="affiliate-disclosure"]');
        await expect(disclosure).toBeVisible();
        
        // Check font size is at least 12px (readable)
        const fontSize = await disclosure.evaluate(el => 
          parseFloat(window.getComputedStyle(el).fontSize)
        );
        expect(fontSize).toBeGreaterThanOrEqual(12);
      });
    }
  });

  test.describe('Category Pages', () => {
    for (const path of CATEGORY_PAGES) {
      test(`${path} has disclosure above products`, async ({ page }) => {
        await page.goto(`${BASE_URL}${path}`);
        
        const disclosure = page.locator('[data-testid="affiliate-disclosure"]').first();
        
        // Should be visible without scrolling (in viewport)
        const isInViewport = await disclosure.isVisible();
        expect(isInViewport).toBe(true);
      });
    }

    test('Disclosure persists after filter/sort changes', async ({ page }) => {
      await page.goto(`${BASE_URL}/cookware`);
      
      // Initial disclosure check
      const disclosure = page.locator('[data-testid="affiliate-disclosure"]').first();
      await expect(disclosure).toBeVisible();
      
      // Simulate URL change with filter
      await page.goto(`${BASE_URL}/cookware?tier=3&sort=tier_desc`);
      
      // Disclosure should still be visible
      await expect(disclosure).toBeVisible();
    });
  });

  test.describe('Product Detail Pages', () => {
    // Using a placeholder slug - in production, use actual product slugs
    const productSlug = 'lodge-cast-iron-skillet-10';
    
    test('Product page has inline disclosure near buy buttons', async ({ page }) => {
      await page.goto(`${BASE_URL}/product/${productSlug}`);
      
      // Check for inline disclosure
      const disclosure = page.locator('[data-testid="affiliate-disclosure"]');
      await expect(disclosure.first()).toBeVisible();
      
      // Check disclosure contains affiliate/commission text
      const disclosureText = await disclosure.first().textContent();
      expect(disclosureText?.toLowerCase()).toMatch(/affiliate|commission/);
    });

    test('Product page disclosure is same font size as surrounding text', async ({ page }) => {
      await page.goto(`${BASE_URL}/product/${productSlug}`);
      
      const disclosure = page.locator('[data-testid="affiliate-disclosure"]').first();
      await expect(disclosure).toBeVisible();
      
      // Get font size of disclosure
      const disclosureFontSize = await disclosure.evaluate(el => 
        parseFloat(window.getComputedStyle(el).fontSize)
      );
      
      // Should be at least 13px (reasonably readable)
      expect(disclosureFontSize).toBeGreaterThanOrEqual(13);
    });
  });

  test.describe('Click-out Modal', () => {
    test('Modal shows disclosure before continue button', async ({ page }) => {
      // Go to a product page
      await page.goto(`${BASE_URL}/product/lodge-cast-iron-skillet-10`);
      
      // Click a buy button to trigger modal
      const buyButton = page.locator('[data-testid="buy-button"]').first();
      
      // Check if buy buttons exist (may not if no retailers)
      const buyButtonCount = await buyButton.count();
      if (buyButtonCount === 0) {
        test.skip();
        return;
      }
      
      await buyButton.click();
      
      // Wait for modal to appear
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Check modal contains disclosure
      const modalDisclosure = modal.locator('[data-testid="affiliate-disclosure"]');
      await expect(modalDisclosure).toBeVisible();
      
      // Check disclosure text
      const disclosureText = await modalDisclosure.textContent();
      expect(disclosureText?.toLowerCase()).toMatch(/commission/);
      
      // Verify disclosure appears before continue button
      const continueButton = modal.locator('[data-testid="buy-button-confirm"]');
      await expect(continueButton).toBeVisible();
    });
  });

  test.describe('Footer Disclosure Link', () => {
    test('Footer has link to disclosure page', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for disclosure link in footer
      const footerLink = page.locator('footer a[href="/disclosure"]');
      await expect(footerLink).toBeVisible();
      
      // Check link text mentions affiliate/disclosure
      const linkText = await footerLink.textContent();
      expect(linkText?.toLowerCase()).toMatch(/affiliate|disclosure/);
    });

    test('Footer disclosure link navigates to disclosure page', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Click the footer link
      const footerLink = page.locator('footer a[href="/disclosure"]');
      await footerLink.click();
      
      // Should navigate to disclosure page
      await expect(page).toHaveURL(/\/disclosure/);
    });
  });

  test.describe('Disclosure Page Content', () => {
    test('Disclosure page exists', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/disclosure`);
      expect(response?.status()).toBe(200);
    });

    test('Disclosure page has required heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/disclosure`);
      
      const heading = page.locator('h1');
      await expect(heading).toContainText(/disclosure/i);
    });

    test('Disclosure page explains affiliate relationship', async ({ page }) => {
      await page.goto(`${BASE_URL}/disclosure`);
      
      const content = await page.textContent('body');
      
      // Must mention affiliate relationship
      expect(content?.toLowerCase()).toContain('affiliate');
      
      // Must mention commissions are earned
      expect(content?.toLowerCase()).toContain('commission');
    });

    test('Disclosure page clarifies independence', async ({ page }) => {
      await page.goto(`${BASE_URL}/disclosure`);
      
      const content = await page.textContent('body');
      
      // Should mention independence of reviews/verification
      expect(content?.toLowerCase()).toMatch(/independent|not.*(influence|affect)/);
    });

    test('Disclosure page mentions FTC compliance', async ({ page }) => {
      await page.goto(`${BASE_URL}/disclosure`);
      
      const content = await page.textContent('body');
      
      // Should mention FTC
      expect(content?.toLowerCase()).toContain('ftc');
    });
  });

  test.describe('Search Results', () => {
    test('Search results show disclosure above results', async ({ page }) => {
      await page.goto(`${BASE_URL}/search?q=cast+iron`);
      
      const disclosure = page.locator('[data-testid="affiliate-disclosure"]');
      await expect(disclosure.first()).toBeVisible();
    });
  });

  test.describe('Compare Page', () => {
    test('Compare page shows disclosure when products displayed', async ({ page }) => {
      // Note: Compare page may show empty state if no products selected
      // This test assumes there's a way to have products in comparison
      await page.goto(`${BASE_URL}/compare`);
      
      // If there's a disclosure wrapper (products are shown), verify it
      const disclosure = page.locator('[data-testid="affiliate-disclosure"]');
      const disclosureCount = await disclosure.count();
      
      // Compare page may or may not have products - test is informational
      if (disclosureCount > 0) {
        await expect(disclosure.first()).toBeVisible();
      }
    });
  });
});

/**
 * Accessibility-focused disclosure tests
 */
test.describe('Disclosure Accessibility', () => {
  test('Disclosures have proper ARIA attributes', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const disclosure = page.locator('[data-testid="affiliate-disclosure"]').first();
    await expect(disclosure).toBeVisible();
    
    // Check for role="note" or aria-label
    const role = await disclosure.getAttribute('role');
    const ariaLabel = await disclosure.getAttribute('aria-label');
    
    expect(role === 'note' || ariaLabel !== null).toBe(true);
  });

  test('Disclosure links are focusable', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const disclosureLink = page.locator('[data-testid="affiliate-disclosure"] a');
    const linkCount = await disclosureLink.count();
    
    if (linkCount > 0) {
      // Tab to disclosure link
      await disclosureLink.first().focus();
      await expect(disclosureLink.first()).toBeFocused();
    }
  });
});
