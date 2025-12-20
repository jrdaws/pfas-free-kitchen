# FRAMEWORK_MAP

Generated: (deterministic)
Hash: 6d67cca890

## Recent changes
- d026157 2025-12-19 feat(cli): add failure recovery guidance
- 3639d8c 2025-12-19 feat(cli): add structured step logging with timing
- 2158038 2025-12-19 feat(cli): comprehensive --dry-run output
- 7039463 2025-12-19 Merge pull request: feat: Add LLM (Anthropic) and Auth (Supabase) providers
- 809fda1 2025-12-19 refactor(framework): streamline compliance message logic for clarity
- 3198864 2025-12-19 refactor(framework): enhance compliance message to display highest required tier
- 8a327d0 2025-12-19 fix(framework): improve compliance message for capability violations
- 39c2fcf 2025-12-19 feat(cli): add framework auth test command
- 517f1d9 2025-12-19 test(auth): add comprehensive Supabase auth provider tests
- 9c98e21 2025-12-19 feat(auth): implement Supabase auth provider with health checks
- c7ac391 2025-12-19 chore(deps): add @supabase/supabase-js for auth provider
- d76de9d 2025-12-19 feat(cli): add framework llm test command
- 91df16c 2025-12-19 test(llm): add comprehensive Anthropic provider tests
- 48305af 2025-12-19 feat(llm): implement Anthropic LLM provider with health checks
- 7156b54 2025-12-19 chore(deps): add @anthropic-ai/sdk for LLM provider
- 52a3ab7 2025-12-19 test(billing): add comprehensive Stripe provider tests
- 3f06deb 2025-12-19 feat(billing): implement Stripe billing provider
- a5b2cdb 2025-12-19 feat(config): add Stripe environment variables to schema
- c8e5c9b 2025-12-19 chore(deps): add stripe npm package for billing provider
- 3c9b9ef 2025-12-19 test(matrix): add matrix smoke test script for all templates
- ab239db 2025-12-19 feat(compliance): add plan compliance checking
- 62d1744 2025-12-19 feat(capabilities): add conflict detection and composition rules
- fa6eeca 2025-12-19 feat(drift): add drift detection command
- 7837f13 2025-12-18 feat(config): add plan file schema validation
- 842c59e 2025-12-18 feat(framework): enhance command options and argument handling

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
  - `src/dd/logger.mjs`
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`
    - `src/dd/recovery-guidance.mjs`
    - `src/platform/providers/impl/llm.anthropic.ts`
    - `src/platform/providers/impl/auth.supabase.ts`
      - `src/platform/providers/llm.ts`
      - `src/platform/providers/types.ts`
      - `src/platform/providers/auth.ts`

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
- `├─ src/dd/logger.mjs`
- `│  src/dd/logger.mjs`
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
- `src/dd/logger.mjs` <- `bin/framework.js`
- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`
- `src/dd/recovery-guidance.mjs` <- `src/commands/llm.mjs`, `src/commands/auth.mjs`
- `src/platform/providers/impl/llm.anthropic.ts` <- `src/commands/llm.mjs`
- `src/platform/providers/impl/auth.supabase.ts` <- `src/commands/auth.mjs`
- `src/platform/providers/llm.ts` <- `src/platform/providers/impl/llm.anthropic.ts`
- `src/platform/providers/types.ts` <- `src/platform/providers/impl/llm.anthropic.ts`, `src/platform/providers/impl/auth.supabase.ts`, `src/platform/providers/llm.ts`, `src/platform/providers/auth.ts`
- `src/platform/providers/auth.ts` <- `src/platform/providers/impl/auth.supabase.ts`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

