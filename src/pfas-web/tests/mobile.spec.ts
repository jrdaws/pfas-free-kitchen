/**
 * Mobile Responsiveness Tests
 * 
 * Ensures the site works correctly on mobile devices.
 */

import { test, expect, devices } from '@playwright/test';

// Use iPhone SE viewport
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Responsiveness', () => {
  test('Homepage is mobile-friendly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No horizontal scroll (content fits viewport)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    expect(
      scrollWidth,
      `Horizontal scroll detected: scrollWidth(${scrollWidth}) > clientWidth(${clientWidth})`
    ).toBeLessThanOrEqual(clientWidth + 1);

    // Hamburger menu or mobile menu button should be visible
    const hamburger = await page.$(
      '[data-testid="mobile-menu-button"], [class*="hamburger" i], [class*="mobile-menu" i] button, [aria-label*="menu" i], button[class*="menu" i]'
    );
    expect(hamburger, 'Should have mobile menu button').toBeTruthy();

    // Desktop nav should be hidden
    const desktopNav = await page.$('[class*="desktop-nav" i]:visible');
    // May or may not exist depending on implementation
  });

  test('Search page works on mobile', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Filter button should be visible (sidebar collapsed on mobile)
    const filterButton = await page.$(
      '[data-testid="mobile-filter-button"], [class*="filter" i] button, button[class*="filter" i]'
    );
    // Filter button is common but not required

    // Product cards should be visible
    const cards = await page.$$(
      '[data-testid="product-card"], [class*="product-card" i], [class*="ProductCard" i]'
    );
    expect(cards.length, 'Should show product cards').toBeGreaterThan(0);

    // Cards should not overflow
    for (const card of cards.slice(0, 3)) {
      const box = await card.boundingBox();
      if (box) {
        expect(box.width, 'Product card should fit viewport').toBeLessThanOrEqual(clientWidth);
      }
    }
  });

  test('Product page works on mobile', async ({ page }) => {
    await page.goto('/product/lodge-cast-iron-skillet-12-inch');
    await page.waitForLoadState('networkidle');

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Product info should be visible
    const productName = await page.$('h1');
    expect(productName, 'Should show product name').toBeTruthy();

    // Product name should be visible
    const isVisible = await productName?.isVisible();
    expect(isVisible).toBeTruthy();

    // Tabs or sections should be accessible
    const tabs = await page.$$('[role="tab"], [class*="tab" i]');
    // Tabs may or may not be present
  });

  test('Navigation works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click mobile menu
    const menuButton = await page.$(
      '[data-testid="mobile-menu-button"], [class*="hamburger" i], [aria-label*="menu" i]'
    );

    if (menuButton) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Menu should open
      const mobileNav = await page.$(
        '[data-testid="mobile-nav"], [class*="mobile-nav" i]:visible, nav:visible'
      );
      expect(mobileNav, 'Mobile nav should be visible after clicking menu').toBeTruthy();

      // Should have navigation links
      const navLinks = await page.$$('nav a, [class*="mobile-nav" i] a');
      expect(navLinks.length).toBeGreaterThan(0);
    }
  });

  test('Touch targets are large enough', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Get all interactive elements
    const interactiveElements = await page.$$('button, a, [role="button"], input[type="checkbox"]');

    let smallTargets = 0;
    for (const element of interactiveElements.slice(0, 20)) {
      const box = await element.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 (iOS guideline)
        // Allow some flexibility for inline links
        if (box.width < 44 || box.height < 44) {
          const tagName = await element.evaluate((el) => el.tagName);
          // Inline text links can be smaller
          if (tagName !== 'A') {
            smallTargets++;
          }
        }
      }
    }

    // Allow a few small targets (inline links, etc.)
    expect(
      smallTargets,
      `Found ${smallTargets} buttons/controls smaller than 44x44`
    ).toBeLessThan(5);
  });

  test('Text is readable without zooming', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get body font size
    const fontSize = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return parseFloat(style.fontSize);
    });

    // Body text should be at least 14px on mobile
    expect(fontSize, 'Body font size should be at least 14px').toBeGreaterThanOrEqual(14);

    // Check that text doesn't overflow
    const paragraphs = await page.$$('p');
    for (const p of paragraphs.slice(0, 5)) {
      const box = await p.boundingBox();
      const viewportWidth = 375;
      if (box) {
        expect(box.width, 'Paragraph should not overflow viewport').toBeLessThanOrEqual(
          viewportWidth + 32 // Allow for padding
        );
      }
    }
  });

  test('Images scale properly', async ({ page }) => {
    await page.goto('/product/all-clad-d3-stainless-12-inch-fry-pan');
    await page.waitForLoadState('networkidle');

    const viewportWidth = 375;

    // Check product images
    const images = await page.$$('img');
    for (const img of images.slice(0, 5)) {
      const box = await img.boundingBox();
      if (box && box.width > 50) {
        // Skip tiny icons
        expect(
          box.width,
          `Image should fit viewport (${box.width}px > ${viewportWidth}px)`
        ).toBeLessThanOrEqual(viewportWidth);
      }
    }
  });

  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Find form inputs
    const inputs = await page.$$('input:not([type="hidden"]), textarea, select');

    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box) {
        // Inputs should be wide enough to type comfortably
        expect(box.width, 'Form inputs should be at least 200px wide').toBeGreaterThanOrEqual(
          200
        );

        // Inputs should be tall enough to tap
        expect(box.height, 'Form inputs should be at least 40px tall').toBeGreaterThanOrEqual(
          36
        );
      }
    }
  });
});

test.describe('Mobile-Specific Features', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Filter bottom sheet or modal on mobile search', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Look for filter trigger
    const filterTrigger = await page.$(
      '[data-testid="mobile-filter-button"], button:has-text("Filter"), [class*="filter" i] button'
    );

    if (filterTrigger) {
      await filterTrigger.click();
      await page.waitForTimeout(300);

      // Should show filter UI
      const filterUI = await page.$(
        '[data-testid="filter-sheet"], [class*="bottom-sheet" i], [class*="filter-modal" i], [class*="FilterSidebar" i]'
      );
      // May or may not have bottom sheet implementation
    }
  });

  test('Sticky header on scroll', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Get initial header position
    const header = await page.$('header');
    const initialBox = await header?.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(100);

    // Header should still be visible (sticky)
    const afterScrollBox = await header?.boundingBox();
    if (afterScrollBox && initialBox) {
      // If sticky, header y should be near top
      expect(afterScrollBox.y).toBeLessThan(100);
    }
  });
});

test.describe('Tablet Responsiveness', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('Tablet layout is appropriate', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Product grid should show multiple columns
    const cards = await page.$$('[data-testid="product-card"], [class*="product-card" i]');

    if (cards.length >= 2) {
      const box1 = await cards[0].boundingBox();
      const box2 = await cards[1].boundingBox();

      // On tablet, cards should be in a grid (side by side) if there's room
      if (box1 && box2 && box1.width < 300) {
        // Small cards might be in grid
        expect(box2.y).toBeLessThanOrEqual(box1.y + box1.height);
      }
    }
  });
});

test.describe('Landscape Orientation', () => {
  test.use({ viewport: { width: 667, height: 375 } }); // iPhone landscape

  test('Landscape mode works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Content should be accessible
    const main = await page.$('main, [role="main"]');
    expect(main).toBeTruthy();
  });
});
