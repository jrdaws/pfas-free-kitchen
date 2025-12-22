# Project Structure

Complete breakdown of the Dawson Does Framework codebase organization, module responsibilities, and file naming conventions.

## Table of Contents

- [Root Directory](#root-directory)
- [Binary Entry Point](#binary-entry-point)
- [Source Code](#source-code)
- [Templates](#templates)
- [Website Platform](#website-platform)
- [Documentation](#documentation)
- [Tests](#tests)
- [Module Responsibilities](#module-responsibilities)
- [File Naming Conventions](#file-naming-conventions)

## Root Directory

```
dawson-does-framework/
├── bin/                           # CLI entry point
├── src/                           # Framework source code
├── templates/                     # Pre-built templates
├── website/                       # Web platform (Next.js)
├── docs/                          # Documentation
├── tests/                         # Test suite
├── scripts/                       # Build and utility scripts
├── prompts/                       # AI prompts and tasks
├── tasks/                         # Task definitions
├── .dd/                           # Framework metadata
│   ├── health.sh                  # Health check script
│   └── after-install.sh           # Post-install hook
├── package.json                   # Package definition
├── FRAMEWORK_MAP.md               # Auto-generated dependency map
├── README.md                      # Main documentation
└── .gitignore                     # Git exclusions
```

## Binary Entry Point

### bin/framework.js

Main CLI dispatcher (1622 lines):

```javascript
#!/usr/bin/env node

// Key sections:
// 1. Imports (lines 1-25)
// 2. Template definitions (lines 30-39)
// 3. Helper functions (lines 40-300)
// 4. Command implementations (lines 300-1550)
// 5. Main dispatcher (lines 1560-1622)
```

**Responsibilities**:
- Parse command-line arguments
- Route to command handlers
- Handle top-level errors
- Maintain CLI interface backward compatibility

**Key Functions**:
- `parseExportFlags()` - Parse export command flags
- `cmdExport()` - Template export orchestration
- `cmdPull()` - Web platform project download
- `cmdDemo()` - Quick export for testing
- `cmdDrift()` - Drift detection
- `cmdCheckpoint()` - Checkpoint management
- `cmdPlugin()` - Plugin management
- `cmdTemplates()` - Template commands

## Source Code

### src/commands/

Command implementations:

```
src/commands/
├── auth.mjs              # Authentication provider setup
├── deploy.mjs            # Deployment orchestration
├── llm.mjs               # LLM provider configuration
├── plugin.mjs            # Plugin CLI commands
└── templates.mjs         # Template registry commands
```

**auth.mjs** (150 lines):
- Configure authentication providers
- Setup credentials
- Test connections

**deploy.mjs** (400 lines):
- Deploy to Vercel, Netlify, Railway
- Environment variable setup
- Deployment authentication

**llm.mjs** (150 lines):
- Configure LLM providers (Anthropic, OpenAI)
- API key management
- Test API connections

**plugin.mjs** (200 lines):
- `plugin add` - Add plugins
- `plugin remove` - Remove plugins
- `plugin list` - List installed plugins
- `plugin info` - Show plugin details
- `plugin hooks` - Show available hooks

**templates.mjs** (300 lines):
- `templates list` - List available templates
- `templates search` - Search templates
- `templates info` - Show template details
- `templates categories` - List categories
- `templates tags` - List tags

### src/dd/

Core framework services:

```
src/dd/
├── agent-safety.mjs          # Checkpoint/rollback system
├── config-schema.mjs         # Config validation
├── credentials.mjs           # Credential management
├── cursorrules.mjs           # Cursor AI rules generation
├── deployment-detector.mjs   # Detect deployment platform
├── drift.mjs                 # Drift detection
├── integration-schema.mjs    # Integration validation schemas
├── integrations.mjs          # Integration application
├── logger.mjs                # Structured logging
├── manifest.mjs              # Template manifest (SHA256)
├── plan-compliance.mjs       # Plan tier validation
├── plugins.mjs               # Plugin system
├── post-export-hooks.mjs     # After-export actions
├── pull.mjs                  # Web platform integration
├── recovery-guidance.mjs     # Error recovery instructions
├── registry.mjs              # Template registry
└── version.mjs               # Version management
```

**Key Modules**:

**manifest.mjs** (~70 lines):
- `listTemplateFiles()` - Recursively list files
- `sha256File()` - Calculate file hash
- `writeManifest()` - Create manifest file

**drift.mjs** (~130 lines):
- `detectDrift()` - Compare current files to manifest
- Returns: added, modified, deleted, unchanged files

**agent-safety.mjs** (~310 lines):
- `createCheckpoint()` - Create git stash checkpoint
- `restoreCheckpoint()` - Restore from checkpoint
- `listCheckpoints()` - List available checkpoints
- `cleanupCheckpoints()` - Remove old checkpoints
- `withSafetyCheckpoint()` - Wrap operations with checkpoint

**plugins.mjs** (~295 lines):
- `loadPluginRegistry()` - Load .dd/plugins.json
- `loadPlugin()` - Import plugin module
- `validatePlugin()` - Validate plugin structure
- `executeHooks()` - Run hooks for hook point
- `addPlugin()` - Add plugin to registry
- `removePlugin()` - Remove plugin from registry

**integrations.mjs** (~400 lines):
- `validateIntegrations()` - Check compatibility
- `applyIntegrations()` - Copy files, merge deps
- `mergePackageJson()` - Merge dependencies
- `mergeEnvExample()` - Update environment template

### src/platform/

Provider abstraction layer:

```
src/platform/
├── providers/
│   ├── types.ts              # Common types
│   ├── auth.ts               # AuthProvider interface
│   ├── billing.ts            # BillingProvider interface
│   ├── llm.ts                # LLMProvider interface
│   ├── deploy.ts             # DeployProvider interface
│   └── analytics.ts          # AnalyticsProvider interface
│
└── providers/impl/
    ├── auth.supabase.ts      # Supabase authentication
    ├── billing.stripe.ts     # Stripe billing
    ├── billing.paddle.ts     # Paddle billing
    ├── billing.lemon-squeezy.ts  # Lemon Squeezy billing
    ├── llm.anthropic.ts      # Anthropic Claude
    ├── llm.openai.ts         # OpenAI GPT
    ├── deploy.vercel.ts      # Vercel deployment
    ├── deploy.netlify.ts     # Netlify deployment
    ├── deploy.railway.ts     # Railway deployment
    └── analytics.console.ts  # Console analytics
```

**Interface Pattern**:

```typescript
// providers/auth.ts
export interface AuthProvider {
  getSession(): Promise<Session | null>;
  createSession(credentials: Credentials): Promise<Session>;
  destroySession(): Promise<void>;
  getUser(id: string): Promise<AuthUser | null>;
  updateUser(id: string, data: Partial<AuthUser>): Promise<AuthUser>;
  signInWithOAuth(provider: OAuthProvider): Promise<{ url: string }>;
  healthCheck(): Promise<ProviderHealth>;
}

// providers/impl/auth.supabase.ts
export class SupabaseAuthProvider implements AuthProvider {
  // Implementation
}
```

## Templates

### Template Structure

```
templates/
├── saas/
│   ├── template.json         # Metadata
│   ├── package.json          # Dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── next.config.js        # Next.js config
│   ├── tailwind.config.js    # Tailwind config
│   ├── postcss.config.js     # PostCSS config
│   │
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (auth)/       # Auth routes
│   │   │   └── (dashboard)/  # Dashboard routes
│   │   │
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base UI components
│   │   │   ├── auth/         # Auth components
│   │   │   └── layout/       # Layout components
│   │   │
│   │   ├── lib/              # Utilities
│   │   │   ├── auth.ts       # Auth helpers
│   │   │   ├── db.ts         # Database client
│   │   │   └── utils.ts      # Utility functions
│   │   │
│   │   └── types/            # TypeScript types
│   │       └── index.ts
│   │
│   ├── integrations/         # Optional integrations
│   │   ├── auth/
│   │   │   ├── supabase/
│   │   │   │   ├── integration.json
│   │   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   └── app/
│   │   │   └── clerk/
│   │   │
│   │   ├── payments/
│   │   │   └── stripe/
│   │   │       ├── integration.json
│   │   │       ├── lib/
│   │   │       └── components/
│   │   │
│   │   └── email/
│   │       ├── sendgrid/
│   │       └── resend/
│   │
│   ├── public/               # Static assets
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   ├── .dd/                  # Framework config
│   │   └── config.json
│   │
│   └── README.md             # Template documentation
│
├── blog/                     # Blog template
├── dashboard/                # Dashboard template
├── landing-page/             # Landing page template
└── seo-directory/            # SEO directory template
```

### Integration Structure

```
integrations/auth/supabase/
├── integration.json          # Integration metadata
│   {
│     "provider": "supabase",
│     "type": "auth",
│     "version": "1.0.0",
│     "dependencies": { ... },
│     "envVars": [ ... ],
│     "files": { ... }
│   }
│
├── lib/
│   ├── supabase.ts           # Client setup
│   └── auth.ts               # Auth helpers
│
├── components/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
│
└── app/
    ├── login/
    │   └── page.tsx
    └── api/auth/
        └── callback/
            └── route.ts
```

## Website Platform

Next.js 15 application for web-based project configuration:

```
website/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   │
│   ├── configure/            # Interactive configurator
│   │   └── page.tsx
│   │
│   ├── api/                  # API routes
│   │   ├── preview/
│   │   │   └── generate/
│   │   │       └── route.ts  # AI preview generation
│   │   │
│   │   └── projects/
│   │       ├── save/
│   │       │   └── route.ts  # Save project config
│   │       │
│   │       └── [token]/
│   │           ├── route.ts  # Fetch project
│   │           └── download/
│   │               └── route.ts  # Download as ZIP
│   │
│   └── components/           # React components
│       ├── configurator/
│       │   ├── TemplateSelector.tsx
│       │   ├── IntegrationPicker.tsx
│       │   └── AIPreview.tsx
│       │
│       └── ui/               # Base UI components
│
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── preview-generator.ts  # AI preview logic
│   └── utils.ts              # Utilities
│
├── public/                   # Static assets
│
└── next.config.js            # Next.js config
```

## Documentation

```
docs/
├── concepts/                 # Core concepts
│   ├── README.md
│   ├── templates.md
│   ├── capabilities.md
│   ├── integrations.md
│   ├── plugins.md            # NEW
│   ├── drift-detection.md    # NEW
│   └── agent-safety.md       # NEW
│
├── architecture/             # Architecture docs
│   ├── README.md             # NEW
│   ├── project-structure.md  # NEW (this file)
│   ├── design-decisions.md   # NEW
│   └── contributing.md       # NEW
│
├── guides/                   # How-to guides
│   ├── getting-started.md
│   ├── first-export.md
│   ├── adding-integrations.md
│   └── deployment.md
│
├── cli/                      # CLI reference
│   ├── export.md
│   ├── pull.md
│   ├── drift.md
│   ├── checkpoint.md
│   └── plugin.md
│
├── integrations/             # Integration docs
│   ├── auth/
│   ├── payments/
│   ├── email/
│   └── analytics/
│
├── templates/                # Template docs
│   ├── saas.md
│   ├── blog.md
│   ├── dashboard.md
│   └── landing-page.md
│
├── standards/                # Standards and governance
│   └── coding-standards.md
│
├── PLUGIN_API.md             # Plugin API reference
├── TEMPLATE_REGISTRY.md      # Template registry docs
├── AI_GOVERNANCE.md          # AI governance rules
└── GOVERNANCE_ROADMAP.md     # Governance roadmap
```

## Tests

```
tests/
├── cli/                      # CLI tests
│   ├── export.test.mjs
│   ├── pull.test.mjs
│   ├── drift.test.mjs
│   ├── checkpoint.test.mjs
│   └── plugin.test.mjs
│
├── integration/              # Integration tests
│   ├── export-flow.test.mjs
│   ├── integration-application.test.mjs
│   └── web-platform.test.mjs
│
├── unit/                     # Unit tests
│   ├── manifest.test.mjs
│   ├── drift.test.mjs
│   ├── plugins.test.mjs
│   ├── agent-safety.test.mjs
│   └── config-schema.test.mjs
│
└── fixtures/                 # Test fixtures
    ├── templates/
    ├── integrations/
    └── plugins/
```

## Module Responsibilities

### CLI Layer (bin/)

**Responsibilities**:
- Parse command-line arguments
- Route to appropriate handler
- Handle top-level errors
- Maintain backward compatibility

**Does NOT**:
- Contain business logic
- Implement features directly
- Make external API calls

### Command Layer (src/commands/)

**Responsibilities**:
- Orchestrate operations
- Call core services
- Handle user interaction
- Format output

**Does NOT**:
- Implement core logic
- Direct file manipulation (use services)
- Parse arguments (already done)

### Core Services (src/dd/)

**Responsibilities**:
- Implement framework features
- Business logic
- File operations
- Data validation

**Does NOT**:
- Parse CLI arguments
- Format user output
- Know about CLI commands

### Platform Layer (src/platform/)

**Responsibilities**:
- Define provider interfaces
- Implement provider adapters
- Abstract third-party services
- Type definitions

**Does NOT**:
- Framework-specific logic
- CLI interaction
- File system operations

### Templates (templates/)

**Responsibilities**:
- Provide complete applications
- Include integrations
- Maintain dependencies
- Document usage

**Does NOT**:
- Reference framework code
- Include framework as dependency
- Break zero lock-in principle

## File Naming Conventions

### JavaScript/TypeScript Files

```
.mjs    # Core framework (ES modules)
.ts     # Platform layer (TypeScript)
.tsx    # React components (TypeScript)
.js     # Config files (CommonJS/ESM)
```

### Test Files

```
*.test.mjs     # Test files
*.test.ts      # TypeScript tests
```

### Configuration Files

```
template.json         # Template metadata
integration.json      # Integration metadata
package.json          # Package definition
tsconfig.json         # TypeScript config
.dd/config.json       # Framework config
.dd/plugins.json      # Plugin registry
.dd/manifest.json     # Template manifest
```

### Documentation Files

```
README.md             # Primary documentation
*.md                  # Markdown documentation
```

### Module Naming

```
kebab-case            # File names (agent-safety.mjs)
PascalCase            # Classes (SupabaseAuthProvider)
camelCase             # Functions (createCheckpoint)
SCREAMING_SNAKE_CASE  # Constants (HOOK_POINTS)
```

## Related Documentation

- [Architecture Overview](./README.md)
- [Design Decisions](./design-decisions.md)
- [Contributing Guide](./contributing.md)

---

**Previous**: [Architecture Overview](./README.md)
**Next**: [Design Decisions](./design-decisions.md)
