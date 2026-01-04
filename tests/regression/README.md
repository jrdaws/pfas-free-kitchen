# Regression Tests

> Tests that prevent fixed bugs from recurring

## Purpose

Every bug fix MUST include a regression test. These tests:
- Reproduce the original bug scenario
- Verify the fix works
- Run on every commit to prevent recurrence

## Naming Convention

```
test-BUG-{YYYYMMDD}-{short-description}.test.ts
```

## Adding a Regression Test

1. Create test file:
   ```bash
   touch tests/regression/test-BUG-$(date +%Y%m%d)-short-name.test.ts
   ```

2. Follow template in `docs/sops/REGRESSION_TESTING_SOP.md`

3. Link test in bug report

## Running Regression Tests

```bash
# All regression tests
npm test -- tests/regression/

# Specific bug
npm test -- --grep "BUG-20251225"
```

## Index

| Bug ID | Description | Date Fixed |
|--------|-------------|------------|
| - | No regression tests yet | - |

---

*See [REGRESSION_TESTING_SOP.md](../../docs/sops/REGRESSION_TESTING_SOP.md) for full guide*

