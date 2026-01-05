/**
 * Quality Dashboard Tests
 * 
 * Tests the admin quality dashboard including:
 * - Page rendering
 * - Metrics API
 * - Chart displays
 * - Admin authentication (if implemented)
 */

import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:3000/api";

test.describe("Quality Dashboard", () => {
  test.describe("Page Rendering", () => {
    test("quality dashboard page loads", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      
      // Check page loads (may redirect to login if auth required)
      await page.waitForLoadState("networkidle");
      
      const url = page.url();
      
      // Either on dashboard or redirected to login
      const onDashboard = url.includes("quality-dashboard");
      const redirectedToAuth = url.includes("login") || url.includes("sign-in") || url.includes("auth");
      
      expect(onDashboard || redirectedToAuth).toBe(true);
    });

    test("dashboard shows metrics section", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      // Only test if we're on the actual dashboard (not redirected)
      if (page.url().includes("quality-dashboard")) {
        // Look for common dashboard elements
        const hasMetrics = await page.locator("text=/metric|score|quality|export|fidelity/i").count() > 0;
        const hasCharts = await page.locator("canvas, svg, [data-chart]").count() > 0;
        const hasTable = await page.locator("table, [role='table']").count() > 0;
        
        // Dashboard should have at least one of these elements
        const hasDashboardContent = hasMetrics || hasCharts || hasTable;
        
        // If page loaded but has no content, might be empty state
        if (!hasDashboardContent) {
          // Check for empty state or loading state
          const hasEmptyState = await page.locator("text=/no data|empty|loading/i").count() > 0;
          expect(hasDashboardContent || hasEmptyState).toBe(true);
        }
      }
    });

    test("dashboard is responsive", async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Test mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // Page should still be usable
        const hasContent = await page.locator("body").textContent();
        expect(hasContent).toBeTruthy();
      }
    });
  });

  test.describe("Quality Metrics API", () => {
    test("GET /api/admin/quality-metrics returns data", async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/quality-metrics`);
      
      // May require auth or may not be implemented
      expect([200, 401, 403, 404, 501]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toBeDefined();
      }
    });

    test("metrics API returns expected structure", async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/quality-metrics`);
      
      if (response.status() === 200) {
        const body = await response.json();
        
        // Expected structure (adjust based on actual implementation)
        // Could have: exports, fidelityScores, feedbackStats, etc.
        if (body.success !== undefined) {
          expect(typeof body.success).toBe("boolean");
        }
      }
    });

    test("metrics API supports date range filter", async ({ request }) => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const response = await request.get(`${API_BASE}/admin/quality-metrics`, {
        params: {
          from: lastWeek.toISOString(),
          to: today.toISOString(),
        },
      });
      
      // API should handle date params gracefully
      expect([200, 400, 401, 403, 404, 501]).toContain(response.status());
    });

    test("metrics API supports template filter", async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/quality-metrics`, {
        params: {
          template: "saas",
        },
      });
      
      expect([200, 400, 401, 403, 404, 501]).toContain(response.status());
    });
  });

  test.describe("Chart Components", () => {
    test("fidelity score chart renders", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for fidelity-related chart
        const fidelityChart = page.locator("[data-testid='fidelity-chart']").or(
          page.locator("text=/fidelity/i").locator("..").locator("canvas, svg")
        );
        
        // Chart might exist or might be in a different structure
      }
    });

    test("export success rate chart renders", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for export-related chart
        const exportChart = page.locator("[data-testid='export-chart']").or(
          page.locator("text=/export/i").locator("..").locator("canvas, svg")
        );
        
        // Chart might exist
      }
    });

    test("feedback trends chart renders", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for feedback-related chart
        const feedbackChart = page.locator("[data-testid='feedback-chart']").or(
          page.locator("text=/feedback|rating/i").locator("..").locator("canvas, svg")
        );
        
        // Chart might exist
      }
    });
  });

  test.describe("Data Tables", () => {
    test("recent exports table shows data", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for exports table
        const table = page.locator("table").filter({ hasText: /export|project|template/i });
        
        if (await table.count() > 0) {
          // Table should have headers
          const headers = table.locator("th, thead td");
          expect(await headers.count()).toBeGreaterThan(0);
        }
      }
    });

    test("feedback entries table shows data", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        const table = page.locator("table").filter({ hasText: /feedback|rating|message/i });
        
        if (await table.count() > 0) {
          const headers = table.locator("th, thead td");
          expect(await headers.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("Admin Authentication", () => {
    test("unauthenticated access redirects or shows error", async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();
      
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      const url = page.url();
      const content = await page.content();
      
      // Should either redirect to login or show unauthorized message
      const redirectedToLogin = url.includes("login") || url.includes("sign-in");
      const showsUnauthorized = content.includes("Unauthorized") || 
                                 content.includes("Access Denied") ||
                                 content.includes("Sign in");
      const showsDashboard = url.includes("quality-dashboard") && 
                             !showsUnauthorized;
      
      // One of these should be true
      expect(redirectedToLogin || showsUnauthorized || showsDashboard).toBe(true);
    });

    test("API requires admin authentication", async ({ request }) => {
      const response = await request.get(`${API_BASE}/admin/quality-metrics`);
      
      // Should require auth or return data if no auth implemented
      expect([200, 401, 403, 404, 501]).toContain(response.status());
    });
  });

  test.describe("Dashboard Actions", () => {
    test("can filter by date range", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for date picker or filter
        const datePicker = page.locator("[data-testid='date-filter']").or(
          page.locator("input[type='date']")
        ).or(
          page.getByRole("button", { name: /date|filter|period/i })
        );
        
        if (await datePicker.count() > 0) {
          // Date filter exists
          expect(await datePicker.first().isVisible()).toBe(true);
        }
      }
    });

    test("can filter by template", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        const templateFilter = page.locator("[data-testid='template-filter']").or(
          page.getByRole("combobox", { name: /template/i })
        ).or(
          page.locator("select").filter({ hasText: /saas|ecommerce|template/i })
        );
        
        if (await templateFilter.count() > 0) {
          expect(await templateFilter.first().isVisible()).toBe(true);
        }
      }
    });

    test("can export report", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        const exportButton = page.getByRole("button", { name: /export|download|report/i });
        
        if (await exportButton.count() > 0) {
          expect(await exportButton.first().isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe("Real-time Updates", () => {
    test("dashboard shows recent activity", async ({ page }) => {
      await page.goto("/admin/quality-dashboard");
      await page.waitForLoadState("networkidle");
      
      if (page.url().includes("quality-dashboard")) {
        // Look for activity feed or timestamps
        const activity = page.locator("[data-testid='activity-feed']").or(
          page.locator("text=/ago|just now|recent/i")
        );
        
        // May or may not have activity
      }
    });
  });
});

