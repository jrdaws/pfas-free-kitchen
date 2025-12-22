# Error Handling Patterns

> Standard patterns for error handling in dawson-does-framework

This document defines how to handle, log, and communicate errors consistently across the codebase.

---

## Core Principles

1. **Actionable Messages** - Tell users what went wrong AND how to fix it
2. **Fail Gracefully** - Non-critical features warn; critical ones error
3. **Consistent Logging** - Use logger.mjs, never raw console.log
4. **Recovery Guidance** - Point to recovery-guidance.mjs for common errors
5. **User-Centric** - Errors are for users, not developers

---

## 1. Error Message Format

### Basic Error

```javascript
throw new Error(`Brief description of what went wrong`)
```

**Example:**
```javascript
throw new Error(`Unknown provider: ${providerName}. Supported: vercel, netlify, railway`)
```

### Error with Recovery Steps

```javascript
throw new Error(
  `Brief description of what went wrong\n` +
  `\n` +
  `To fix this:\n` +
  `  1. First recovery step\n` +
  `  2. Second recovery step\n` +
  `\n` +
  `For more help: https://docs.dawson.dev/errors/ERROR_CODE`
)
```

**Example:**
```javascript
throw new Error(
  `SUPABASE_URL environment variable is not set\n` +
  `\n` +
  `To fix this:\n` +
  `  1. Create a project at https://supabase.com/dashboard\n` +
  `  2. Find your URL in Settings > API\n` +
  `  3. Set: export SUPABASE_URL=https://your-project.supabase.co\n` +
  `\n` +
  `Or add to .env file`
)
```

### Error with Suggestions Property

For complex errors that need structured recovery guidance:

```javascript
const error = new Error(`Deployment failed: ${reason}`)
error.suggestions = [
  "Check your network connection",
  "Verify your API credentials are valid",
  "Try again in a few moments"
]
throw error
```

---

## 2. User-Facing vs Internal Errors

### User-Facing Errors (CLI Commands)

When users make mistakes or external services fail:

```javascript
// Pattern 1: Catch and display with context
try {
  await riskyOperation()
} catch (error) {
  console.error(`\n❌ Operation failed: ${error.message}`)
  if (error.suggestions) {
    console.log("\n💡 Suggestions:")
    error.suggestions.forEach(s => console.log(`   • ${s}`))
  }
  process.exit(1)
}

// Pattern 2: Validate and exit early
if (!credential) {
  console.log(`\n❌ No ${provider.toUpperCase()} credentials found.\n`)
  printSetupGuide(provider)
  process.exit(1)
}
```

**Key Points:**
- Use emoji for clarity (❌ for errors, ⚠️ for warnings)
- Always call `process.exit(1)` after fatal errors in CLI
- Provide actionable next steps

### Internal Errors (Library Functions)

When developers misuse APIs or impossible states occur:

```javascript
// Just throw - let caller decide how to handle
throw new Error(`Invalid plugin: ${validation.errors.join(", ")}`)
throw new Error(`Plugin '${plugin.name}' is already installed`)
throw new Error(`Unknown hook point: ${hookPoint}`)
```

**Key Points:**
- No console.error in library code
- No process.exit() in library functions
- Descriptive messages for debugging

---

## 3. Recovery Guidance

### Using recovery-guidance.mjs

For common, well-understood errors, use the recovery guidance system:

```javascript
import { printRecoveryGuidance } from './dd/recovery-guidance.mjs'

try {
  await operation()
} catch (error) {
  console.error(`\n❌ ${error.message}`)
  printRecoveryGuidance(error)  // Automatically detects error type
  process.exit(1)
}
```

### Supported Error Types

The recovery-guidance.mjs module automatically provides help for:

- Missing environment variables (ANTHROPIC_API_KEY, SUPABASE_URL, etc.)
- Port already in use (EADDRINUSE)
- Missing Node modules (MODULE_NOT_FOUND)
- Git not installed
- Directory not empty
- Permission denied (EACCES, EPERM)
- Network errors (ENOTFOUND, ECONNREFUSED)
- Authentication failures (401, 403)

### Adding New Recovery Patterns

Edit `src/dd/recovery-guidance.mjs` and add a new detection block:

```javascript
if (message.includes("your-error-pattern")) {
  guidance.push({
    problem: "Brief problem description",
    solutions: [
      "Step 1 to fix",
      "Step 2 to fix",
      "Alternative approach"
    ]
  })
}
```

---

## 4. Logging Errors

### Import Logger

```javascript
import * as logger from './dd/logger.mjs'
```

### Available Methods

```javascript
// General error (always shown, even in quiet mode)
logger.error("Something went wrong")
logger.error(error.message)

// Step-specific error (with ✗ prefix)
logger.stepError("Failed to clone template")
logger.stepError(`Push failed: ${error.message}`)

// Warning (with ⚠️ prefix)
logger.stepWarning("Integration missing, skipping")

// Success (with ✓ prefix)
logger.stepSuccess("Template cloned successfully")

// Info (plain, respects quiet mode)
logger.stepInfo("Processing files...")
```

### When to Use Each

| Method | Use Case | Shown in Quiet Mode? |
|--------|----------|---------------------|
| `logger.error()` | Fatal errors, unexpected failures | ✅ Yes |
| `logger.stepError()` | Step failed in multi-step process | ✅ Yes |
| `logger.stepWarning()` | Non-fatal issues, degraded functionality | ❌ No |
| `logger.stepSuccess()` | Step completed successfully | ❌ No |
| `logger.stepInfo()` | Progress updates | ❌ No |

### Timing Steps

```javascript
logger.startStep('clone', '📦 Cloning template...')
// ... do work ...
logger.endStep('clone', '✓ Template cloned')  // Shows elapsed time
```

---

## 5. Error Codes

**Current Status:** The project does not use formal error codes yet.

### Future Consideration

If error codes are added later, use this pattern:

```javascript
const ERROR_CODES = {
  MISSING_CONFIG: 'ERR_001',
  INVALID_TEMPLATE: 'ERR_002',
  NETWORK_FAILURE: 'ERR_003'
}

throw new Error(`[${ERROR_CODES.MISSING_CONFIG}] Configuration file not found`)
```

For now, rely on descriptive error messages instead.

---

## 6. Try/Catch Patterns

### Pattern 1: Fatal Error (Exit Process)

Use in CLI commands where failure means we can't continue:

```javascript
try {
  deployProvider = await loadProvider(provider)
  console.log(`   ✓ Provider loaded: ${deployProvider.name}`)
} catch (error) {
  console.error(`\n❌ Failed to load provider: ${error.message}`)
  process.exit(1)
}
```

### Pattern 2: Non-Fatal Error (Warn and Continue)

Use for optional features that can fail without breaking the workflow:

```javascript
try {
  await deployProvider.streamLogs(deploymentId, log => {
    console.log(`   ${log}`)
  })
} catch (error) {
  console.log(`\n⚠️  Could not stream logs: ${error.message}`)
  // Continue anyway - logs are nice-to-have
}
```

### Pattern 3: Library Function (Rethrow or Wrap)

Use in reusable functions - let caller decide how to handle:

```javascript
export async function loadPlugin(pluginPath) {
  try {
    const plugin = await import(pluginPath)
    return plugin.default || plugin
  } catch (error) {
    // Wrap with context, then rethrow
    throw new Error(`Failed to load plugin: ${error.message}`)
  }
}
```

### Pattern 4: Validation (Check First, Throw if Invalid)

Prefer validation before risky operations:

```javascript
// ✅ Good: Validate first
if (!fs.existsSync(configPath)) {
  throw new Error(`Configuration file not found: ${configPath}`)
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

// ❌ Avoid: Catching expected errors
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
} catch (error) {
  throw new Error(`Failed to read config: ${error.message}`)
}
```

### Pattern 5: Multiple Operations (Individual vs Grouped)

```javascript
// Individual try/catch for independent operations
try {
  await operation1()
} catch (error) {
  logger.stepError(`Operation 1 failed: ${error.message}`)
  process.exit(1)
}

try {
  await operation2()
} catch (error) {
  logger.stepError(`Operation 2 failed: ${error.message}`)
  process.exit(1)
}

// Single try/catch for related operations
try {
  await operation1()
  await operation2()
  await operation3()
} catch (error) {
  console.error(`\n❌ Workflow failed: ${error.message}`)
  printRecoveryGuidance(error)
  process.exit(1)
}
```

---

## 7. Graceful Degradation

### When to Degrade vs Fail

**Degrade (warn and continue):**
- Optional integrations with missing env vars
- Nice-to-have features (log streaming, analytics)
- Non-critical external services
- Development-only tools

**Fail (error and exit):**
- Core functionality required for operation
- User explicitly requested a feature that's unavailable
- Data corruption or security risks
- Invalid user input

### Examples

#### Graceful: Optional Integration

```javascript
// In template export
if (!process.env.STRIPE_SECRET_KEY) {
  logger.stepWarning("STRIPE_SECRET_KEY not set - payments disabled")
  logger.stepInfo("Set the key later in .env to enable payments")
  // Continue without Stripe
} else {
  await configureStripe()
}
```

#### Fail: Required Dependency

```javascript
// In CLI command
if (!hasGit) {
  console.error(`\n❌ Git is required but not installed`)
  console.log(`\nInstall Git:`)
  console.log(`   macOS: brew install git`)
  console.log(`   Ubuntu: sudo apt-get install git`)
  process.exit(1)
}
```

### Testing Graceful Degradation

Always test both paths:

```javascript
// Test success path
test('integration works with env vars', async () => {
  process.env.API_KEY = 'test-key'
  await setupIntegration()
  assert(integrationActive)
})

// Test degradation path
test('integration warns without env vars', async () => {
  delete process.env.API_KEY
  await setupIntegration()
  assert(!integrationActive)
  // Should warn, not throw
})
```

---

## Quick Reference

| Scenario | Pattern | Exit? |
|----------|---------|-------|
| User error in CLI | console.error + suggestions + recovery | Yes (1) |
| Library validation | throw new Error | No |
| Optional feature fails | logger.stepWarning | No |
| Critical feature fails | logger.stepError + exit | Yes (1) |
| Network/API error | try/catch + recovery guidance | Depends |
| Missing dependency | console.error + install guide | Yes (1) |

---

## Related Files

- `src/dd/recovery-guidance.mjs` - Automatic recovery guidance
- `src/dd/logger.mjs` - Structured logging
- `docs/standards/CODING_STANDARDS.md` - General coding standards
- `AGENT_CONTEXT.md` - Project philosophy (fail gracefully)

---

*Last updated: 2025-12-22*
