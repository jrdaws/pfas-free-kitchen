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
- **Total Tests**: 461
- **Passing**: 439+ (95.2%)
- **Failing**: 0-7 (varies with environment)
- **Skipped**: 15

### Code Coverage
- **Overall**: 63.39%
- **Core (src/dd/)**: 80.59% ⭐
- **CLI (bin/framework.js)**: 52.37%
- **Commands (src/commands/)**: 55.26%
- **Functions**: 79.27%
- **Branches**: 76.41%

Significant improvements:
- Overall coverage: 42.42% → 63.39% (+49% improvement)
- bin/framework.js: 27.02% → 52.37% (+94% improvement)
- src/commands: 15.39% → 55.26% (+259% improvement)
- logger.mjs: 54.16% → 100% (complete coverage)
- Functions: 50.45% → 79.27% (+57% improvement)

### New Test Files Created (Session 1)
1. **tests/utils/fixtures.mjs** - Test utilities for creating temp projects, mock data
2. **tests/utils/assertions.mjs** - Custom assertions for validating manifests, configs, templates
3. **tests/cli/pull.test.mjs** - Unit tests for pull command (17 tests)
4. **tests/cli/demo.test.mjs** - Unit tests for demo command (6 tests)
5. **tests/cli/flags.test.mjs** - Comprehensive flag parsing tests (20 tests)
6. **tests/cli/export.test.mjs** - Export command structure tests (3 tests)
7. **tests/integration/template-valid.test.mjs** - Template validation tests
8. **tests/integration/manifest.test.mjs** - Manifest integration tests

### Additional Test Files Created (Session 2 - Coverage Push to 63%)
9. **tests/dd/logger.test.mjs** - Expanded logger tests (15 tests, 100% coverage)
10. **tests/commands/plugin.test.mjs** - Plugin command tests (9 tests)
11. **tests/commands/templates.test.mjs** - Templates command tests (10 tests)
12. **tests/commands/auth.test.mjs** - Auth command tests (3 tests)
13. **tests/commands/llm.test.mjs** - LLM command tests (3 tests)
14. **tests/dd/version.test.mjs** - Version utility tests (10 tests)
15. **tests/dd/integration-schema-validation.test.mjs** - Schema validation tests (17 tests)
16. **tests/dd/config-schema.test.mjs** - Config schema tests (9 tests)
17. **tests/cli/export-integration.test.mjs** - Export integration tests (10 tests)
18. **tests/cli/demo-integration.test.mjs** - Demo integration tests (8 tests)
19. **tests/cli/pull-integration.test.mjs** - Pull integration tests (8 tests)
20. **tests/cli/misc-commands.test.mjs** - Miscellaneous CLI tests (19 tests)
21. **tests/cli/edge-cases.test.mjs** - CLI edge case tests (16 tests)
22. **tests/cli/successful-exports.test.mjs** - Successful export scenarios (10 tests)
23. **tests/cli/start-command.test.mjs** - Start command tests (8 tests)

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
