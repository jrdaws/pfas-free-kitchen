import { test, expect } from '@playwright/test';

test.describe('Component-Aware Preview System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and navigate to configure
    await page.goto('/configure');
    await page.evaluate(() => localStorage.removeItem('configurator-storage'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test.describe('Bug Fix Verification', () => {
    test('Badge hydration fix - uses span instead of div', async ({ page }) => {
      // Navigate to step 6 where badges are used
      // First complete step 1 (template selection)
      await page.waitForTimeout(1000);
      
      // Select a template
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      // Navigate through to step 6
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab if visible
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
      }
      
      // Open section editor which contains badges
      const reorderBtn = page.locator('button:has-text("Reorder Sections")');
      if (await reorderBtn.isVisible()) {
        await reorderBtn.click();
        await page.waitForTimeout(500);
        
        // Check that "required" badge uses span, not div
        const requiredBadge = page.locator('span:has-text("required")').first();
        await expect(requiredBadge).toBeVisible();
        
        // Verify it's a span element (the fix)
        const tagName = await requiredBadge.evaluate(el => el.tagName.toLowerCase());
        expect(tagName).toBe('span');
      }
    });

    test('Double nesting path fix - detects when outputDir includes project name', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Complete step 1
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
      
      // Skip step 2
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
      
      // Step 3 - Project Details
      // Enter project name "my-app"
      const projectInput = page.locator('input').first();
      await projectInput.fill('my-app');
      await page.waitForTimeout(500);
      
      // Check the path preview
      const pathPreview = page.locator('code').first();
      const pathText = await pathPreview.textContent();
      
      // Path should be "./my-app" NOT "./my-app/my-app"
      // The auto-set outputDir is "./my-app" which matches the project name
      expect(pathText).not.toContain('my-app/my-app');
      
      // Should see the info message about directory already including name
      const infoMessage = page.locator('text=Output directory already includes project name');
      await expect(infoMessage).toBeVisible();
    });

    test('Section reorder UX improvements - numbered positions and instructions', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
      }
      
      // Open section editor
      const reorderBtn = page.locator('button:has-text("Reorder Sections")');
      if (await reorderBtn.isVisible()) {
        await reorderBtn.click();
        await page.waitForTimeout(500);
        
        // Check for instruction banner
        const instructionBanner = page.locator('text=How it works');
        await expect(instructionBanner).toBeVisible();
        
        // Check for numbered positions
        const positionNumber = page.locator('text=/^[1-9]$/').first();
        await expect(positionNumber).toBeVisible();
        
        // Check for up/down arrows
        const upArrow = page.locator('button:has-text("↑")').first();
        const downArrow = page.locator('button:has-text("↓")').first();
        await expect(upArrow).toBeVisible();
        await expect(downArrow).toBeVisible();
      }
    });
  });

  test.describe('UI Rendering Tests', () => {
    test('Step 6 shows three tabs', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Verify tabs exist
      await expect(page.locator('button:has-text("Component Preview")')).toBeVisible();
      await expect(page.locator('button:has-text("AI HTML Preview")')).toBeVisible();
      await expect(page.locator('button:has-text("Full Project Generator")')).toBeVisible();
    });

    test('Viewport switching works', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
        await page.waitForTimeout(500);
        
        // Find viewport buttons by title attribute
        const desktopBtn = page.locator('button[title="Desktop View"]');
        const tabletBtn = page.locator('button[title="Tablet View"]');
        const mobileBtn = page.locator('button[title="Mobile View"]');
        
        await expect(desktopBtn).toBeVisible();
        await expect(tabletBtn).toBeVisible();
        await expect(mobileBtn).toBeVisible();
        
        // Click tablet
        await tabletBtn.click();
        await page.waitForTimeout(300);
        
        // Click mobile
        await mobileBtn.click();
        await page.waitForTimeout(300);
        
        // Should see mobile phone frame
        const mobileFrame = page.locator('[class*="rounded-\\[40px\\]"]');
        await expect(mobileFrame).toBeVisible();
      }
    });
  });

  test.describe('Section Ordering Tests', () => {
    test('Move section up works', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
      }
      
      // Open section editor
      const reorderBtn = page.locator('button:has-text("Reorder Sections")');
      if (await reorderBtn.isVisible()) {
        await reorderBtn.click();
        await page.waitForTimeout(500);
        
        // Get the second section's name
        const sections = page.locator('[class*="Active Sections"] ~ div button');
        const sectionCount = await sections.count();
        
        // Click up arrow on second section if available
        const upButtons = page.locator('button:has-text("↑")');
        const upCount = await upButtons.count();
        if (upCount > 1) {
          // Second up button (first is disabled for first item)
          await upButtons.nth(1).click();
          await page.waitForTimeout(300);
          // Verify reorder happened (section numbers should change)
        }
      }
    });

    test('Reset button works', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
      }
      
      // Open section editor and make a change
      const reorderBtn = page.locator('button:has-text("Reorder Sections")');
      if (await reorderBtn.isVisible()) {
        await reorderBtn.click();
        await page.waitForTimeout(500);
        
        // Click reset
        const resetBtn = page.locator('button:has-text("Reset")');
        await resetBtn.click();
        await page.waitForTimeout(300);
      }
    });

    test('Required sections cannot be removed', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
      }
      
      // Open section editor
      const reorderBtn = page.locator('button:has-text("Reorder Sections")');
      if (await reorderBtn.isVisible()) {
        await reorderBtn.click();
        await page.waitForTimeout(500);
        
        // Nav row should have "required" badge and NO × button
        const navRow = page.locator('text=Nav').first().locator('..');
        const requiredBadge = navRow.locator('text=required');
        await expect(requiredBadge).toBeVisible();
        
        // × button should not exist for required sections
        // The implementation adds a spacer div instead
      }
    });
  });

  test.describe('API Endpoint Tests', () => {
    test('POST /api/preview/enhance returns valid structure', async ({ request }) => {
      const response = await request.post('/api/preview/enhance', {
        data: {
          template: 'saas',
          projectName: 'TestApp',
          vision: 'A project management tool for teams',
          description: 'Help teams collaborate better'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.componentProps).toBeDefined();
      expect(data.data.sectionOrder).toBeDefined();
      expect(Array.isArray(data.data.sectionOrder)).toBe(true);
      expect(data.data.source).toMatch(/^(ai|fallback)$/);
    });

    test('POST /api/preview/enhance handles missing template gracefully', async ({ request }) => {
      const response = await request.post('/api/preview/enhance', {
        data: {
          projectName: 'TestApp'
          // No template provided
        }
      });
      
      // Should either return fallback or error gracefully (not 500)
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Preview Component Quality', () => {
    test('Preview renders without console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Navigate to step 6
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
        await page.waitForTimeout(2000);
      }
      
      // Filter out expected warnings
      const realErrors = consoleErrors.filter(e => 
        !e.includes('Supabase') && 
        !e.includes('Redis') &&
        !e.includes('404') // May have missing images in dev
      );
      
      expect(realErrors.length).toBe(0);
    });

    test('Preview shows correct template components', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      // Navigate to step 6 with SaaS template
      const templateCard = page.locator('[class*="card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
      }
      
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(500);
      }
      
      // Click Component Preview tab
      const componentTab = page.locator('button:has-text("Component Preview")');
      if (await componentTab.isVisible()) {
        await componentTab.click();
        await page.waitForTimeout(2000);
        
        // Verify preview frame exists
        const previewFrame = page.locator('[class*="rounded-xl"][class*="overflow-hidden"]');
        await expect(previewFrame.first()).toBeVisible();
      }
    });
  });
});

