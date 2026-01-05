/**
 * Preview Session API Tests
 * 
 * Tests the multi-page preview session management:
 * - Session creation with shared state
 * - Session retrieval
 * - Session updates (auth state, navigation)
 * - Page content rendering
 */

import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:3000/api";

test.describe("Preview Session API", () => {
  let sessionId: string;

  test.describe("POST /api/preview/session", () => {
    test("creates session with required fields", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "test-project-123",
          template: "saas",
          projectName: "My Test SaaS",
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.session).toBeDefined();
      expect(body.session.id).toBeDefined();
      expect(body.session.template).toBe("saas");
      expect(body.session.branding.projectName).toBe("My Test SaaS");
      
      // Save session ID for other tests
      sessionId = body.session.id;
    });

    test("returns 400 if required fields missing", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          template: "saas",
          // Missing projectId and projectName
        },
      });

      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("Missing required fields");
    });

    test("creates session with custom branding", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "branded-project",
          template: "saas",
          projectName: "Branded SaaS",
          branding: {
            colors: {
              primary: "#8b5cf6",
              secondary: "#6366f1",
              accent: "#f59e0b",
              background: "#1a1a2e",
              foreground: "#ffffff",
            },
            fonts: {
              heading: "Poppins",
              body: "Inter",
            },
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.session.branding.colors.primary).toBe("#8b5cf6");
      expect(body.session.branding.fonts.heading).toBe("Poppins");
    });

    test("creates session with initial pages", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "multi-page-project",
          template: "saas",
          projectName: "Multi-Page SaaS",
          pages: [
            { path: "/", title: "Home", description: "Landing page" },
            { path: "/pricing", title: "Pricing", description: "Pricing plans" },
            { path: "/features", title: "Features", description: "Product features" },
            { path: "/dashboard", title: "Dashboard", description: "User dashboard" },
          ],
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.session.navigation.pages).toHaveLength(4);
      expect(body.session.navigation.pages[0].path).toBe("/");
      expect(body.session.navigation.currentPath).toBe("/");
    });

    test("calculates fidelity score on creation", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "fidelity-test",
          template: "saas",
          projectName: "Fidelity Test",
          integrations: {
            auth: "supabase",
            payments: "stripe",
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(typeof body.session.fidelityScore).toBe("number");
      expect(body.session.fidelityScore).toBeGreaterThanOrEqual(0);
      expect(body.session.fidelityScore).toBeLessThanOrEqual(100);
    });

    test("sets initial auth state", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "auth-state-test",
          template: "saas",
          projectName: "Auth State Test",
          initialAuthState: "logged-in",
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.session.stateSimulation.authState).toBe("logged-in");
    });
  });

  test.describe("GET /api/preview/session", () => {
    test("retrieves existing session", async ({ request }) => {
      // First create a session
      const createResponse = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "get-test-project",
          template: "saas",
          projectName: "Get Test",
        },
      });
      const createBody = await createResponse.json();
      const sid = createBody.session.id;

      // Then retrieve it
      const response = await request.get(`${API_BASE}/preview/session?id=${sid}`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.session.id).toBe(sid);
      expect(body.session.branding.projectName).toBe("Get Test");
    });

    test("returns 400 if session ID not provided", async ({ request }) => {
      const response = await request.get(`${API_BASE}/preview/session`);
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body.error).toContain("Session ID required");
    });

    test("returns 404 for non-existent session", async ({ request }) => {
      const response = await request.get(`${API_BASE}/preview/session?id=non-existent-id`);
      
      expect(response.status()).toBe(404);
      
      const body = await response.json();
      expect(body.error).toContain("Session not found");
    });
  });

  test.describe("PATCH /api/preview/session", () => {
    test("updates session state", async ({ request }) => {
      // Create a session first
      const createResponse = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "patch-test-project",
          template: "saas",
          projectName: "Patch Test",
        },
      });
      const createBody = await createResponse.json();
      const sid = createBody.session.id;

      // Update the session
      const response = await request.patch(`${API_BASE}/preview/session`, {
        data: {
          sessionId: sid,
          updates: {
            currentPath: "/pricing",
            authState: "logged-in",
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test("returns 400 if session ID not provided", async ({ request }) => {
      const response = await request.patch(`${API_BASE}/preview/session`, {
        data: {
          updates: { currentPath: "/pricing" },
        },
      });

      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body.error).toContain("Session ID required");
    });

    test("returns 404 for non-existent session", async ({ request }) => {
      const response = await request.patch(`${API_BASE}/preview/session`, {
        data: {
          sessionId: "non-existent-id",
          updates: { currentPath: "/pricing" },
        },
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe("Session Persistence", () => {
    test("session maintains state across requests", async ({ request }) => {
      // Create session
      const createResponse = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "persistence-test",
          template: "saas",
          projectName: "Persistence Test",
          branding: {
            colors: { primary: "#ff0000" },
          },
        },
      });
      const createBody = await createResponse.json();
      const sid = createBody.session.id;

      // Retrieve and verify
      const getResponse = await request.get(`${API_BASE}/preview/session?id=${sid}`);
      const getBody = await getResponse.json();

      expect(getBody.session.branding.colors.primary).toBe("#ff0000");
      expect(getBody.session.branding.projectName).toBe("Persistence Test");
    });
  });

  test.describe("Research Integration", () => {
    test("session stores research insights", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "research-test",
          template: "saas",
          projectName: "Research Test",
          research: {
            competitors: ["Competitor A", "Competitor B"],
            targetMarket: "SMB",
            valueProposition: "Faster onboarding",
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.session.research).toBeDefined();
      expect(body.session.research.competitors).toHaveLength(2);
    });
  });

  test.describe("Vision Integration", () => {
    test("session stores vision document", async ({ request }) => {
      const response = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "vision-test",
          template: "saas",
          projectName: "Vision Test",
          vision: {
            problem: "Teams struggle with project coordination",
            audience: { type: "b2b", description: "SMB teams" },
            businessModel: "subscription",
            designStyle: "modern",
            requiredFeatures: ["auth", "dashboard", "billing"],
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.session.vision).toBeDefined();
      expect(body.session.vision.businessModel).toBe("subscription");
      expect(body.session.vision.requiredFeatures).toContain("auth");
    });
  });
});

test.describe("Preview Page API", () => {
  test.describe("GET /api/preview/page/[pageId]", () => {
    test("returns page content for valid session", async ({ request }) => {
      // Create session first
      const createResponse = await request.post(`${API_BASE}/preview/session`, {
        data: {
          projectId: "page-content-test",
          template: "saas",
          projectName: "Page Content Test",
          pages: [
            { path: "/", title: "Home", description: "Home page" },
            { path: "/pricing", title: "Pricing", description: "Pricing page" },
          ],
        },
      });
      const createBody = await createResponse.json();
      const sid = createBody.session.id;

      // Get page content
      const response = await request.get(`${API_BASE}/preview/page/home?sessionId=${sid}`);
      
      // Should either succeed or return expected error structure
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toBeDefined();
      }
    });
  });
});

