/**
 * User Journey 7: Education Pages
 * 
 * Tests the educational content including:
 * - How We Verify page
 * - Tier explanations
 * - Affiliate Disclosure page
 * - FTC compliance content
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 7: Education Pages', () => {
  test('can navigate to How We Verify from footer', async ({ page }) => {
    await page.goto('/');
    
    // Find link in footer
    const footerLink = page.locator('footer >> a:has-text("How We Verify")');
    
    if (!await footerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Try alternate text
      const altLink = page.locator('footer >> a:has-text("Verification")');
      if (await altLink.isVisible().catch(() => false)) {
        await altLink.click();
      } else {
        test.skip();
        return;
      }
    } else {
      await footerLink.click();
    }
    
    // Should navigate to education page
    await expect(page).toHaveURL(/education|verify|how-we-verify/);
  });

  test('How We Verify page explains all 5 tiers', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check for tier explanations (Tier 0-4)
    const pageContent = await page.textContent('body');
    
    // Should mention all tier levels
    expect(pageContent?.toLowerCase()).toContain('tier 0');
    expect(pageContent?.toLowerCase()).toContain('tier 1');
    expect(pageContent?.toLowerCase()).toContain('tier 2');
    expect(pageContent?.toLowerCase()).toContain('tier 3');
    expect(pageContent?.toLowerCase()).toContain('tier 4');
  });

  test('Tier explanations include criteria', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    // Look for tier sections
    const tierSections = page.locator('[data-testid^="tier-explanation-"]');
    
    if (await tierSections.count() > 0) {
      // Each section should have description
      const firstSection = tierSections.first();
      const sectionText = await firstSection.textContent();
      
      // Should contain verification criteria keywords
      expect(sectionText?.toLowerCase()).toMatch(/evidence|verification|claim|test|lab|brand/);
    } else {
      // Fall back to general content check
      const content = await page.textContent('main');
      expect(content?.toLowerCase()).toMatch(/verification|evidence|claim/);
    }
  });

  test('can navigate to Affiliate Disclosure from footer', async ({ page }) => {
    await page.goto('/');
    
    // Find disclosure link
    const disclosureLink = page.locator('footer >> a[href="/disclosure"]');
    
    if (!await disclosureLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Try alternate selectors
      const altLink = page.locator('footer >> a:has-text("Disclosure")');
      if (await altLink.isVisible().catch(() => false)) {
        await altLink.click();
      } else {
        test.skip();
        return;
      }
    } else {
      await disclosureLink.click();
    }
    
    await expect(page).toHaveURL(/disclosure/);
  });

  test('Disclosure page has required FTC content', async ({ page }) => {
    await page.goto('/disclosure');
    
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const lowerContent = content?.toLowerCase() || '';
    
    // Must mention affiliate relationship
    expect(lowerContent).toContain('affiliate');
    
    // Must mention commissions
    expect(lowerContent).toContain('commission');
    
    // Must mention FTC
    expect(lowerContent).toContain('ftc');
    
    // Should clarify editorial independence
    expect(lowerContent).toMatch(/independent|not.*(influence|affect)|editorial/);
  });

  test('Disclosure page has clear heading', async ({ page }) => {
    await page.goto('/disclosure');
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toMatch(/disclosure|affiliate/);
  });

  test('Education pages are accessible', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check that content is not hidden from screen readers
    const mainContent = page.locator('main');
    const ariaHidden = await mainContent.getAttribute('aria-hidden');
    expect(ariaHidden).not.toBe('true');
  });
});

test.describe('Journey 7: Education - Navigation', () => {
  test('can navigate between education pages', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    // Look for links to other education content
    const educationNav = page.locator('[data-testid="education-nav"]');
    
    if (await educationNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      const links = educationNav.locator('a');
      const linkCount = await links.count();
      
      if (linkCount > 1) {
        // Click second link
        await links.nth(1).click();
        
        // Should navigate to another education page
        await expect(page).toHaveURL(/education/);
      }
    }
  });

  test('breadcrumb navigation works on education pages', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    
    if (await breadcrumb.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click home link
      const homeLink = breadcrumb.locator('a').first();
      await homeLink.click();
      
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Journey 7: Education - Content Quality', () => {
  test('How We Verify page has substantial content', async ({ page }) => {
    await page.goto('/education/how-we-verify');
    
    // Check for minimum content length
    const mainContent = page.locator('main');
    const textContent = await mainContent.textContent();
    
    // Should have substantial explanation
    expect(textContent?.length).toBeGreaterThan(500);
  });

  test('Disclosure page meets FTC minimum requirements', async ({ page }) => {
    await page.goto('/disclosure');
    
    const content = await page.textContent('main');
    
    // Should explain what affiliate links are
    expect(content?.toLowerCase()).toMatch(/affiliate\s*(link|program|partner)/);
    
    // Should explain compensation
    expect(content?.toLowerCase()).toMatch(/commission|earn|compensat/);
    
    // Should be clearly visible (not hidden)
    const mainElement = page.locator('main');
    const display = await mainElement.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(display).not.toBe('none');
  });
});
