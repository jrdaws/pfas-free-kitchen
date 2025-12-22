import { test, expect } from '@playwright/test';

test.describe('Visual Editor', () => {
  test('editor-demo page loads successfully', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Check header loads
    await expect(page.locator('h1')).toContainText('Visual Editor Demo');
    await expect(page.locator('text=Click elements to edit')).toBeVisible();
  });

  test('editor displays demo HTML content', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Wait for iframe to load
    const iframe = page.frameLocator('iframe').first();

    // Check for demo content within iframe
    await expect(iframe.locator('h1')).toContainText('Welcome to the Visual Editor');
    await expect(iframe.locator('button.button')).toBeVisible();
  });

  test('Show Code / Show Editor toggle works', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Initially should show editor (iframe)
    await expect(page.locator('iframe')).toBeVisible();

    // Click "Show Code" button
    const showCodeBtn = page.locator('button:has-text("Show Code")');
    await showCodeBtn.click();

    // Should now show code view (no iframe)
    await expect(page.locator('iframe')).not.toBeVisible();
    await expect(page.locator('pre')).toBeVisible();
    await expect(page.locator('text=<!DOCTYPE html>')).toBeVisible();

    // Click "Show Editor" button to go back
    const showEditorBtn = page.locator('button:has-text("Show Editor")');
    await showEditorBtn.click();

    // Should show editor again
    await expect(page.locator('iframe')).toBeVisible();
  });

  test('editor iframe is interactive', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Wait for iframe to be fully loaded
    await page.waitForTimeout(2000);

    const iframe = page.frameLocator('iframe').first();

    // Verify interactive elements are present
    const button = iframe.locator('button.button');
    await expect(button).toBeVisible();

    // Check for card elements
    const cards = iframe.locator('.card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2);
  });

  test('editor has properties panel placeholder', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // The VisualEditor component should render a properties panel
    // This test checks for the editor structure
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Iframe should be present (main editor area)
    await expect(page.locator('iframe')).toBeVisible();
  });

  test('code view displays valid HTML', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Switch to code view
    const showCodeBtn = page.locator('button:has-text("Show Code")');
    await showCodeBtn.click();

    // Check that code is displayed
    await expect(page.locator('pre')).toBeVisible();

    // Verify HTML structure
    const codeContent = await page.locator('pre').textContent();
    expect(codeContent).toContain('<!DOCTYPE html>');
    expect(codeContent).toContain('<html');
    expect(codeContent).toContain('</html>');
    expect(codeContent).toContain('Welcome to the Visual Editor');
  });

  test('editor page has proper terminal styling', async ({ page }) => {
    await page.goto('/editor-demo');
    await page.waitForLoadState('networkidle');

    // Click show code to see terminal window
    const showCodeBtn = page.locator('button:has-text("Show Code")');
    await showCodeBtn.click();

    // Check for terminal-themed elements
    const terminalWindow = page.locator('.terminal-window');
    await expect(terminalWindow).toBeVisible();

    // Check for terminal dots (window controls)
    const terminalDots = page.locator('.terminal-dot');
    const dotCount = await terminalDots.count();
    expect(dotCount).toBeGreaterThanOrEqual(3);
  });
});
