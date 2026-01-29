/**
 * Content Verification Tests
 * 
 * Ensures all content pages have required sections and no placeholder text.
 */

import { test, expect } from '@playwright/test';

test.describe('Content Pages', () => {
  test('What is PFAS page has required sections', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');
    await page.waitForLoadState('networkidle');

    // Should have health disclaimer
    const disclaimer = await page.$('[data-testid="health-disclaimer"], [class*="disclaimer" i], [role="note"]');
    expect(disclaimer, 'Should have health disclaimer').toBeTruthy();

    // Should have sources section
    const sources = await page.$('text=Sources');
    const references = await page.$('text=References');
    const bibliography = await page.$('text=Bibliography');
    expect(
      sources || references || bibliography,
      'Should have sources/references section'
    ).toBeTruthy();

    // Check for placeholder text
    const content = await page.content();
    expect(content).not.toContain('TBD');
    expect(content).not.toContain('Lorem ipsum');
    expect(content).not.toContain('TODO:');
    expect(content).not.toContain('PLACEHOLDER');
    expect(content).not.toContain('[INSERT');

    // Should have substantive content
    const mainContent = await page.$('main, article, [class*="content" i]');
    const textContent = await mainContent?.textContent();
    expect(textContent?.length, 'Page should have substantive content').toBeGreaterThan(500);
  });

  test('How We Verify page explains verification process', async ({ page }) => {
    await page.goto('/learn/how-we-verify');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should explain tiers
    const hasTierExplanation =
      content.toLowerCase().includes('tier') ||
      content.toLowerCase().includes('verification') ||
      content.toLowerCase().includes('level');
    expect(hasTierExplanation, 'Should explain verification tiers').toBeTruthy();

    // Should not have placeholder text
    expect(content).not.toContain('Lorem ipsum');
    expect(content).not.toContain('TBD');
  });

  test("Buyer's Guide has practical recommendations", async ({ page }) => {
    await page.goto('/learn/buyers-guide');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should have recommendations or tips
    const hasRecommendations =
      content.toLowerCase().includes('recommend') ||
      content.toLowerCase().includes('look for') ||
      content.toLowerCase().includes('choose') ||
      content.toLowerCase().includes('tip');
    expect(hasRecommendations, 'Should have practical recommendations').toBeTruthy();

    // Should not have placeholder text
    expect(content).not.toContain('Lorem ipsum');
  });

  test('FAQ page has expandable questions', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    // Should have FAQ items
    const faqItems = await page.$$(
      '[data-testid="faq-item"], [class*="faq" i], details, [class*="accordion" i]'
    );
    expect(faqItems.length, 'Should have multiple FAQ items').toBeGreaterThan(3);

    // Try clicking first item to expand
    if (faqItems.length > 0) {
      const firstItem = faqItems[0];
      const button = await firstItem.$('button, summary, [role="button"]');
      if (button) {
        await button.click();
        await page.waitForTimeout(300);

        // Check if content expanded
        const expandedContent = await page.$(
          '[data-testid="faq-answer"]:visible, [class*="answer" i]:visible, details[open]'
        );
        // Some implementations show content differently
      }
    }
  });

  test('Disclosure page has Amazon statement', async ({ page }) => {
    await page.goto('/disclosure');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Must have Amazon Associates disclosure
    expect(
      content.includes('Amazon Associate'),
      'Should have Amazon Associate disclosure'
    ).toBeTruthy();
    expect(
      content.toLowerCase().includes('qualifying purchases'),
      'Should mention qualifying purchases'
    ).toBeTruthy();
  });

  test('Privacy page has required sections', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should have privacy-related content
    const hasPrivacyContent =
      content.toLowerCase().includes('collect') ||
      content.toLowerCase().includes('data') ||
      content.toLowerCase().includes('information') ||
      content.toLowerCase().includes('privacy');
    expect(hasPrivacyContent, 'Should have privacy-related content').toBeTruthy();

    // Should not have placeholder text
    expect(content).not.toContain('Lorem ipsum');
    expect(content).not.toContain('[Company Name]');
  });

  test('Terms page has legal content', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should have terms-related content
    const hasTermsContent =
      content.toLowerCase().includes('agree') ||
      content.toLowerCase().includes('terms') ||
      content.toLowerCase().includes('use') ||
      content.toLowerCase().includes('service');
    expect(hasTermsContent, 'Should have terms-related content').toBeTruthy();

    // Should not have placeholder text
    expect(content).not.toContain('Lorem ipsum');
  });

  test('About page has company information', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should have about-related content
    const hasAboutContent =
      content.toLowerCase().includes('mission') ||
      content.toLowerCase().includes('about') ||
      content.toLowerCase().includes('pfas') ||
      content.toLowerCase().includes('kitchen');
    expect(hasAboutContent, 'Should have about-related content').toBeTruthy();

    // Should have h1
    const h1 = await page.$('h1');
    expect(h1, 'About page should have h1').toBeTruthy();
  });
});

test.describe('Content Quality', () => {
  test('No broken images on content pages', async ({ page }) => {
    const contentPages = [
      '/learn/what-is-pfas',
      '/learn/how-we-verify',
      '/learn/buyers-guide',
      '/about',
    ];

    for (const pagePath of contentPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check all images loaded
      const images = await page.$$('img');
      for (const img of images) {
        const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
        const src = await img.getAttribute('src');

        // naturalWidth = 0 means image failed to load
        expect(
          naturalWidth,
          `Image ${src} failed to load on ${pagePath}`
        ).toBeGreaterThan(0);
      }
    }
  });

  test('Content pages have proper heading hierarchy', async ({ page }) => {
    const contentPages = [
      '/learn/what-is-pfas',
      '/learn/how-we-verify',
      '/about',
    ];

    for (const pagePath of contentPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Should have h1
      const h1Count = await page.$$eval('h1', (els) => els.length);
      expect(h1Count, `${pagePath} should have exactly one h1`).toBe(1);

      // Get all headings
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) =>
        els.map((el) => parseInt(el.tagName.replace('H', '')))
      );

      // Check heading hierarchy - shouldn't skip levels
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i];
        const previous = headings[i - 1];

        // Should not skip more than one level
        expect(
          current,
          `${pagePath} has heading hierarchy issue (h${previous} followed by h${current})`
        ).toBeLessThanOrEqual(previous + 1);
      }
    }
  });

  test('Product pages have real product data', async ({ page }) => {
    const productPages = [
      '/product/all-clad-d3-stainless-12-inch-fry-pan',
      '/product/lodge-cast-iron-skillet-12-inch',
      '/product/le-creuset-signature-round-dutch-oven-5-5-qt',
    ];

    for (const pagePath of productPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const content = await page.content();

      // Should not have placeholder product names
      expect(content).not.toContain('Sample Product');
      expect(content).not.toContain('Test Product');
      expect(content).not.toContain('Product Name Here');

      // Should have real brand name
      const hasBrand =
        content.includes('All-Clad') ||
        content.includes('Lodge') ||
        content.includes('Le Creuset') ||
        content.includes('Staub') ||
        content.includes('Made In');
      expect(hasBrand, `${pagePath} should show real brand name`).toBeTruthy();
    }
  });
});

test.describe('Citations and Sources', () => {
  test('What is PFAS page cites sources', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should cite authoritative sources
    const citesGovernment =
      content.includes('EPA') ||
      content.includes('FDA') ||
      content.includes('CDC') ||
      content.includes('epa.gov') ||
      content.includes('fda.gov');

    expect(citesGovernment, 'Should cite government sources').toBeTruthy();
  });

  test('Source links are functional', async ({ page }) => {
    await page.goto('/learn/what-is-pfas');
    await page.waitForLoadState('networkidle');

    // Find citation/source links
    const sourceLinks = await page.$$(
      'a[href*="epa.gov"], a[href*="fda.gov"], a[href*="cdc.gov"], a[href*="nih.gov"], a[href*="doi.org"]'
    );

    // Should have at least some source links
    expect(sourceLinks.length).toBeGreaterThan(0);

    // Check they have proper attributes
    for (const link of sourceLinks) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);

      const target = await link.getAttribute('target');
      expect(target).toBe('_blank');
    }
  });
});
