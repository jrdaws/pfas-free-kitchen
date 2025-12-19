# FRAMEWORK_MAP

Generated: (deterministic)
Hash: 542288378f

## Recent changes
- 06f5534 2025-12-18 fix(export): actually parse --template-source and --framework-version
482f673 2025-12-18 chore(map): make FRAMEWORK_MAP deterministic (no timestamp churn)
05ee343 2025-12-18 chore(test): stop auto-running framework:map during tests; add map check script
27ad00f 2025-12-18 refactor(tests): use defaults + expectFlags helpers
43c1fec 2025-12-18 test(export): include afterInstall in expected defaults
afb31e0 2025-12-18 test(export): update expectations for afterInstall + add post-export hooks module
433686d 2025-12-18 feat(export): add --after-install and run post-export hooks
7e3464b 2025-12-18 chore(dd): make patch helper dry-run by default
4f605d9 2025-12-18 chore(map): refresh FRAMEWORK_MAP
d895e50 2025-12-18 chore(dd): add after-install patch prompt helper
e1ac240 2025-12-18 fix(health): run with tsx and stabilize provider imports
26a42f3 2025-12-18 fix(cli): ensure shebang at byte 0
c39020b 2025-12-18 feat(trust): align capability engine + add caps explain/diff
6f92075 2025-12-16 Fix export: copy after-install.sh to correct output folder
2ea919b 2025-12-16 Export: include .dd/after-install.sh
ce5f6e8 2025-12-16 Export should include .dd/after-install.sh
f39b358 2025-12-16 Export should also include .dd/after-install.sh
284f892 2025-12-16 Export should include .dd/after-install.sh
c347e86 2025-12-16 Add after-install hook to seo-directory template
3be859c 2025-12-16 Add after-install hook to template
1a405f5 2025-12-16 Add post-export hook runner
46afde8 2025-12-16 Make .dd/health.sh work for framework repo and exported apps
7206c8e 2025-12-16 Add capability validation, local secrets vault, realtime scaffolding
7ce9aa1 2025-12-16 Fix package.json files list to include health, docs, and framework assets
4580560 2025-12-16 Fix npm package files list; include .dd/health.sh

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|

## Call Graph (Execution BFS)
Used for: runtime reasoning, blast-radius analysis, debugging

- `bin/framework.js`
  - `src/dd/post-export-hooks.mjs`
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`

## Dependency Tree (Structural)
Used for: onboarding, refactors, capability ownership

- `bin/framework.js`
- `├─ src/dd/post-export-hooks.mjs`
- `│  src/dd/post-export-hooks.mjs`
- `├─ scripts/orchestrator/project-config.mjs`
- `│  scripts/orchestrator/project-config.mjs`
- `└─ scripts/orchestrator/capability-engine.mjs`
- `   scripts/orchestrator/capability-engine.mjs`
- `   └─ scripts/orchestrator/project-config.mjs`
- `      scripts/orchestrator/project-config.mjs`

## Reverse graph (What depends on this file)

- `src/dd/post-export-hooks.mjs` <- `bin/framework.js`
- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

