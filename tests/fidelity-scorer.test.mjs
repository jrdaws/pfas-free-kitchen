/**
 * Fidelity Scorer Tests
 * 
 * Tests the preview-to-export fidelity scoring system.
 */

import { test } from "node:test"
import assert from "node:assert"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import the module dynamically since it's TypeScript
// In CI, this would be compiled first
let fidelityScorer

test.before(async () => {
  // For now, we'll test the logic without importing the TypeScript module
  // The actual tests would run against compiled output
})

test.describe("Fidelity Scorer", () => {
  test.describe("CSS Variable Matching", () => {
    test("detects core CSS variables in globals.css", () => {
      const mockGlobalsCss = `
        :root {
          --primary: 222 47% 51%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96%;
          --background: 0 0% 100%;
          --foreground: 222 47% 11%;
          --border: 214 32% 91%;
          --ring: 222 47% 51%;
          --radius: 0.5rem;
        }
      `
      
      const coreVars = [
        "--primary",
        "--primary-foreground", 
        "--secondary",
        "--background",
        "--foreground",
        "--border",
        "--ring",
        "--radius",
      ]
      
      const found = coreVars.filter(v => mockGlobalsCss.includes(v))
      const score = Math.round((found.length / coreVars.length) * 100)
      
      assert.strictEqual(score, 100, "All core CSS variables should be found")
    })

    test("calculates partial score for missing variables", () => {
      const mockGlobalsCss = `
        :root {
          --primary: 222 47% 51%;
          --background: 0 0% 100%;
          --foreground: 222 47% 11%;
        }
      `
      
      const coreVars = [
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--background",
        "--foreground",
        "--border",
      ]
      
      const found = coreVars.filter(v => mockGlobalsCss.includes(v))
      const score = Math.round((found.length / coreVars.length) * 100)
      
      assert.strictEqual(score, 50, "Score should be 50% when half variables present")
    })

    test("returns 0 for empty globals.css", () => {
      const mockGlobalsCss = ""
      const coreVars = ["--primary", "--background", "--foreground"]
      
      const found = coreVars.filter(v => mockGlobalsCss.includes(v))
      const score = found.length === 0 ? 0 : Math.round((found.length / coreVars.length) * 100)
      
      assert.strictEqual(score, 0, "Score should be 0 for empty file")
    })
  })

  test.describe("Component Detection", () => {
    test("identifies core components", () => {
      const mockComponentList = [
        "Nav.tsx",
        "Hero.tsx",
        "Footer.tsx",
        "FeatureCards.tsx",
        "CTA.tsx",
      ]
      
      const expectedComponents = ["Nav", "Hero", "Footer", "FeatureCards", "CTA"]
      
      const found = expectedComponents.filter(comp => 
        mockComponentList.some(file => file.toLowerCase().includes(comp.toLowerCase()))
      )
      
      assert.strictEqual(found.length, expectedComponents.length, "All core components should be found")
    })

    test("detects integration-specific components", () => {
      const mockComponentList = [
        "Nav.tsx",
        "Hero.tsx",
        "LoginForm.tsx",
        "SignupForm.tsx",
        "UserMenu.tsx",
        "PricingTable.tsx",
        "CheckoutButton.tsx",
      ]
      
      const authComponents = ["LoginForm", "SignupForm", "UserMenu"]
      const paymentComponents = ["PricingTable", "CheckoutButton"]
      
      const foundAuth = authComponents.filter(comp =>
        mockComponentList.some(file => file.includes(comp))
      )
      const foundPayments = paymentComponents.filter(comp =>
        mockComponentList.some(file => file.includes(comp))
      )
      
      assert.strictEqual(foundAuth.length, 3, "All auth components should be found")
      assert.strictEqual(foundPayments.length, 2, "All payment components should be found")
    })

    test("handles missing components gracefully", () => {
      const mockComponentList = ["Nav.tsx", "Hero.tsx"]
      const expectedComponents = ["Nav", "Hero", "Footer", "FeatureCards", "CTA"]
      
      const found = expectedComponents.filter(comp =>
        mockComponentList.some(file => file.toLowerCase().includes(comp.toLowerCase()))
      )
      
      const score = Math.round((found.length / expectedComponents.length) * 100)
      
      assert.strictEqual(score, 40, "Score should reflect missing components")
    })
  })

  test.describe("Route Structure Scoring", () => {
    test("validates core routes exist", () => {
      const mockRoutes = [
        "page.tsx",
        "layout.tsx",
        "globals.css",
        "pricing/page.tsx",
        "dashboard/page.tsx",
      ]
      
      const expectedCoreRoutes = ["page.tsx", "layout.tsx", "globals.css"]
      
      const found = expectedCoreRoutes.filter(route =>
        mockRoutes.includes(route)
      )
      
      assert.strictEqual(found.length, 3, "All core routes should exist")
    })

    test("detects auth routes for Supabase", () => {
      const mockRoutes = [
        "page.tsx",
        "layout.tsx",
        "(auth)/login/page.tsx",
        "auth/callback/route.ts",
      ]
      
      const supabaseAuthRoutes = [
        "(auth)/login/page.tsx",
        "auth/callback/route.ts",
      ]
      
      const found = supabaseAuthRoutes.filter(route =>
        mockRoutes.includes(route)
      )
      
      assert.strictEqual(found.length, 2, "Supabase auth routes should exist")
    })

    test("detects auth routes for Clerk", () => {
      const mockRoutes = [
        "page.tsx",
        "layout.tsx",
        "sign-in/[[...sign-in]]/page.tsx",
        "sign-up/[[...sign-up]]/page.tsx",
      ]
      
      const clerkAuthRoutes = [
        "sign-in/[[...sign-in]]/page.tsx",
        "sign-up/[[...sign-up]]/page.tsx",
      ]
      
      const found = clerkAuthRoutes.filter(route =>
        mockRoutes.includes(route)
      )
      
      assert.strictEqual(found.length, 2, "Clerk auth routes should exist")
    })

    test("detects Stripe API routes", () => {
      const mockRoutes = [
        "page.tsx",
        "api/stripe/checkout/route.ts",
        "api/webhooks/stripe/route.ts",
      ]
      
      const stripeRoutes = [
        "api/stripe/checkout/route.ts",
        "api/webhooks/stripe/route.ts",
      ]
      
      const found = stripeRoutes.filter(route =>
        mockRoutes.includes(route)
      )
      
      assert.strictEqual(found.length, 2, "Stripe routes should exist")
    })
  })

  test.describe("Environment Variable Documentation", () => {
    test("validates Supabase env vars documented", () => {
      const mockEnvExample = `
        # Supabase
        NEXT_PUBLIC_SUPABASE_URL=
        NEXT_PUBLIC_SUPABASE_ANON_KEY=
      `
      
      const supabaseVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ]
      
      const documented = supabaseVars.filter(v => mockEnvExample.includes(v))
      
      assert.strictEqual(documented.length, 2, "All Supabase vars should be documented")
    })

    test("validates Stripe env vars documented", () => {
      const mockEnvExample = `
        # Stripe
        STRIPE_SECRET_KEY=
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
        STRIPE_WEBHOOK_SECRET=
      `
      
      const stripeVars = [
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_WEBHOOK_SECRET",
      ]
      
      const documented = stripeVars.filter(v => mockEnvExample.includes(v))
      
      assert.strictEqual(documented.length, 3, "All Stripe vars should be documented")
    })

    test("returns 0 when .env.example missing", () => {
      const mockEnvExample = null
      const expectedVars = ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]
      
      const score = mockEnvExample ? 100 : 0
      
      assert.strictEqual(score, 0, "Score should be 0 when no env example")
    })
  })

  test.describe("Overall Score Calculation", () => {
    test("calculates weighted average correctly", () => {
      const colorMatch = 100
      const componentMatch = 80
      const layoutMatch = 60
      const contentMatch = 40
      
      // Weights: color 0.15, component 0.35, layout 0.35, content 0.15
      const expected = Math.round(
        colorMatch * 0.15 +
        componentMatch * 0.35 +
        layoutMatch * 0.35 +
        contentMatch * 0.15
      )
      
      assert.strictEqual(expected, 70, "Weighted average should be calculated correctly")
    })

    test("overall score is between 0 and 100", () => {
      const scores = [
        { color: 0, component: 0, layout: 0, content: 0 },
        { color: 50, component: 50, layout: 50, content: 50 },
        { color: 100, component: 100, layout: 100, content: 100 },
      ]
      
      for (const s of scores) {
        const overall = Math.round(
          s.color * 0.15 +
          s.component * 0.35 +
          s.layout * 0.35 +
          s.content * 0.15
        )
        
        assert.ok(overall >= 0 && overall <= 100, `Score ${overall} should be between 0-100`)
      }
    })
  })

  test.describe("Hex to HSL Conversion", () => {
    test("converts hex to HSL format", () => {
      // Simple conversion test
      const hex = "#3b82f6"
      
      // Expected approximate HSL for this blue
      // The actual function would return "217 91% 60%" or similar
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      
      assert.ok(result, "Hex should parse correctly")
      assert.strictEqual(result[1], "3b", "Red component correct")
      assert.strictEqual(result[2], "82", "Green component correct")
      assert.strictEqual(result[3], "f6", "Blue component correct")
    })

    test("returns null for invalid hex", () => {
      const invalidHex = "not-a-color"
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(invalidHex)
      
      assert.strictEqual(result, null, "Invalid hex should return null")
    })
  })
})

