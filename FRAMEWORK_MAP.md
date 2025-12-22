# FRAMEWORK_MAP

Generated: (deterministic)
Hash: dd6ce1c0d2

## Recent changes
- 47889c7 2025-12-22 docs(governance): create Documentation Agent memory file
- 921f61c 2025-12-22 docs(governance): add comprehensive governance and standards documentation
- 98af1c4 2025-12-22 docs(agents): update Template Agent memory with responsive design session
- 472d98b 2025-12-22 feat(templates): add comprehensive responsive breakpoints to all templates
- 4eb2b52 2025-12-22 fix(templates): update blog template for Next.js 15 async params
- ada33cd 2025-12-22 chore: update Next.js types and fix E2E test selectors
- 1fcdcc4 2025-12-22 chore(templates): standardize dependencies across saas and seo-directory
- 2efa50e 2025-12-22 docs(agents): update Template Agent memory with dark mode session
- dce6da7 2025-12-22 feat(website): improve configurator and add E2E tests
- bb5dab3 2025-12-22 chore(templates): update seo-directory Next.js types
- ea01403 2025-12-22 feat(templates): add dark mode support to all templates
- 00dd8d3 2025-12-22 feat(templates): add dark mode support to blog, dashboard, and landing-page
- 1c4406c 2025-12-22 docs(agents): update agent memory files with recent sessions
- ad7bd61 2025-12-22 docs(cli): update CLI memory with API format update session
- 9052da5 2025-12-22 feat(cli): update pull command to support new standardized API format
- 1e7811d 2025-12-22 docs: create CONTRIBUTING.md with comprehensive CLI patterns documentation
- 942d8bb 2025-12-22 feat(cli): add standardized error helper functions to logger
- b83a654 2025-12-22 docs(readme): add Projects API documentation section
- 527e4e6 2025-12-22 docs(agents): update Template Agent memory with saas fix session
- d6893be 2025-12-22 fix(templates): exclude integrations from saas template build
- 5926740 2025-12-22 feat(cli): add help flag support to export command and fix help text output
- 20a9f0a 2025-12-22 docs(cli): add CLI commands consistency audit to memory
- 3539df2 2025-12-22 docs(api): fix Projects API documentation inconsistencies
- 55fabd7 2025-12-22 fix(tests): make environment-dependent tests more resilient
- 47308e7 2025-12-22 docs(cli): update CLI memory with documentation enhancement session

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
  - `src/dd/plugins.mjs`
  - `src/dd/logger.mjs`
  - `src/dd/version.mjs`
  - `src/dd/agent-safety.mjs`
  - `src/dd/integrations.mjs`
  - `src/dd/pull.mjs`
  - `src/dd/cursorrules.mjs`
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
- `src/dd/plugins.mjs` <- `bin/framework.js`, `src/commands/plugin.mjs`
- `src/dd/logger.mjs` <- `bin/framework.js`
- `src/dd/version.mjs` <- `bin/framework.js`, `src/commands/templates.mjs`
- `src/dd/agent-safety.mjs` <- `bin/framework.js`
- `src/dd/integrations.mjs` <- `bin/framework.js`
- `src/dd/pull.mjs` <- `bin/framework.js`
- `src/dd/cursorrules.mjs` <- `bin/framework.js`
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

