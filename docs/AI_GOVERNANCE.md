# AI Governance Constitution

This document defines the constitutional invariants, permission boundaries, and operational rules for AI agents working on the dawson-does-framework codebase.

## Core Constitutional Invariants

These invariants are **non-negotiable**. Any AI agent operating on this codebase must respect them.

### 1. No Hidden Behavior
- Every action must be explainable
- Every mutation must be visible in logs or git history
- No silent installs, background network calls, or hidden writes
- If an action has side effects, they must be documented

### 2. Explicit Consent Required
- Destructive operations require human approval
- Irreversible actions must be opt-in
- Default to safe/read-only operations when uncertain
- Never assume consent from silence

### 3. Reversibility & Recovery
- Every mutation should be reversible or have a documented undo path
- Changes should be atomic where possible
- Partial failures must not corrupt state
- Recovery instructions must be provided when things fail

### 4. Determinism
- Same inputs should produce predictable outputs
- Avoid "magic" that breaks when files change
- Document any non-deterministic behavior explicitly
- Random elements must be seeded and logged

### 5. Zero Lock-in
- Exported projects must work without the framework
- No hidden dependencies on framework internals
- Users can eject at any time
- Generated code should be human-readable

---

## AI Agent Permission Boundaries

### ✅ ALLOWED (No Approval Required)

| Action | Condition |
|--------|-----------|
| Read any file | Always |
| Search codebase | Always |
| Run tests | Always |
| Run linters | Always |
| Generate documentation | Always |
| Create new files in `src/`, `tests/`, `docs/` | If requested |
| Edit existing source files | If requested |
| Run `npm install` in sandbox | If dependencies needed |

### ⚠️ REQUIRES CHECKPOINT (Use `withSafetyCheckpoint`)

| Action | Why |
|--------|-----|
| Delete multiple files | Potentially destructive |
| Refactor core modules | High impact on stability |
| Modify `package.json` dependencies | Can break builds |
| Change `bin/framework.js` entry point | Core functionality |
| Modify plugin system | Affects extensibility |
| Update templates | Affects all new exports |

### 🛑 FORBIDDEN (Never Do)

| Action | Why |
|--------|-----|
| Execute arbitrary shell commands with user input | Command injection risk |
| Store secrets in source code | Security violation |
| Make network calls without explicit approval | Privacy/security |
| Modify `.git` internals directly | Can corrupt history |
| Delete `.dd/` audit logs | Destroys audit trail |
| Bypass TTY detection for consent | Violates explicit consent |
| Suppress error messages | Hides problems |

---

## Backup Protocol

### When to Create Checkpoints

AI agents SHOULD create a checkpoint (`withSafetyCheckpoint()`) before:

1. **Major refactors** - Changes spanning 5+ files
2. **Core module changes** - `bin/framework.js`, `src/dd/*.mjs`
3. **Dependency updates** - Adding/removing npm packages
4. **Template modifications** - Changes to `templates/*/`
5. **Configuration schema changes** - Capability or config schema updates

### When Checkpoints Are NOT Needed

Skip checkpoints for:
- Single file edits
- Documentation updates
- Test file changes only
- Adding new, isolated files

### Checkpoint Usage

```javascript
import { withSafetyCheckpoint } from './src/dd/agent-safety.mjs';

// Wrap major operations
await withSafetyCheckpoint(async () => {
  // Risky operation here
  await refactorEntireModule();
}, { 
  description: "Refactor auth module to use new provider interface"
});
```

---

## Audit Trail Requirements

All AI agent operations that modify files MUST be logged:

### Git Commits
- Use conventional commit format: `type(scope): description`
- Include `[AI]` tag when AI-generated: `feat(auth): add OAuth support [AI]`
- Each commit should be atomic and revertible

### Agent Safety Log
Located at `.dd/agent-safety-log.json`:
- Records all checkpoint creation/restoration
- Tracks operation success/failure
- Maintains last 100 entries

### What Must Be Logged

| Event | Required Fields |
|-------|----------------|
| Checkpoint created | id, description, timestamp |
| Checkpoint restored | id, reason, timestamp |
| Major operation started | description, files affected |
| Operation failed | error message, recovery steps |

---

## Error Handling Requirements

When errors occur, AI agents must:

1. **Provide actionable recovery steps** - Not just stack traces
2. **Suggest rollback options** - If checkpoint exists
3. **Preserve partial state** - Don't leave corrupted files
4. **Log the failure** - For audit purposes

### Recovery Guidance Format

```
❌ Operation failed: [error message]

💡 Recovery Steps:
   1. [Specific action user can take]
   2. [Alternative approach]
   
💾 Checkpoint available: agent-checkpoint-1734567890
   To restore: framework checkpoint restore agent-checkpoint-1734567890
```

---

## Human-in-the-Loop Protocol

For the `framework copilot` command (when implemented):

### Step Presentation Format

```
┌─────────────────────────────────────────────────────────────┐
│ Step 3 of 7: Create authentication middleware               │
├─────────────────────────────────────────────────────────────┤
│ Action: Create new file                                     │
│ Path: src/middleware/auth.ts                                │
│ Reversible: Yes (can delete file)                           │
│                                                             │
│ Reasoning: The auth integration requires middleware to      │
│ validate session tokens on protected routes.                │
├─────────────────────────────────────────────────────────────┤
│ [A] Accept  [M] Modify  [R] Reject  [S] Skip  [Q] Abort     │
└─────────────────────────────────────────────────────────────┘
```

### User Actions

| Key | Action | Effect |
|-----|--------|--------|
| A | Accept | Execute step as shown |
| M | Modify | Edit the proposed change before executing |
| R | Reject | Skip this step, continue to next |
| S | Skip | Skip remaining steps in this category |
| Q | Abort | Cancel entire operation, offer rollback |

---

## Testing Requirements for AI Changes

Before committing AI-generated changes:

1. **Run full test suite**: `npm test`
2. **Validate capabilities**: `npm run caps:validate`
3. **Check for lint errors**: Read lint diagnostics
4. **Verify no regressions**: Compare test count before/after

### CI Must Pass

AI-generated commits must:
- Pass all existing tests
- Not reduce test coverage
- Not introduce new lint errors
- Generate valid `FRAMEWORK_MAP.md`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-20 | Initial governance document |

---

## Acknowledgments

This governance framework is inspired by:
- Constitutional AI principles
- The framework's trust primitives
- Lessons from multi-agent system design

