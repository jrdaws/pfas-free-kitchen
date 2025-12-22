# Testing Standards

> **Version 1.0** | How to write, organize, and maintain tests.

---

## 🎯 Purpose

This document defines:
- Test organization and naming
- Coverage requirements
- Test patterns and anti-patterns
- CI/CD integration

All agents working on tests must follow these standards.

---

## 📁 Test Organization

### Directory Structure

```
tests/                          # CLI and core tests
├── unit/                       # Isolated unit tests
│   ├── manifest.test.mjs
│   └── logger.test.mjs
├── integration/                # Multi-module tests
│   └── export-flow.test.mjs
├── cli/                        # CLI command tests
│   ├── export.test.mjs
│   └── pull.test.mjs
├── fixtures/                   # Test data
│   ├── template-mini/
│   └── sample-configs/
└── utils/                      # Test utilities
    └── helpers.mjs

website/tests/                  # Website E2E tests (Playwright)
├── e2e/
│   ├── configurator.spec.ts
│   └── export.spec.ts
├── fixtures/
│   └── test-projects/
└── utils/
    └── test-helpers.ts
```

### File Naming

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit tests | `[module].test.mjs` | `manifest.test.mjs` |
| Integration tests | `[flow].test.mjs` | `export-flow.test.mjs` |
| E2E tests | `[feature].spec.ts` | `configurator.spec.ts` |

---

## ✍️ Test Writing Patterns

### Basic Test Structure (Node.js)

```javascript
import { describe, test, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import { functionToTest } from "../src/dd/module.mjs"

describe("ModuleName", () => {
  describe("functionName", () => {
    test("returns expected value when given valid input", () => {
      // Arrange
      const input = { key: "value" }
      const expected = { result: true }
      
      // Act
      const actual = functionToTest(input)
      
      // Assert
      assert.deepStrictEqual(actual, expected)
    })

    test("throws error when given invalid input", () => {
      // Arrange
      const invalidInput = null
      
      // Act & Assert
      assert.throws(
        () => functionToTest(invalidInput),
        { message: /expected non-null/ }
      )
    })
  })
})
```

### Test Naming Convention

Use this format:
```
"[does/returns/throws] [expected outcome] when [condition]"
```

**Good examples:**
- `"returns parsed config when given valid JSON"`
- `"throws VALIDATION_ERROR when template is missing"`
- `"creates output directory when it doesn't exist"`

**Bad examples:**
- `"test1"`
- `"it works"`
- `"parseConfig test"`

---

## 🎭 E2E Test Patterns (Playwright)

### Basic E2E Structure

```typescript
// website/tests/e2e/configurator.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Configurator Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/configure");
  });

  test("completes full configuration flow", async ({ page }) => {
    // Step 1: Select template
    await page.click('[data-testid="template-saas"]');
    await expect(page.locator('[data-testid="step-integrations"]')).toBeVisible();

    // Step 2: Configure integrations
    await page.click('[data-testid="integration-supabase"]');
    
    // Step 3: Get export command
    await page.click('[data-testid="export-button"]');
    await expect(page.locator('[data-testid="export-command"]')).toContainText("framework export");
  });

  test("shows validation error for missing required fields", async ({ page }) => {
    await page.click('[data-testid="next-step"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText("required");
  });
});
```

### Data Attributes for Testing

Use `data-testid` for test selectors:
```tsx
// Component
<button data-testid="submit-button">Submit</button>

// Test
await page.click('[data-testid="submit-button"]');
```

---

## 📊 Coverage Requirements

### Minimum Coverage

| Category | Target | Critical |
|----------|--------|----------|
| Overall | 80% | 70% |
| Core modules (`src/dd/`) | 90% | 80% |
| CLI commands | 85% | 75% |
| API routes | 85% | 75% |
| UI components | 70% | 60% |

### Coverage Commands

```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report
npx c8 report --reporter=html
```

### What to Cover

| Must Cover | May Skip |
|------------|----------|
| Happy path | Simple getters/setters |
| Error cases | External library wrappers |
| Edge cases | Generated code |
| Public APIs | Type-only files |

---

## 🧪 Test Types

### Unit Tests
- Test single functions/modules in isolation
- Mock external dependencies
- Fast, run in milliseconds
- Run: `npm test`

```javascript
// Unit test example
test("parseFlags extracts template and output", () => {
  const args = ["saas", "./my-app", "--auth", "supabase"]
  const result = parseFlags(args)
  
  assert.strictEqual(result.template, "saas")
  assert.strictEqual(result.outputDir, "./my-app")
  assert.strictEqual(result.auth, "supabase")
})
```

### Integration Tests
- Test multiple modules together
- May use real filesystem (in temp dir)
- Moderate speed
- Run: `npm test -- --grep "integration"`

```javascript
// Integration test example
test("full export creates working project", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-"))
  
  try {
    await exportTemplate("saas", tempDir, { auth: "supabase" })
    
    // Verify structure
    assert.ok(fs.existsSync(path.join(tempDir, "package.json")))
    assert.ok(fs.existsSync(path.join(tempDir, "app/layout.tsx")))
  } finally {
    await fs.rm(tempDir, { recursive: true })
  }
})
```

### E2E Tests
- Test complete user flows
- Use real browser
- Slowest
- Run: `cd website && npx playwright test`

---

## 🚫 Anti-Patterns

### Don't Do This

| Anti-Pattern | Problem | Instead |
|--------------|---------|---------|
| Testing implementation | Breaks on refactor | Test behavior |
| Hardcoded paths | Fails on other machines | Use temp dirs |
| Sleep for async | Flaky, slow | Use proper waits |
| Testing private functions | Couples to internals | Test through public API |
| Ignoring cleanup | Resource leaks | Use afterEach |

### Examples of Anti-Patterns

```javascript
// ❌ BAD: Testing implementation details
test("calls internal _parseJson", () => {
  const spy = mock.method(module, "_parseJson")
  module.loadConfig("file.json")
  assert.ok(spy.called)  // Breaks if implementation changes
})

// ✅ GOOD: Testing behavior
test("loads valid JSON config", () => {
  const config = module.loadConfig("test-config.json")
  assert.deepStrictEqual(config, { expected: "value" })
})
```

```javascript
// ❌ BAD: Using sleep
await new Promise(resolve => setTimeout(resolve, 1000))
const result = await page.textContent(".result")

// ✅ GOOD: Using proper wait
await expect(page.locator(".result")).toBeVisible({ timeout: 5000 })
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: cd website && npm ci
      
      - name: Install Playwright
        run: cd website && npx playwright install --with-deps
      
      - name: Run E2E tests
        run: cd website && npx playwright test
```

---

## ✅ Test Checklist

Before submitting code:

- [ ] All existing tests pass
- [ ] New code has tests
- [ ] Coverage meets minimums
- [ ] Tests are named clearly
- [ ] No flaky tests
- [ ] Cleanup in afterEach
- [ ] No hardcoded paths
- [ ] E2E tests for UI changes

---

## 📋 Commands Reference

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/manifest.test.mjs

# Run with pattern
npm test -- --grep "export"

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# E2E tests
cd website && npx playwright test

# E2E with UI
cd website && npx playwright test --ui
```

---

*Version 1.0 | All test code must follow these standards.*
