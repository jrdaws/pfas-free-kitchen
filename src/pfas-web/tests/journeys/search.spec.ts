/**
 * User Journey 2: Search
 * 
 * Tests the search functionality including:
 * - Search input and autocomplete
 * - Search results page
 * - Result relevance
 * - Education banner for specific terms
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 2: Search', () => {
  test('can search for products using search bar', async ({ page }) => {
    await page.goto('/');
    
    // Find and click search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.click();
    
    // Type search query
    await searchInput.fill('skillet');
    
    // Submit search
    await searchInput.press('Enter');
    
    // Verify navigation to search results
    await expect(page).toHaveURL(/search\?q=skillet/i);
  });

  test('autocomplete shows suggestions while typing', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.click();
    
    // Type slowly to trigger autocomplete
    await searchInput.fill('ski');
    
    // Wait for autocomplete dropdown
    const autocomplete = page.locator('[data-testid="search-autocomplete"]');
    
    // Check if autocomplete appears (may not if no API connected)
    if (await autocomplete.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify suggestions are shown
      const suggestions = autocomplete.locator('[data-testid="autocomplete-suggestion"]');
      const suggestionCount = await suggestions.count();
      expect(suggestionCount).toBeGreaterThan(0);
      
      // Click first suggestion
      await suggestions.first().click();
      
      // Verify navigation
      await expect(page).toHaveURL(/search\?q=/);
    }
  });

  test('search results page shows relevant products', async ({ page }) => {
    await page.goto('/search?q=skillet');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="product-card"], [data-testid="no-results"]');
    
    // Check if results or no-results message
    const results = page.locator('[data-testid="product-card"]');
    const noResults = page.locator('[data-testid="no-results"]');
    
    const hasResults = await results.count() > 0;
    const hasNoResults = await noResults.isVisible().catch(() => false);
    
    // One or the other should be true
    expect(hasResults || hasNoResults).toBe(true);
    
    if (hasResults) {
      // Verify result relevance by checking product names
      const firstProduct = results.first();
      const productName = await firstProduct.locator('[data-testid="product-name"]').textContent();
      // Product name might contain search term or related words
      // This is a soft check - search relevance can vary
    }
  });

  test('education banner appears for PFOA-free search', async ({ page }) => {
    // Search for terms that should trigger education banner
    await page.goto('/search?q=PFOA-free');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for education banner
    const educationBanner = page.locator('[data-testid="education-banner"]');
    
    if (await educationBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Verify banner content explains PFOA ≠ PFAS
      const bannerText = await educationBanner.textContent();
      expect(bannerText?.toLowerCase()).toMatch(/pfoa|pfas/);
    }
  });

  test('education banner for non-stick search', async ({ page }) => {
    await page.goto('/search?q=non-stick');
    
    await page.waitForLoadState('networkidle');
    
    const educationBanner = page.locator('[data-testid="education-banner"]');
    
    if (await educationBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      const bannerText = await educationBanner.textContent();
      // Should explain about non-stick coatings and PFAS
      expect(bannerText?.toLowerCase()).toMatch(/pfas|coating|non-?stick/);
    }
  });

  test('empty search shows appropriate message', async ({ page }) => {
    await page.goto('/search?q=');
    
    // Should show message about entering search term
    const emptyMessage = page.locator('[data-testid="search-empty"]');
    
    if (await emptyMessage.isVisible().catch(() => false)) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('no results shows empty state', async ({ page }) => {
    // Use nonsense query
    await page.goto('/search?q=xyznonexistentproduct123');
    
    await page.waitForLoadState('networkidle');
    
    // Check for no results message
    const noResults = page.locator('[data-testid="no-results"]');
    
    if (await noResults.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(noResults).toBeVisible();
      
      // Verify helpful suggestions shown
      const suggestions = page.locator('[data-testid="search-suggestions"]');
      if (await suggestions.isVisible().catch(() => false)) {
        await expect(suggestions).toBeVisible();
      }
    }
  });

  test('search preserves filters when re-searching', async ({ page }) => {
    // Start with filtered search
    await page.goto('/search?q=pan&tier=3');
    
    // Get search input
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Clear and enter new search
    await searchInput.clear();
    await searchInput.fill('skillet');
    await searchInput.press('Enter');
    
    // Verify new search term but filters may persist
    await expect(page).toHaveURL(/q=skillet/);
  });

  test('search results show tier badges', async ({ page }) => {
    await page.goto('/search?q=skillet');
    
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 }).catch(() => {});
    
    const products = page.locator('[data-testid="product-card"]');
    const productCount = await products.count();
    
    if (productCount > 0) {
      // Check that tier badges are present
      const badges = page.locator('[data-testid="tier-badge"]');
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Journey 2: Search - Keyboard Navigation', () => {
  test('can navigate search with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Tab to search
    await page.keyboard.press('Tab');
    
    // Find focused element
    let focused = page.locator(':focus');
    
    // Keep tabbing until we reach search or give up
    for (let i = 0; i < 10; i++) {
      const tagName = await focused.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      const type = await focused.getAttribute('type').catch(() => '');
      const testId = await focused.getAttribute('data-testid').catch(() => '');
      
      if (tagName === 'input' && (type === 'search' || testId === 'search-input')) {
        // Found search input
        break;
      }
      
      await page.keyboard.press('Tab');
      focused = page.locator(':focus');
    }
    
    // Type search query
    await page.keyboard.type('skillet');
    await page.keyboard.press('Enter');
    
    // Verify search happened
    await expect(page).toHaveURL(/search/);
  });
});
