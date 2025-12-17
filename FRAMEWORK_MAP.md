# FRAMEWORK_MAP

Generated: 2025-12-17T02:22:59.957Z
Hash: 01e6fa6159

## Recent changes
- f39b358 2025-12-16 Export should also include .dd/after-install.sh
284f892 2025-12-16 Export should include .dd/after-install.sh
c347e86 2025-12-16 Add after-install hook to seo-directory template
3be859c 2025-12-16 Add after-install hook to template
1a405f5 2025-12-16 Add post-export hook runner
46afde8 2025-12-16 Make .dd/health.sh work for framework repo and exported apps
7206c8e 2025-12-16 Add capability validation, local secrets vault, realtime scaffolding
7ce9aa1 2025-12-16 Fix package.json files list to include health, docs, and framework assets
4580560 2025-12-16 Fix npm package files list; include .dd/health.sh
938f70a 2025-12-16 Export: include .dd/health.sh in exported repos
e1f5348 2025-12-15 Add agent feedback loop docs + improve export args test
4aafcdb 2025-12-15 Ignore npm pack tgz artifacts
835d6dc 2025-12-15 Fix CLI: remove execa dependency; use spawnSync for doctor/map/scripts
d0f1e14 2025-12-15 Add global map auto-refresh + framework doctor command
d924d8e 2025-12-15 Fix CLI: don’t call main() eagerly; use unified dispatcher
083a9a7 2025-12-15 Refactor entitlements into pure canCore + thin wrapper
2f464d4 2025-12-15 Fix entitlements can() imports + restrict test discovery
062a36c 2025-12-15 Add repo-audit + provider registry + usage budgets + entitlements tests
f33ebba 2025-12-15 Add repo health script
e66266a 2025-12-15 Auto-refresh FRAMEWORK_MAP on capabilities/phrases
7558ac8 2025-12-15 Ignore backup files
140e1b8 2025-12-15 Fix framework-map recentChanges + remove duplicate dispatcher block
6ffa4d1 2025-12-15 Add optional Google/Meta/Apple integration scaffolding + capabilities
3745882 2025-12-15 Update framework map + hooks
404f57f 2025-12-15 Update husky hook header for v10 compatibility

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|

## Call Graph (Execution BFS)
Used for: runtime reasoning, blast-radius analysis, debugging

- `bin/framework.js`
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`

## Dependency Tree (Structural)
Used for: onboarding, refactors, capability ownership

- `bin/framework.js`
- `├─ scripts/orchestrator/project-config.mjs`
- `│  scripts/orchestrator/project-config.mjs`
- `└─ scripts/orchestrator/capability-engine.mjs`
- `   scripts/orchestrator/capability-engine.mjs`
- `   └─ scripts/orchestrator/project-config.mjs`
- `      scripts/orchestrator/project-config.mjs`

## Reverse graph (What depends on this file)

- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

