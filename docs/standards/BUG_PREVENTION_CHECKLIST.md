# Bug Prevention Checklist

> **Purpose**: Quick reference for agents to prevent common bugs
> **Use**: Review before committing code changes
> **Related**: [CODE_QUALITY_SOP.md](../sops/CODE_QUALITY_SOP.md)

---

## 🔴 Pre-Commit Checklist (MANDATORY)

Before every commit, verify:

- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes (no type errors)
- [ ] `npx eslint .` passes (no lint errors)
- [ ] No `console.log` left in code (use logger)
- [ ] No hardcoded secrets or API keys
- [ ] No `any` types without justification

---

## 🟠 Domain-Specific Checklists

### UI/Frontend Bugs

| Check | Why | Fix |
|-------|-----|-----|
| **Loading states handled** | Prevents flash of broken UI | Add `isLoading` check |
| **Error states handled** | Prevents white screen | Add `error` boundary |
| **Empty states handled** | Prevents undefined.map() | Check array length |
| **Responsive tested** | Mobile users | Test at 375px, 768px, 1024px |
| **Keyboard accessible** | Accessibility | Add `tabIndex`, `aria-` |
| **Dark mode works** | Theme switching | Use CSS variables |

```tsx
// ✅ CORRECT: All states handled
function UserList({ users, isLoading, error }) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!users?.length) return <EmptyState />;
  
  return users.map(user => <UserCard key={user.id} user={user} />);
}

// ❌ WRONG: Crashes on empty/loading
function UserList({ users }) {
  return users.map(user => <UserCard user={user} />);
}
```

### API/Backend Bugs

| Check | Why | Fix |
|-------|-----|-----|
| **Input validated** | Injection, crashes | Use Zod schema |
| **Auth checked** | Unauthorized access | Middleware check |
| **Rate limited** | DDoS protection | Add rate limiter |
| **Errors returned properly** | Client handling | Return proper status codes |
| **Timeout set** | Hanging requests | Set fetch timeout |
| **Secrets from env** | Security | process.env.SECRET |

```typescript
// ✅ CORRECT: Proper API handler
export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Input validation
    const body = await req.json();
    const validated = schema.safeParse(body);
    if (!validated.success) {
      return Response.json({ error: validated.error }, { status: 400 });
    }

    // 3. Business logic with timeout
    const result = await Promise.race([
      processData(validated.data),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      ),
    ]);

    return Response.json(result);
  } catch (error) {
    // 4. Error logging (not exposing internals)
    console.error('API error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database Bugs

| Check | Why | Fix |
|-------|-----|-----|
| **Transactions used** | Data consistency | Wrap in transaction |
| **Indexes exist** | Performance | Add index on queried fields |
| **Unique constraints** | Duplicates | Add unique index |
| **Cascade deletes** | Orphaned data | Set onDelete behavior |
| **Connection pooled** | Resource exhaustion | Use connection pool |
| **Query parameterized** | SQL injection | Use prepared statements |

```typescript
// ✅ CORRECT: Transaction for related operations
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({ 
    data: items.map(item => ({ ...item, orderId: order.id }))
  });
  await tx.inventory.updateMany({
    where: { productId: { in: items.map(i => i.productId) } },
    data: { quantity: { decrement: 1 } },
  });
});

// ❌ WRONG: Partial failure possible
await prisma.order.create({ data: orderData });
await prisma.orderItem.createMany({ data: items }); // Fails here = orphaned order
```

### Async/Promise Bugs

| Check | Why | Fix |
|-------|-----|-----|
| **All promises awaited** | Silent failures | Add `await` |
| **Promise.all for parallel** | Sequential slowness | Use Promise.all |
| **Error handling in async** | Unhandled rejections | try/catch or .catch() |
| **No async in forEach** | Floating promises | Use for...of or map |
| **Race conditions handled** | Data corruption | Use locks or queues |

```typescript
// ✅ CORRECT: Proper async patterns
async function processItems(items: Item[]) {
  // Parallel processing with error handling
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  );
  
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`${failed.length} items failed`);
  }
  
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

// ❌ WRONG: Floating promises
function processItems(items: Item[]) {
  items.forEach(async (item) => {
    await processItem(item); // Not awaited!
  });
}
```

---

## 🟡 Error Handling Patterns

### Always Use Specific Error Types

```typescript
// ✅ Define specific errors
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// ✅ Handle by type
try {
  await updateUser(id, data);
} catch (error) {
  if (error instanceof ValidationError) {
    return Response.json({ field: error.field, message: error.message }, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return Response.json({ message: error.message }, { status: 404 });
  }
  throw error; // Re-throw unknown errors
}
```

### Never Swallow Errors

```typescript
// ❌ NEVER: Silent swallowing
try {
  await riskyOperation();
} catch (e) {
  // Bug: Error disappears
}

// ❌ NEVER: Return null silently
try {
  return await fetchData();
} catch (e) {
  return null; // Caller can't distinguish null vs error
}

// ✅ CORRECT: Log and re-throw or return error
try {
  return await fetchData();
} catch (error) {
  logger.error('fetchData failed', { error });
  throw error; // Or return { error: error.message }
}
```

---

## 🟢 Common Pitfalls by Framework

### Next.js

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Missing 'use client' | Hooks error | Add 'use client' directive |
| Server/client mismatch | Hydration error | Check conditional rendering |
| Missing loading.tsx | Flash of content | Add loading.tsx |
| Missing error.tsx | White screen | Add error.tsx |
| Caching issues | Stale data | Use revalidatePath/Tag |

### React

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Missing key prop | Console warning, bugs | Add unique key |
| Stale closure | Old state values | Use functional setState |
| Infinite useEffect | Loop, performance | Check dependency array |
| Memory leak | Warning on unmount | Cleanup in useEffect |

### Prisma

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Missing await | Pending promise | Add await |
| N+1 queries | Slow performance | Use include/select |
| Unique constraint | P2002 error | Check before insert |
| Connection limit | ECONNREFUSED | Use connection pool |

---

## 🔵 Quick Commands

```bash
# Full quality check before commit
npm test && npx tsc --noEmit && npx eslint .

# Find potential bugs
grep -r "any\|TODO\|FIXME\|console.log" src/

# Check for missing error handling
grep -r "catch.*{}" src/

# Find unhandled promises
npx eslint . --rule '@typescript-eslint/no-floating-promises: error'

# Run affected tests only
npm test -- --changedSince=main
```

---

## 📊 Bug Severity Quick Reference

| Severity | Example | Action |
|----------|---------|--------|
| **P0** | Site down, data loss | Stop everything, fix now |
| **P1** | Feature broken | Fix within 6 hours |
| **P2** | Degraded experience | Fix within 24 hours |
| **P3** | Cosmetic issue | Fix next cycle |

---

## Related Documents

- [CODE_QUALITY_SOP.md](../sops/CODE_QUALITY_SOP.md) - Detailed quality rules
- [REGRESSION_TESTING_SOP.md](../sops/REGRESSION_TESTING_SOP.md) - Test requirements
- [BUG_TRIAGE_SOP.md](../sops/BUG_TRIAGE_SOP.md) - Bug handling process

---

*Bug Prevention Checklist v1.0 | Quick Reference | 2025-12-25*

