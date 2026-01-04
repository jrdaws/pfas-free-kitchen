# Code Quality SOP

> **Version**: 1.0 | **Created**: 2025-12-25
> **Purpose**: Prevent bugs through code quality enforcement
> **Audience**: All agents writing code
> **Related**: [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md), [REGRESSION_TESTING_SOP.md](./REGRESSION_TESTING_SOP.md)

---

## Overview

This SOP establishes code quality gates that catch bugs before they reach production.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  TypeScript │───▶│   ESLint    │───▶│  Pre-Commit │───▶│    Tests    │
│   Strict    │    │   Rules     │    │    Hooks    │    │   Pass      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     Compile           Lint             Git Hook           npm test
     Errors            Errors           Block              Block
```

---

## 1. TypeScript Strict Mode

### Required tsconfig.json Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Why Each Flag Matters

| Flag | Bugs Prevented |
|------|----------------|
| `strictNullChecks` | Cannot read property of undefined |
| `noImplicitAny` | Type mismatches, wrong parameters |
| `noUncheckedIndexedAccess` | Array out of bounds |
| `noImplicitReturns` | Missing return statements |
| `noFallthroughCasesInSwitch` | Switch case bugs |
| `useUnknownInCatchVariables` | Unsafe error handling |

### Verification Command

```bash
npx tsc --noEmit --strict
```

---

## 2. ESLint Configuration

### Required .eslintrc.js

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Bug Prevention - Critical
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    
    // Null Safety
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    
    // Error Handling
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': 'error',
    
    // Code Quality
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Consistency
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
```

### Bug-Specific Rules Explained

| Rule | Bug Category | Example |
|------|--------------|---------|
| `no-floating-promises` | Unhandled rejections | `fetchData()` without await |
| `no-misused-promises` | Race conditions | `array.filter(async fn)` |
| `strict-boolean-expressions` | Falsy bugs | `if (count)` when 0 is valid |
| `no-unnecessary-condition` | Dead code | Checking values that can't be null |
| `no-non-null-assertion` | Runtime crashes | `user!.name` when user can be null |

### Quick Fix Commands

```bash
# Check for issues
npx eslint . --ext .ts,.tsx

# Auto-fix what's possible
npx eslint . --ext .ts,.tsx --fix

# Check specific file
npx eslint src/components/Button.tsx
```

---

## 3. Pre-Commit Hooks

### Install Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

### Configure .husky/pre-commit

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npx tsc --noEmit

# Run affected tests
npm test -- --changedSince=HEAD --passWithNoTests
```

### Configure lint-staged in package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,mjs}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Pre-Commit Workflow

```
git commit
    │
    ▼
┌─────────────────┐
│  lint-staged    │ ── Fix formatting, lint
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  tsc --noEmit   │ ── Type check
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm test       │ ── Run affected tests
└────────┬────────┘
         │
         ▼
    ✅ Commit OK
    or
    ❌ Commit Blocked
```

---

## 4. CI/CD Quality Gates

### GitHub Actions Workflow

```yaml
# .github/workflows/quality.yml
name: Code Quality

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type Check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Check coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
```

---

## 5. Required Patterns

### Error Handling Pattern

```typescript
// ✅ CORRECT: Explicit error handling with context
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    
    if (!response.ok) {
      throw new ApiError(`Failed to fetch user ${id}`, response.status);
    }
    
    return response.data;
  } catch (error) {
    // Log with context
    logger.error('fetchUser failed', {
      userId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ❌ WRONG: Silent failure, no context
async function fetchUser(id: string) {
  try {
    return await api.get(`/users/${id}`);
  } catch (e) {
    return null; // Bug: Caller doesn't know about failure
  }
}
```

### Null Safety Pattern

```typescript
// ✅ CORRECT: Explicit null handling
function getUsername(user: User | null): string {
  if (!user) {
    return 'Anonymous';
  }
  return user.name ?? 'Unknown';
}

// ❌ WRONG: Non-null assertion
function getUsername(user: User | null): string {
  return user!.name; // Bug: Crashes if user is null
}
```

### Async Pattern

```typescript
// ✅ CORRECT: All promises handled
async function processItems(items: Item[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      await processItem(item);
    })
  );
}

// ❌ WRONG: Floating promises
function processItems(items: Item[]): void {
  items.forEach(async (item) => {
    await processItem(item); // Bug: Not awaited
  });
}
```

---

## 6. Agent Responsibilities

### Before Writing Code

- [ ] Verify TypeScript strict mode is enabled
- [ ] Verify ESLint is configured
- [ ] Understand the domain patterns

### While Writing Code

- [ ] Handle all null/undefined cases
- [ ] Await all promises
- [ ] Add explicit return types
- [ ] Use specific error types

### Before Committing

- [ ] Run `npm test`
- [ ] Run `npx tsc --noEmit`
- [ ] Run `npx eslint .`
- [ ] Review changed files for patterns

---

## 7. Quick Reference

### Commands

```bash
# Full quality check
npm run lint && npx tsc --noEmit && npm test

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/path/to/file.ts && npx tsc --noEmit
```

### Common Error Fixes

| Error | Fix |
|-------|-----|
| "Object is possibly undefined" | Add null check or optional chaining |
| "Floating promise" | Add `await` or `.catch()` |
| "Argument of type 'any'" | Add explicit type annotation |
| "Missing return type" | Add `: ReturnType` to function |
| "Non-null assertion" | Use optional chaining or null check |

---

## Related Documents

- [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md) - When bugs slip through
- [REGRESSION_TESTING_SOP.md](./REGRESSION_TESTING_SOP.md) - Prevent bug recurrence
- [BUG_PREVENTION_CHECKLIST.md](../standards/BUG_PREVENTION_CHECKLIST.md) - Quick reference

---

*Code Quality SOP v1.0 | Bug Prevention System | 2025-12-25*

