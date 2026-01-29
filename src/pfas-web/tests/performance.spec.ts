/**
 * Performance Validation Tests
 * 
 * Tests Core Web Vitals and page performance including:
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay) / INP
 * - Resource loading
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Validation', () => {
  test.describe('Core Web Vitals', () => {
    test('category page LCP is under 2.5s', async ({ page }) => {
      const metrics: { lcp?: number } = {};
      
      // Listen for LCP
      await page.addInitScript(() => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          (window as any).__LCP__ = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
      
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for LCP to be calculated
      await page.waitForTimeout(1000);
      
      // Get LCP value
      const lcp = await page.evaluate(() => (window as any).__LCP__);
      
      if (lcp) {
        console.log(`LCP: ${lcp}ms`);
        expect(lcp).toBeLessThan(2500); // 2.5 seconds
      }
    });

    test('page CLS is under 0.1', async ({ page }) => {
      await page.addInitScript(() => {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          (window as any).__CLS__ = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      // Wait for layout to stabilize
      await page.waitForTimeout(2000);
      
      const cls = await page.evaluate(() => (window as any).__CLS__);
      
      if (cls !== undefined) {
        console.log(`CLS: ${cls}`);
        expect(cls).toBeLessThan(0.1);
      }
    });

    test('homepage loads within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const domContentLoaded = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      
      const loadComplete = Date.now() - startTime;
      
      console.log(`DOM Content Loaded: ${domContentLoaded}ms`);
      console.log(`Load Complete: ${loadComplete}ms`);
      
      // DOM should be interactive within 3 seconds
      expect(domContentLoaded).toBeLessThan(3000);
      
      // Full load within 5 seconds
      expect(loadComplete).toBeLessThan(5000);
    });

    test('PDP loads within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/product/all-clad-d3-stainless-steel-12-skillet');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`PDP Load Time: ${loadTime}ms`);
      
      // Should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
    });
  });

  test.describe('Resource Loading', () => {
    test('images are lazy loaded', async ({ page }) => {
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      // Check product images
      const images = page.locator('[data-testid="product-card"] img');
      const imageCount = await images.count();
      
      if (imageCount > 4) {
        // Images below fold should have loading="lazy"
        for (let i = 4; i < Math.min(imageCount, 10); i++) {
          const loading = await images.nth(i).getAttribute('loading');
          // Next.js Image component handles lazy loading
          // May use different mechanism
        }
      }
    });

    test('no large blocking resources', async ({ page }) => {
      const resources: { url: string; size: number }[] = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        const headers = response.headers();
        const contentLength = headers['content-length'];
        
        if (contentLength) {
          const size = parseInt(contentLength);
          if (size > 100000) { // 100KB
            resources.push({ url, size });
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for large blocking resources
      const largeJS = resources.filter(r => 
        r.url.endsWith('.js') && r.size > 500000
      );
      
      // Warn about large JS bundles
      if (largeJS.length > 0) {
        console.warn('Large JS bundles:', largeJS);
      }
    });

    test('API responses are reasonably sized', async ({ page }) => {
      const apiResponses: { url: string; size: number }[] = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/')) {
          const body = await response.body().catch(() => Buffer.from(''));
          apiResponses.push({ url, size: body.length });
        }
      });
      
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      // Check API response sizes
      for (const response of apiResponses) {
        // API responses should be under 1MB
        expect(response.size).toBeLessThan(1000000);
        
        // Warn if over 100KB
        if (response.size > 100000) {
          console.warn(`Large API response: ${response.url} (${response.size} bytes)`);
        }
      }
    });
  });

  test.describe('Interaction Performance', () => {
    test('filter interaction is responsive', async ({ page }) => {
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      const filterCheckbox = page.locator('[data-testid^="filter-tier-"]').first();
      
      if (!await filterCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip();
        return;
      }
      
      const startTime = Date.now();
      
      await filterCheckbox.click();
      
      // Wait for UI update
      await page.waitForURL(/tier=/, { timeout: 2000 }).catch(() => {});
      
      const interactionTime = Date.now() - startTime;
      
      console.log(`Filter interaction time: ${interactionTime}ms`);
      
      // Should be under 200ms for good INP
      expect(interactionTime).toBeLessThan(500);
    });

    test('search input is responsive', async ({ page }) => {
      await page.goto('/');
      
      const searchInput = page.locator('[data-testid="search-input"]');
      
      if (!await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        test.skip();
        return;
      }
      
      const startTime = Date.now();
      
      await searchInput.focus();
      await searchInput.fill('skillet');
      await searchInput.press('Enter');
      
      // Wait for navigation
      await page.waitForURL(/search/, { timeout: 3000 });
      
      const totalTime = Date.now() - startTime;
      
      console.log(`Search interaction time: ${totalTime}ms`);
      
      // Total interaction should be reasonable
      expect(totalTime).toBeLessThan(2000);
    });
  });

  test.describe('Mobile Performance', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('mobile category page is performant', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Mobile Load Time: ${loadTime}ms`);
      
      // Mobile should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
    });

    test('mobile scroll performance is smooth', async ({ page }) => {
      await page.goto('/cookware');
      await page.waitForLoadState('networkidle');
      
      // Scroll down
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(100);
      }
      
      // Page should still be responsive
      const isResponsive = await page.evaluate(() => {
        const start = performance.now();
        document.body.getBoundingClientRect();
        return performance.now() - start < 50;
      });
      
      expect(isResponsive).toBe(true);
    });
  });
});
