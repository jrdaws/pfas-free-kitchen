# Framework Test Suite

Comprehensive test suite ensuring reliability across CLI, integrations, and website.

## Structure

```
tests/
├── cli/                    # CLI unit tests
│   ├── commands.test.mjs
│   ├── export-args.test.mjs
│   ├── version.test.mjs
│   ├── template-resolution.test.mjs
│   └── ...
├── integration/            # Integration tests
│   ├── template-validation.test.mjs
│   ├── billing.stripe.test.mjs
│   └── ...
├── utils/                  # Test utilities
│   ├── fixtures.mjs       # Test fixtures and helpers
│   └── assertions.mjs     # Custom assertions
├── matrix/                 # Cross-environment tests
│   └── smoke.mjs
├── providers/              # Provider-specific tests
│   ├── auth-supabase.test.mjs
│   ├── billing-paddle.test.mjs
│   └── ...
└── fixtures/               # Test data
    └── template-mini/
```

## Running Tests

### All Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

### Specific Test Suites
```bash
npm run test:cli            # CLI unit tests only
npm run test:integration    # Integration tests only
npm run matrix:smoke        # Smoke tests
```

### Website E2E Tests
```bash
cd website
npm test                    # Run Playwright tests
npm run test:ui             # Interactive UI mode
npm run test:headed         # With browser visible
```

## Coverage

We use [c8](https://github.com/bcoe/c8) for coverage reporting.

Target coverage: **80%+** for CLI and core functionality

Coverage reports are generated in:
- `coverage/` - HTML report
- `coverage/lcov.info` - LCOV format for CI

## CI/CD

Tests run automatically on:
- **Push to main**: Full test suite
- **Pull requests**: Full test suite + coverage
- **Nightly**: Comprehensive smoke tests
- **Tags**: Tests before publish

See `.github/workflows/` for workflow definitions.

## Writing Tests

### CLI Unit Tests

Use Node.js test runner with ES modules:

```javascript
import test from "node:test";
import assert from "node:assert/strict";

test("description", () => {
  // Test code
  assert.equal(actual, expected);
});
```

### Using Test Utilities

```javascript
import { createTempProject, cleanupTempProject } from "../utils/fixtures.mjs";
import { assertValidManifest, assertHasFiles } from "../utils/assertions.mjs";

test("template validation", () => {
  const tempDir = createTempProject();

  try {
    // Test code
    assertValidManifest(path.join(tempDir, ".dd/manifest.json"));
  } finally {
    cleanupTempProject(tempDir);
  }
});
```

### Integration Tests

Test real integrations with templates and providers:

```javascript
test("Integration: all templates have valid structure", () => {
  const templates = getTemplates();
  for (const templateName of templates) {
    assertValidTemplate(templatePath);
  }
});
```

### Website E2E Tests

Use Playwright for end-to-end testing:

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Framework/i);
});
```

## Best Practices

1. **Fast Tests**: Unit tests should run in <2 minutes total
2. **Isolated**: Each test should be independent
3. **Cleanup**: Always clean up temp files/directories
4. **Clear Names**: Test names should describe what they verify
5. **Fixtures**: Use shared fixtures from `tests/utils/`
6. **Assertions**: Use custom assertions for common checks

## Debugging

### Failed Tests
```bash
# Run specific test file
node --test tests/cli/commands.test.mjs

# Run with more verbose output
node --test --test-reporter=spec tests/cli/commands.test.mjs
```

### Website Tests
```bash
cd website

# Debug mode - opens browser and Playwright Inspector
npm run test:headed

# Interactive UI mode
npm run test:ui
```

## Adding New Tests

1. Choose appropriate directory (`cli/`, `integration/`, etc.)
2. Create `*.test.mjs` file
3. Import necessary utilities from `tests/utils/`
4. Write tests following existing patterns
5. Run tests locally before committing
6. Tests will run automatically in CI

## Success Criteria

- ✅ 80%+ code coverage on CLI
- ✅ All CLI commands have tests
- ✅ All templates validate
- ✅ Website E2E covers happy path
- ✅ CI runs on every PR
- ✅ Tests complete in <2 minutes
