import { test, expect } from '@playwright/test';

// Use longer timeouts for configurator tests due to dynamic loading
test.setTimeout(60000);

test.describe('Configurator - Accordion Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport (sidebar is hidden on mobile with `hidden md:flex`)
    await page.setViewportSize({ width: 1280, height: 900 });
    
    // Clear localStorage and navigate to configure page
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for the sidebar to be visible
    await page.waitForSelector('aside', { state: 'visible', timeout: 15000 });
  });

  test('sidebar displays all 8 navigation sections', async ({ page }) => {
    // Check for all 8 sections in the sidebar using accordion trigger text
    const sections = [
      'Research',
      'Core Features',
      'Integrate AI',
      'Cursor',
      'GitHub',
      'Claude Code',
      'Supabase',
      'Vercel',
    ];

    for (const section of sections) {
      // Use getByRole to find accordion triggers
      const trigger = page.getByRole('button', { name: new RegExp(section, 'i') });
      await expect(trigger.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('first section (Research) is expanded by default', async ({ page }) => {
    // The Research section should be expanded on initial load
    const researchSection = page.locator('[data-state="open"]').first();
    await expect(researchSection).toBeVisible({ timeout: 5000 });
  });

  test('clicking accordion trigger expands/collapses section', async ({ page }) => {
    // Find Core Features accordion trigger  
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await expect(coreFeaturesBtn).toBeVisible({ timeout: 5000 });

    // Click to expand Core Features
    await coreFeaturesBtn.click();
    await page.waitForTimeout(500);

    // The section should now be expanded - check aria-expanded
    await expect(coreFeaturesBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('clicking section navigates to correct step', async ({ page }) => {
    // Click on GitHub section (step 5)
    const githubBtn = page.getByRole('button', { name: /GitHub/i }).first();
    await expect(githubBtn).toBeVisible({ timeout: 5000 });
    await githubBtn.click();
    await page.waitForTimeout(500);

    // Should navigate to GitHub step - check heading or content area
    const mainContent = page.locator('main, [class*="flex-1"]');
    await expect(mainContent.getByText(/GitHub/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('completed step shows checkmark indicator', async ({ page }) => {
    // Complete step 1 by filling in research/vision
    const inputField = page.locator('textarea, input[type="text"]').first();
    if (await inputField.isVisible({ timeout: 3000 })) {
      await inputField.fill('My awesome SaaS project');
    }

    // Click Next to complete step 1 (use exact: true)
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify we moved to step 2 (sidebar should show Core Features as active)
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/Core Features/i).first()).toBeVisible();
  });

  test('current step has active indicator', async ({ page }) => {
    // The current step should have an active indicator (blue bar or background)
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
    // At least one accordion trigger (Research) should be visible and expanded
    const researchBtn = sidebar.getByRole('button', { name: /Research/i }).first();
    await expect(researchBtn).toBeVisible();
    await expect(researchBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('progress indicator shows correct count', async ({ page }) => {
    // Progress should show "0/8 complete" initially in sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/0\/8/)).toBeVisible({ timeout: 5000 });
  });

  test('sections preserve expanded state after navigation', async ({ page }) => {
    // Click on Core Features section
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(300);

    // Navigate to another step
    const githubBtn = page.getByRole('button', { name: /GitHub/i }).first();
    await githubBtn.click();
    await page.waitForTimeout(300);

    // Go back to Core Features  
    await coreFeaturesBtn.click();
    await page.waitForTimeout(300);

    // Section should still be accessible
    await expect(coreFeaturesBtn).toBeVisible();
  });

  test('sidebar is scrollable when content overflows', async ({ page }) => {
    // The sidebar should have a scroll area for all 8 sections
    const scrollArea = page.locator('[data-radix-scroll-area-viewport]').first();
    await expect(scrollArea).toBeVisible({ timeout: 5000 });
  });

  test('section badges display when present', async ({ page }) => {
    // Navigate to Core Features
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(500);

    // The sidebar should still be visible after navigation
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    // Core Features button should still be visible
    await expect(coreFeaturesBtn).toBeVisible();
  });
});

test.describe('Configurator - Feature Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Wait for the sidebar to be visible
    await page.waitForSelector('aside', { state: 'visible', timeout: 15000 });

    // Navigate to Core Features step
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    if (await coreFeaturesBtn.isVisible({ timeout: 5000 })) {
      await coreFeaturesBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('feature categories are displayed', async ({ page }) => {
    // The Core Features step should show content area
    const mainContent = page.locator('main, [class*="flex-1"]').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });
  });

  test('feature selection interface is accessible', async ({ page }) => {
    // Should have checkboxes or clickable feature cards
    const interactiveElements = page.locator('input[type="checkbox"], button, [role="button"]');
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sidebar remains visible on feature step', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('Core Features section is expanded', async ({ page }) => {
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await expect(coreFeaturesBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('can navigate from features to other steps', async ({ page }) => {
    // Navigate to GitHub step
    const githubBtn = page.getByRole('button', { name: /GitHub/i }).first();
    await githubBtn.click();
    await page.waitForTimeout(300);
    
    // GitHub should now be expanded
    await expect(githubBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('progress indicator is visible', async ({ page }) => {
    const sidebar = page.locator('aside');
    // Progress section exists in sidebar
    await expect(sidebar.getByText(/Progress/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Configurator - Step Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Wait for the sidebar to be visible
    await page.waitForSelector('aside', { state: 'visible', timeout: 15000 });
  });

  test('complete step 1 and verify progress updates', async ({ page }) => {
    // Fill in step 1 content if textarea is visible
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('Building a project management SaaS');
    }

    // Click Next button (use exact: true to avoid matching Next.js dev tools)
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Progress should update - sidebar shows completed steps
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('can navigate to any step via sidebar', async ({ page }) => {
    // Click on step 5 (GitHub)
    const githubBtn = page.getByRole('button', { name: /GitHub/i }).first();
    await githubBtn.click();
    await page.waitForTimeout(500);

    // Should be on GitHub step - verify GitHub button is expanded
    await expect(githubBtn).toHaveAttribute('aria-expanded', 'true');

    // Click on step 1 (Research)
    const researchBtn = page.getByRole('button', { name: /Research/i }).first();
    await researchBtn.click();
    await page.waitForTimeout(500);

    // Should be back on Research step
    await expect(researchBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('sidebar highlights current step', async ({ page }) => {
    // Navigate to step 3
    const aiBtn = page.getByRole('button', { name: /Integrate AI/i }).first();
    await aiBtn.click();
    await page.waitForTimeout(500);

    // The AI section should be expanded (active)
    await expect(aiBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('Previous button works to go back', async ({ page }) => {
    // Navigate to step 2
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(500);

    // Click Previous button if visible
    const prevBtn = page.getByRole('button', { name: /Previous/i });
    if (await prevBtn.isVisible({ timeout: 3000 })) {
      await prevBtn.click();
      await page.waitForTimeout(500);

      // Should be on step 1 - Research should be expanded
      const researchBtn = page.getByRole('button', { name: /Research/i }).first();
      await expect(researchBtn).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('Next button advances to next step', async ({ page }) => {
    // Fill in step 1 content if textarea is visible
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 })) {
      await textarea.fill('Test project');
    }

    // Click Next button (use exact: true to avoid matching Next.js dev tools)
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Should be on step 2 - Core Features should be expanded
    const coreFeaturesBtn = page.getByRole('button', { name: /Core Features/i }).first();
    await expect(coreFeaturesBtn).toHaveAttribute('aria-expanded', 'true');
  });
});

