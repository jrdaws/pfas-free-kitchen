# Regression Testing SOP

> **Version**: 1.0 | **Created**: 2025-12-25
> **Purpose**: Prevent bug recurrence through mandatory regression tests
> **Audience**: All agents fixing bugs
> **Related**: [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md), [CODE_QUALITY_SOP.md](./CODE_QUALITY_SOP.md)

---

## Overview

Every bug fix MUST include a regression test that:
1. Reproduces the original bug
2. Verifies the fix works
3. Prevents future recurrence

```
Bug Reported → Fix Applied → Test Written → Verified → Closed
                                 │
                                 ▼
                    Test runs on every future commit
```

---

## 1. Mandatory Test Requirement

### Rule: No Fix Without Test

| Bug Severity | Test Required | Exception |
|--------------|---------------|-----------|
| P0 Critical | ✅ MANDATORY | None |
| P1 High | ✅ MANDATORY | None |
| P2 Medium | ✅ MANDATORY | Documentation-only bugs |
| P3 Low | ✅ RECOMMENDED | Pure cosmetic (CSS-only) |

### Verification Gate

Bug status cannot move from `Fixed` to `Verified` unless:
- [ ] Regression test exists
- [ ] Test name follows convention
- [ ] Test passes locally
- [ ] Test linked in bug report

---

## 2. Test Naming Convention

### Format

```
test-BUG-{YYYYMMDD}-{short-description}.test.ts
```

### Examples

```
tests/regression/test-BUG-20251225-auth-token-expired.test.ts
tests/regression/test-BUG-20251225-export-fails-empty-config.test.ts
tests/regression/test-BUG-20251225-ui-button-disabled-state.test.ts
```

### Directory Structure

```
tests/
├── unit/                    # Regular unit tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
└── regression/              # Bug regression tests
    ├── test-BUG-20251225-*.test.ts
    └── README.md            # Index of all regression tests
```

---

## 3. Regression Test Template

```typescript
// tests/regression/test-BUG-{id}.test.ts

/**
 * Regression test for: BUG-{YYYYMMDD}-{short-description}
 * 
 * Original Bug: {Link to bug report}
 * Description: {What was happening}
 * Root Cause: {Why it happened}
 * Fix: {What fixed it}
 * 
 * This test ensures the bug does not recur.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// or: import { describe, it, expect } from '@jest/globals';

describe('BUG-{YYYYMMDD}-{short-description}', () => {
  // Setup that replicates bug conditions
  beforeEach(() => {
    // Set up the exact conditions that triggered the bug
  });

  afterEach(() => {
    // Clean up
  });

  it('should not reproduce the original bug', () => {
    // GIVEN: The exact conditions that caused the bug
    const input = { /* conditions that triggered bug */ };

    // WHEN: The action that triggered the bug
    const result = functionThatHadBug(input);

    // THEN: The bug should not occur
    expect(result).not.toThrow();
    expect(result).toBe(/* expected correct behavior */);
  });

  it('should handle edge case that caused the bug', () => {
    // Test the specific edge case
  });

  it('should work correctly in normal conditions', () => {
    // Ensure fix didn't break normal behavior
  });
});
```

### Real Example

```typescript
// tests/regression/test-BUG-20251225-auth-token-expired.test.ts

/**
 * Regression test for: BUG-20251225-auth-token-expired
 * 
 * Original Bug: output/shared/bugs/closed/2025-12/BUG-20251225-auth-token-expired.md
 * Description: Users were logged out unexpectedly when token expired
 * Root Cause: Token refresh wasn't triggered before expiration
 * Fix: Added 5-minute buffer to token refresh check
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shouldRefreshToken, refreshToken } from '@/lib/auth';

describe('BUG-20251225-auth-token-expired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should refresh token before expiration', () => {
    // GIVEN: Token expires in 4 minutes (within 5-min buffer)
    const token = {
      expiresAt: Date.now() + 4 * 60 * 1000, // 4 minutes
    };

    // WHEN: Checking if refresh is needed
    const needsRefresh = shouldRefreshToken(token);

    // THEN: Should trigger refresh (5-minute buffer)
    expect(needsRefresh).toBe(true);
  });

  it('should NOT refresh token if expiration is far away', () => {
    // GIVEN: Token expires in 30 minutes
    const token = {
      expiresAt: Date.now() + 30 * 60 * 1000,
    };

    // WHEN: Checking if refresh is needed
    const needsRefresh = shouldRefreshToken(token);

    // THEN: Should NOT trigger refresh
    expect(needsRefresh).toBe(false);
  });

  it('should handle already expired tokens gracefully', () => {
    // GIVEN: Token already expired
    const token = {
      expiresAt: Date.now() - 1000, // 1 second ago
    };

    // WHEN: Attempting to refresh
    const result = refreshToken(token);

    // THEN: Should redirect to login, not crash
    expect(result.action).toBe('redirect_to_login');
    expect(result.error).toBeUndefined();
  });
});
```

---

## 4. Test Requirements by Bug Type

### UI/Visual Bugs

```typescript
// Use component testing (Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';

describe('BUG-20251225-button-disabled-state', () => {
  it('should show disabled styling when disabled prop is true', () => {
    render(<Button disabled>Submit</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
});
```

### API Bugs

```typescript
// Use API mocking
import { rest } from 'msw';
import { server } from '@/tests/mocks/server';

describe('BUG-20251225-api-timeout', () => {
  it('should retry on timeout', async () => {
    let attempts = 0;
    server.use(
      rest.get('/api/data', (req, res, ctx) => {
        attempts++;
        if (attempts < 3) {
          return res(ctx.delay(10000)); // Timeout
        }
        return res(ctx.json({ data: 'success' }));
      })
    );

    const result = await fetchWithRetry('/api/data');
    
    expect(attempts).toBe(3);
    expect(result.data).toBe('success');
  });
});
```

### Database Bugs

```typescript
// Use test database or mocks
describe('BUG-20251225-duplicate-entries', () => {
  it('should prevent duplicate email registration', async () => {
    // GIVEN: User already exists
    await db.user.create({ data: { email: 'test@example.com' } });

    // WHEN: Trying to create duplicate
    const createDuplicate = () => 
      db.user.create({ data: { email: 'test@example.com' } });

    // THEN: Should throw unique constraint error
    await expect(createDuplicate()).rejects.toThrow('Unique constraint');
  });
});
```

### Race Condition Bugs

```typescript
describe('BUG-20251225-race-condition', () => {
  it('should handle concurrent requests correctly', async () => {
    // GIVEN: Multiple concurrent requests
    const requests = Array(10).fill(null).map(() => 
      updateCounter(userId)
    );

    // WHEN: All requests complete
    await Promise.all(requests);

    // THEN: Counter should be exactly 10 (not less due to race)
    const counter = await getCounter(userId);
    expect(counter).toBe(10);
  });
});
```

---

## 5. Verification Process

### Before Closing Bug

Testing Agent must verify:

1. **Test Exists**
   ```bash
   ls tests/regression/test-BUG-{id}*.test.ts
   ```

2. **Test Passes**
   ```bash
   npm test -- --grep "BUG-{id}"
   ```

3. **Test Covers Bug Scenario**
   - Review test code
   - Confirm it tests the exact failure case

4. **Test Linked in Bug Report**
   - Add to "Fix Notes" section:
     ```markdown
     ## Fix Notes
     - **Test Added**: Yes - tests/regression/test-BUG-20251225-example.test.ts
     ```

### Verification Checklist

```markdown
## Regression Test Verification

- [ ] Test file exists: `tests/regression/test-BUG-{id}.test.ts`
- [ ] Test name follows convention
- [ ] Test passes: `npm test -- --grep "BUG-{id}"`
- [ ] Test reproduces original bug scenario
- [ ] Test verifies fix works
- [ ] Test covers edge cases
- [ ] Test linked in bug report
```

---

## 6. Regression Test Index

Maintain `tests/regression/README.md`:

```markdown
# Regression Tests Index

| Bug ID | Description | File | Date Fixed |
|--------|-------------|------|------------|
| BUG-20251225-auth-token | Token refresh timing | test-BUG-20251225-auth-token.test.ts | 2025-12-25 |
| BUG-20251224-export-fail | Empty config export | test-BUG-20251224-export-fail.test.ts | 2025-12-24 |
```

### Auto-Update Script

```bash
#!/bin/bash
# scripts/update-regression-index.sh

echo "# Regression Tests Index" > tests/regression/README.md
echo "" >> tests/regression/README.md
echo "| Bug ID | File | Last Run |" >> tests/regression/README.md
echo "|--------|------|----------|" >> tests/regression/README.md

for file in tests/regression/test-BUG-*.test.ts; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    bugid=$(echo "$filename" | grep -oE 'BUG-[0-9]+-[a-z-]+')
    echo "| $bugid | $filename | $(date +%Y-%m-%d) |" >> tests/regression/README.md
  fi
done
```

---

## 7. CI Integration

### Run Regression Tests in CI

```yaml
# .github/workflows/test.yml
regression-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - name: Run Regression Tests
      run: npm test -- tests/regression/ --coverage
    - name: Verify All Regression Tests Pass
      run: |
        if npm test -- tests/regression/ 2>&1 | grep -q "failed"; then
          echo "❌ Regression tests failing - blocking merge"
          exit 1
        fi
```

---

## 8. Quick Reference

### Create Regression Test

```bash
# 1. Create test file
touch tests/regression/test-BUG-$(date +%Y%m%d)-short-name.test.ts

# 2. Copy template
cat docs/sops/templates/regression-test-template.ts > tests/regression/test-BUG-...

# 3. Fill in test
code tests/regression/test-BUG-...

# 4. Run test
npm test -- --grep "BUG-$(date +%Y%m%d)"
```

### Verify Regression Test

```bash
# Run specific bug test
npm test -- tests/regression/test-BUG-20251225-*.test.ts

# Run all regression tests
npm test -- tests/regression/

# Check coverage
npm test -- tests/regression/ --coverage
```

---

## Related Documents

- [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md) - Bug lifecycle
- [CODE_QUALITY_SOP.md](./CODE_QUALITY_SOP.md) - Prevent bugs
- [BUG_PREVENTION_CHECKLIST.md](../standards/BUG_PREVENTION_CHECKLIST.md) - Quick reference

---

*Regression Testing SOP v1.0 | Bug Prevention System | 2025-12-25*

