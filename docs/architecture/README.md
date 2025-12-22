# Architecture Overview

The Dawson Does Framework is a TypeScript/JavaScript framework for rapidly exporting production-ready web applications with integrated services. This document describes the high-level system architecture and design principles.

## Table of Contents

- [System Architecture](#system-architecture)
- [Component Diagram](#component-diagram)
- [Data Flow](#data-flow)
- [Key Design Principles](#key-design-principles)
- [Technology Stack](#technology-stack)
- [Module Organization](#module-organization)
- [Extension Points](#extension-points)
- [Performance Considerations](#performance-considerations)

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Interface                            │
│                      (bin/framework.js)                         │
│  Commands: export, pull, deploy, plugin, templates, etc.       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Command Layer                              │
│                   (src/commands/*.mjs)                          │
│  • export → cmdExport()                                         │
│  • pull → cmdPull()                                             │
│  • deploy → cmdDeploy()                                         │
│  • plugin → cmdPlugin()                                         │
│  • templates → cmdTemplates()                                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Core Services                              │
│                    (src/dd/*.mjs)                               │
│  • manifest.mjs → Template tracking                             │
│  • plugins.mjs → Plugin system                                  │
│  • integrations.mjs → Service integrations                      │
│  • drift.mjs → Drift detection                                  │
│  • agent-safety.mjs → Checkpoint/rollback                       │
│  • registry.mjs → Template registry                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├───────────────────────┬─────────────────────────────┤
             ↓                       ↓                             ↓
┌──────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│   Platform Layer     │  │  Template Layer    │  │   Web Platform       │
│ (src/platform/)      │  │  (templates/)      │  │   (website/)         │
│                      │  │                    │  │                      │
│ • providers/         │  │ • saas/            │  │ • Configurator UI    │
│   - auth.ts          │  │ • blog/            │  │ • API endpoints      │
│   - billing.ts       │  │ • dashboard/       │  │ • AI preview         │
│   - llm.ts           │  │ • landing-page/    │  │ • Project storage    │
│   - deploy.ts        │  │ • seo-directory/   │  │                      │
│ • impl/              │  │                    │  │                      │
│   - auth.supabase.ts │  │ Each template:     │  │                      │
│   - billing.stripe.ts│  │ • template.json    │  │                      │
│   - llm.anthropic.ts │  │ • integrations/    │  │                      │
│   - deploy.vercel.ts │  │ • .dd/config.json  │  │                      │
└──────────────────────┘  └────────────────────┘  └──────────────────────┘
```

### Architectural Layers

1. **CLI Interface**: Entry point, argument parsing, command routing
2. **Command Layer**: High-level command implementations
3. **Core Services**: Business logic, framework features
4. **Platform Layer**: Provider abstractions and implementations
5. **Template Layer**: Pre-built application templates
6. **Web Platform**: Browser-based configurator and preview

## Component Diagram

### Component Responsibilities

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLI (bin/)                               │
├──────────────────────────────────────────────────────────────────┤
│ • Parse command-line arguments                                   │
│ • Route to appropriate command handler                           │
│ • Handle errors and exit codes                                   │
│ • Maintain backward compatibility                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Commands (src/commands/)                      │
├──────────────────────────────────────────────────────────────────┤
│ export    → Template export orchestration                        │
│ pull      → Web platform project download                        │
│ deploy    → Deployment to hosting providers                      │
│ plugin    → Plugin management                                    │
│ templates → Template discovery and info                          │
│ auth      → Authentication provider setup                        │
│ llm       → LLM provider configuration                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  Core Services (src/dd/)                         │
├──────────────────────────────────────────────────────────────────┤
│ manifest        → Template file tracking (SHA256)                │
│ drift           → Detect changes from template                   │
│ plugins         → Plugin loading and execution                   │
│ integrations    → Integration validation and application         │
│ agent-safety    → Checkpoints and rollback                       │
│ registry        → Template discovery                             │
│ config-schema   → Configuration validation                       │
│ version         → Version management                             │
│ logger          → Structured logging                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              Platform Layer (src/platform/)                      │
├──────────────────────────────────────────────────────────────────┤
│ providers/           → Abstract provider interfaces              │
│   • auth.ts          → AuthProvider interface                    │
│   • billing.ts       → BillingProvider interface                 │
│   • llm.ts           → LLMProvider interface                     │
│   • deploy.ts        → DeployProvider interface                  │
│   • analytics.ts     → AnalyticsProvider interface               │
│                                                                  │
│ providers/impl/      → Concrete implementations                  │
│   • auth.supabase.ts    → Supabase auth                          │
│   • billing.stripe.ts   → Stripe billing                         │
│   • llm.anthropic.ts    → Anthropic Claude                       │
│   • deploy.vercel.ts    → Vercel deployment                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  Templates (templates/)                          │
├──────────────────────────────────────────────────────────────────┤
│ Each template contains:                                          │
│ • template.json        → Metadata                                │
│ • package.json         → Dependencies                            │
│ • Source code          → Application logic                       │
│ • integrations/        → Optional integrations                   │
│   - auth/              → Auth providers                          │
│   - payments/          → Payment providers                       │
│   - email/             → Email providers                         │
│   - etc.                                                         │
│ • .dd/config.json      → Framework config                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  Web Platform (website/)                         │
├──────────────────────────────────────────────────────────────────┤
│ Next.js 15 App Router application:                              │
│ • /configure           → Interactive configurator                │
│ • /api/preview         → AI-powered preview generation           │
│ • /api/projects        → Project storage and retrieval           │
│ • /download            → Project download as ZIP                 │
│ • Supabase integration → Project persistence                     │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Export Flow

```
User Input
    ↓
framework export saas ./my-app --auth supabase --payments stripe
    ↓
┌─────────────────────────────────────────┐
│ 1. Parse Arguments                      │
│    templateId: "saas"                   │
│    projectDir: "./my-app"               │
│    flags: { auth: "supabase", ... }     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Execute Pre-Export Hooks             │
│    plugins.executeHooks("pre:export")   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Resolve Template                     │
│    - Check local templates/             │
│    - Or fetch from GitHub (degit)       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Clone Template                       │
│    - Copy files to projectDir           │
│    - Exclude node_modules, .git         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 5. Create Manifest                      │
│    - Hash all files (SHA256)            │
│    - Write .dd/template-manifest.json   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 6. Apply Integrations                   │
│    - Validate compatibility             │
│    - Copy integration files             │
│    - Merge package.json deps            │
│    - Update .env.example                │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 7. Create Starter Files                 │
│    - README.md                          │
│    - .gitignore                         │
│    - .dd/config.json                    │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 8. Initialize Git                       │
│    - git init -b main                   │
│    - git add -A                         │
│    - git commit                         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 9. Execute Post-Export Hooks            │
│    plugins.executeHooks("post:export")  │
└────────────┬────────────────────────────┘
             ↓
        Output
    Ready-to-use project
```

### Pull Flow (Web Platform Integration)

```
User Input
    ↓
framework pull fast-lion-1234 --cursor --open
    ↓
┌─────────────────────────────────────────┐
│ 1. Fetch from API                       │
│    GET /api/projects/[token]            │
│    Returns: project configuration       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Build Export Flags                   │
│    Convert project config to flags:     │
│    --auth supabase                      │
│    --payments stripe                    │
│    --name "My Project"                  │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Call cmdExport()                     │
│    Uses standard export flow            │
│    with config from web platform        │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Write Context Files                  │
│    .dd/context.json                     │
│    .dd/vision.md                        │
│    .dd/mission.md                       │
│    .env.example                         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 5. Generate Cursor Files (optional)     │
│    .cursorrules                         │
│    START_PROMPT.md                      │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 6. Open in Cursor (optional)            │
│    Execute: cursor [project-dir]        │
└────────────┬────────────────────────────┘
             ↓
        Output
    Project ready for AI development
```

### Provider Resolution Flow

```
Application Code
    ↓
import { getAuthProvider } from '@/lib/auth'
    ↓
┌─────────────────────────────────────────┐
│ 1. Check Environment                    │
│    AUTH_PROVIDER=supabase               │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Load Provider Implementation         │
│    import SupabaseAuthProvider          │
│    from 'src/platform/providers/impl/'  │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Instantiate Provider                 │
│    new SupabaseAuthProvider({           │
│      url: SUPABASE_URL,                 │
│      key: SUPABASE_ANON_KEY             │
│    })                                   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Return Provider Instance             │
│    Implements AuthProvider interface    │
│    • getSession()                       │
│    • createSession()                    │
│    • destroySession()                   │
└────────────┬────────────────────────────┘
             ↓
    Application uses provider
```

## Key Design Principles

### 1. Separation of Concerns

Each layer has a single, well-defined responsibility:

- **CLI**: Argument parsing, routing
- **Commands**: Orchestration, high-level logic
- **Core Services**: Business logic, framework features
- **Platform**: Provider abstractions and implementations
- **Templates**: Application structures

### 2. Provider Abstraction Pattern

All third-party services use a provider abstraction:

```typescript
// Abstract interface
interface AuthProvider {
  getSession(): Promise<Session | null>;
  createSession(creds: Credentials): Promise<Session>;
  destroySession(): Promise<void>;
}

// Concrete implementation
class SupabaseAuthProvider implements AuthProvider {
  // Implementation details
}

// Usage (provider-agnostic)
const auth = getAuthProvider();
const session = await auth.getSession();
```

**Benefits**:
- Easy to swap providers
- Testable with mocks
- Consistent API across providers
- Type-safe

### 3. Local-First with Web Sync

Framework works entirely offline, with optional web platform integration:

```
Local Operation          Web Platform (Optional)
     ↓                          ↓
framework export        Configure in browser
     ↓                          ↓
Instant export          Generate token
     ↓                          ↓
Ready to use            framework pull [token]
                               ↓
                        Same result locally
```

### 4. Template Composition

Templates are composable with integrations:

```
Base Template
    +
Optional Integrations
    ↓
Final Project
```

No template inheritance - keep it simple.

### 5. Plugin-Based Extensibility

Core functionality is fixed, extensions via plugins:

```
Core Framework         Plugins
    ↓                     ↓
Fixed behavior      Custom behavior
Stable API          User-defined
Framework team      Community/org
```

### 6. Zero Lock-In

Exported projects work independently:

```
After Export:
┌────────────────────────────────┐
│ my-app/                        │
│ ├─ package.json                │
│ ├─ src/                        │
│ └─ .dd/                        │
│    └─ config.json  (optional)  │
└────────────────────────────────┘

Can remove framework:
$ npm uninstall @jrdaws/framework
$ rm -rf .dd/

App still works perfectly ✓
```

### 7. Explicit Over Implicit

Framework behavior is predictable and documented:

```typescript
// Bad: Implicit behavior
framework export saas ./app
// What integrations? What config? Unknown

// Good: Explicit behavior
framework export saas ./app \
  --auth supabase \
  --payments stripe \
  --template-source local
// Clear what will happen
```

### 8. Fail Fast, Fail Loud

Errors are caught early and reported clearly:

```javascript
// Validate before starting
if (!isValidTemplate(templateId)) {
  throw new Error(`Unknown template: ${templateId}`);
}

// Don't continue on error
if (!validation.valid) {
  console.error("Validation failed:");
  validation.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}
```

## Technology Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| TypeScript | Type safety (platform layer) | 5.x |
| JavaScript (ESM) | Core framework | ES2022 |
| Git | Version control, checkpoints | 2.28+ |

### Key Dependencies

| Package | Purpose | Usage |
|---------|---------|-------|
| `degit` | Template cloning | Clone GitHub repos without git history |
| `fs-extra` | File operations | Enhanced fs with promises |
| `prompts` | Interactive prompts | User input during commands |
| `zod` | Schema validation | Validate configs and integrations |
| `@anthropic-ai/sdk` | AI integration | Claude API for previews |
| `@supabase/supabase-js` | Database | Web platform storage |

### Development Tools

| Tool | Purpose |
|------|---------|
| Node.js test runner | Unit testing |
| c8 | Code coverage |
| Husky | Git hooks |
| ESLint | Linting (templates) |

### Template Technologies

| Framework | Purpose | Templates |
|-----------|---------|-----------|
| Next.js 15 | React framework | All templates |
| React 19 | UI library | All templates |
| TypeScript | Type safety | All templates |
| Tailwind CSS | Styling | All templates |

## Module Organization

### Directory Structure

```
dawson-does-framework/
├── bin/                      # CLI entry point
│   └── framework.js          # Main CLI dispatcher
│
├── src/                      # Source code
│   ├── commands/             # Command implementations
│   │   ├── auth.mjs
│   │   ├── deploy.mjs
│   │   ├── llm.mjs
│   │   ├── plugin.mjs
│   │   └── templates.mjs
│   │
│   ├── dd/                   # Core services
│   │   ├── agent-safety.mjs
│   │   ├── config-schema.mjs
│   │   ├── credentials.mjs
│   │   ├── cursorrules.mjs
│   │   ├── deployment-detector.mjs
│   │   ├── drift.mjs
│   │   ├── integration-schema.mjs
│   │   ├── integrations.mjs
│   │   ├── logger.mjs
│   │   ├── manifest.mjs
│   │   ├── plan-compliance.mjs
│   │   ├── plugins.mjs
│   │   ├── post-export-hooks.mjs
│   │   ├── pull.mjs
│   │   ├── recovery-guidance.mjs
│   │   ├── registry.mjs
│   │   └── version.mjs
│   │
│   └── platform/             # Provider layer
│       ├── providers/        # Abstract interfaces
│       │   ├── auth.ts
│       │   ├── billing.ts
│       │   ├── llm.ts
│       │   ├── deploy.ts
│       │   ├── analytics.ts
│       │   └── types.ts
│       │
│       └── providers/impl/   # Implementations
│           ├── auth.supabase.ts
│           ├── billing.stripe.ts
│           ├── llm.anthropic.ts
│           ├── deploy.vercel.ts
│           ├── deploy.netlify.ts
│           └── deploy.railway.ts
│
├── templates/                # Pre-built templates
│   ├── saas/
│   ├── blog/
│   ├── dashboard/
│   ├── landing-page/
│   └── seo-directory/
│
├── website/                  # Web platform
│   ├── app/                  # Next.js App Router
│   │   ├── configure/        # Interactive configurator
│   │   ├── api/              # API routes
│   │   └── components/       # React components
│   └── lib/                  # Utilities
│
├── docs/                     # Documentation
│   ├── concepts/
│   ├── guides/
│   ├── cli/
│   └── architecture/
│
└── tests/                    # Test suite
    ├── cli/
    ├── integration/
    └── unit/
```

### Import Conventions

```javascript
// Core services use .mjs extension
import { writeManifest } from '../src/dd/manifest.mjs';

// Platform layer uses TypeScript
import { AuthProvider } from './src/platform/providers/auth.ts';

// Use absolute imports in templates
import { getAuthProvider } from '@/lib/auth';

// Node built-ins use node: prefix
import fs from 'node:fs';
import path from 'node:path';
```

## Extension Points

### 1. Plugins

Extend framework behavior via hooks:

```javascript
export default {
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    "pre:export": async (context) => { /* ... */ },
    "post:export": async (context) => { /* ... */ },
  },
};
```

### 2. Templates

Create new templates:

```bash
templates/my-template/
├── template.json
├── package.json
└── src/
```

### 3. Integrations

Add new service integrations:

```bash
templates/saas/integrations/auth/my-auth/
├── integration.json
├── lib/
└── components/
```

### 4. Providers

Implement new provider types:

```typescript
// src/platform/providers/impl/auth.myauth.ts
export class MyAuthProvider implements AuthProvider {
  async getSession() { /* ... */ }
  async createSession() { /* ... */ }
  async destroySession() { /* ... */ }
}
```

## Performance Considerations

### Template Cloning

- **degit**: Fast, no git history (~2s for typical template)
- **Local copy**: Even faster for local templates (~500ms)
- **Caching**: No caching (intentional - always get latest)

### File Hashing (Drift Detection)

- **SHA256**: Fast enough for typical projects (~100ms for 150 files)
- **Excluded**: node_modules, .git, .next (would be slow)
- **Lazy**: Only computed on demand (framework drift)

### Plugin Loading

- **Dynamic imports**: Load only when needed
- **Validation**: Upfront validation prevents runtime errors
- **Execution**: Serial execution (prevents race conditions)

### Manifest Storage

- **JSON**: Human-readable, git-friendly
- **Size**: ~10KB for typical project (150 files × ~70 bytes)
- **Location**: .dd/template-manifest.json (tracked in git)

## Related Documentation

- [Project Structure](./project-structure.md): Detailed codebase layout
- [Design Decisions](./design-decisions.md): Why we chose specific approaches
- [Contributing](./contributing.md): How to contribute to the framework

---

**Next**: [Project Structure](./project-structure.md)
