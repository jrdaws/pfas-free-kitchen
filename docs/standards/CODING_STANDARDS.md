# Coding Standards

> **Required reading for all agents writing code in dawson-does-framework.**

## Quick Reference

| Area | Language | Semicolons | Indent | File Extension |
|------|----------|------------|--------|----------------|
| CLI & Core | JavaScript ESM | ❌ No | 2 spaces | `.mjs` |
| Website | TypeScript | ✅ Yes | 2 spaces | `.ts`, `.tsx` |
| Config files | JavaScript | ✅ Yes | 2 spaces | `.js` |
| Tests | JavaScript ESM | ❌ No | 2 spaces | `.test.mjs` |

---

## JavaScript ESM (CLI, Core Modules)

### Location
- `bin/framework.js`
- `src/dd/*.mjs`
- `scripts/**/*.mjs`
- `tests/**/*.mjs`

### Style Rules

```javascript
// ✅ GOOD: No semicolons, 2-space indent
import fs from "node:fs"
import path from "node:path"

export async function doSomething(input) {
  const result = await processInput(input)
  
  if (!result) {
    throw new Error("Processing failed")
  }
  
  return result
}
```

```javascript
// ❌ BAD: Semicolons, wrong indent
import fs from "node:fs";
import path from "node:path";

export async function doSomething(input) {
    const result = await processInput(input);
    return result;
}
```

### Import Order
1. Node.js built-ins (with `node:` prefix)
2. External packages
3. Internal modules (relative paths)

```javascript
// ✅ GOOD: Correct import order
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import fse from "fs-extra"
import degit from "degit"

import { writeManifest } from "../src/dd/manifest.mjs"
import { logger } from "../src/dd/logger.mjs"
```

### Naming Conventions
- **Functions**: camelCase, verb prefix
  - `processTemplate()`, `validateConfig()`, `handleError()`
- **Variables**: camelCase
  - `projectDir`, `templateId`, `configPath`
- **Constants**: UPPER_SNAKE_CASE
  - `DEFAULT_BRANCH`, `MAX_RETRIES`, `API_URL`
- **Files**: kebab-case
  - `post-export-hooks.mjs`, `config-schema.mjs`

### Error Handling

```javascript
// ✅ GOOD: Descriptive errors with recovery guidance
if (!fs.existsSync(configPath)) {
  throw new Error(
    `Config file not found: ${configPath}\n` +
    `Create one with: framework init`
  )
}

// ❌ BAD: Generic errors
if (!fs.existsSync(configPath)) {
  throw new Error("File not found")
}
```

### Async/Await
- Always use async/await over .then() chains
- Handle errors with try/catch at appropriate boundaries

```javascript
// ✅ GOOD
async function loadConfig(path) {
  try {
    const content = await fs.promises.readFile(path, "utf8")
    return JSON.parse(content)
  } catch (error) {
    if (error.code === "ENOENT") {
      return null // File doesn't exist
    }
    throw error // Re-throw unexpected errors
  }
}
```

---

## TypeScript (Website)

### Location
- `website/app/**/*.tsx`
- `website/components/**/*.tsx`
- `website/lib/**/*.ts`

### Style Rules

```typescript
// ✅ GOOD: Semicolons, explicit types, 2-space indent
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProjectConfig {
  name: string;
  template: string;
  integrations: Record<string, string>;
}

export function ProjectForm({ onSubmit }: { onSubmit: (config: ProjectConfig) => void }) {
  const [name, setName] = useState<string>("");
  
  const handleSubmit = () => {
    onSubmit({ name, template: "saas", integrations: {} });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <Button type="submit">Create</Button>
    </form>
  );
}
```

### Component Structure

```typescript
// ✅ GOOD: Standard component structure
"use client"; // Only if needed

import { useState } from "react";

// Types at top
interface Props {
  title: string;
  onAction: () => void;
}

// Component
export function MyComponent({ title, onAction }: Props) {
  // Hooks first
  const [state, setState] = useState(false);
  
  // Handlers
  const handleClick = () => {
    setState(true);
    onAction();
  };
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

### Naming Conventions
- **Components**: PascalCase
  - `ProjectForm`, `TemplateSelector`, `ExportView`
- **Hooks**: camelCase with `use` prefix
  - `useProject`, `useTemplates`, `useExport`
- **Files**: kebab-case for components, camelCase for utilities
  - `project-form.tsx`, `template-selector.tsx`
  - `commandBuilder.ts`, `zipGenerator.ts`

### Import Aliases
Use path aliases from tsconfig.json:
```typescript
// ✅ GOOD
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// ❌ BAD
import { Button } from "../../../components/ui/button";
```

---

## Comments

### When to Comment
- Complex business logic
- Non-obvious decisions
- TODO items with context
- JSDoc for public functions

```javascript
// ✅ GOOD: Explains WHY, not WHAT
// Skip node_modules to avoid massive file lists
// and .git to prevent exporting repo internals
const SKIP_DIRS = ["node_modules", ".git", ".next"]

// ✅ GOOD: JSDoc for public functions
/**
 * Writes the project manifest to .dd/manifest.json
 * @param {string} projectDir - Absolute path to project
 * @param {object} options - Manifest options
 * @returns {string} Path to written manifest
 */
export function writeManifest(projectDir, options) {
  // ...
}

// ❌ BAD: States the obvious
// Loop through the array
for (const item of items) {
  // Process the item
  processItem(item)
}
```

### TODO Format
```javascript
// TODO: Add rate limiting before production (2024-12-21)
// TODO(auth): Implement refresh token rotation
// FIXME: This breaks when projectDir has spaces
```

---

## Console Output

### Use logger.mjs, Not console.log

```javascript
// ✅ GOOD: Use the logger
import * as logger from "../src/dd/logger.mjs"

logger.log("Processing template...")
logger.stepSuccess("Template cloned")
logger.stepError("Failed to clone template")
logger.stepWarning("Using cached version")

// ❌ BAD: Direct console usage
console.log("Processing...")
console.error("Error!")
```

### Output Formatting
- Use emojis sparingly (✅ ❌ ⚠️ 📦 🚀)
- Indent nested information
- Include actionable next steps on errors

```javascript
// ✅ GOOD: Structured output
logger.log("\n✅ Export complete!\n")
logger.log("Next steps:")
logger.log("  cd ./my-project")
logger.log("  npm install")
logger.log("  npm run dev")
```

---

## File Organization

### Module Exports
- One main export per file when possible
- Named exports preferred over default exports
- Export types alongside implementations

```javascript
// ✅ GOOD: Clear named exports
export function validateConfig(config) { }
export function loadConfig(path) { }
export function saveConfig(path, config) { }

// In TypeScript
export interface Config { }
export function validateConfig(config: Config): boolean { }
```

### File Length
- Aim for <300 lines per file
- Split large files by responsibility
- Create index.ts for re-exports if needed

---

## Testing Code

### Test File Naming
```
tests/
├── export-args.test.mjs     # Tests for export argument parsing
├── manifest.test.mjs        # Tests for manifest functions
├── cli/
│   └── start-command.test.mjs
└── fixtures/
    └── template-mini/       # Test fixtures
```

### Test Structure
```javascript
import { test, describe } from "node:test"
import assert from "node:assert"

describe("parseExportFlags", () => {
  test("handles --auth supabase flag", () => {
    const flags = parseExportFlags(["--auth", "supabase"])
    assert.strictEqual(flags.integrations.auth, "supabase")
  })
  
  test("returns null for missing optional flags", () => {
    const flags = parseExportFlags([])
    assert.strictEqual(flags.integrations.auth, null)
  })
})
```

---

## Verification Checklist

Before submitting code, verify:

- [ ] No semicolons in .mjs files
- [ ] Semicolons in .ts/.tsx files
- [ ] 2-space indentation everywhere
- [ ] Import order is correct
- [ ] Using logger.mjs instead of console.log
- [ ] Error messages include recovery guidance
- [ ] Public functions have JSDoc comments
- [ ] File is <300 lines
- [ ] Tests pass: `npm test`

---

*Last updated: 2024-12-21*

