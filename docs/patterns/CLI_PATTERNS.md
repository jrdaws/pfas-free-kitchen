# CLI Patterns

> How to add new CLI commands to the dawson-does-framework

This guide documents the patterns for creating new CLI commands. Follow these conventions to maintain consistency across the codebase.

---

## Table of Contents

1. [Command Structure](#command-structure)
2. [Registering Commands](#registering-commands)
3. [Argument Parsing](#argument-parsing)
4. [Flag Handling](#flag-handling)
5. [Output Formatting](#output-formatting)
6. [Error Handling](#error-handling)
7. [Help Text](#help-text)
8. [Testing Commands](#testing-commands)

---

## Command Structure

### Basic Command Template

Create command files in `src/commands/`:

```javascript
/**
 * Command Name
 * Usage: framework <command> [subcommand] [args]
 */

import { printRecoveryGuidance } from "../dd/recovery-guidance.mjs"
import * as logger from "../dd/logger.mjs"

export async function cmdYourCommand(args) {
  const [subcommand, arg1, arg2] = args

  // Handle help
  if (!subcommand || subcommand === "help") {
    printHelp()
    return
  }

  // Handle subcommands
  if (subcommand === "test") {
    await cmdYourCommandTest(arg1, arg2)
    return
  }

  // Unknown subcommand
  console.error(`Unknown subcommand: ${subcommand}`)
  console.error("Run 'framework yourcommand help' for usage.")
  process.exit(1)
}

async function cmdYourCommandTest(arg1, arg2) {
  console.log("🧪 Testing your command...\n")

  try {
    // Validate arguments
    if (!arg1) {
      console.error("❌ Missing required argument: <arg1>")
      console.error("\nUsage: framework yourcommand test <arg1> [arg2]")
      process.exit(1)
    }

    // Execute command logic
    logger.startStep("step-1", "1️⃣  Doing first thing...")
    // ... work ...
    logger.stepSuccess("First thing complete")
    logger.endStep("step-1", "     Complete")

    console.log("\n✅ Command complete!")
  } catch (error) {
    console.error("\n❌ Command failed:")
    console.error(`   ${error.message}`)

    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }

    printRecoveryGuidance(error)
    process.exit(1)
  }
}

function printHelp() {
  console.log(`
Usage: framework yourcommand <subcommand> [args]

Subcommands:
  test <arg1> [arg2]    Test your command functionality
  help                  Show this help message

Examples:
  framework yourcommand test foo       # Test with foo
  framework yourcommand test foo bar   # Test with foo and bar
`)
}
```

### File Naming

- Command files: `src/commands/{name}.mjs` (no semicolons, JavaScript ESM)
- Use lowercase with hyphens for multi-word commands: `my-command.mjs`
- Export main command as: `export async function cmdMyCommand(args)`

---

## Registering Commands

### In `bin/framework.js`

1. **Import the command** at the top:
   ```javascript
   import { cmdYourCommand } from "../src/commands/yourcommand.mjs"
   ```

2. **Register in the command dispatcher** (around line 1578-1616):
   ```javascript
   const [a, b, c, d] = args

   // ... other commands ...

   if (a === "yourcommand") {
     await cmdYourCommand([b, c, d])
     process.exit(0)
   }
   ```

### Command Dispatcher Pattern

Commands are dispatched using a simple if-statement pattern:

```javascript
// Single argument commands
if (a === "version") {
  await cmdVersion()
  process.exit(0)
}

// Commands with arguments
if (a === "doctor") {
  await cmdDoctor(b)
  process.exit(0)
}

// Commands with multiple arguments
if (a === "llm") {
  await cmdLLM([b, c, d])
  process.exit(0)
}

// Commands with all remaining args
if (a === "deploy") {
  const deployArgs = process.argv.slice(3) // Everything after "framework deploy"
  await cmdDeploy(deployArgs)
  process.exit(0)
}

// Commands with token + flags
if (a === "pull") {
  const pullArgs = process.argv.slice(4) // Everything after "framework pull <token>"
  await cmdPull(b, pullArgs)
  process.exit(0)
}
```

### Argument Slicing Guide

- `process.argv.slice(2)` - All arguments after `node bin/framework.js`
- `process.argv.slice(3)` - All arguments after the command name
- `process.argv.slice(4)` - All arguments after command + first arg

Example: `framework pull abc123 --open --branch main`
- `args` = `["pull", "abc123", "--open", "--branch", "main"]`
- `a` = `"pull"`, `b` = `"abc123"`
- `process.argv.slice(4)` = `["--open", "--branch", "main"]`

---

## Argument Parsing

### Simple Argument Extraction

For commands with fixed arguments:

```javascript
export async function cmdMyCommand(args) {
  const [subcommand, arg1, arg2] = args

  if (!arg1) {
    console.error("Usage: framework mycommand <required-arg> [optional-arg]")
    process.exit(1)
  }

  // Use arg1, arg2...
}
```

### Subcommand Pattern

Commands with subcommands (like `framework llm test`):

```javascript
export async function cmdLLM(args) {
  const subcommand = args[0]

  if (subcommand === "test") {
    await cmdLLMTest()
  } else {
    // Show help for unknown subcommand
    console.log(`
Usage: framework llm <command>

Commands:
  test    Test LLM provider health
`)
  }
}
```

### Complex Argument Parsing

For commands with many flags, create a parser function:

```javascript
/**
 * Parse command flags from argv array
 * @param {string[]} args - Rest of argv
 * @returns {object} Parsed flags
 */
export function parseMyCommandFlags(args) {
  const flags = {
    name: null,
    force: false,
    branch: "main",
    integrations: {
      auth: null,
      payments: null,
    },
  }

  // Helper: check if next arg exists and is a value (not another flag)
  const hasValue = (idx) => args[idx + 1] && !args[idx + 1].startsWith("--")

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === "--name" && hasValue(i)) {
      flags.name = args[++i]
    } else if (arg === "--force") {
      flags.force = true
    } else if (arg === "--branch" && hasValue(i)) {
      flags.branch = args[++i]
    } else if (arg === "--auth" && hasValue(i)) {
      flags.integrations.auth = String(args[++i]).trim()
    }
  }

  return flags
}
```

Usage:
```javascript
export async function cmdMyCommand(args) {
  const flags = parseMyCommandFlags(args)
  console.log(`Branch: ${flags.branch}`)
  console.log(`Force: ${flags.force}`)
}
```

---

## Flag Handling

### Boolean Flags

Flags without values (e.g., `--force`, `--push`, `--dry-run`):

```javascript
if (arg === "--force") {
  flags.force = true
} else if (arg === "--push") {
  flags.push = true
}
```

### Value Flags

Flags with values (e.g., `--name foo`, `--branch main`):

```javascript
if (arg === "--name" && hasValue(i)) {
  flags.name = args[++i]
} else if (arg === "--branch" && hasValue(i)) {
  flags.branch = args[++i]
}
```

### Enum Flags

Flags with specific allowed values:

```javascript
if (arg === "--after-install" && hasValue(i)) {
  const v = String(args[++i]).trim()
  if (v === "prompt" || v === "auto" || v === "off") {
    flags.afterInstall = v
  }
}
```

### Help Flag

Always support `--help` and `-h`:

```javascript
export async function cmdDeploy(args) {
  // Handle help flag first
  if (args.includes('--help') || args.includes('-h')) {
    printDeployHelp()
    return
  }

  // ... rest of command logic
}
```

---

## Output Formatting

### Logger API

Use the logger from `src/dd/logger.mjs` for structured output:

```javascript
import * as logger from "../dd/logger.mjs"

// Simple message
logger.log("Starting process...")

// Error message (always shown, even in quiet mode)
logger.error("Failed to process file")

// Step with timing
logger.startStep("step-id", "[1/3] Doing thing...")
// ... do work ...
logger.endStep("step-id", "     Complete")

// Step status messages (indented)
logger.stepSuccess("Task completed")
logger.stepWarning("Non-critical issue")
logger.stepInfo("Additional information")
logger.stepError("Task failed")

// Format step headers
const header = logger.formatStep(2, 5, "Running tests")
// Output: "[2/5] Running tests"
```

### Console Output Patterns

#### Success Messages
```javascript
console.log("\n✅ Command complete!")
console.log(`   Result: ${result}`)
```

#### Error Messages
```javascript
console.error("\n❌ Command failed:")
console.error(`   ${error.message}`)
if (error.code) {
  console.error(`   Error code: ${error.code}`)
}
```

#### Info Messages
```javascript
console.log("🔍 Detecting provider...")
console.log(`   ✓ Detected: ${provider}`)
```

#### Warnings
```javascript
console.log("⚠️  Warning: credentials not found")
console.log("   Please set PROVIDER_TOKEN in .env")
```

### Multi-Step Output

Use numbered emoji for clear progression:

```javascript
console.log("1️⃣  Running health check...")
// ... work ...
console.log(`   ✓ Health: OK`)

console.log("\n2️⃣  Running test completion...")
// ... work ...
console.log(`   ✓ Completion successful`)

console.log("\n3️⃣  Verifying results...")
// ... work ...
console.log(`   ✓ All checks passed`)

console.log("\n✅ Test complete!")
```

### Progress Indicators

For multi-step commands with timing:

```javascript
logger.startStep("build", logger.formatStep(1, 3, "Building project..."))
// ... build work ...
logger.stepSuccess("Build completed")
logger.endStep("build", "     Build ready")
// Output includes timing: "     Build ready (1234ms)"

logger.startStep("test", logger.formatStep(2, 3, "Running tests..."))
// ... test work ...
logger.stepSuccess("All tests passed")
logger.endStep("test", "     Tests complete")

logger.startStep("deploy", logger.formatStep(3, 3, "Deploying..."))
// ... deploy work ...
logger.stepSuccess("Deployed successfully")
logger.endStep("deploy", "     Deployment complete")
```

---

## Error Handling

### Basic Error Pattern

```javascript
try {
  // Command logic
  const result = await someOperation()
  console.log("✅ Success!")
} catch (error) {
  console.error("\n❌ Operation failed:")
  console.error(`   ${error.message}`)

  if (error.code) {
    console.error(`   Error code: ${error.code}`)
  }

  process.exit(1)
}
```

### With Recovery Guidance

Use `printRecoveryGuidance` for helpful error recovery:

```javascript
import { printRecoveryGuidance } from "../dd/recovery-guidance.mjs"

try {
  // Command logic
} catch (error) {
  console.error("\n❌ Command failed:")
  console.error(`   ${error.message}`)

  if (error.code) {
    console.error(`   Error code: ${error.code}`)
  }

  printRecoveryGuidance(error)
  process.exit(1)
}
```

### Validation Errors

Exit early with helpful messages:

```javascript
if (!requiredArg) {
  console.error("❌ Missing required argument: <arg-name>")
  console.error("\nUsage: framework command <arg-name> [options]")
  console.error("\nExamples:")
  console.error("  framework command value1")
  console.error("  framework command value1 --flag")
  process.exit(1)
}
```

### Non-Fatal Warnings

For optional features or degraded functionality:

```javascript
try {
  await optionalFeature()
  logger.stepSuccess("Optional feature enabled")
} catch (error) {
  logger.stepWarning(`Optional feature unavailable: ${error.message}`)
  logger.stepInfo("Continuing without this feature...")
  // Continue execution
}
```

### Provider/Integration Errors

When dealing with external services:

```javascript
const health = await provider.health()

if (health.ok) {
  console.log(`✅ Health: OK`)
  console.log(`   Provider: ${health.provider}`)
} else {
  console.log(`❌ Health: FAILED`)
  console.log(`   Error: ${health.details?.error || "Unknown error"}`)

  // Provide setup guidance
  console.log("\n💡 Setup required:")
  console.log(`   1. Get your API key from ${providerUrl}`)
  console.log(`   2. Add to .env: ${envVarName}=your-key`)
  console.log(`   3. Run this command again`)

  process.exit(1)
}
```

---

## Help Text

### Standard Help Format

```javascript
function printHelp() {
  console.log(`
Usage: framework command <required-arg> [optional-arg] [options]

Description:
  Brief description of what this command does.

Arguments:
  <required-arg>    Description of required argument
  [optional-arg]    Description of optional argument (default: value)

Options:
  --flag            Description of boolean flag
  --value <val>     Description of value flag
  --help, -h        Show this help message

Examples:
  framework command arg1                    # Basic usage
  framework command arg1 arg2               # With optional arg
  framework command arg1 --flag             # With flag
  framework command arg1 --value custom     # With value flag
`)
}
```

### Inline Help (for subcommands)

```javascript
export async function cmdMyCommand(args) {
  const subcommand = args[0]

  if (!subcommand || subcommand === "help") {
    console.log(`
Usage: framework mycommand <subcommand> [args]

Subcommands:
  create <name>     Create a new item
  list              List all items
  delete <id>       Delete an item by ID
  help              Show this help message

Examples:
  framework mycommand create my-item
  framework mycommand list
  framework mycommand delete 123
`)
    return
  }

  // Handle subcommands...
}
```

### Help for Complex Commands

For commands with many options (like deploy):

```javascript
function printDeployHelp() {
  console.log(`
🚀 Framework Deploy

Usage: framework deploy [options]

Description:
  Deploy your application to a hosting provider. Automatically detects
  provider from configuration files or you can specify explicitly.

Options:
  --provider <name>       Deployment provider (vercel, netlify, railway)
  --cwd <path>           Working directory (default: current directory)
  --dry-run              Preview deployment without executing
  --production           Deploy to production (default: preview)
  --build                Run build before deployment (default: true)
  --env <key>=<value>    Set environment variable (can be used multiple times)
  --help, -h             Show this help message

Provider Detection:
  The command will auto-detect your provider from:
  - vercel.json (Vercel)
  - netlify.toml (Netlify)
  - railway.json (Railway)
  - .dd/config.json deployment preferences

Setup:
  1. Configure deployment credentials:
     framework deploy:auth setup <provider>

  2. Run deployment:
     framework deploy

Examples:
  framework deploy                         # Auto-detect and deploy
  framework deploy --provider vercel       # Explicit provider
  framework deploy --dry-run               # Preview deployment
  framework deploy --production            # Deploy to production
  framework deploy --env API_KEY=abc123    # Set environment variable

For more information:
  framework deploy:auth help               # Credential management
`)
}
```

---

## Testing Commands

### Manual Testing Checklist

Before committing a new command:

- [ ] Command executes without errors
- [ ] Help text is clear and accurate
- [ ] All flags work as documented
- [ ] Error messages are helpful
- [ ] Success output is clear
- [ ] Edge cases are handled (missing args, invalid values, etc.)
- [ ] Works from different directories if applicable

### Unit Testing

Create test files in `tests/commands/`:

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseMyCommandFlags } from '../../bin/framework.js'

describe('parseMyCommandFlags', () => {
  it('should parse boolean flags', () => {
    const args = ['--force', '--push']
    const flags = parseMyCommandFlags(args)
    assert.strictEqual(flags.force, true)
    assert.strictEqual(flags.push, true)
  })

  it('should parse value flags', () => {
    const args = ['--name', 'my-project', '--branch', 'develop']
    const flags = parseMyCommandFlags(args)
    assert.strictEqual(flags.name, 'my-project')
    assert.strictEqual(flags.branch, 'develop')
  })

  it('should use default values', () => {
    const args = []
    const flags = parseMyCommandFlags(args)
    assert.strictEqual(flags.branch, 'main')
    assert.strictEqual(flags.force, false)
  })
})
```

### Integration Testing

Test the full command flow:

```javascript
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { spawnSync } from 'node:child_process'

describe('framework mycommand', () => {
  it('should show help text', () => {
    const result = spawnSync('node', ['bin/framework.js', 'mycommand', 'help'], {
      encoding: 'utf8'
    })
    assert.strictEqual(result.status, 0)
    assert.match(result.stdout, /Usage: framework mycommand/)
  })

  it('should handle missing arguments', () => {
    const result = spawnSync('node', ['bin/framework.js', 'mycommand', 'test'], {
      encoding: 'utf8'
    })
    assert.notStrictEqual(result.status, 0)
    assert.match(result.stderr, /Missing required argument/)
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test tests/commands/mycommand.test.mjs

# Run with coverage
npm run test:coverage
```

---

## Real-World Examples

### Simple Command: `version`

Location: `bin/framework.js:1080-1084`

```javascript
async function cmdVersion() {
  const version = getCurrentVersion()
  const packageName = getPackageName()
  console.log(`${packageName} v${version}`)
}
```

Registration:
```javascript
if (a === "version") { await cmdVersion(); process.exit(0); }
```

### Command with Subcommands: `llm`

Location: `src/commands/llm.mjs`

```javascript
export async function cmdLLM(args) {
  const subcommand = args[0]

  if (subcommand === "test") {
    await cmdLLMTest()
  } else {
    console.log(`
Usage: framework llm <command>

Commands:
  test    Test LLM provider health and run a simple completion

Examples:
  framework llm test    # Test Anthropic LLM provider
`)
  }
}
```

### Complex Command: `checkpoint`

Location: `bin/framework.js:1086-1174`

Features:
- Multiple subcommands (create, list, restore, cleanup, log)
- Help text
- Argument validation
- Formatted output
- Error handling

### Command with Flags: `deploy`

Location: `src/commands/deploy.mjs`

Features:
- Help flag handling
- Complex flag parsing
- Multi-step execution with progress
- Error recovery guidance
- Dry-run mode
- Provider detection

---

## Checklist for New Commands

- [ ] Command file created in `src/commands/` (if complex) or `bin/framework.js` (if simple)
- [ ] No semicolons (JavaScript ESM style)
- [ ] Exported as `cmdYourCommand`
- [ ] Imported in `bin/framework.js`
- [ ] Registered in command dispatcher
- [ ] Help text implemented
- [ ] Arguments parsed and validated
- [ ] Flags documented and parsed correctly
- [ ] Uses logger for structured output
- [ ] Error handling with recovery guidance
- [ ] Exit codes: 0 for success, 1 for failure
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Tested manually with various inputs
- [ ] Conventional commit message

---

## Resources

- **Logger API**: `src/dd/logger.mjs`
- **Recovery Guidance**: `src/dd/recovery-guidance.mjs`
- **Flag Parsing Examples**: `bin/framework.js` (parseExportFlags, parsePullFlags)
- **Command Examples**: `src/commands/` directory
- **Testing**: `tests/commands/` directory
- **Coding Standards**: `docs/standards/CODING_STANDARDS.md`
- **Main CLI**: `bin/framework.js`

---

*Part of the dawson-does-framework CLI. For more patterns, see `docs/patterns/`.*
