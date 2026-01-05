# FRAMEWORK_MAP

Generated: (deterministic)
Hash: ae3a969bf2

## Recent changes
- ecbc45c 2026-01-04 feat(cli): add env pull and env check commands
- 9a1bc2c 2026-01-04 docs(tasks): create agent task files for platform implementation
- f7d5fcd 2026-01-04 docs(architecture): comprehensive platform research for admin dashboard & multi-page preview
- 3ecb457 2026-01-04 feat: Complete Dashboard template with charts and data table
- 0aa25e2 2026-01-04 feat: Complete Blog template with comments and related posts
- 1fbf216 2026-01-04 feat: Complete E-commerce template with cart, checkout, orders
- 7db1a04 2026-01-04 test: Add E2E export tests for Phase 1-3 integrations
- f2319cb 2026-01-04 fix: Remove duplicate integration paths and cases in export route
- 499f523 2026-01-04 feat: Phase 3 templates - Contentful, Meilisearch, Cloudflare R2
- 9768052 2026-01-04 feat: Phase 2 templates - Plausible, SendGrid, Anthropic, Trigger.dev
- 14b92a6 2026-01-04 feat: Phase 1 templates - NextAuth, Paddle, LemonSqueezy, Checkout, Subscriptions
- 109f07f 2026-01-04 chore: move completed tasks to done
- 0edfa72 2026-01-04 test: all tier 1 export tests pass (12/12)
- c64cbe1 2026-01-04 feat(website): add dashboard with connected services UI
- 610c280 2026-01-04 feat: dynamic preview integration badges and template-specific CTAs
- 5dd762b 2026-01-04 fix: progress bar can now reach 100% - remove hidden claude-code tool
- bdeded9 2026-01-04 chore: move completed task to done
- 510cfc4 2026-01-04 feat: auto-include features + integration bridges + e-commerce templates
- 9d3591d 2026-01-03 fix(P1): resolve remaining P1 export failures
- 3d478da 2026-01-03 chore: move completed task to done
- 1f44926 2026-01-03 fix: add supabase re-export shim for backward compatibility
- a814819 2026-01-03 fix(exports): add missing components to e-commerce template
- 8ece2be 2026-01-03 feat(governance): add 'rr' shortcut for re-reading rules
- f16cfb3 2026-01-03 feat(governance): add role-based SOP requirements
- 1477da2 2026-01-03 feat(sops): add comprehensive Bug Prevention & Detection System

## Agent Governance Structure

The project uses a role-based agent system for AI-assisted development.

### Core Governance Documents

| File | Purpose | Version |
|------|---------|---------|
| `AGENT_CONTEXT.md` | Mandatory context for all agents, verification test | Required reading |
| `CLAUDE.md` | Claude Code CLI auto-loaded instructions | Auto-loaded |
| `prompts/agents/AGENT_POLICIES.md` | Universal agent policies and protocols | v1.0 |
| `prompts/agents/HANDOFF_TEMPLATE.md` | Template for cross-agent handoffs | - |

### Agent Roles

7 specialized agents with distinct domains:

| Role | Files | Domain | Key Responsibilities |
|------|-------|--------|---------------------|
| **CLI Agent** | `prompts/agents/roles/CLI_AGENT.md` | `bin/framework.js`, `src/dd/*.mjs`, `src/commands/*.mjs` | CLI commands, core framework logic, integrations system |
| **Website Agent** | `prompts/agents/roles/WEBSITE_AGENT.md` | `website/`, Next.js app | Web configurator, UI components, API routes |
| **Template Agent** | `prompts/agents/roles/TEMPLATE_AGENT.md` | `templates/`, `template.json` | Starter templates, template structure, content |
| **Integration Agent** | `prompts/agents/roles/INTEGRATION_AGENT.md` | `src/platform/providers/` | Auth, payments, analytics, third-party integrations |
| **Documentation Agent** | `prompts/agents/roles/DOCUMENTATION_AGENT.md` | `docs/`, `*.md`, governance | User docs, guides, agent context, governance |
| **Testing Agent** | `prompts/agents/roles/TESTING_AGENT.md` | `tests/`, CI/CD | Unit tests, E2E tests, coverage, quality assurance |
| **Platform Agent** | `prompts/agents/roles/PLATFORM_AGENT.md` | `packages/`, API routes | Platform APIs, deployment, preview, packages |

### Agent Memory System

Session continuity tracked in `prompts/agents/memory/`:

- `CLI_MEMORY.md` - CLI Agent session history
- `WEBSITE_MEMORY.md` - Website Agent session history
- `TEMPLATE_MEMORY.md` - Template Agent session history
- `INTEGRATION_MEMORY.md` - Integration Agent session history
- `DOCUMENTATION_MEMORY.md` - Documentation Agent session history
- `TESTING_MEMORY.md` - Testing Agent session history
- `PLATFORM_MEMORY.md` - Platform Agent session history

Each memory file tracks:
- Current priorities
- Known blockers
- Session history with date, work completed, next steps
- Handoff notes for continuity

### Agent Initialization Flow

```
1. Read AGENT_CONTEXT.md (mandatory)
2. Pass verification test (5 questions)
3. Read AGENT_POLICIES.md
4. Identify role from task assignment
5. Load role file: prompts/agents/roles/[ROLE]_AGENT.md
6. Load memory: prompts/agents/memory/[ROLE]_MEMORY.md
7. Establish continuity from previous sessions
8. Confirm ready and begin work
```

### Session Completion Protocol

Every agent must:
1. Update their memory file with session entry
2. Run `npm test` before committing
3. Provide summary of work completed
4. Document blockers and next priorities
5. Provide handoff notes if cross-role work needed

### Code Standards by Agent

- **CLI Agent**: JavaScript (.mjs), no semicolons, 2-space indent, use `logger.mjs`
- **Website/Platform Agents**: TypeScript (.ts/.tsx), semicolons, 2-space indent
- **All Agents**: Conventional commits, run tests before commit, update docs

### Governance Version

- **Version**: 1.0
- **Created**: 2025-12-22
- **Status**: Operational

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|

## Call Graph (Execution BFS)
Used for: runtime reasoning, blast-radius analysis, debugging

- `bin/framework.js`
  - `src/dd/post-export-hooks.mjs`
  - `src/dd/manifest.mjs`
  - `src/dd/config-schema.mjs`
  - `src/dd/drift.mjs`
  - `src/dd/plan-compliance.mjs`
  - `src/commands/llm.mjs`
  - `src/commands/auth.mjs`
  - `src/commands/plugin.mjs`
  - `src/commands/templates.mjs`
  - `src/commands/deploy.mjs`
  - `src/dd/generate.mjs`
  - `src/dd/plugins.mjs`
  - `src/dd/logger.mjs`
  - `src/dd/version.mjs`
  - `src/dd/agent-safety.mjs`
  - `src/dd/integrations.mjs`
  - `src/dd/pull.mjs`
  - `src/dd/cursorrules.mjs`
  - `src/dd/feature-assembler.mjs`
  - `src/dd/env-manager.mjs`
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`
    - `src/dd/recovery-guidance.mjs`
    - `src/platform/providers/impl/llm.anthropic.ts`
    - `src/platform/providers/impl/auth.supabase.ts`
    - `src/dd/registry.mjs`
    - `src/dd/credentials.mjs`
    - `src/dd/deployment-detector.mjs`
    - `src/platform/providers/impl/deploy.vercel.ts`
    - `src/platform/providers/impl/deploy.netlify.ts`
    - `src/platform/providers/impl/deploy.railway.ts`
    - `src/dd/integration-schema.mjs`
      - `src/platform/providers/llm.ts`
      - `src/platform/providers/types.ts`
      - `src/platform/providers/auth.ts`
      - `src/platform/providers/deploy.ts`

## Dependency Tree (Structural)
Used for: onboarding, refactors, capability ownership

- `bin/framework.js`
- `├─ src/dd/post-export-hooks.mjs`
- `│  src/dd/post-export-hooks.mjs`
- `├─ src/dd/manifest.mjs`
- `│  src/dd/manifest.mjs`
- `├─ src/dd/config-schema.mjs`
- `│  src/dd/config-schema.mjs`
- `├─ src/dd/drift.mjs`
- `│  src/dd/drift.mjs`
- `│  └─ src/dd/manifest.mjs`
- `│     src/dd/manifest.mjs`
- `├─ src/dd/plan-compliance.mjs`
- `│  src/dd/plan-compliance.mjs`
- `├─ src/commands/llm.mjs`
- `│  src/commands/llm.mjs`
- `│  ├─ src/dd/recovery-guidance.mjs`
- `│  │  src/dd/recovery-guidance.mjs`
- `│  └─ src/platform/providers/impl/llm.anthropic.ts`
- `│     src/platform/providers/impl/llm.anthropic.ts`
- `│     ├─ src/platform/providers/llm.ts`
- `│     │  src/platform/providers/llm.ts`
- `│     │  └─ src/platform/providers/types.ts`
- `│     │     src/platform/providers/types.ts`
- `│     └─ src/platform/providers/types.ts`
- `│        src/platform/providers/types.ts`
- `├─ src/commands/auth.mjs`
- `│  src/commands/auth.mjs`
- `│  ├─ src/dd/recovery-guidance.mjs`
- `│  │  src/dd/recovery-guidance.mjs`
- `│  └─ src/platform/providers/impl/auth.supabase.ts`
- `│     src/platform/providers/impl/auth.supabase.ts`
- `│     ├─ src/platform/providers/auth.ts`
- `│     │  src/platform/providers/auth.ts`
- `│     │  └─ src/platform/providers/types.ts`
- `│     │     src/platform/providers/types.ts`
- `│     └─ src/platform/providers/types.ts`
- `│        src/platform/providers/types.ts`
- `├─ src/commands/plugin.mjs`
- `│  src/commands/plugin.mjs`
- `│  └─ src/dd/plugins.mjs`
- `│     src/dd/plugins.mjs`
- `├─ src/commands/templates.mjs`
- `│  src/commands/templates.mjs`
- `│  ├─ src/dd/registry.mjs`
- `│  │  src/dd/registry.mjs`
- `│  └─ src/dd/version.mjs`
- `│     src/dd/version.mjs`
- `├─ src/commands/deploy.mjs`
- `│  src/commands/deploy.mjs`
- `│  ├─ src/dd/credentials.mjs`
- `│  │  src/dd/credentials.mjs`
- `│  ├─ src/dd/deployment-detector.mjs`
- `│  │  src/dd/deployment-detector.mjs`
- `│  ├─ src/dd/logger.mjs`
- `│  │  src/dd/logger.mjs`
- `│  ├─ src/platform/providers/impl/deploy.vercel.ts`
- `│  │  src/platform/providers/impl/deploy.vercel.ts`
- `│  │  ├─ src/platform/providers/deploy.ts`
- `│  │  │  src/platform/providers/deploy.ts`
- `│  │  │  └─ src/platform/providers/types.ts`
- `│  │  │     src/platform/providers/types.ts`
- `│  │  └─ src/platform/providers/types.ts`
- `│  │     src/platform/providers/types.ts`
- `│  ├─ src/platform/providers/impl/deploy.netlify.ts`
- `│  │  src/platform/providers/impl/deploy.netlify.ts`
- `│  │  ├─ src/platform/providers/deploy.ts`
- `│  │  │  src/platform/providers/deploy.ts`
- `│  │  └─ src/platform/providers/types.ts`
- `│  │     src/platform/providers/types.ts`
- `│  └─ src/platform/providers/impl/deploy.railway.ts`
- `│     src/platform/providers/impl/deploy.railway.ts`
- `│     ├─ src/platform/providers/deploy.ts`
- `│     │  src/platform/providers/deploy.ts`
- `│     └─ src/platform/providers/types.ts`
- `│        src/platform/providers/types.ts`
- `├─ src/dd/generate.mjs`
- `│  src/dd/generate.mjs`
- `│  └─ src/dd/logger.mjs`
- `│     src/dd/logger.mjs`
- `├─ src/dd/plugins.mjs`
- `│  src/dd/plugins.mjs`
- `├─ src/dd/logger.mjs`
- `│  src/dd/logger.mjs`
- `├─ src/dd/version.mjs`
- `│  src/dd/version.mjs`
- `├─ src/dd/agent-safety.mjs`
- `│  src/dd/agent-safety.mjs`
- `├─ src/dd/integrations.mjs`
- `│  src/dd/integrations.mjs`
- `│  └─ src/dd/integration-schema.mjs`
- `│     src/dd/integration-schema.mjs`
- `├─ src/dd/pull.mjs`
- `│  src/dd/pull.mjs`
- `├─ src/dd/cursorrules.mjs`
- `│  src/dd/cursorrules.mjs`
- `├─ src/dd/feature-assembler.mjs`
- `│  src/dd/feature-assembler.mjs`
- `├─ src/dd/env-manager.mjs`
- `│  src/dd/env-manager.mjs`
- `├─ scripts/orchestrator/project-config.mjs`
- `│  scripts/orchestrator/project-config.mjs`
- `└─ scripts/orchestrator/capability-engine.mjs`
- `   scripts/orchestrator/capability-engine.mjs`
- `   └─ scripts/orchestrator/project-config.mjs`
- `      scripts/orchestrator/project-config.mjs`

## Reverse graph (What depends on this file)

- `src/dd/post-export-hooks.mjs` <- `bin/framework.js`
- `src/dd/manifest.mjs` <- `bin/framework.js`, `src/dd/drift.mjs`
- `src/dd/config-schema.mjs` <- `bin/framework.js`
- `src/dd/drift.mjs` <- `bin/framework.js`
- `src/dd/plan-compliance.mjs` <- `bin/framework.js`
- `src/commands/llm.mjs` <- `bin/framework.js`
- `src/commands/auth.mjs` <- `bin/framework.js`
- `src/commands/plugin.mjs` <- `bin/framework.js`
- `src/commands/templates.mjs` <- `bin/framework.js`
- `src/commands/deploy.mjs` <- `bin/framework.js`
- `src/dd/generate.mjs` <- `bin/framework.js`
- `src/dd/plugins.mjs` <- `bin/framework.js`, `src/commands/plugin.mjs`
- `src/dd/logger.mjs` <- `bin/framework.js`, `src/commands/deploy.mjs`, `src/dd/generate.mjs`
- `src/dd/version.mjs` <- `bin/framework.js`, `src/commands/templates.mjs`
- `src/dd/agent-safety.mjs` <- `bin/framework.js`
- `src/dd/integrations.mjs` <- `bin/framework.js`
- `src/dd/pull.mjs` <- `bin/framework.js`
- `src/dd/cursorrules.mjs` <- `bin/framework.js`
- `src/dd/feature-assembler.mjs` <- `bin/framework.js`
- `src/dd/env-manager.mjs` <- `bin/framework.js`
- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`
- `src/dd/recovery-guidance.mjs` <- `src/commands/llm.mjs`, `src/commands/auth.mjs`
- `src/platform/providers/impl/llm.anthropic.ts` <- `src/commands/llm.mjs`
- `src/platform/providers/impl/auth.supabase.ts` <- `src/commands/auth.mjs`
- `src/dd/registry.mjs` <- `src/commands/templates.mjs`
- `src/dd/credentials.mjs` <- `src/commands/deploy.mjs`
- `src/dd/deployment-detector.mjs` <- `src/commands/deploy.mjs`
- `src/platform/providers/impl/deploy.vercel.ts` <- `src/commands/deploy.mjs`
- `src/platform/providers/impl/deploy.netlify.ts` <- `src/commands/deploy.mjs`
- `src/platform/providers/impl/deploy.railway.ts` <- `src/commands/deploy.mjs`
- `src/dd/integration-schema.mjs` <- `src/dd/integrations.mjs`
- `src/platform/providers/llm.ts` <- `src/platform/providers/impl/llm.anthropic.ts`
- `src/platform/providers/types.ts` <- `src/platform/providers/impl/llm.anthropic.ts`, `src/platform/providers/impl/auth.supabase.ts`, `src/platform/providers/impl/deploy.vercel.ts`, `src/platform/providers/impl/deploy.netlify.ts`, `src/platform/providers/impl/deploy.railway.ts`, `src/platform/providers/llm.ts`, `src/platform/providers/auth.ts`, `src/platform/providers/deploy.ts`
- `src/platform/providers/auth.ts` <- `src/platform/providers/impl/auth.supabase.ts`
- `src/platform/providers/deploy.ts` <- `src/platform/providers/impl/deploy.vercel.ts`, `src/platform/providers/impl/deploy.netlify.ts`, `src/platform/providers/impl/deploy.railway.ts`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

