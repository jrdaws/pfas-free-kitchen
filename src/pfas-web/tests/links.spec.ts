/**
 * Link Verification Tests
 * 
 * Ensures all internal and external links work correctly.
 */

import { test, expect } from '@playwright/test';

test.describe('Internal Links', () => {
  test('All navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all internal links
    const links = await page.$$eval('a[href^="/"]', (els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean)
    );

    const uniqueLinks = [...new Set(links)] as string[];
    console.log(`Found ${uniqueLinks.length} unique internal links`);

    // Test a sample of links (first 20)
    const linksToTest = uniqueLinks.slice(0, 20);

    for (const link of linksToTest) {
      const response = await page.goto(link);
      expect(
        response?.status(),
        `Link ${link} returned error status ${response?.status()}`
      ).toBeLessThan(400);
    }
  });

  test('Product links go to valid products', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Get product links
    const productLinks = await page.$$eval('a[href^="/product/"]', (els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean).slice(0, 10)
    );

    expect(productLinks.length).toBeGreaterThan(0);

    for (const link of productLinks) {
      const response = await page.goto(link!);
      expect(response?.status()).toBeLessThan(400);

      // Should show product content, not 404 page
      const title = await page.title();
      expect(title.toLowerCase()).not.toContain('not found');
      expect(title.toLowerCase()).not.toContain('404');

      // Should have product name in h1
      const h1 = await page.$('h1');
      expect(h1).toBeTruthy();
    }
  });

  test('Category links filter products', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find category links
    const categoryLinks = await page.$$eval(
      'a[href*="category"], a[href*="/search?"]',
      (els) => els.map((el) => el.getAttribute('href')).filter(Boolean).slice(0, 5)
    );

    for (const link of categoryLinks) {
      if (link) {
        const response = await page.goto(link);
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('Education page links work', async ({ page }) => {
    const educationLinks = [
      '/learn/what-is-pfas',
      '/learn/how-we-verify',
      '/learn/buyers-guide',
    ];

    for (const link of educationLinks) {
      const response = await page.goto(link);
      expect(response?.status(), `${link} failed`).toBeLessThan(400);

      // Should have content
      const h1 = await page.$('h1');
      expect(h1, `${link} missing h1`).toBeTruthy();
    }
  });

  test('Footer links all work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get footer links
    const footerLinks = await page.$$eval('footer a[href^="/"]', (els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean)
    );

    const uniqueFooterLinks = [...new Set(footerLinks)] as string[];

    for (const link of uniqueFooterLinks) {
      const response = await page.goto(link);
      expect(response?.status(), `Footer link ${link} failed`).toBeLessThan(400);
    }
  });
});

test.describe('External Links', () => {
  test('Affiliate links have correct attributes', async ({ page }) => {
    // Go to a product page that has retailer links
    await page.goto('/product/all-clad-d3-stainless-12-inch-fry-pan');
    await page.waitForLoadState('networkidle');

    // Find affiliate/retailer links
    const affiliateLinks = await page.$$('a[rel*="sponsored"], a[target="_blank"][href*="amazon"], a[target="_blank"][href*="williams"]');

    // If there are affiliate links, verify their attributes
    if (affiliateLinks.length > 0) {
      for (const link of affiliateLinks) {
        const href = await link.getAttribute('href');
        const rel = await link.getAttribute('rel');
        const target = await link.getAttribute('target');

        // External links should open in new tab
        if (href && href.startsWith('http') && !href.includes('localhost')) {
          expect(target, `External link ${href} should have target="_blank"`).toBe('_blank');

          // Should have noopener for security
          expect(rel, `External link ${href} should have noopener`).toContain('noopener');
        }
      }
    }
  });

  test('External links in content have security attributes', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');
    await page.waitForLoadState('networkidle');

    // Find all external links (starting with http)
    const externalLinks = await page.$$('a[href^="http"]');

    for (const link of externalLinks) {
      const href = await link.getAttribute('href');

      // Skip internal links
      if (href?.includes('localhost') || href?.includes('pfas-free')) {
        continue;
      }

      const rel = await link.getAttribute('rel');

      // External links should have noopener
      expect(
        rel?.includes('noopener'),
        `External link ${href} should have rel="noopener"`
      ).toBeTruthy();
    }
  });

  test('Brand website links are external', async ({ page }) => {
    await page.goto('/product/all-clad-d3-stainless-12-inch-fry-pan');
    await page.waitForLoadState('networkidle');

    // Find links to brand websites
    const brandLinks = await page.$$(
      'a[href*="all-clad.com"], a[href*="lodgecastiron.com"], a[href*="lecreuset.com"]'
    );

    for (const link of brandLinks) {
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');

      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
    }
  });
});

test.describe('Link Integrity', () => {
  test('No broken internal links on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = await page.$$eval('a[href^="/"]', (els) =>
      els.map((el) => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim().slice(0, 50),
      }))
    );

    const uniqueLinks = links.reduce(
      (acc, link) => {
        if (link.href && !acc.find((l) => l.href === link.href)) {
          acc.push(link);
        }
        return acc;
      },
      [] as { href: string | null; text: string | undefined }[]
    );

    const brokenLinks: string[] = [];

    for (const link of uniqueLinks.slice(0, 30)) {
      if (link.href) {
        const response = await page.request.get(link.href);
        if (!response.ok()) {
          brokenLinks.push(`${link.href} (${link.text})`);
        }
      }
    }

    expect(
      brokenLinks.length,
      `Found broken links: ${brokenLinks.join(', ')}`
    ).toBe(0);
  });

  test('Search results link to valid products', async ({ page }) => {
    await page.goto('/search?q=skillet');
    await page.waitForLoadState('networkidle');

    const productLinks = await page.$$eval('a[href^="/product/"]', (els) =>
      els.map((el) => el.getAttribute('href')).slice(0, 5)
    );

    for (const link of productLinks) {
      if (link) {
        const response = await page.goto(link);
        expect(response?.status()).toBe(200);
      }
    }
  });
});

test.describe('Anchor Links', () => {
  test('Table of contents links work on education pages', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');
    await page.waitForLoadState('networkidle');

    // Find anchor links (href starting with #)
    const anchorLinks = await page.$$eval('a[href^="#"]', (els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean)
    );

    for (const anchor of anchorLinks.slice(0, 10)) {
      if (anchor && anchor.length > 1) {
        const targetId = anchor.replace('#', '');
        const targetElement = await page.$(`#${targetId}, [id="${targetId}"]`);

        expect(
          targetElement,
          `Anchor target ${anchor} not found on page`
        ).toBeTruthy();
      }
    }
  });
});
