# Agent Safety

The Dawson Does Framework includes built-in safety features designed for AI agents making autonomous changes to codebases. These features prevent destructive operations, enable rollback, and maintain audit trails.

## Table of Contents

- [What Is Agent Safety?](#what-is-agent-safety)
- [Why Agent Safety Matters](#why-agent-safety-matters)
- [Safety Architecture](#safety-architecture)
- [Checkpoint System](#checkpoint-system)
- [Session Recovery](#session-recovery)
- [Safety Protocols](#safety-protocols)
- [Trust Layer Principles](#trust-layer-principles)
- [Constitutional Invariants](#constitutional-invariants)
- [Using Safety Features](#using-safety-features)
- [AI Governance](#ai-governance)

## What Is Agent Safety?

Agent safety is a set of features and protocols that make it safe for AI agents (like Claude, GitHub Copilot, or custom AI systems) to make changes to your codebase without human supervision.

### The AI Agent Problem

AI agents are powerful but can make mistakes:

```
❌ Without Safety:
┌─────────────────────────────────────────┐
│ AI Agent                                │
│ "Refactor auth system"                  │
└────────────┬────────────────────────────┘
             ↓
      Deletes files
      Breaks tests
      No way to undo
             ↓
┌─────────────────────────────────────────┐
│ Broken Codebase                         │
│ ❌ Can't recover                        │
└─────────────────────────────────────────┘
```

```
✅ With Safety:
┌─────────────────────────────────────────┐
│ AI Agent                                │
│ "Refactor auth system"                  │
└────────────┬────────────────────────────┘
             ↓
      Creates checkpoint
      Makes changes
      If failure → rollback available
             ↓
┌─────────────────────────────────────────┐
│ Safe Codebase                           │
│ ✓ Can recover from failures             │
│ ✓ Audit trail maintained                │
└─────────────────────────────────────────┘
```

### Safety Features

1. **Checkpoints**: Automatic snapshots before major changes
2. **Rollback**: Restore from any checkpoint
3. **Audit Log**: Track all agent operations
4. **Recovery Guidance**: Clear instructions when things fail
5. **Permission Boundaries**: Define what agents can/cannot do

## Why Agent Safety Matters

### 1. Prevent Data Loss

**Without Safety**:
```bash
# AI agent refactors code
# Deletes important files
# No backup exists
# ❌ Permanent data loss
```

**With Safety**:
```bash
# AI agent creates checkpoint
# Refactors code
# Deletes files
# Test fails → restore checkpoint
# ✅ No data loss
```

### 2. Enable Autonomous Operations

**Without Safety**:
- Human must supervise every change
- Can't run agents overnight
- Must manually backup before operations

**With Safety**:
- Agent can work autonomously
- Failures auto-rollback
- Humans review after completion

### 3. Build Trust

**Without Safety**:
- Developers fear AI agents
- Won't use for production work
- Limited adoption

**With Safety**:
- Developers trust the system
- Use agents for critical work
- Wider adoption

### 4. Compliance and Auditing

**Without Safety**:
- No record of what AI changed
- Can't prove compliance
- Regulatory issues

**With Safety**:
- Complete audit trail
- Prove what changed and why
- Meet compliance requirements

## Safety Architecture

### Layered Safety Model

```
┌─────────────────────────────────────────┐
│ Layer 1: Constitutional Invariants      │
│ • No hidden behavior                    │
│ • Explicit consent required             │
│ • Reversibility mandatory               │
│ • Zero lock-in                          │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Layer 2: Permission Boundaries          │
│ • Allowed operations (read, test)       │
│ • Checkpoint required (refactor, etc.)  │
│ • Forbidden (arbitrary shell, etc.)     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Layer 3: Checkpoint System              │
│ • Git stash-based snapshots             │
│ • Automatic before major ops            │
│ • Manual checkpoint support             │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Layer 4: Audit Trail                    │
│ • .dd/agent-safety-log.json             │
│ • All operations logged                 │
│ • Last 100 entries kept                 │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Layer 5: Recovery Guidance              │
│ • Actionable error messages             │
│ • Rollback instructions                 │
│ • Prevention advice                     │
└─────────────────────────────────────────┘
```

### Safety Flow

```
┌─────────────────────────────────────────┐
│ 1. Agent Plans Operation                │
│    "Refactor authentication module"     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Check Permission Boundary            │
│    Is this allowed? Checkpoint needed?  │
└────────────┬────────────────────────────┘
             ↓ (requires checkpoint)
┌─────────────────────────────────────────┐
│ 3. Create Checkpoint                    │
│    git stash push -m "checkpoint-..."   │
│    Log to audit trail                   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Execute Operation                    │
│    withSafetyCheckpoint(async () => {   │
│      // risky operation                 │
│    })                                   │
└────────────┬────────────────────────────┘
             ↓
      Success?   ┌─ Yes → Complete
             │   └─ Log success
             │
             └─ No → Rollback
                     ↓
             ┌─────────────────────────────┐
             │ Offer Recovery              │
             │ • Show checkpoint ID        │
             │ • Restore command           │
             │ • Error analysis            │
             └─────────────────────────────┘
```

## Checkpoint System

### What Are Checkpoints?

Checkpoints are snapshots of your working directory created before major operations. They use git stash internally, making them:

- **Fast**: Near-instant creation
- **Reliable**: Built on proven git technology
- **Reversible**: Easy to restore
- **Space-efficient**: Compressed storage

### Creating Checkpoints

#### Automatic (via withSafetyCheckpoint)

```javascript
import { withSafetyCheckpoint } from './src/dd/agent-safety.mjs';

// Automatically creates checkpoint before operation
const result = await withSafetyCheckpoint(async () => {
  // Risky operation here
  await refactorAuthModule();
  await runTests();
}, {
  description: "Refactor authentication module",
  files: ["src/lib/auth.ts", "src/app/api/auth/**"],
});

if (result.success) {
  console.log("Operation succeeded");
} else {
  console.error("Operation failed");
  // Checkpoint available for rollback
}
```

#### Manual (via CLI)

```bash
# Create checkpoint manually
framework checkpoint create "Before major refactor"

# Output:
# ✅ Checkpoint created: agent-checkpoint-1734567890
#    To restore: framework checkpoint restore agent-checkpoint-1734567890
```

### Listing Checkpoints

```bash
framework checkpoint list

# Output:
# Found 3 checkpoint(s):
#
#   stash@{0} | agent-checkpoint-1734567890
#     Before major refactor
#
#   stash@{1} | agent-checkpoint-1734567800
#     Refactor authentication module
#
#   stash@{2} | agent-checkpoint-1734567700
#     Add payment integration
```

### Restoring Checkpoints

```bash
# Restore by checkpoint ID
framework checkpoint restore agent-checkpoint-1734567890

# Output:
# ✅ Restored from checkpoint: agent-checkpoint-1734567890
#    Working directory restored to previous state
```

### Cleanup Old Checkpoints

```bash
# Clean up, keep last 5
framework checkpoint cleanup 5

# Output:
# Removed 3 checkpoint(s), kept 5.

# Keep last 10
framework checkpoint cleanup 10
```

### Checkpoint Storage

Checkpoints are stored as git stashes:

```bash
# View in git
git stash list

# Output:
# stash@{0}: On main: agent-checkpoint-1734567890: Before major refactor
# stash@{1}: On main: agent-checkpoint-1734567800: Refactor authentication module
```

### When Checkpoints Are Created

| Operation | Checkpoint? | Why |
|-----------|-------------|-----|
| Reading files | No | Safe operation |
| Running tests | No | Safe operation |
| Linting | No | Safe operation |
| Creating new files | No* | Reversible via git |
| Editing files | Yes | May break functionality |
| Deleting files | Yes | Destructive |
| Major refactors | Yes | High impact |
| Dependency updates | Yes | May break builds |

\* If editing 5+ files, checkpoint is recommended.

### Checkpoint Lifecycle

```
1. Create
   ↓
   git stash push -m "agent-checkpoint-..."
   ↓
2. Operation runs
   ↓
3. Success → Keep checkpoint (for audit)
   Failure → Offer restore
   ↓
4. Eventually cleanup (keep last N)
```

## Session Recovery

### The Context Loss Problem

AI agents can lose context mid-operation:

```
Agent starts task:
├─ Step 1: Analyze codebase ✓
├─ Step 2: Create checkpoint ✓
├─ Step 3: Start refactoring...
│
└─ ❌ Context window full / API timeout
    ⚠️  Agent doesn't know what it was doing
```

### Session State Files

Framework maintains state in `.dd/`:

```
.dd/
├── agent-safety-log.json        # Audit trail
├── checkpoint-state.json        # Active checkpoint info
└── recovery-state.json          # Session recovery data
```

### Recovery State

```json
{
  "sessionId": "session-1734567890",
  "startedAt": "2025-12-21T10:30:00.000Z",
  "operation": "refactor-auth",
  "description": "Refactoring authentication module",
  "checkpointId": "agent-checkpoint-1734567890",
  "filesModified": [
    "src/lib/auth.ts",
    "src/app/api/auth/route.ts"
  ],
  "currentStep": 3,
  "totalSteps": 7,
  "canRecover": true
}
```

### Resuming After Context Loss

```bash
# Framework detects incomplete operation
framework doctor .

# Output:
# ⚠️  Incomplete operation detected:
#    Operation: refactor-auth
#    Started: 2025-12-21 10:30:00
#    Checkpoint: agent-checkpoint-1734567890
#
# Options:
#   1. Resume operation (requires AI agent)
#   2. Rollback to checkpoint
#   3. Keep changes and mark complete
#
# Choose option: _
```

## Safety Protocols

### Protocol 1: No Hidden Behavior

**Rule**: Every action must be explainable and visible.

**Implementation**:
```javascript
// Good: Logged operation
await withSafetyCheckpoint(async () => {
  console.log("Refactoring auth module...");
  await refactor();
  console.log("Refactor complete");
}, { description: "Refactor authentication" });

// Bad: Silent operation
await refactor();  // What happened? No record
```

### Protocol 2: Explicit Consent Required

**Rule**: Destructive operations require approval.

**Implementation**:
```javascript
// Destructive operation requires checkpoint
await withSafetyCheckpoint(async () => {
  await deleteOldFiles();
}, { description: "Delete deprecated files" });

// Framework prompts:
// "This operation may be destructive. Continue? (y/n)"
```

### Protocol 3: Reversibility & Recovery

**Rule**: Every mutation should be reversible.

**Implementation**:
```javascript
// Checkpoint enables rollback
const result = await withSafetyCheckpoint(operation);

if (!result.success) {
  // Framework automatically offers:
  // "To restore: framework checkpoint restore [id]"
}
```

### Protocol 4: Determinism

**Rule**: Same inputs should produce predictable outputs.

**Implementation**:
```javascript
// Good: Deterministic
function generateCode(template, options) {
  // Same template + options = same output
  return render(template, options);
}

// Bad: Non-deterministic
function generateCode(template, options) {
  // Different output each time
  return render(template, { ...options, random: Math.random() });
}
```

### Protocol 5: Zero Lock-in

**Rule**: Exported projects must work without the framework.

**Implementation**:
```bash
# After export
framework export saas ./my-app

# Remove framework
npm uninstall -g @jrdaws/framework

# App still works
cd my-app
npm install
npm run dev
# ✓ Runs fine
```

## Trust Layer Principles

### Principle 1: Explicit Over Implicit

**Bad**: Framework makes assumptions
```javascript
// Implicit: Framework decides what to backup
framework refactor
```

**Good**: User controls what happens
```javascript
// Explicit: User chooses checkpoint behavior
framework checkpoint create "Before refactor"
framework refactor
```

### Principle 2: Audit Everything

Every operation is logged:

```json
{
  "timestamp": "2025-12-21T10:30:00.000Z",
  "operation": "checkpoint-create",
  "checkpointId": "agent-checkpoint-1734567890",
  "description": "Refactor authentication module",
  "filesAffected": 12,
  "success": true
}
```

### Principle 3: Fail Safe

When in doubt, preserve state:

```javascript
// If checkpoint creation fails
if (!checkpoint.created) {
  console.log("⚠️  Checkpoint not created (no uncommitted changes)");
  console.log("   Operation will proceed without checkpoint");
  // Asks user to confirm
}
```

### Principle 4: Human-in-the-Loop for Critical Ops

Critical operations require human approval:

```bash
# Delete production data
framework database delete --environment production

# Framework blocks:
# ❌ This operation requires explicit approval
#    Run with: --confirm="I understand this is permanent"
```

### Principle 5: Recoverable by Default

Default behavior is safe:

```bash
# Safe: Creates checkpoint
framework refactor

# Unsafe: Skip checkpoint (opt-in)
framework refactor --no-checkpoint
```

## Constitutional Invariants

These rules are **non-negotiable** for the framework:

### 1. No Hidden Behavior

```
✓ Every action logged
✓ Every mutation visible
✓ No silent installs
✓ No background network calls
```

### 2. Explicit Consent Required

```
✓ Destructive ops need approval
✓ Irreversible actions opt-in
✓ Default to safe operations
✓ Never assume consent
```

### 3. Reversibility & Recovery

```
✓ Changes are reversible
✓ Recovery instructions provided
✓ Partial failures don't corrupt state
✓ Checkpoints before major changes
```

### 4. Determinism

```
✓ Same inputs → same outputs
✓ No magic behavior
✓ Random elements seeded and logged
✓ Document non-deterministic behavior
```

### 5. Zero Lock-in

```
✓ Exported projects work standalone
✓ No hidden dependencies
✓ Users can eject anytime
✓ Generated code is readable
```

## Using Safety Features

### For AI Agent Developers

```javascript
import { withSafetyCheckpoint } from '@jrdaws/framework';

// Wrap risky operations
async function agentRefactor(context) {
  const result = await withSafetyCheckpoint(async () => {
    // 1. Analyze codebase
    const analysis = await analyzeCode(context);

    // 2. Generate changes
    const changes = await generateRefactor(analysis);

    // 3. Apply changes
    await applyChanges(changes);

    // 4. Run tests
    const testsPass = await runTests();

    if (!testsPass) {
      throw new Error("Tests failed after refactor");
    }

    return { success: true, changes };
  }, {
    description: "AI-driven refactor of auth module",
  });

  if (!result.success) {
    // Framework offers rollback
    console.error("Refactor failed, checkpoint available");
  }

  return result;
}
```

### For Cursor AI Rules

```plaintext
# .cursorrules

When modifying code:
1. Create checkpoint before major changes
2. Test after each change
3. If tests fail, offer rollback

Commands:
- Before refactoring: `framework checkpoint create "description"`
- After changes: `framework doctor .` (health check)
- If failure: `framework checkpoint restore [id]`

Never:
- Delete files without checkpoint
- Modify 5+ files without checkpoint
- Skip tests after changes
```

### For Human Developers

```bash
# Before letting AI agent work
framework checkpoint create "Before AI session"

# Let AI work...

# After AI session, check what changed
git diff agent-checkpoint-1734567890

# If unhappy, rollback
framework checkpoint restore agent-checkpoint-1734567890
```

## AI Governance

Full governance rules are in [AI_GOVERNANCE.md](/Users/joseph.dawson/Documents/dawson-does-framework/docs/AI_GOVERNANCE.md):

### Permission Boundaries

#### ✅ Allowed (No Approval Required)

- Read any file
- Search codebase
- Run tests
- Run linters
- Generate documentation

#### ⚠️ Requires Checkpoint

- Delete multiple files
- Refactor core modules
- Modify package.json
- Change entry points
- Modify plugin system

#### 🛑 Forbidden (Never Do)

- Execute arbitrary shell commands
- Store secrets in source
- Make network calls without approval
- Modify .git internals
- Delete audit logs
- Suppress errors

### Audit Trail Requirements

All operations logged to `.dd/agent-safety-log.json`:

```json
{
  "timestamp": "2025-12-21T10:30:00.000Z",
  "checkpointId": "agent-checkpoint-1734567890",
  "description": "Refactor authentication module",
  "action": "created",
  "filesAffected": 12,
  "success": true
}
```

## Related Concepts

- **[Drift Detection](./drift-detection.md)**: Track changes from template
- **[Plugins](./plugins.md)**: Extend framework safely
- **[CLI Commands](/Users/joseph.dawson/Documents/dawson-does-framework/docs/cli/checkpoint.md)**: Checkpoint command reference
- **[AI Governance](/Users/joseph.dawson/Documents/dawson-does-framework/docs/AI_GOVERNANCE.md)**: Complete governance rules

## Next Steps

- Read [AI Governance Constitution](/Users/joseph.dawson/Documents/dawson-does-framework/docs/AI_GOVERNANCE.md)
- Learn about [Checkpoint Commands](/Users/joseph.dawson/Documents/dawson-does-framework/docs/cli/checkpoint.md)
- Explore [Recovery Guidance](/Users/joseph.dawson/Documents/dawson-does-framework/src/dd/recovery-guidance.mjs)
- Review [Coding Standards](/Users/joseph.dawson/Documents/dawson-does-framework/docs/standards/coding-standards.md)

---

**Previous**: [Drift Detection](./drift-detection.md)
**Next**: [Architecture Overview](../architecture/README.md)
