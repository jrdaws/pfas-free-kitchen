# Design Decisions

Key architectural and design decisions made in the Dawson Does Framework, including rationale, alternatives considered, and trade-offs.

## Table of Contents

- [Why Next.js 15 App Router](#why-nextjs-15-app-router)
- [Provider Abstraction Pattern](#provider-abstraction-pattern)
- [CLI Architecture](#cli-architecture)
- [Manifest-Based Drift Detection](#manifest-based-drift-detection)
- [Local-First with Web Sync](#local-first-with-web-sync)
- [Template Composition vs Inheritance](#template-composition-vs-inheritance)
- [Git Stash for Checkpoints](#git-stash-for-checkpoints)
- [Plugin System Design](#plugin-system-design)

## Why Next.js 15 App Router

### Decision

All templates use Next.js 15 with App Router (not Pages Router).

### Rationale

**App Router Benefits**:
1. **Server Components**: Better performance, smaller bundles
2. **Built-in Data Fetching**: Simplified async/await in components
3. **Layout System**: Nested layouts reduce duplication
4. **Route Groups**: Organize routes without affecting URLs
5. **Future-Proof**: App Router is the future of Next.js

**Example**:
```typescript
// App Router: Cleaner, simpler
export default async function Page() {
  const data = await fetch('...');  // Just works
  return <div>{data}</div>;
}

// Pages Router: More boilerplate
export async function getServerSideProps() {
  const data = await fetch('...');
  return { props: { data } };
}

export default function Page({ data }) {
  return <div>{data}</div>;
}
```

### Alternatives Considered

**Option 1: Pages Router**
- Pros: More stable, wider community knowledge
- Cons: Being phased out, more boilerplate
- **Rejected**: Not forward-looking

**Option 2: Mix of Both**
- Pros: Flexibility
- Cons: Confusing, inconsistent patterns
- **Rejected**: Too complex

**Option 3: Other Frameworks (Remix, SvelteKit)**
- Pros: Alternative approaches
- Cons: Smaller ecosystems, less mature
- **Rejected**: Next.js has best ecosystem

### Trade-offs

**Pros**:
- Future-proof
- Better performance
- Cleaner code
- Better DX

**Cons**:
- Learning curve for Pages Router users
- Some libraries not yet compatible
- Fewer community examples

### Impact

All templates must:
- Use App Router structure
- Leverage Server Components
- Avoid Pages Router patterns
- Document RSC considerations

## Provider Abstraction Pattern

### Decision

Third-party services use abstract interfaces with concrete implementations.

### Pattern

```typescript
// Abstract
interface AuthProvider {
  getSession(): Promise<Session | null>;
  createSession(creds: Credentials): Promise<Session>;
}

// Concrete
class SupabaseAuthProvider implements AuthProvider {
  async getSession() { /* Supabase-specific */ }
  async createSession() { /* Supabase-specific */ }
}

// Usage
const auth = getAuthProvider();  // Returns concrete implementation
await auth.getSession();  // Uses provider-agnostic interface
```

### Rationale

**Benefits**:
1. **Swappable**: Change providers without code changes
2. **Testable**: Mock interfaces for testing
3. **Consistent**: Same API across providers
4. **Type-Safe**: TypeScript catches incompatibilities

**Example Use Case**:
```typescript
// Start with Supabase
const auth = new SupabaseAuthProvider(config);

// Later switch to Clerk (same interface)
const auth = new ClerkAuthProvider(config);

// Application code unchanged
const session = await auth.getSession();
```

### Alternatives Considered

**Option 1: Direct Integration**
- Pros: Simpler, fewer files
- Cons: Vendor lock-in, hard to test
- **Rejected**: Too inflexible

**Option 2: Adapter Pattern Only**
- Pros: Flexibility
- Cons: No type safety
- **Rejected**: TypeScript provides better DX

**Option 3: Plugin-Based Providers**
- Pros: Maximum flexibility
- Cons: Too complex for this use case
- **Rejected**: Overkill

### Trade-offs

**Pros**:
- Easy provider switching
- Testable with mocks
- Type-safe contracts
- Consistent APIs

**Cons**:
- Extra abstraction layer
- More files to maintain
- Learning curve

### Impact

All integrations must:
- Define abstract interface
- Implement concrete provider
- Export factory function
- Document interface contract

## CLI Architecture

### Decision

Single binary (`framework`) with subcommands, not separate binaries per command.

### Structure

```bash
# Single binary
framework export saas ./app
framework pull token-123
framework drift .
framework checkpoint create

# NOT separate binaries
framework-export saas ./app    # ❌
framework-pull token-123       # ❌
```

### Rationale

**Benefits**:
1. **Discovery**: All commands visible via `framework --help`
2. **Consistency**: Shared flags and behavior
3. **Installation**: One package, one binary
4. **Maintenance**: Single entry point

**Implementation**:
```javascript
// bin/framework.js
if (a === "export") { await cmdExport(b, c, restArgs); }
else if (a === "pull") { await cmdPull(b, restArgs); }
else if (a === "drift") { await cmdDrift(b); }
// ... more commands
```

### Alternatives Considered

**Option 1: Plugin-Based CLI**
- Pros: Extensible architecture
- Cons: Complex, slower startup
- **Rejected**: Over-engineered

**Option 2: Separate Binaries**
- Pros: Clear separation
- Cons: Harder to discover, install
- **Rejected**: Poor UX

**Option 3: Interactive Menu**
- Pros: User-friendly
- Cons: Slow for experienced users
- **Rejected**: Can't be scripted

### Trade-offs

**Pros**:
- Easy to discover commands
- Consistent interface
- Simple installation
- Shareable code

**Cons**:
- Large single file (~1600 lines)
- All commands load together
- Refactoring requires care

### Impact

Commands must:
- Be added to main dispatcher
- Follow consistent flag patterns
- Share common utilities
- Update help text

## Manifest-Based Drift Detection

### Decision

Track template changes using SHA256 hashes in a manifest file.

### Implementation

```json
{
  "files": [
    {
      "path": "src/app/page.tsx",
      "sha256": "a3f2e8c1b9d7f5e..."
    }
  ]
}
```

### Rationale

**Benefits**:
1. **Fast**: Hash comparison is O(n)
2. **Accurate**: Content-based, not timestamp-based
3. **Git-Friendly**: JSON manifest in version control
4. **Platform-Independent**: Works everywhere

**Alternative**: git diff against template repo
- Pros: No manifest needed
- Cons: Requires network, complex with local templates
- **Rejected**: Less reliable

### Alternatives Considered

**Option 1: Timestamp-Based**
- Pros: Very fast
- Cons: Unreliable (timestamps change on git clone)
- **Rejected**: Not accurate

**Option 2: Git Submodules**
- Pros: Native git integration
- Cons: Complex, confusing for users
- **Rejected**: Poor UX

**Option 3: AST-Based Diffing**
- Pros: Semantic understanding
- Cons: Slow, language-specific
- **Rejected**: Too complex

### Trade-offs

**Pros**:
- Accurate change detection
- Fast comparison
- Works offline
- Simple implementation

**Cons**:
- Manifest file in repo (~10KB)
- No semantic understanding
- Binary files tracked but not diffed

### Impact

Export process must:
- Hash all files (SHA256)
- Write manifest to .dd/
- Exclude node_modules, .git
- Keep manifest in git

## Local-First with Web Sync

### Decision

Framework works entirely offline, with optional web platform integration.

### Architecture

```
Local (Primary)              Web (Optional)
     ↓                            ↓
framework export          Configure in browser
     ↓                            ↓
Instant export            Generate token
     ↓                            ↓
Ready to use              framework pull [token]
                               ↓
                          Same local experience
```

### Rationale

**Benefits**:
1. **Speed**: No network latency
2. **Reliability**: Works offline
3. **Privacy**: Data stays local
4. **Simplicity**: No account required

**Web Platform Optional**:
- Visual configuration
- AI-powered previews
- Shareable project tokens
- Non-technical users

### Alternatives Considered

**Option 1: Web-Only**
- Pros: Easier to update, analytics
- Cons: Requires internet, slower
- **Rejected**: Poor UX for developers

**Option 2: Desktop App**
- Pros: Rich UI, local-first
- Cons: Installation complexity, updates
- **Rejected**: CLI is simpler

**Option 3: Hybrid Required**
- Pros: Better analytics
- Cons: Doesn't work offline
- **Rejected**: Violates local-first

### Trade-offs

**Pros**:
- Works offline
- Fast iteration
- No vendor lock-in
- Developer-friendly

**Cons**:
- Less usage data
- Web platform optional (must maintain both)
- No centralized updates

### Impact

Design must ensure:
- CLI never requires network
- Web platform is enhancement
- Same output from both paths
- Templates work standalone

## Template Composition vs Inheritance

### Decision

Templates use composition (add integrations) not inheritance (extend base template).

### Pattern

```
Composition (Used):
  Base Template (saas)
  + Auth Integration (supabase)
  + Payment Integration (stripe)
  = Final Project

Inheritance (Not Used):
  Base Template
  ↓ extends
  Auth Template
  ↓ extends
  Payment Template
  = Final Project
```

### Rationale

**Composition Benefits**:
1. **Flexibility**: Mix and match any integrations
2. **Simplicity**: Flat structure, no inheritance chains
3. **Maintenance**: Update integrations independently
4. **Understanding**: Clear what's included

**Example**:
```bash
# Composition: Clear what's added
framework export saas ./app \
  --auth supabase \
  --payments stripe

# Inheritance: Unclear intermediate steps
framework export saas-with-auth ./app
# What auth? Can I change it? Unclear.
```

### Alternatives Considered

**Option 1: Template Inheritance**
- Pros: DRY, code reuse
- Cons: Complex hierarchy, coupling
- **Rejected**: Too complex

**Option 2: Template Mixins**
- Pros: Multiple inheritance
- Cons: Order matters, conflicts
- **Rejected**: Confusing

**Option 3: No Composition**
- Pros: Simplest
- Cons: Duplicate code across templates
- **Rejected**: Too much duplication

### Trade-offs

**Pros**:
- Easy to understand
- Flexible combinations
- Independent updates
- No coupling

**Cons**:
- Some code duplication
- Integration conflicts possible
- More files to maintain

### Impact

Templates must:
- Be self-contained
- Support integrations via composition
- Not extend other templates
- Document integration compatibility

## Git Stash for Checkpoints

### Decision

Use git stash for checkpoint/rollback system, not custom backup mechanism.

### Implementation

```javascript
// Create checkpoint
execFileSync("git", ["stash", "push", "-m", "checkpoint-1234"]);

// Restore checkpoint
execFileSync("git", ["stash", "pop", "stash@{0}"]);
```

### Rationale

**Benefits**:
1. **Proven**: Battle-tested git technology
2. **Fast**: Near-instant snapshots
3. **Space-Efficient**: Compressed storage
4. **Standard**: Uses familiar git commands

**Why Not Custom**:
- Don't reinvent version control
- Git is already required
- Users understand git stash

### Alternatives Considered

**Option 1: Custom Backup System**
- Pros: Full control
- Cons: Reinventing git
- **Rejected**: Unnecessary work

**Option 2: Git Commits**
- Pros: Full history
- Cons: Pollutes commit log
- **Rejected**: Messy history

**Option 3: File System Snapshots**
- Pros: Simple
- Cons: Platform-specific, large
- **Rejected**: Not portable

### Trade-offs

**Pros**:
- Leverages git
- Fast and reliable
- Space-efficient
- Standard tool

**Cons**:
- Requires git (but already required)
- Stash complexity
- Hidden from git log

### Impact

Agent safety must:
- Require git availability
- Use git stash commands
- Clean up old stashes
- Document stash format

## Plugin System Design

### Decision

Plugins hook into lifecycle events, not extend core classes.

### Pattern

```javascript
// Plugin exports hooks
export default {
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    "pre:export": async (context) => { /* ... */ },
    "post:export": async (context) => { /* ... */ },
  },
};

// Framework executes hooks
await executeHooks("pre:export", context);
```

### Rationale

**Benefits**:
1. **Simple**: No complex plugin API
2. **Safe**: Plugins can't break core
3. **Isolated**: Plugins don't interact
4. **Standard**: Event-based pattern

**Why Hooks Not Classes**:
- Simpler for plugin authors
- No inheritance complexity
- Clear execution order
- Easy to disable

### Alternatives Considered

**Option 1: Class Extension**
- Pros: Object-oriented
- Cons: Complex inheritance
- **Rejected**: Too complex

**Option 2: Middleware Pattern**
- Pros: Composable
- Cons: Execution order matters
- **Rejected**: Over-engineered

**Option 3: No Plugins**
- Pros: Simplest
- Cons: Not extensible
- **Rejected**: Need extensibility

### Trade-offs

**Pros**:
- Simple API
- Safe isolation
- Clear contract
- Easy to test

**Cons**:
- Limited to hooks
- No plugin-to-plugin communication
- Synchronous execution

### Impact

Plugins must:
- Export default object
- Implement hook functions
- Return success/failure
- Handle own errors

## Related Documentation

- [Architecture Overview](./README.md)
- [Project Structure](./project-structure.md)
- [Contributing Guide](./contributing.md)

---

**Previous**: [Project Structure](./project-structure.md)
**Next**: [Contributing Guide](./contributing.md)
