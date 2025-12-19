# FRAMEWORK_MAP

Generated: (deterministic)
Hash: 542288378f

## Recent changes
- beed865 2025-12-18 chore(template): include TypeScript devDependencies to avoid first-run mutation
a8a50aa 2025-12-18 chore(template): bump Next.js to patched version
4d73d98 2025-12-18 fix(export): define resolved in cmdExport; dry-run reflects local/remote resolution
1dbd3a8 2025-12-18 fix(export): honor local template source and copy templates from disk
1b8e681 2025-12-18 feat(template): make saas template runnable (Next.js dev/build/start)
95c5870 2025-12-18 feat(export): resolve template source (local/remote/auto) + version pinning
06f5534 2025-12-18 fix(export): actually parse --template-source and --framework-version
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

