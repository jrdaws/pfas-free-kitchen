# FRAMEWORK_MAP

Generated: (deterministic)
Hash: 7c67fd4d5c

## Recent changes
- ed09ee6 2025-12-18 refactor(framework): remove after-install prompt and enhance capability logging
- d749c18 2025-12-18 refactor: enhance captureRepoAdditions to return commits and status
- cd87d1f 2025-12-18 chore: update framework map and fix localDir typo
- 97e7a25 2025-12-18 chore(ci): add seo-directory smoke test job
- 56bb214 2025-12-18 feat(templates): add ready signal to saas and seo-directory page components
- 06c6762 2025-12-18 chore: add handoff tooling and move network tests
- 1301cf8 2025-12-18 fix(map): normalize Recent changes bullets and handle multiline entries
- 51fe7d7 2025-12-18 chore(templates): add after-install.sh to saas template
- 23d4b34 2025-12-18 chore(ci): add GitHub Actions workflow for tests and smoke
- db43ff5 2025-12-18 fix(cli): improve demo command UX and update templates list
- def1e12 2025-12-18 feat(hooks): add TTY detection for non-interactive environments
- 161197a 2025-12-18 feat(manifest): add template manifest system with SHA256 verification
- ec7097f 2025-12-18 test(map): guard Recent changes bullets + single-line entries
- 5407c0a 2025-12-18 chore(template): make tsconfig deterministic for Next (avoid first-run rewrite)
- beed865 2025-12-18 chore(template): include TypeScript devDependencies to avoid first-run mutation
- a8a50aa 2025-12-18 chore(template): bump Next.js to patched version
- 4d73d98 2025-12-18 fix(export): define resolved in cmdExport; dry-run reflects local/remote resolution
- 1dbd3a8 2025-12-18 fix(export): honor local template source and copy templates from disk
- 1b8e681 2025-12-18 feat(template): make saas template runnable (Next.js dev/build/start)
- 95c5870 2025-12-18 feat(export): resolve template source (local/remote/auto) + version pinning
- 06f5534 2025-12-18 fix(export): actually parse --template-source and --framework-version
- 482f673 2025-12-18 chore(map): make FRAMEWORK_MAP deterministic (no timestamp churn)
- 05ee343 2025-12-18 chore(test): stop auto-running framework:map during tests; add map check script
- 27ad00f 2025-12-18 refactor(tests): use defaults + expectFlags helpers
- 43c1fec 2025-12-18 test(export): include afterInstall in expected defaults

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|

## Call Graph (Execution BFS)
Used for: runtime reasoning, blast-radius analysis, debugging

- `bin/framework.js`
  - `src/dd/post-export-hooks.mjs`
  - `src/dd/manifest.mjs`
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`

## Dependency Tree (Structural)
Used for: onboarding, refactors, capability ownership

- `bin/framework.js`
- `├─ src/dd/post-export-hooks.mjs`
- `│  src/dd/post-export-hooks.mjs`
- `├─ src/dd/manifest.mjs`
- `│  src/dd/manifest.mjs`
- `├─ scripts/orchestrator/project-config.mjs`
- `│  scripts/orchestrator/project-config.mjs`
- `└─ scripts/orchestrator/capability-engine.mjs`
- `   scripts/orchestrator/capability-engine.mjs`
- `   └─ scripts/orchestrator/project-config.mjs`
- `      scripts/orchestrator/project-config.mjs`

## Reverse graph (What depends on this file)

- `src/dd/post-export-hooks.mjs` <- `bin/framework.js`
- `src/dd/manifest.mjs` <- `bin/framework.js`
- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

