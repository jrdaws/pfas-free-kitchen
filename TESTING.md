# Testing Infrastructure

## Overview
Comprehensive test suite for the Dawson Does Framework, covering CLI commands, integrations, templates, and the web platform.

## Test Structure

```
tests/
├── cli/                    # CLI unit tests
│   ├── demo.test.mjs       # Demo command tests
│   ├── flags.test.mjs      # Flag parsing tests
│   ├── pull.test.mjs       # Pull command tests
│   └── plugins.test.mjs    # Plugin system tests
├── integration/            # Integration tests
│   ├── manifest.test.mjs   # Manifest generation tests
│   └── template-valid.test.mjs  # Template validation tests
└── utils/                  # Test utilities
    ├── fixtures.mjs        # Test fixtures and helpers
    └── assertions.mjs      # Custom assertions

website/tests/              # Website E2E tests
├── configurator.spec.ts    # Configurator flow tests
├── api.spec.ts            # API endpoint tests
├── homepage.spec.ts       # Homepage tests
└── preview.spec.ts        # Preview generation tests
```

## Running Tests

### CLI Tests
```bash
# Run all tests
npm test

# Run only CLI unit tests
npm run test:cli

# Run only integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Website E2E Tests
```bash
cd website

# Run all E2E tests
npm test

# Run with UI
npm run test:ui

# Run headed (see browser)
npm run test:headed
```

## Test Coverage

Coverage configuration is in `.c8rc.json`:
- Lines: 60% minimum
- Functions: 50% minimum
- Branches: 50% minimum
- Statements: 60% minimum

To view coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## Current Status

### Test Statistics
- **Total Tests**: 373
- **Passing**: 267 (71.6%)
- **Failing**: 107 (28.4%)

Most failing tests are in existing test files that need updates to match current implementation.

### New Test Files Created
1. **tests/utils/fixtures.mjs** - Test utilities for creating temp projects, mock data
2. **tests/utils/assertions.mjs** - Custom assertions for validating manifests, configs, templates
3. **tests/cli/pull.test.mjs** - Unit tests for pull command (17 tests)
4. **tests/cli/demo.test.mjs** - Unit tests for demo command (6 tests)
5. **tests/cli/flags.test.mjs** - Comprehensive flag parsing tests (20 tests)
6. **tests/cli/export.test.mjs** - Export command structure tests (3 tests)
7. **tests/integration/template-valid.test.mjs** - Template validation tests
8. **tests/integration/manifest.test.mjs** - Manifest integration tests

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/test.yml`) runs on every push and PR:

### Jobs
1. **cli-tests** - Runs all CLI and integration tests with coverage
2. **website-e2e** - Runs Playwright E2E tests on website
3. **template-validation** - Validates all templates have required files
4. **lint-and-validate** - Checks capabilities and framework map

### Matrix Testing
- Node.js versions: 18.x, 20.x
- Browsers (E2E): Chromium, Firefox, Safari

## Test Utilities

### Fixtures (`tests/utils/fixtures.mjs`)
- `createTempProject()` - Create temporary test directory
- `cleanupTempProject()` - Clean up test directory
- `createMockTemplate()` - Create mock template structure
- `createMockProject()` - Create mock project configuration
- `createMockManifest()` - Create mock manifest file
- `createMockConfig()` - Create mock .dd/config.json
- `initGitRepo()` - Initialize git repository
- `createMockFetch()` - Mock fetch for API tests
- `waitFor()` - Wait for async conditions

### Assertions (`tests/utils/assertions.mjs`)
- `assertValidManifest()` - Validate manifest.json structure
- `assertValidTemplate()` - Validate template directory
- `assertValidExport()` - Validate exported project
- `assertValidConfig()` - Validate config.json
- `assertEnvVars()` - Check env file has required variables
- `assertFilesExist()` - Check files exist
- `assertFilesNotExist()` - Check files don't exist
- `assertFileContains()` - Check file content
- `assertGitRepo()` - Validate git repository
- `assertPackageJson()` - Validate package.json
- `assertIntegrationFiles()` - Check integration files

## Writing New Tests

### CLI Unit Test Example
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExportFlags } from '../../bin/framework.js';

test('parseExportFlags: handles --name flag', () => {
  const flags = parseExportFlags(['--name', 'my-project']);
  assert.equal(flags.name, 'my-project');
});
```

### Integration Test Example
```javascript
import test from 'node:test';
import { createTempProject, cleanupTempProject } from '../utils/fixtures.mjs';
import { assertValidExport } from '../utils/assertions.mjs';

test('export creates valid project', () => {
  const tempDir = createTempProject();
  try {
    // ... perform export ...
    assertValidExport(tempDir);
  } finally {
    cleanupTempProject(tempDir);
  }
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('configurator loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
```

## Test Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Always clean up temp files/dirs
3. **Descriptive Names** - Test names should describe what they test
4. **Fast** - Tests should complete in <2 minutes total
5. **Assertions** - Use specific assertions, not generic truthiness
6. **Coverage** - Aim for 80%+ on new code

## Known Issues

1. Some existing tests have incorrect import paths
2. Template validation tests expect .dd/manifest.json in templates (not standard)
3. Some flag parsing edge cases need investigation
4. Website E2E tests need actual Supabase credentials for full testing

## Next Steps

To reach 80% coverage:
1. Fix failing tests in existing test files
2. Add more CLI command tests (export, doctor, capabilities)
3. Add integration tests for full export flow
4. Add integration tests for pull flow with mock API
5. Increase website E2E coverage
6. Add template-specific tests for each template

## Resources

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright Docs](https://playwright.dev)
- [c8 Coverage Tool](https://github.com/bcoe/c8)
