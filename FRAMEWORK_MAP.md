# FRAMEWORK_MAP

Generated: (deterministic)
Hash: a5b61bc06d

## Recent changes
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
- f0220dd 2025-12-18 fix(health): ensure correct argument handling in has_script function
- f9b9d5a 2025-12-18 fix(health): correct argument index for script name in has_script function
- ed09ee6 2025-12-18 refactor(framework): remove after-install prompt and enhance capability logging
- d749c18 2025-12-18 refactor: enhance captureRepoAdditions to return commits and status
- cd87d1f 2025-12-18 chore: update framework map and fix localDir typo
- 97e7a25 2025-12-18 chore(ci): add seo-directory smoke test job
- 56bb214 2025-12-18 feat(templates): add ready signal to saas and seo-directory page components
- 06c6762 2025-12-18 chore: add handoff tooling and move network tests
- 1301cf8 2025-12-18 fix(map): normalize Recent changes bullets and handle multiline entries
- 51fe7d7 2025-12-18 chore(templates): add after-install.sh to saas template
- 23d4b34 2025-12-18 chore(ci): add GitHub Actions workflow for tests and smoke

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
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`
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
- `│  └─ src/platform/providers/impl/auth.supabase.ts`
- `│     src/platform/providers/impl/auth.supabase.ts`
- `│     ├─ src/platform/providers/auth.ts`
- `│     │  src/platform/providers/auth.ts`
- `│     │  └─ src/platform/providers/types.ts`
- `│     │     src/platform/providers/types.ts`
- `│     └─ src/platform/providers/types.ts`
- `│        src/platform/providers/types.ts`
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
- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`
- `src/platform/providers/impl/llm.anthropic.ts` <- `src/commands/llm.mjs`
- `src/platform/providers/impl/auth.supabase.ts` <- `src/commands/auth.mjs`
- `src/platform/providers/llm.ts` <- `src/platform/providers/impl/llm.anthropic.ts`
- `src/platform/providers/types.ts` <- `src/platform/providers/impl/llm.anthropic.ts`, `src/platform/providers/impl/auth.supabase.ts`, `src/platform/providers/llm.ts`, `src/platform/providers/auth.ts`
- `src/platform/providers/auth.ts` <- `src/platform/providers/impl/auth.supabase.ts`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

