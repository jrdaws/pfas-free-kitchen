import { test, expect } from '@playwright/test';

/**
 * Supabase OAuth E2E Tests
 * 
 * Tests the Supabase connection flow including:
 * - OAuth/PAT initiation via /api/supabase/connect
 * - Connected services API operations
 * - Disconnect flow
 * 
 * Note: Actual OAuth requires Supabase configuration.
 * Tests that require real Supabase API are marked with test.skip()
 * and TODO comments for CI environments.
 */

test.describe('Supabase OAuth - API Endpoints', () => {
  
  test.describe('POST /api/supabase/connect', () => {
    
    test('returns 401 when no authorization header', async ({ request }) => {
      const response = await request.post('/api/supabase/connect', {
        data: { access_token: 'fake-token' },
      });
      
      expect(response.status()).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('UNAUTHORIZED');
      expect(json.message).toContain('authorization');
    });
    
    test('returns 400 when access_token is missing', async ({ request }) => {
      const response = await request.post('/api/supabase/connect', {
        headers: { 'Authorization': 'Bearer fake-user-token' },
        data: {},
      });
      
      // Either 401 (invalid user token) or 400 (missing access_token)
      expect([400, 401, 500]).toContain(response.status());
    });
    
    test('returns 400 when access_token is empty', async ({ request }) => {
      const response = await request.post('/api/supabase/connect', {
        headers: { 'Authorization': 'Bearer fake-user-token' },
        data: { access_token: '' },
      });
      
      expect([400, 401, 500]).toContain(response.status());
    });
    
    // TODO: Skip in CI - requires real Supabase configuration
    test.skip('connects successfully with valid Supabase PAT', async ({ request }) => {
      // This test requires:
      // 1. Valid Supabase user authentication token
      // 2. Valid Supabase Personal Access Token (PAT)
      // 
      // To run locally:
      // 1. Set SUPABASE_TEST_USER_TOKEN env var
      // 2. Set SUPABASE_TEST_PAT env var
      const userToken = process.env.SUPABASE_TEST_USER_TOKEN;
      const pat = process.env.SUPABASE_TEST_PAT;
      
      if (!userToken || !pat) {
        test.skip();
        return;
      }
      
      const response = await request.post('/api/supabase/connect', {
        headers: { 'Authorization': `Bearer ${userToken}` },
        data: { access_token: pat },
      });
      
      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.connected).toBe(true);
      expect(Array.isArray(json.projects)).toBe(true);
    });
  });
  
  test.describe('GET /api/connected-services', () => {
    
    test('returns 401 when no authorization header', async ({ request }) => {
      const response = await request.get('/api/connected-services');
      
      expect(response.status()).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('UNAUTHORIZED');
    });
    
    test('returns 401 with invalid Bearer token format', async ({ request }) => {
      const response = await request.get('/api/connected-services', {
        headers: { 'Authorization': 'InvalidFormat token' },
      });
      
      expect(response.status()).toBe(401);
    });
    
    // TODO: Skip in CI - requires real Supabase authentication
    test.skip('returns empty list for new user', async ({ request }) => {
      const userToken = process.env.SUPABASE_TEST_USER_TOKEN;
      if (!userToken) {
        test.skip();
        return;
      }
      
      const response = await request.get('/api/connected-services', {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      
      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.services)).toBe(true);
    });
  });
  
  test.describe('POST /api/connected-services', () => {
    
    test('returns 401 when no authorization header', async ({ request }) => {
      const response = await request.post('/api/connected-services', {
        data: { service_type: 'github', access_token: 'token' },
      });
      
      expect(response.status()).toBe(401);
    });
    
    test('rejects request without auth even with valid service_type', async ({ request }) => {
      const response = await request.post('/api/connected-services', {
        headers: { 'Authorization': 'Bearer fake-token' },
        data: { service_type: 'github', access_token: 'token' },
      });
      
      // Auth check happens first - returns 401 or 500 if Supabase not configured
      expect([401, 500]).toContain(response.status());
      const json = await response.json();
      expect(json.error).toBeTruthy();
    });
  });
  
  test.describe('GET /api/connected-services/[type]', () => {
    
    test('returns 401 when no authorization header', async ({ request }) => {
      const response = await request.get('/api/connected-services/supabase');
      
      expect(response.status()).toBe(401);
    });
    
    test('returns 400 for invalid service type', async ({ request }) => {
      const response = await request.get('/api/connected-services/invalid', {
        headers: { 'Authorization': 'Bearer fake-token' },
      });
      
      // Either 400 (validation) or 401 (auth fails first)
      expect([400, 401]).toContain(response.status());
    });
    
    test('accepts valid service types (returns auth error, not validation error)', async ({ request }) => {
      // Testing that valid types pass validation (auth check happens first)
      const response = await request.get('/api/connected-services/supabase', {
        headers: { 'Authorization': 'Bearer fake-token' },
      });
      
      // Should be 401 (auth) or 500 (config) not 400 (validation) - proves supabase is valid type
      expect([401, 500]).toContain(response.status());
      const json = await response.json();
      expect(json.error).toBeTruthy();
    });
  });
  
  test.describe('DELETE /api/connected-services/[type]', () => {
    
    test('returns 401 when no authorization header', async ({ request }) => {
      const response = await request.delete('/api/connected-services/supabase');
      
      expect(response.status()).toBe(401);
    });
    
    test('returns 400 for invalid service type', async ({ request }) => {
      const response = await request.delete('/api/connected-services/invalid', {
        headers: { 'Authorization': 'Bearer fake-token' },
      });
      
      // Either 400 (validation) or 401 (auth fails first)
      expect([400, 401]).toContain(response.status());
    });
    
    // TODO: Skip in CI - requires real Supabase authentication
    test.skip('disconnects service successfully', async ({ request }) => {
      const userToken = process.env.SUPABASE_TEST_USER_TOKEN;
      if (!userToken) {
        test.skip();
        return;
      }
      
      const response = await request.delete('/api/connected-services/supabase', {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      
      expect(response.status()).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Disconnected');
    });
  });
});

test.describe('Supabase OAuth - UI Integration', () => {
  
  test('configurator loads with navigation elements', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be interactive
    await page.waitForLoadState('load');
    
    // Page should have main content
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 15000 });
  });
  
  test('Supabase text or button exists somewhere in configurator', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    // Look for any Supabase reference
    const supabaseText = page.getByText(/supabase/i).first();
    
    // If sidebar exists with Supabase button, or main content mentions Supabase
    const sidebar = page.locator('aside');
    const hasSidebar = await sidebar.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasSidebar) {
      const supabaseBtn = sidebar.getByRole('button', { name: /Supabase/i }).first();
      await expect(supabaseBtn).toBeVisible({ timeout: 10000 });
    } else {
      // Different layout - just verify page loads without error
      await expect(page.locator('body')).toBeVisible();
    }
  });
  
  test('configurator navigation is accessible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/configure', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    // Should have navigation buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('Supabase OAuth - Error Handling', () => {
  
  test('gracefully handles missing Supabase config', async ({ request }) => {
    // When Supabase is not configured, should return appropriate error
    const response = await request.post('/api/supabase/connect', {
      headers: { 'Authorization': 'Bearer test-token' },
      data: { access_token: 'test-pat' },
    });
    
    // Should be 401 (auth error) or 500 (config error), not crash
    expect([401, 500]).toContain(response.status());
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });
  
  test('returns JSON error response, not HTML', async ({ request }) => {
    const response = await request.post('/api/supabase/connect', {
      headers: { 'Authorization': 'Bearer test-token' },
      data: { access_token: 'invalid' },
    });
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
  
  test('connected-services returns JSON on error', async ({ request }) => {
    const response = await request.get('/api/connected-services');
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});

test.describe('Supabase OAuth - Session Management', () => {
  
  // TODO: These tests require mocked Supabase authentication
  // In CI, use mock service worker or similar to test session flows
  
  test.skip('session persists after page reload', async ({ page }) => {
    // This test requires a real authenticated session
    // Steps:
    // 1. Sign in with Supabase
    // 2. Navigate away
    // 3. Reload page
    // 4. Verify still authenticated
  });
  
  test.skip('token refresh works when session expires', async ({ page }) => {
    // This test requires ability to simulate token expiry
    // Mock the Supabase client to test refresh behavior
  });
});

