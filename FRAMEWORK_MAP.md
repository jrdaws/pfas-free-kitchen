# FRAMEWORK_MAP
Generated: 2025-12-16T02:50:23.237Z
Entrypoint: `bin/framework.js`

## Legend
- 🟦 `cli.core` (free, required)
- 🟩 `capabilities.engine` (free)
- 🟠 `cost.logging` (pro, optional)
- 🟣 `figma.parse` (pro, optional)
- 🟨 `templates` (free)
- ⬜ `unknown` (free, fallback)

## Recent changes
- 2025-12-15 486ba3f Make call graph recursive BFS from bin/framework.js
- 2025-12-15 e7e8d37 Enhance FRAMEWORK_MAP: call graph + tiered capabilities + recent changes
- 2025-12-15 a5f741c Add auto-updating framework map for agents (docs/FRAMEWORK_MAP.md)
- 2025-12-15 096c196 Add auto-updating FRAMEWORK_MAP.md (repo roadmap for agents)
- 2025-12-15 ab3d212 Fix syntax error in CLI (remove extra brace)
- 2025-12-15 ee2f188 Fix CLI dispatcher so phrases/capabilities/toggle work
- 2025-12-15 3c49fba Add dynamic phrases/capabilities/toggles + optional figma + superprompt section
- 2025-12-15 b520656 Add framework function phrases + capability negotiation
- 2025-12-15 6596592 Make Figma parsing optional when env vars missing
- 2025-12-15 57341d7 Fix CLI dispatcher (framework start)
- 2025-12-15 6558946 Ignore local scratch projects (next-seo-template, test-project)
- 2025-12-15 3fe9b34 Add framework start CLI, Figma parsing, PR visual workflow, and agent cost logging
- 2025-12-15 0a40cc4 Add standardized design rules (shadcn + figma + dribbble)
- 2025-12-15 658b7b9 Add design system and UI workflow (shadcn + figma + dribbble)
- 2025-12-14 f612f6f Add multi-model orchestrator (start/follow-rules/compacting)

## Call Graph (Execution BFS)
Used for: Runtime reasoning - Blast-radius analysis - Debugging

### BFS outline (levels)
### Depth 0
- 🟦 `bin/framework.js`  _(cli.core, free)_

### Depth 1
- ⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_
- ⬜ `scripts/orchestrator/capability-engine.mjs`  _(unknown, free)_


### BFS grouped (tree-like, parent -> children, still BFS-layered)
### Depth 0 (parents grouped)
- 🟦 `bin/framework.js`  _(cli.core, free)_
  - ⬜ `scripts/orchestrator/capability-engine.mjs`  _(unknown, free)_
  - ⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_

### Depth 1 (parents grouped)
- ⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_
  - (no local imports)
- ⬜ `scripts/orchestrator/capability-engine.mjs`  _(unknown, free)_
  - ⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_


## Dependency Tree (Structural)
Used for: Onboarding - Refactors - Capability ownership

```
🟦 `bin/framework.js`  _(cli.core, free)_
⬜ `scripts/orchestrator/capability-engine.mjs`  _(unknown, free)_
⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_
⬜ `scripts/orchestrator/project-config.mjs`  _(unknown, free)_
↩︎ (already shown above)
```

## Reverse graph (what depends on this file)

- 🟦 `bin/framework.js`
  - (no dependents)
- ⬜ `scripts/orchestrator/capability-engine.mjs`
  - 🟦 `bin/framework.js`
- ⬜ `scripts/orchestrator/project-config.mjs`
  - 🟦 `bin/framework.js`
  - ⬜ `scripts/orchestrator/capability-engine.mjs`
