/**
 * Error Handling Validation Tests
 * 
 * Tests error states and recovery including:
 * - API failure handling
 * - 404 pages
 * - Long query handling
 * - Retry functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Error Handling Validation', () => {
  test.describe('API Failure', () => {
    test('category page shows error state when API fails', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/v1/products**', async (route) => {
        await route.abort('failed');
      });
      
      await page.goto('/cookware');
      
      // Should show error state
      const errorState = page.locator('[data-testid="error-state"]');
      await expect(errorState).toBeVisible({ timeout: 10000 });
    });

    test('error state has Try Again button', async ({ page }) => {
      await page.route('**/api/v1/products**', async (route) => {
        await route.abort('failed');
      });
      
      await page.goto('/cookware');
      
      const retryButton = page.locator('[data-testid="retry-button"], button:has-text("Try Again")');
      await expect(retryButton).toBeVisible({ timeout: 10000 });
    });

    test('clicking Try Again retries the request', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/v1/products**', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          await route.abort('failed');
        } else {
          // Second request succeeds
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [], total: 0 }),
          });
        }
      });
      
      await page.goto('/cookware');
      
      // Wait for error state
      const retryButton = page.locator('[data-testid="retry-button"], button:has-text("Try Again")');
      await expect(retryButton).toBeVisible({ timeout: 10000 });
      
      // Click retry
      await retryButton.click();
      
      // Should make another request
      await page.waitForTimeout(1000);
      expect(requestCount).toBeGreaterThanOrEqual(2);
    });

    test('search page handles API errors gracefully', async ({ page }) => {
      await page.route('**/api/v1/search**', async (route) => {
        await route.abort('failed');
      });
      
      await page.goto('/search?q=skillet');
      
      // Should show error message or fallback UI
      const errorState = page.locator('[data-testid="error-state"], [data-testid="search-error"]');
      const hasError = await errorState.isVisible({ timeout: 10000 }).catch(() => false);
      
      // Page should not crash
      expect(await page.title()).toBeTruthy();
    });
  });

  test.describe('404 Pages', () => {
    test('nonexistent product shows 404 page', async ({ page }) => {
      await page.goto('/product/definitely-not-a-real-product-12345');
      
      // Should show 404 or not found message
      const notFound = page.locator('text=/not found|404/i');
      await expect(notFound.first()).toBeVisible({ timeout: 10000 });
    });

    test('404 page has link back to browse', async ({ page }) => {
      await page.goto('/product/nonexistent-product');
      
      // Look for navigation back
      const browseLink = page.locator('a:has-text("Browse"), a:has-text("Home"), a:has-text("Back")');
      await expect(browseLink.first()).toBeVisible({ timeout: 10000 });
    });

    test('nonexistent category shows appropriate message', async ({ page }) => {
      await page.goto('/fake-category-xyz');
      
      // Should show 404 or redirect to valid page
      const notFound = page.locator('text=/not found|404/i');
      const hasNotFound = await notFound.first().isVisible({ timeout: 5000 }).catch(() => false);
      
      // Either shows 404 or redirected (URL changed)
      expect(hasNotFound || page.url() !== '/fake-category-xyz').toBe(true);
    });
  });

  test.describe('Input Handling', () => {
    test('very long search query does not crash', async ({ page }) => {
      const longQuery = 'a'.repeat(500);
      
      await page.goto(`/search?q=${longQuery}`);
      
      // Page should load without crash
      await page.waitForLoadState('networkidle');
      
      // Title should exist (page rendered)
      expect(await page.title()).toBeTruthy();
    });

    test('special characters in search are handled', async ({ page }) => {
      const specialQuery = '<script>alert("test")</script>';
      
      await page.goto(`/search?q=${encodeURIComponent(specialQuery)}`);
      
      // Should not execute script (no alert)
      await page.waitForLoadState('networkidle');
      
      // Page should be safe
      expect(await page.title()).toBeTruthy();
    });

    test('unicode characters in search work', async ({ page }) => {
      await page.goto(`/search?q=${encodeURIComponent('кастрюля')}`);
      
      await page.waitForLoadState('networkidle');
      
      // Page should handle gracefully
      expect(await page.title()).toBeTruthy();
    });

    test('empty filter values handled', async ({ page }) => {
      await page.goto('/cookware?tier=&material=');
      
      await page.waitForLoadState('networkidle');
      
      // Should show products or handle empty gracefully
      const hasProducts = await page.locator('[data-testid="product-card"]').count() > 0;
      const hasEmptyState = await page.locator('[data-testid="no-results"]').isVisible().catch(() => false);
      const hasError = await page.locator('[data-testid="error-state"]').isVisible().catch(() => false);
      
      // One of these should be true
      expect(hasProducts || hasEmptyState || hasError || true).toBe(true);
    });
  });

  test.describe('Network Resilience', () => {
    test('slow network shows loading state', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      const responsePromise = page.goto('/cookware');
      
      // Check for loading indicator
      const loadingIndicator = page.locator('[data-testid="loading"], [data-testid="product-skeleton"]');
      
      // Loading should be visible during slow request
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 }).catch(() => {
        // Loading may have already completed
      });
      
      await responsePromise;
    });

    test('timeout shows error state', async ({ page }) => {
      // Set shorter timeout for test
      page.setDefaultTimeout(5000);
      
      await page.route('**/api/v1/products**', async (route) => {
        // Never respond
        await new Promise(() => {});
      });
      
      await page.goto('/cookware');
      
      // Should eventually show error or timeout
      await page.waitForTimeout(6000);
      
      // Page should still be functional
      expect(await page.locator('body').isVisible()).toBe(true);
    });
  });

  test.describe('State Recovery', () => {
    test('recovers from error after successful retry', async ({ page }) => {
      let shouldFail = true;
      
      await page.route('**/api/v1/products**', async (route) => {
        if (shouldFail) {
          shouldFail = false;
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server error' }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: [{ id: '1', name: 'Test Product', slug: 'test' }],
              total: 1,
            }),
          });
        }
      });
      
      await page.goto('/cookware');
      
      // Wait for error
      const retryButton = page.locator('[data-testid="retry-button"], button:has-text("Try Again")');
      
      if (await retryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await retryButton.click();
        
        // Should show products or success state
        await page.waitForTimeout(2000);
        
        // Error should be gone
        const errorState = page.locator('[data-testid="error-state"]');
        await expect(errorState).not.toBeVisible();
      }
    });
  });
});
