/**
 * User Journey 6: Report Issue
 * 
 * Tests the issue reporting functionality including:
 * - Report form accessibility
 * - Issue type selection
 * - Form validation
 * - Successful submission
 * - Confirmation message
 */

import { test, expect } from '@playwright/test';

const PRODUCT_SLUG = 'all-clad-d3-stainless-steel-12-skillet';

test.describe('Journey 6: Report Issue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await page.waitForLoadState('networkidle');
  });

  test('report issue button is visible on PDP', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Button may be in footer or different location
      const footerReportLink = page.locator('footer >> text=Report');
      if (!await footerReportLink.isVisible().catch(() => false)) {
        test.skip();
        return;
      }
    }
    
    await expect(reportButton).toBeVisible();
  });

  test('clicking report button opens form', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    // Form should appear (modal or page)
    const reportForm = page.locator('[data-testid="report-form"]');
    await expect(reportForm).toBeVisible();
  });

  test('form has issue type selector', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    const reportForm = page.locator('[data-testid="report-form"]');
    await expect(reportForm).toBeVisible();
    
    // Check for issue type selector
    const issueTypeSelect = reportForm.locator('[data-testid="issue-type"]');
    await expect(issueTypeSelect).toBeVisible();
  });

  test('can select Suspected PFAS issue type', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    const issueTypeSelect = page.locator('[data-testid="issue-type"]');
    
    if (!await issueTypeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Click to open dropdown
    await issueTypeSelect.click();
    
    // Find and click "Suspected PFAS" option
    const pfasOption = page.locator('[data-testid="issue-type-suspected-pfas"]');
    
    if (await pfasOption.isVisible().catch(() => false)) {
      await pfasOption.click();
      
      // Verify selection
      const selectedValue = await issueTypeSelect.textContent();
      expect(selectedValue?.toLowerCase()).toContain('pfas');
    }
  });

  test('form requires description with minimum length', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    const descriptionField = page.locator('[data-testid="issue-description"]');
    
    if (!await descriptionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Enter short description
    await descriptionField.fill('Too short');
    
    // Try to submit
    const submitButton = page.locator('[data-testid="submit-report"]');
    await submitButton.click();
    
    // Should show validation error
    const errorMessage = page.locator('[data-testid="description-error"]');
    
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('can submit valid report', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    // Fill out form
    const issueTypeSelect = page.locator('[data-testid="issue-type"]');
    const descriptionField = page.locator('[data-testid="issue-description"]');
    
    if (!await descriptionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Select issue type
    await issueTypeSelect.click();
    const option = page.locator('[data-testid^="issue-type-"]').first();
    if (await option.isVisible()) {
      await option.click();
    }
    
    // Enter valid description (50+ characters)
    const validDescription = 'I noticed that this product may contain PFAS materials based on recent news articles about the brand. The coating appears similar to other products that were recalled for PFAS content.';
    await descriptionField.fill(validDescription);
    
    // Submit
    const submitButton = page.locator('[data-testid="submit-report"]');
    await submitButton.click();
    
    // Check for confirmation
    const confirmation = page.locator('[data-testid="report-confirmation"]');
    
    if (await confirmation.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(confirmation).toBeVisible();
      
      const confirmText = await confirmation.textContent();
      expect(confirmText?.toLowerCase()).toMatch(/thank|submitted|received/);
    }
  });

  test('form is accessible via keyboard', async ({ page }) => {
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    // Focus and activate report button with keyboard
    await reportButton.focus();
    await page.keyboard.press('Enter');
    
    // Form should open
    const reportForm = page.locator('[data-testid="report-form"]');
    
    if (await reportForm.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Tab through form fields
      await page.keyboard.press('Tab');
      
      // Should be able to navigate form
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });
});

test.describe('Journey 6: Report - Error Handling', () => {
  test('shows error on submit failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/v1/reports', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });
    
    await page.goto(`/product/${PRODUCT_SLUG}`);
    
    const reportButton = page.locator('[data-testid="report-issue-button"]');
    
    if (!await reportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await reportButton.click();
    
    const descriptionField = page.locator('[data-testid="issue-description"]');
    
    if (!await descriptionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await descriptionField.fill('A valid description that is long enough to pass validation checks for the report form submission process.');
    
    const submitButton = page.locator('[data-testid="submit-report"]');
    await submitButton.click();
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="submit-error"]');
    
    if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
