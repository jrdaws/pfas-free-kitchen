# File Structure

> **Required reading for all agents working on dawson-does-framework.**
>
> This guide explains where every type of file should go in the project.

## Quick Reference

Before adding a new file, ask:
- ✅ Is it a CLI command? → `bin/framework.js` (single entry point)
- ✅ Is it core framework logic? → `src/dd/`
- ✅ Is it a website component? → `website/app/components/`
- ✅ Is it a website page? → `website/app/`
- ✅ Is it a utility/lib? → `website/lib/` or `src/dd/`
- ✅ Is it a template? → `templates/{template-id}/`
- ✅ Is it a test? → `tests/`
- ✅ Is it documentation? → `docs/`
- ✅ Is it a prompt? → `prompts/`
- ✅ Is it a shared package? → `packages/`

---

## 1. Directory Overview

| Directory | Purpose | Language | Notes |
|-----------|---------|----------|-------|
| `bin/` | CLI entry point | JavaScript ESM | Single file: `framework.js` |
| `src/dd/` | Core framework modules | JavaScript ESM (`.mjs`) | Business logic, integrations, config |
| `website/` | Web configurator | TypeScript | Next.js 15 with App Router |
| `templates/` | Starter templates | TypeScript | Each template is standalone project |
| `packages/` | Shared packages | TypeScript | Reusable npm packages |
| `docs/` | Documentation | Markdown | Architecture, guides, standards |
| `tests/` | Test files | JavaScript ESM (`.test.mjs`) | Mirrors `src/` structure |
| `scripts/` | Build/utility scripts | JavaScript/Bash | Dev tooling, automation |
| `prompts/` | AI prompt templates | Markdown/Text | Agent instructions, tasks |
| `tools/` | Development tools | Mixed | Internal tooling (e.g., handoff-pack) |

---

## 2. File Naming Conventions

| File Type | Convention | Example | Location |
|-----------|-----------|---------|----------|
| CLI commands | Single entry point | `framework.js` | `bin/` |
| Core modules | kebab-case.mjs | `post-export-hooks.mjs` | `src/dd/` |
| React components | PascalCase.tsx | `TemplateSelector.tsx` | `website/app/components/` |
| Pages | lowercase/route.tsx | `configure/page.tsx` | `website/app/` |
| API routes | route.ts | `api/projects/route.ts` | `website/app/api/` |
| Utilities | camelCase.ts | `commandBuilder.ts` | `website/lib/` |
| Tests | *.test.mjs | `export-args.test.mjs` | `tests/` |
| Config files | lowercase.js/json | `next.config.js` | Root or template root |
| Documentation | UPPERCASE.md | `FILE_STRUCTURE.md` | `docs/` |
| Integration metadata | integration.json | `integration.json` | `templates/{id}/integrations/{type}/{provider}/` |
| Template metadata | template.json | `template.json` | `templates/{id}/` |

### Naming Rules

**JavaScript ESM (.mjs)**
```javascript
// ✅ GOOD: kebab-case for modules
src/dd/post-export-hooks.mjs
src/dd/deployment-detector.mjs
src/dd/recovery-guidance.mjs

// ❌ BAD: camelCase or PascalCase
src/dd/postExportHooks.mjs
src/dd/PostExportHooks.mjs
```

**TypeScript Components (.tsx)**
```typescript
// ✅ GOOD: PascalCase for components
website/app/components/TemplateSelector.tsx
website/app/components/editor/ComponentTree.tsx

// ❌ BAD: kebab-case or camelCase
website/app/components/template-selector.tsx
website/app/components/templateSelector.tsx
```

**Tests (.test.mjs)**
```javascript
// ✅ GOOD: Match the file being tested
tests/dd/pull.test.mjs          // tests src/dd/pull.mjs
tests/cli/export.test.mjs       // tests export command
tests/integration/manifest.test.mjs

// ❌ BAD: Generic names
tests/test1.mjs
tests/my-test.mjs
```

---

## 3. Where New Files Go

### Decision Tree

#### CLI & Core Framework

```
Is it a CLI command?
├─ Yes → Add to bin/framework.js (single entry point)
│
└─ No → Is it core framework logic?
    ├─ Yes → src/dd/{module-name}.mjs
    │   Examples:
    │   - Integration handling → src/dd/integrations.mjs
    │   - Plugin system → src/dd/plugins.mjs
    │   - Config validation → src/dd/config-schema.mjs
    │   - Pull from platform → src/dd/pull.mjs
    │
    └─ No → Continue to next section
```

#### Website/Platform

```
Is it website-related?
├─ Yes → What kind of file?
│   ├─ Page → website/app/{route}/page.tsx
│   ├─ Layout → website/app/{route}/layout.tsx
│   ├─ API endpoint → website/app/api/{endpoint}/route.ts
│   ├─ Component → website/app/components/{Component}.tsx
│   ├─ Utility → website/lib/{utility}.ts
│   └─ Type → website/types/{types}.ts
│
└─ No → Continue to next section
```

#### Templates

```
Is it template-related?
├─ Yes → Part of which template?
│   ├─ New template → templates/{template-id}/
│   ├─ Template code → templates/{id}/app/
│   ├─ Integration → templates/{id}/integrations/{type}/{provider}/
│   ├─ Template config → templates/{id}/template.json
│   └─ Template docs → templates/{id}/README.md
│
└─ No → Continue to next section
```

#### Tests

```
Is it a test?
├─ Yes → Mirror the structure of what you're testing
│   ├─ CLI test → tests/cli/{command}.test.mjs
│   ├─ Core module test → tests/dd/{module}.test.mjs
│   ├─ Integration test → tests/integration/{feature}.test.mjs
│   ├─ Provider test → tests/providers/{provider}.test.mjs
│   └─ Command test → tests/commands/{command}.test.mjs
│
└─ No → Continue to next section
```

#### Documentation

```
Is it documentation?
├─ Yes → What type?
│   ├─ Standards → docs/standards/{STANDARD}.md
│   ├─ Architecture → docs/architecture/{CONCEPT}.md
│   ├─ CLI guide → docs/cli/{command}.md
│   ├─ Integration guide → docs/integrations/{integration}.md
│   ├─ Template guide → docs/templates/{template}.md
│   ├─ Getting started → docs/getting-started/{guide}.md
│   ├─ Concepts → docs/concepts/{concept}.md
│   └─ Root-level → {DOCUMENT}.md (e.g., AGENT_CONTEXT.md)
│
└─ No → Continue to next section
```

#### Other

```
What else could it be?
├─ Shared package → packages/{package-name}/
├─ Prompt template → prompts/{category}/{prompt}.md
├─ Build script → scripts/{script}.mjs
├─ Tool → tools/{tool-name}/
└─ Not sure? → Ask in the PR or discuss with team
```

---

## 4. Template Structure

Every template follows this standard structure:

```
templates/{template-id}/
├── .dd/                          # Framework metadata (auto-generated)
│   └── config.json              # Template configuration
│
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── {routes}/                # Additional routes
│
├── integrations/                 # Optional integrations
│   ├── auth/                    # Authentication
│   │   ├── supabase/
│   │   │   ├── integration.json # Integration metadata
│   │   │   ├── package.json     # Dependencies
│   │   │   ├── lib/            # Client libraries
│   │   │   ├── components/     # UI components
│   │   │   ├── app/            # Route handlers
│   │   │   └── middleware.ts   # Auth middleware
│   │   └── clerk/              # Alternative provider
│   │
│   ├── payments/               # Billing
│   │   ├── stripe/
│   │   └── paddle/
│   │
│   ├── ai/                     # AI/LLM
│   │   ├── openai/
│   │   └── anthropic/
│   │
│   ├── db/                     # Database
│   │   ├── supabase/
│   │   └── planetscale/
│   │
│   ├── email/                  # Email
│   │   ├── resend/
│   │   └── sendgrid/
│   │
│   └── analytics/              # Analytics
│       ├── posthog/
│       └── plausible/
│
├── public/                      # Static assets
│   └── images/
│
├── template.json                # Template metadata
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
├── .gitignore                   # Git ignore rules
└── README.md                    # Template documentation
```

### Integration Structure

Each integration follows this pattern:

```
templates/{template}/integrations/{type}/{provider}/
├── integration.json             # Metadata (REQUIRED)
├── package.json                 # Dependencies (REQUIRED)
├── lib/                         # Client libraries
│   └── {provider}.ts           # API client
├── components/                  # UI components
│   └── {feature}/
│       └── {Component}.tsx
├── app/                         # Route handlers
│   └── api/
│       └── {provider}/
│           └── route.ts
├── middleware.ts                # Optional middleware
└── README.md                    # Integration docs
```

**Required Files:**
- `integration.json` - Metadata about the integration
- `package.json` - npm dependencies to install

**Optional but Common:**
- `lib/` - Client libraries for API calls
- `components/` - React components
- `app/api/` - API route handlers
- `middleware.ts` - Request middleware
- `.env.example` - Environment variable template

---

## 5. Website Structure

The website (`website/`) is a Next.js 15 application with App Router:

```
website/
├── app/                         # Next.js App Router
│   ├── page.tsx                # Homepage
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   │
│   ├── configure/              # Configurator page
│   │   └── page.tsx
│   │
│   ├── components/             # React components
│   │   ├── configurator/      # Configurator UI
│   │   ├── editor/            # Visual editor (disabled)
│   │   └── {Component}.tsx    # Shared components
│   │
│   └── api/                    # API routes
│       ├── projects/
│       │   └── route.ts
│       └── preview/
│           └── route.ts
│
├── lib/                        # Utilities
│   ├── supabase.ts            # Supabase client
│   └── utils.ts               # Helper functions
│
├── types/                      # TypeScript types
│   └── {types}.ts
│
├── public/                     # Static assets
│   └── images/
│
├── .env.local.example         # Environment template
├── next.config.js             # Next.js config
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

### Website File Placement

| File Type | Location | Example |
|-----------|----------|---------|
| Pages | `app/{route}/page.tsx` | `app/configure/page.tsx` |
| Layouts | `app/{route}/layout.tsx` | `app/layout.tsx` |
| API Routes | `app/api/{endpoint}/route.ts` | `app/api/projects/route.ts` |
| Components | `app/components/{Component}.tsx` | `app/components/TemplateSelector.tsx` |
| Grouped Components | `app/components/{group}/{Component}.tsx` | `app/components/editor/ComponentTree.tsx` |
| Utilities | `lib/{utility}.ts` | `lib/supabase.ts` |
| Types | `types/{types}.ts` | `types/template.ts` |
| Styles | `app/globals.css` or component-level | `app/globals.css` |

---

## 6. Core Framework Structure

The core framework code lives in `src/dd/`:

```
src/dd/
├── agent-safety.mjs            # AI safety checks
├── config-schema.mjs           # Configuration validation
├── credentials.mjs             # Credential management
├── cursorrules.mjs             # Cursor rules generation
├── deployment-detector.mjs     # Detect deployment platforms
├── drift.mjs                   # Drift detection
├── integration-schema.mjs      # Integration validation
├── integrations.mjs            # Integration handling
├── logger.mjs                  # Logging utility
├── manifest.mjs                # Manifest handling
├── plan-compliance.mjs         # Plan validation
├── plugins.mjs                 # Plugin system
├── post-export-hooks.mjs       # Post-export hooks
├── pull.mjs                    # Pull from platform
├── realtime/                   # Realtime features
├── recovery-guidance.mjs       # Error recovery
├── registry.mjs                # Template registry
└── version.mjs                 # Version management
```

### Core Module Guidelines

**When to create a new module:**
- ✅ It's a distinct piece of business logic
- ✅ It's reused across multiple commands
- ✅ It's complex enough to need its own file (>200 lines)
- ✅ It has clear responsibilities and boundaries

**When NOT to create a new module:**
- ❌ It's only used in one place (keep it inline)
- ❌ It's a simple utility (add to existing module)
- ❌ It's temporary or experimental

---

## 7. Test Structure

Tests mirror the source structure:

```
tests/
├── cli/                        # CLI command tests
│   ├── pull.test.mjs
│   ├── export.test.mjs
│   ├── can.test.mjs
│   └── plugins.test.mjs
│
├── commands/                   # Command-specific tests
│   ├── deploy.test.mjs
│   └── doctor.test.mjs
│
├── dd/                         # Core module tests
│   ├── pull.test.mjs
│   ├── integrations.test.mjs
│   └── plugins.test.mjs
│
├── integration/                # Integration tests
│   ├── manifest.test.mjs
│   ├── template-validation.test.mjs
│   └── handoff-pack.test.mjs
│
├── providers/                  # Provider-specific tests
│   ├── auth-supabase.test.mjs
│   ├── billing-stripe.test.mjs
│   └── llm-anthropic.test.mjs
│
├── utils/                      # Test utilities
│   ├── assertions.mjs
│   └── fixtures.mjs
│
├── fixtures/                   # Test fixtures
│   └── {fixture-data}/
│
└── matrix/                     # Matrix tests
    └── smoke.mjs
```

### Test Naming Rules

```javascript
// ✅ GOOD: Descriptive test names
tests/cli/pull.test.mjs          // Tests 'framework pull' command
tests/dd/integrations.test.mjs   // Tests src/dd/integrations.mjs
tests/providers/auth-supabase.test.mjs  // Tests Supabase auth provider

// ❌ BAD: Vague names
tests/test1.test.mjs
tests/my-test.test.mjs
```

---

## 8. Documentation Structure

Documentation is organized by topic:

```
docs/
├── standards/                  # Coding standards
│   ├── CODING_STANDARDS.md
│   └── FILE_STRUCTURE.md      # This file
│
├── architecture/               # Architecture docs
│   ├── OVERVIEW.md
│   ├── INTEGRATION_SYSTEM.md
│   └── PLUGIN_SYSTEM.md
│
├── cli/                        # CLI documentation
│   ├── export.md
│   ├── pull.md
│   ├── doctor.md
│   └── deploy.md
│
├── integrations/               # Integration guides
│   ├── auth-supabase.md
│   ├── billing-stripe.md
│   └── ai-anthropic.md
│
├── templates/                  # Template guides
│   ├── saas.md
│   ├── blog.md
│   └── creating-templates.md
│
├── getting-started/            # Getting started guides
│   ├── quickstart.md
│   ├── installation.md
│   └── first-project.md
│
├── concepts/                   # Conceptual docs
│   ├── export-first.md
│   ├── zero-lock-in.md
│   └── cursor-native.md
│
├── deploy/                     # Deployment guides
│   ├── vercel.md
│   └── netlify.md
│
├── examples/                   # Example projects
│   └── {example}/
│
└── agents/                     # Agent documentation
    └── context.md
```

### Documentation File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Standards | UPPERCASE.md | `CODING_STANDARDS.md` |
| Guides | lowercase.md | `quickstart.md` |
| Reference | kebab-case.md | `auth-supabase.md` |
| Architecture | UPPERCASE.md | `PLUGIN_SYSTEM.md` |

---

## 9. Package Structure

Shared packages live in `packages/`:

```
packages/
├── ai-agent/                   # AI agent package
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── collaboration/              # Collaboration package
    ├── src/
    ├── tests/
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

Each package is a standalone npm package with:
- `src/` - Source code
- `tests/` - Package tests
- `package.json` - Package metadata
- `tsconfig.json` - TypeScript config
- `README.md` - Package documentation

---

## 10. Prompt Structure

AI prompts are organized in `prompts/`:

```
prompts/
├── agents/                     # Agent prompts
│   ├── architect.md
│   ├── implementer.md
│   └── reviewer.md
│
├── tasks/                      # Task-specific prompts
│   ├── add-integration.md
│   ├── create-template.md
│   └── debug-issue.md
│
├── superprompt/                # Meta prompts
│   └── framework.md
│
└── orchestrator/               # Orchestration prompts
    └── coordinator.md
```

---

## 11. Special Files

### Root-Level Files

These files live at the project root and have special purposes:

| File | Purpose |
|------|---------|
| `AGENT_CONTEXT.md` | **REQUIRED READING** - Agent instructions |
| `FRAMEWORK_MAP.md` | Architecture and dependency map |
| `CLAUDE.md` | Auto-loaded context for Claude Code CLI |
| `.cursorrules` | Cursor IDE rules |
| `package.json` | Project dependencies |
| `README.md` | Project overview |
| `.gitignore` | Git ignore rules |
| `.env.example` | Environment variable template |

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `package.json` | Root, templates, integrations | npm dependencies |
| `tsconfig.json` | Root, website, templates | TypeScript config |
| `next.config.js` | Website, templates | Next.js config |
| `template.json` | `templates/{id}/` | Template metadata |
| `integration.json` | `templates/{id}/integrations/{type}/{provider}/` | Integration metadata |
| `.env.example` | Root, website, templates | Environment template |
| `.env.local` | Root, website (gitignored) | Local environment vars |

---

## 12. Common Mistakes

### ❌ Wrong

```
# Putting CLI logic in website
website/lib/pullFromPlatform.ts

# Mixing file naming conventions
src/dd/PostExportHooks.mjs
src/dd/postExportHooks.mjs

# Tests not mirroring structure
tests/random-test.test.mjs

# Creating unnecessary new files
src/dd/utils.mjs (too generic)
src/dd/helpers.mjs (too vague)

# Wrong extension
src/dd/integrations.js (should be .mjs)
website/components/Button.ts (should be .tsx)
```

### ✅ Right

```
# CLI logic in core
src/dd/pull.mjs

# Correct naming
src/dd/post-export-hooks.mjs

# Tests mirror structure
tests/dd/pull.test.mjs

# Specific, purposeful files
src/dd/integration-schema.mjs
src/dd/deployment-detector.mjs

# Correct extensions
src/dd/integrations.mjs
website/app/components/Button.tsx
```

---

## 13. Adding New Files Checklist

Before creating a new file, verify:

- [ ] I've read this entire document
- [ ] I've checked if a similar file already exists
- [ ] I've chosen the correct location using the decision tree
- [ ] I've used the correct naming convention
- [ ] I've used the correct file extension (`.mjs`, `.ts`, `.tsx`)
- [ ] I've followed the style guide for this file type
- [ ] I've created a corresponding test file if needed
- [ ] I've added the file to `.gitignore` if it contains secrets

---

## 14. Quick Reference Matrix

| I'm adding... | It should go in... | Named like... | Extension |
|---------------|-------------------|--------------|-----------|
| CLI command | Add to `bin/framework.js` | N/A | `.js` |
| Core module | `src/dd/` | `kebab-case` | `.mjs` |
| Website page | `website/app/{route}/` | `page` | `.tsx` |
| Website component | `website/app/components/` | `PascalCase` | `.tsx` |
| API route | `website/app/api/{endpoint}/` | `route` | `.ts` |
| Utility | `website/lib/` or `src/dd/` | `camelCase` | `.ts` or `.mjs` |
| Test | `tests/` (mirror structure) | `{file}.test` | `.mjs` |
| Template | `templates/{id}/` | `kebab-case` | N/A (directory) |
| Integration | `templates/{id}/integrations/{type}/{provider}/` | `kebab-case` | N/A (directory) |
| Documentation | `docs/{category}/` | `UPPERCASE` or `lowercase` | `.md` |
| Package | `packages/{name}/` | `kebab-case` | N/A (directory) |
| Prompt | `prompts/{category}/` | `kebab-case` | `.md` |

---

## Questions?

If you're unsure where a file should go:

1. Check the decision tree (Section 3)
2. Look for similar existing files
3. Ask in the PR description
4. Refer to AGENT_CONTEXT.md

**When in doubt, ask before creating!**

---

*Last updated: 2025-12-21*
