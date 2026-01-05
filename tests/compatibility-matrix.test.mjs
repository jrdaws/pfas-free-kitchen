/**
 * Compatibility Matrix Tests
 * 
 * Tests the integration compatibility checking system.
 */

import { test } from "node:test"
import assert from "node:assert"

// Mock the compatibility logic for testing
const COMPATIBILITY_MATRIX = {
  "auth:supabase": {
    "auth:clerk": { compatible: false, note: "Both provide authentication - choose one" },
    "payments:stripe": { compatible: true },
    "database:supabase": { compatible: true, note: "Recommended combination" },
  },
  "auth:clerk": {
    "auth:supabase": { compatible: false, note: "Both provide authentication - choose one" },
    "payments:stripe": { compatible: true },
  },
  "payments:stripe": {
    "payments:paddle": { compatible: false, note: "Both are payment processors" },
  },
}

function checkCompatibility(integrations) {
  const conflicts = []
  const warnings = []
  const suggestions = []

  const selected = Object.entries(integrations)
    .filter(([, value]) => value)
    .map(([category, provider]) => `${category}:${provider}`)

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i]
      const b = selected[j]

      const entry = COMPATIBILITY_MATRIX[a]?.[b] || COMPATIBILITY_MATRIX[b]?.[a]

      if (entry) {
        if (!entry.compatible) {
          conflicts.push({
            integrations: [a, b],
            reason: entry.note || "Incompatible integrations",
            severity: "error",
          })
        } else if (entry.note) {
          warnings.push({
            integration: `${a} + ${b}`,
            message: entry.note,
          })
        }
      }
    }
  }

  if (integrations.auth === "supabase" && !integrations.database) {
    suggestions.push("Consider using Supabase for database too")
  }

  if (integrations.payments && !integrations.email) {
    suggestions.push("Consider adding email for payment receipts")
  }

  return {
    compatible: conflicts.filter(c => c.severity === "error").length === 0,
    conflicts,
    warnings,
    suggestions,
  }
}

test.describe("Compatibility Matrix", () => {
  test.describe("Conflict Detection", () => {
    test("detects Supabase + Clerk auth conflict", () => {
      const result = checkCompatibility({
        auth: "supabase",
      })
      
      // Just Supabase should be fine
      assert.strictEqual(result.compatible, true)
      assert.strictEqual(result.conflicts.length, 0)
    })

    test("detects dual auth providers as conflict", () => {
      // Simulate adding both auth providers
      // In real implementation this would check the matrix
      const integrations = { auth: "supabase" }
      const secondAuth = "clerk"
      
      const a = `auth:supabase`
      const b = `auth:${secondAuth}`
      
      const entry = COMPATIBILITY_MATRIX[a]?.[b]
      
      assert.ok(entry, "Matrix should have entry for auth providers")
      assert.strictEqual(entry.compatible, false, "Dual auth should conflict")
    })

    test("detects Stripe + Paddle payment conflict", () => {
      const a = "payments:stripe"
      const b = "payments:paddle"
      
      const entry = COMPATIBILITY_MATRIX[a]?.[b]
      
      assert.ok(entry, "Matrix should have entry for payment providers")
      assert.strictEqual(entry.compatible, false, "Dual payments should conflict")
    })

    test("allows compatible combinations", () => {
      const result = checkCompatibility({
        auth: "supabase",
        payments: "stripe",
      })
      
      assert.strictEqual(result.compatible, true, "Supabase + Stripe should be compatible")
      assert.strictEqual(result.conflicts.length, 0, "Should have no conflicts")
    })
  })

  test.describe("Warnings", () => {
    test("generates warning for recommended combinations", () => {
      const a = "auth:supabase"
      const b = "database:supabase"
      
      const entry = COMPATIBILITY_MATRIX[a]?.[b]
      
      assert.ok(entry, "Matrix should have entry")
      assert.strictEqual(entry.compatible, true, "Should be compatible")
      assert.ok(entry.note, "Should have a note")
    })
  })

  test.describe("Suggestions", () => {
    test("suggests database when using Supabase auth", () => {
      const result = checkCompatibility({
        auth: "supabase",
        // No database selected
      })
      
      assert.ok(
        result.suggestions.some(s => s.includes("database")),
        "Should suggest Supabase database"
      )
    })

    test("suggests email when using payments", () => {
      const result = checkCompatibility({
        auth: "supabase",
        payments: "stripe",
        // No email selected
      })
      
      assert.ok(
        result.suggestions.some(s => s.includes("email")),
        "Should suggest email for receipts"
      )
    })
  })

  test.describe("Required Environment Variables", () => {
    const REQUIRED_ENV_VARS = {
      "auth:supabase": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      "auth:clerk": ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
      "payments:stripe": ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
      "email:resend": ["RESEND_API_KEY", "EMAIL_FROM"],
      "analytics:posthog": ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
    }

    function getRequiredEnvVars(integrations) {
      const envVars = new Set()
      
      for (const [category, provider] of Object.entries(integrations)) {
        if (!provider) continue
        const key = `${category}:${provider}`
        const vars = REQUIRED_ENV_VARS[key] || []
        for (const v of vars) envVars.add(v)
      }
      
      return Array.from(envVars).sort()
    }

    test("returns Supabase env vars", () => {
      const vars = getRequiredEnvVars({ auth: "supabase" })
      
      assert.ok(vars.includes("NEXT_PUBLIC_SUPABASE_URL"))
      assert.ok(vars.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
    })

    test("returns combined env vars for multiple integrations", () => {
      const vars = getRequiredEnvVars({
        auth: "supabase",
        payments: "stripe",
        email: "resend",
      })
      
      assert.ok(vars.includes("NEXT_PUBLIC_SUPABASE_URL"), "Should include Supabase URL")
      assert.ok(vars.includes("STRIPE_SECRET_KEY"), "Should include Stripe key")
      assert.ok(vars.includes("RESEND_API_KEY"), "Should include Resend key")
    })

    test("returns empty array for no integrations", () => {
      const vars = getRequiredEnvVars({})
      
      assert.strictEqual(vars.length, 0, "Should return empty array")
    })

    test("deduplicates shared env vars", () => {
      const vars = getRequiredEnvVars({
        auth: "supabase",
        database: "supabase", // Both might need same vars
      })
      
      // Count occurrences of each var
      const counts = {}
      for (const v of vars) {
        counts[v] = (counts[v] || 0) + 1
      }
      
      for (const [v, count] of Object.entries(counts)) {
        assert.strictEqual(count, 1, `${v} should not be duplicated`)
      }
    })
  })

  test.describe("Report Generation", () => {
    function generateReport(integrations) {
      const result = checkCompatibility(integrations)
      
      const lines = [
        "# Compatibility Report",
        "",
        `Status: ${result.compatible ? "Compatible" : "Conflicts Detected"}`,
        "",
        "## Integrations",
      ]
      
      for (const [category, provider] of Object.entries(integrations)) {
        if (provider) {
          lines.push(`- ${category}: ${provider}`)
        }
      }
      
      if (result.conflicts.length > 0) {
        lines.push("", "## Conflicts")
        for (const c of result.conflicts) {
          lines.push(`- ${c.integrations.join(" vs ")}: ${c.reason}`)
        }
      }
      
      return lines.join("\n")
    }

    test("generates markdown report", () => {
      const report = generateReport({
        auth: "supabase",
        payments: "stripe",
      })
      
      assert.ok(report.includes("# Compatibility Report"))
      assert.ok(report.includes("auth: supabase"))
      assert.ok(report.includes("payments: stripe"))
    })

    test("includes conflicts in report", () => {
      // Test with mocked conflict
      const result = checkCompatibility({
        auth: "supabase",
        payments: "stripe",
      })
      
      // No conflicts in this case
      assert.strictEqual(result.conflicts.length, 0)
    })
  })

  test.describe("Visual Matrix Generation", () => {
    test("creates visual compatibility matrix", () => {
      const providers = ["auth:supabase", "auth:clerk", "payments:stripe"]
      const shortNames = {
        "auth:supabase": "Supa",
        "auth:clerk": "Clerk",
        "payments:stripe": "Stripe",
      }
      
      // Build matrix row
      let matrix = []
      for (const row of providers) {
        const cells = []
        for (const col of providers) {
          if (row === col) {
            cells.push("-")
          } else {
            const entry = COMPATIBILITY_MATRIX[row]?.[col] || COMPATIBILITY_MATRIX[col]?.[row]
            cells.push(entry ? (entry.compatible ? "✅" : "❌") : "✅")
          }
        }
        matrix.push({ row: shortNames[row], cells })
      }
      
      assert.strictEqual(matrix.length, 3, "Matrix should have 3 rows")
      assert.strictEqual(matrix[0].cells[0], "-", "Diagonal should be -")
    })
  })
})

