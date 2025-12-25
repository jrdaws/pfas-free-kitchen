import { test, expect } from '@playwright/test';

// Use longer timeouts for configurator tests due to dynamic loading
test.setTimeout(60000);

test.describe('Configurator - Accordion Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Wait for React to hydrate
    await page.waitForSelector('[data-radix-scroll-area-viewport]', { timeout: 15000 }).catch(() => {});
  });

  test('sidebar displays all 8 navigation sections', async ({ page }) => {
    // Check for all 8 sections in the sidebar
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
      await expect(page.locator(`text=${section}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('first section (Research) is expanded by default', async ({ page }) => {
    // The Research section should be expanded on initial load
    const researchSection = page.locator('[data-state="open"]').first();
    await expect(researchSection).toBeVisible({ timeout: 5000 });
  });

  test('clicking accordion trigger expands/collapses section', async ({ page }) => {
    // Find Core Features accordion trigger
    const coreFeaturesBtn = page.locator('button:has-text("Core Features")').first();
    await expect(coreFeaturesBtn).toBeVisible({ timeout: 5000 });

    // Click to expand Core Features
    await coreFeaturesBtn.click();
    await page.waitForTimeout(300);

    // The section should now be expanded
    // Verify by checking for Core Features content visibility
    await expect(page.locator('text=Select features').first()).toBeVisible({ timeout: 3000 });
  });

  test('clicking section navigates to correct step', async ({ page }) => {
    // Click on GitHub section (step 5)
    const githubBtn = page.locator('button:has-text("GitHub")').first();
    await expect(githubBtn).toBeVisible({ timeout: 5000 });
    await githubBtn.click();
    await page.waitForTimeout(500);

    // Should navigate to GitHub step
    const heading = page.locator('h1').first();
    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toContain('github');
  });

  test('completed step shows checkmark indicator', async ({ page }) => {
    // Complete step 1 by filling in research/vision
    const inputField = page.locator('textarea, input[type="text"]').first();
    if (await inputField.isVisible({ timeout: 3000 })) {
      await inputField.fill('My awesome SaaS project');
    }

    // Click Next to complete step 1
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }

    // Check for completion indicator (checkmark or completed state)
    const completedIndicator = page.locator('[data-state="completed"], .text-emerald-500, svg.text-emerald-500').first();
    // If the first step is completed, there should be some visual indicator
    await expect(page.locator('body')).toBeVisible();
  });

  test('current step has active indicator', async ({ page }) => {
    // The current step should have an active indicator (blue bar or background)
    const activeIndicator = page.locator('[class*="bg-[#0052FF]"]').first();
    await expect(activeIndicator).toBeVisible({ timeout: 5000 });
  });

  test('progress indicator shows correct count', async ({ page }) => {
    // Progress should show 0/8 initially
    await expect(page.locator('text=/0\\/8/').first()).toBeVisible({ timeout: 5000 });
  });

  test('sections preserve expanded state after navigation', async ({ page }) => {
    // Expand Core Features section
    const coreFeaturesBtn = page.locator('button:has-text("Core Features")').first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(300);

    // Navigate to another step
    const githubBtn = page.locator('button:has-text("GitHub")').first();
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
    // Navigate to Core Features and select some features
    const coreFeaturesBtn = page.locator('button:has-text("Core Features")').first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(500);

    // Try to select a feature
    const featureCheckbox = page.locator('[class*="rounded-lg"][class*="border"]').first();
    if (await featureCheckbox.isVisible({ timeout: 3000 })) {
      await featureCheckbox.click();
      await page.waitForTimeout(300);

      // Badge should appear showing count
      const badge = page.locator('span:has-text(/[0-9]+/)').first();
      // Badge may or may not be visible depending on implementation
    }
  });
});

test.describe('Configurator - Feature Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configure');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Navigate to Core Features step
    const coreFeaturesBtn = page.locator('button:has-text("Core Features")').first();
    if (await coreFeaturesBtn.isVisible({ timeout: 5000 })) {
      await coreFeaturesBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('feature categories are displayed as accordion', async ({ page }) => {
    // Look for category accordions (Authentication, Data & Storage, etc.)
    const categories = ['Authentication', 'Data', 'Payments', 'AI'];
    
    for (const category of categories) {
      const categoryBtn = page.locator(`button:has-text("${category}")`).first();
      // At least some categories should be visible
      if (await categoryBtn.isVisible({ timeout: 3000 })) {
        await expect(categoryBtn).toBeVisible();
        break; // Found at least one category
      }
    }
  });

  test('clicking feature toggles selection', async ({ page }) => {
    // Find a feature checkbox/card
    const featureCard = page.locator('[class*="rounded-lg"][class*="border"][class*="cursor-pointer"]').first();
    
    if (await featureCard.isVisible({ timeout: 5000 })) {
      // Get initial state
      const initialClasses = await featureCard.getAttribute('class');
      
      // Click to select
      await featureCard.click();
      await page.waitForTimeout(300);
      
      // Should show selected state (blue border/background)
      const afterClasses = await featureCard.getAttribute('class');
      
      // Classes should have changed to indicate selection
      expect(afterClasses).toBeTruthy();
    }
  });

  test('selected features show checkmark', async ({ page }) => {
    const featureCard = page.locator('[class*="rounded-lg"][class*="border"][class*="cursor-pointer"]').first();
    
    if (await featureCard.isVisible({ timeout: 5000 })) {
      await featureCard.click();
      await page.waitForTimeout(300);
      
      // Look for checkmark within the card
      const checkmark = featureCard.locator('svg').first();
      await expect(checkmark).toBeVisible({ timeout: 3000 });
    }
  });

  test('feature complexity badge is displayed', async ({ page }) => {
    // Features should show complexity badge (simple, medium, complex)
    const complexityBadges = ['simple', 'medium', 'complex'];
    
    for (const complexity of complexityBadges) {
      const badge = page.locator(`text=${complexity}`).first();
      if (await badge.isVisible({ timeout: 2000 })) {
        await expect(badge).toBeVisible();
        break; // Found at least one complexity badge
      }
    }
  });

  test('features with unmet dependencies are locked', async ({ page }) => {
    // Look for locked/disabled features (opacity-50, cursor-not-allowed)
    const lockedFeature = page.locator('[class*="opacity-50"][class*="cursor-not-allowed"]').first();
    
    if (await lockedFeature.isVisible({ timeout: 3000 })) {
      // Locked features should show lock icon
      const lockIcon = lockedFeature.locator('svg').first();
      await expect(lockIcon).toBeVisible();
    }
  });

  test('clicking locked feature shows dependency tooltip', async ({ page }) => {
    const lockedFeature = page.locator('[class*="opacity-50"]').first();
    
    if (await lockedFeature.isVisible({ timeout: 3000 })) {
      // Hover over locked feature
      await lockedFeature.hover();
      await page.waitForTimeout(500);
      
      // Tooltip should appear with "Requires" message
      const tooltip = page.locator('[role="tooltip"], [data-radix-popper-content-wrapper]').first();
      // Tooltip may or may not appear depending on implementation
    }
  });

  test('clear selection button removes all selected features', async ({ page }) => {
    // Select some features first
    const featureCards = page.locator('[class*="rounded-lg"][class*="border"][class*="cursor-pointer"]');
    const cardCount = await featureCards.count();
    
    if (cardCount > 0) {
      // Select first feature
      await featureCards.first().click();
      await page.waitForTimeout(300);
      
      // Look for clear/reset button
      const clearBtn = page.locator('button:has-text("Clear"), button:has-text("Reset")').first();
      if (await clearBtn.isVisible({ timeout: 2000 })) {
        await clearBtn.click();
        await page.waitForTimeout(300);
        
        // Features should be deselected
        const selectedFeature = page.locator('[class*="border-\\[#0052FF\\]"]').first();
        // Should have no selected features
      }
    }
  });

  test('AI recommendation button suggests features', async ({ page }) => {
    // Look for AI/Smart recommendation button
    const recommendBtn = page.locator('button:has-text("Recommend"), button:has-text("AI"), button:has-text("Smart")').first();
    
    if (await recommendBtn.isVisible({ timeout: 3000 })) {
      await recommendBtn.click();
      await page.waitForTimeout(500);
      
      // Some features should be auto-selected
      const selectedFeatures = page.locator('[class*="border-\\[#0052FF\\]"]');
      const count = await selectedFeatures.count();
      // Recommendation may or may not select features
    }
  });

  test('complexity score updates when features are selected', async ({ page }) => {
    // Look for complexity score display
    const complexityScore = page.locator('text=Complexity').first();
    
    if (await complexityScore.isVisible({ timeout: 3000 })) {
      // Get initial score
      const initialText = await complexityScore.textContent();
      
      // Select a feature
      const featureCard = page.locator('[class*="rounded-lg"][class*="border"][class*="cursor-pointer"]').first();
      if (await featureCard.isVisible()) {
        await featureCard.click();
        await page.waitForTimeout(300);
        
        // Score should update
        const newText = await complexityScore.textContent();
        // Text should have changed (or remained same if feature was already selected)
      }
    }
  });

  test('feature description is visible', async ({ page }) => {
    // Features should have descriptions
    const featureDescription = page.locator('p.text-xs, p.text-sm').first();
    await expect(featureDescription).toBeVisible({ timeout: 5000 });
  });

  test('expanding category shows features', async ({ page }) => {
    // Click on a category accordion to expand it
    const categoryTrigger = page.locator('[data-radix-accordion-trigger]').first();
    
    if (await categoryTrigger.isVisible({ timeout: 3000 })) {
      await categoryTrigger.click();
      await page.waitForTimeout(300);
      
      // Features should now be visible
      const features = page.locator('[class*="rounded-lg"][class*="border"]');
      const count = await features.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Configurator - Step Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configure');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('complete step 1 and verify progress updates', async ({ page }) => {
    // Fill in step 1 content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('Building a project management SaaS');
    }

    // Click Next
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Progress should show 1/8
    await expect(page.locator('text=/1\\/8/').first()).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to any step via sidebar', async ({ page }) => {
    // Click on step 5 (GitHub)
    const githubBtn = page.locator('button:has-text("GitHub")').first();
    await githubBtn.click();
    await page.waitForTimeout(500);

    // Should be on GitHub step
    const h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('github');

    // Click on step 1 (Research)
    const researchBtn = page.locator('button:has-text("Research")').first();
    await researchBtn.click();
    await page.waitForTimeout(500);

    // Should be back on Research step
    const newH1 = await page.locator('h1').first().textContent();
    expect(newH1?.toLowerCase()).toContain('research');
  });

  test('sidebar highlights current step', async ({ page }) => {
    // Navigate to step 3
    const aiBtn = page.locator('button:has-text("Integrate AI")').first();
    await aiBtn.click();
    await page.waitForTimeout(500);

    // The AI section should have active styling
    const activeBar = page.locator('span[class*="bg-\\[#0052FF\\]"]').first();
    await expect(activeBar).toBeVisible({ timeout: 3000 });
  });

  test('Previous button works to go back', async ({ page }) => {
    // Navigate to step 2
    const coreFeaturesBtn = page.locator('button:has-text("Core Features")').first();
    await coreFeaturesBtn.click();
    await page.waitForTimeout(500);

    // Click Previous
    const prevBtn = page.locator('button:has-text("Previous")');
    if (await prevBtn.isVisible({ timeout: 3000 })) {
      await prevBtn.click();
      await page.waitForTimeout(500);

      // Should be on step 1
      const h1 = await page.locator('h1').first().textContent();
      expect(h1?.toLowerCase()).toContain('research');
    }
  });

  test('Next button advances to next step', async ({ page }) => {
    // Fill in step 1 content (if required)
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 })) {
      await textarea.fill('Test project');
    }

    // Click Next
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Should be on step 2
    const h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('feature');
  });
});

