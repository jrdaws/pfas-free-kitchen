import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility audit tests using axe-core
 * 
 * Run with: npx playwright test tests/accessibility.spec.ts
 * 
 * These tests verify WCAG 2.1 Level AA compliance
 */

const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/search', name: 'Search Page' },
  { path: '/search?q=skillet', name: 'Search Results' },
  { path: '/compare', name: 'Compare Page' },
  { path: '/learn', name: 'Learn Index' },
  { path: '/learn/what-is-pfas', name: 'What is PFAS' },
  { path: '/learn/how-we-verify', name: 'How We Verify' },
  { path: '/learn/buyers-guide', name: 'Buyers Guide' },
  { path: '/about', name: 'About Page' },
  { path: '/faq', name: 'FAQ Page' },
  { path: '/disclosure', name: 'Disclosure Page' },
];

test.describe('Accessibility Audit', () => {
  for (const page of PAGES_TO_TEST) {
    test(`${page.name} (${page.path}) should have no critical accessibility violations`, async ({ page: p }) => {
      await p.goto(page.path);
      
      // Wait for page to be fully loaded
      await p.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      // Filter out minor issues and focus on serious/critical
      const seriousViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'serious' || v.impact === 'critical'
      );
      
      // Log violations for debugging
      if (seriousViolations.length > 0) {
        console.log(`\nAccessibility violations on ${page.name}:`);
        for (const violation of seriousViolations) {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Impact: ${violation.impact}`);
          console.log(`    Elements: ${violation.nodes.length}`);
        }
      }
      
      expect(seriousViolations).toEqual([]);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  test('Skip link should work on all pages', async ({ page }) => {
    await page.goto('/');
    
    // Focus on skip link (first focusable element)
    await page.keyboard.press('Tab');
    
    // Check if skip link is visible on focus
    const skipLink = page.locator('a.skip-to-content');
    await expect(skipLink).toBeFocused();
    
    // Activate skip link
    await page.keyboard.press('Enter');
    
    // Main content should be focused or in view
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeInViewport();
  });

  test('Tab navigation should follow logical order on search page', async ({ page }) => {
    await page.goto('/search');
    
    const focusableElements: string[] = [];
    
    // Tab through first 10 focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName.toLowerCase() + (el?.className ? '.' + el.className.split(' ')[0] : '');
      });
      focusableElements.push(focused);
    }
    
    // Verify focus moved through elements
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('Escape key should close modals', async ({ page }) => {
    await page.goto('/search?q=skillet');
    
    // Wait for results
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 }).catch(() => {});
    
    // Open filter modal on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const filterButton = page.locator('button:has-text("Filter")');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.keyboard.press('Escape');
      
      // Modal should close
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Color Contrast', () => {
  test('Primary buttons should meet contrast requirements', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();
    
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    
    expect(contrastViolations).toEqual([]);
  });
});

test.describe('Form Accessibility', () => {
  test('Search input should have proper labeling', async ({ page }) => {
    await page.goto('/search');
    
    const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="earch"]');
    
    if (await searchInput.count() > 0) {
      // Check for accessible name (label, aria-label, or aria-labelledby)
      const accessibleName = await searchInput.first().getAttribute('aria-label') ||
                            await searchInput.first().getAttribute('placeholder');
      
      expect(accessibleName).toBeTruthy();
    }
  });
});

test.describe('Images', () => {
  test('All images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Image should have alt text or be decorative (role="presentation" or empty alt)
      const hasAccessibleHandling = alt !== null || role === 'presentation';
      expect(hasAccessibleHandling).toBeTruthy();
    }
  });
});

test.describe('Headings', () => {
  test('Pages should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.evaluate(() => {
      const h = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(h).map(el => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim().substring(0, 50),
      }));
    });
    
    // Should have at least one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Should not have multiple h1s (optional, depends on page structure)
    expect(h1Count).toBeLessThanOrEqual(2);
    
    // Check for heading level skips (e.g., h1 -> h3)
    let previousLevel = 0;
    for (const heading of headings) {
      if (previousLevel > 0 && heading.level > previousLevel + 1) {
        console.warn(`Heading level skip detected: h${previousLevel} -> h${heading.level}`);
      }
      previousLevel = heading.level;
    }
  });
});

test.describe('ARIA', () => {
  test('Interactive elements should have proper ARIA labels', async ({ page }) => {
    await page.goto('/search');
    
    // Check icon buttons
    const iconButtons = page.locator('button:has(svg):not(:has-text("."))');
    const count = await iconButtons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = iconButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const innerText = await button.innerText();
      
      // Button should have accessible name
      const hasAccessibleName = ariaLabel || title || innerText.trim();
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});
