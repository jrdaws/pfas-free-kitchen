/**
 * Page Rendering Verification Tests
 * 
 * Ensures all pages render without errors and return correct status codes.
 */

import { test, expect, Page } from '@playwright/test';

// All pages to test for successful rendering
const PAGES_TO_TEST = [
  // Static pages
  { path: '/', name: 'Homepage' },
  { path: '/search', name: 'Search (empty)' },
  { path: '/search?q=skillet', name: 'Search with query' },
  { path: '/search?category=cookware', name: 'Search with category' },
  { path: '/compare', name: 'Compare (empty)' },

  // Product pages (sample from mock data)
  { path: '/product/all-clad-d3-stainless-12-inch-fry-pan', name: 'Product - All-Clad D3 12"' },
  { path: '/product/lodge-cast-iron-skillet-12-inch', name: 'Product - Lodge Cast Iron 12"' },
  { path: '/product/le-creuset-signature-round-dutch-oven-5-5-qt', name: 'Product - Le Creuset 5.5qt' },
  { path: '/product/made-in-blue-carbon-steel-12-inch', name: 'Product - Made In Carbon Steel' },
  { path: '/product/staub-round-cocotte-5-5-qt', name: 'Product - Staub Cocotte' },

  // Education pages
  { path: '/learn', name: 'Learn Hub' },
  { path: '/learn/what-is-pfas', name: 'What is PFAS' },
  { path: '/learn/how-we-verify', name: 'How We Verify' },
  { path: '/learn/buyers-guide', name: "Buyer's Guide" },

  // Static pages
  { path: '/about', name: 'About' },
  { path: '/faq', name: 'FAQ' },
  { path: '/disclosure', name: 'Disclosure' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/contact', name: 'Contact' },
];

test.describe('Page Rendering Verification', () => {
  // Track console errors during navigation
  const captureConsoleErrors = (page: Page): string[] => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  };

  for (const pageInfo of PAGES_TO_TEST) {
    test(`${pageInfo.name} renders without errors`, async ({ page }) => {
      const errors = captureConsoleErrors(page);

      // Navigate to page
      const response = await page.goto(pageInfo.path);

      // Check HTTP status
      expect(response?.status(), `${pageInfo.name} returned non-200 status`).toBeLessThan(400);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Check for React/Next.js hydration errors
      const hydrationErrors = errors.filter(
        (e) =>
          e.includes('Hydration') ||
          e.includes('Text content does not match') ||
          e.includes('did not match')
      );
      expect(hydrationErrors, `${pageInfo.name} has hydration errors`).toHaveLength(0);

      // Check for critical errors (allow some minor warnings)
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('404') &&
          !e.includes('Warning:') &&
          !e.includes('DevTools')
      );
      expect(criticalErrors.length, `${pageInfo.name} has console errors: ${criticalErrors.join(', ')}`).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('Page Content Verification', () => {
  test('Homepage has required sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have hero section
    const hero = await page.$('section, [class*="hero"], [class*="Hero"]');
    expect(hero, 'Homepage should have hero section').toBeTruthy();

    // Should have navigation
    const nav = await page.$('nav, header');
    expect(nav, 'Homepage should have navigation').toBeTruthy();

    // Should have footer
    const footer = await page.$('footer');
    expect(footer, 'Homepage should have footer').toBeTruthy();
  });

  test('Search page has search functionality', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Should have search input or search bar
    const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], [class*="search" i] input');
    expect(searchInput, 'Search page should have search input').toBeTruthy();
  });

  test('Product pages have required elements', async ({ page }) => {
    await page.goto('/product/all-clad-d3-stainless-12-inch-fry-pan');
    await page.waitForLoadState('networkidle');

    // Should have product name
    const productName = await page.$('h1');
    expect(productName, 'Product page should have h1 title').toBeTruthy();
    const nameText = await productName?.textContent();
    expect(nameText?.length).toBeGreaterThan(0);

    // Should have tier badge
    const tierBadge = await page.$('[class*="tier" i], [data-testid="tier-badge"]');
    expect(tierBadge, 'Product page should have tier badge').toBeTruthy();
  });

  test('404 page handles missing routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Should return 404
    expect(response?.status()).toBe(404);

    // Should have helpful message
    const content = await page.textContent('body');
    const has404Indicator =
      content?.includes('404') ||
      content?.includes('not found') ||
      content?.includes('Not Found');
    expect(has404Indicator, '404 page should indicate page not found').toBeTruthy();
  });
});

test.describe('Meta Tags Verification', () => {
  test('Homepage has correct meta tags', async ({ page }) => {
    await page.goto('/');

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('pfas');

    // Check meta description
    const description = await page.$('meta[name="description"]');
    const descContent = await description?.getAttribute('content');
    expect(descContent?.length).toBeGreaterThan(0);
  });

  test('Product pages have unique meta tags', async ({ page }) => {
    await page.goto('/product/all-clad-d3-stainless-12-inch-fry-pan');

    // Title should contain product name
    const title = await page.title();
    expect(title.toLowerCase()).toContain('all-clad');

    // Meta description should exist
    const description = await page.$('meta[name="description"]');
    const descContent = await description?.getAttribute('content');
    expect(descContent?.length).toBeGreaterThan(50);
  });

  test('Education pages have meta tags', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');

    const title = await page.title();
    expect(title.toLowerCase()).toContain('pfas');

    const description = await page.$('meta[name="description"]');
    const descContent = await description?.getAttribute('content');
    expect(descContent).toBeTruthy();
  });
});
