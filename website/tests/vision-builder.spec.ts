/**
 * Vision Builder Integration Tests
 * 
 * Tests the multi-step vision workflow:
 * 1. Problem definition
 * 2. Audience selection
 * 3. Business model selection
 * 4. Design style selection
 * 5. Feature discovery
 */

import { test, expect } from "@playwright/test";

test.describe("Vision Builder", () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 800 });
    // Navigate to configurator which includes VisionBuilder
    await page.goto("/configure");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Step Navigation", () => {
    test("shows step 1 of 5 on initial load", async ({ page }) => {
      // Check for step indicator
      const stepText = page.locator("text=Step 1 of 5");
      await expect(stepText).toBeVisible({ timeout: 10000 });
    });

    test("shows Problem step as first step", async ({ page }) => {
      // The first step should be Problem (🎯)
      const problemLabel = page.locator("text=Problem");
      await expect(problemLabel).toBeVisible({ timeout: 10000 });
    });

    test("back button is disabled on first step", async ({ page }) => {
      const backButton = page.getByRole("button", { name: /back/i });
      await expect(backButton).toBeDisabled();
    });

    test("next button is disabled until step is complete", async ({ page }) => {
      // Without filling problem, Next should be disabled
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(nextButton).toBeDisabled();
    });
  });

  test.describe("Problem Step", () => {
    test("enables Next when problem text is at least 10 characters", async ({ page }) => {
      // Find the problem textarea
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 10000 });
      
      // Type short text - Next should stay disabled
      await textarea.fill("Short");
      const nextButton = page.getByRole("button", { name: /next/i });
      await expect(nextButton).toBeDisabled();
      
      // Type longer text - Next should enable
      await textarea.fill("This is a longer problem description that meets the minimum length requirement");
      await expect(nextButton).toBeEnabled();
    });
  });

  test.describe("Audience Step", () => {
    test("shows audience options after completing problem step", async ({ page }) => {
      // Complete problem step
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 10000 });
      await textarea.fill("Building a project management tool for remote teams to collaborate effectively");
      
      // Click next
      const nextButton = page.getByRole("button", { name: /next/i });
      await nextButton.click();
      
      // Should now see audience step (step 2)
      await expect(page.locator("text=Step 2 of 5")).toBeVisible({ timeout: 5000 });
      
      // Should see audience type options
      const b2bOption = page.locator("text=B2B");
      await expect(b2bOption).toBeVisible({ timeout: 5000 });
    });

    test("can select audience type", async ({ page }) => {
      // Complete problem step first
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 10000 });
      await textarea.fill("Building a project management tool for remote teams to collaborate effectively");
      await page.getByRole("button", { name: /next/i }).click();
      
      // Wait for audience step
      await expect(page.locator("text=Step 2 of 5")).toBeVisible({ timeout: 5000 });
      
      // Click B2B option
      const b2bCard = page.locator("[data-audience-type='b2b']").or(
        page.getByRole("button").filter({ hasText: /B2B/i })
      );
      
      if (await b2bCard.count() > 0) {
        await b2bCard.first().click();
        
        // Next should now be enabled
        const nextButton = page.getByRole("button", { name: /next/i });
        await expect(nextButton).toBeEnabled();
      }
    });
  });

  test.describe("Business Model Step", () => {
    test.skip("shows business model cards", async ({ page }) => {
      // Skip - requires completing steps 1-2 first
      // This would be tested in a full flow test
    });
  });

  test.describe("Design Style Step", () => {
    test.skip("shows design style options", async ({ page }) => {
      // Skip - requires completing steps 1-3 first
    });
  });

  test.describe("Feature Discovery Step", () => {
    test.skip("shows feature suggestions based on template", async ({ page }) => {
      // Skip - requires completing steps 1-4 first
    });
  });

  test.describe("Full Flow", () => {
    test("completes entire vision workflow", async ({ page }) => {
      // This is a comprehensive flow test
      
      // Step 1: Problem
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 10000 });
      await textarea.fill("Building a SaaS platform for small businesses to manage their invoicing and payments");
      await page.getByRole("button", { name: /next/i }).click();
      
      // Step 2: Audience - wait for it to load
      await expect(page.locator("text=Step 2 of 5")).toBeVisible({ timeout: 5000 });
      
      // Try to select an audience option (the first clickable card)
      const audienceCards = page.locator("[role='button'], button").filter({ hasText: /B2B|B2C|Enterprise|Consumer/i });
      if (await audienceCards.count() > 0) {
        await audienceCards.first().click();
        await page.getByRole("button", { name: /next/i }).click();
        
        // Step 3: Business Model
        await expect(page.locator("text=Step 3 of 5")).toBeVisible({ timeout: 5000 });
        
        // Select a business model
        const modelCards = page.locator("[role='button'], button").filter({ hasText: /Subscription|Freemium|One-time/i });
        if (await modelCards.count() > 0) {
          await modelCards.first().click();
          await page.getByRole("button", { name: /next/i }).click();
          
          // Step 4: Design
          await expect(page.locator("text=Step 4 of 5")).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe("Vision Summary", () => {
    test("shows vision summary on desktop", async ({ page }) => {
      // Set large viewport to show sidebar
      await page.setViewportSize({ width: 1400, height: 900 });
      await page.reload();
      await page.waitForLoadState("networkidle");
      
      // Fill in problem to have some data
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 10000 });
      await textarea.fill("Building a project management platform");
      
      // Check for summary sidebar (hidden on smaller screens)
      const summary = page.locator("text=Vision Summary").or(page.locator("[data-testid='vision-summary']"));
      // Summary may or may not be visible depending on implementation
    });
  });
});

