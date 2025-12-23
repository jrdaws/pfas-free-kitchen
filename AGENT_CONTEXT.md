# Agent Context - Read This First

> **Governance Version: 2.2** | Last Updated: 2025-12-22
> 
> This file provides essential context for AI agents working on the dawson-does-framework.
> **Every agent must read this file before starting work.**

---

## 🛑 MANDATORY VERIFICATION TEST

Before proceeding with ANY task, you must pass this verification. 
**Include your answers in your first response:**

### Questions (Answer All)

1. **Philosophy**: What does "export-first" mean in this project?
2. **Code Style**: What is the semicolon rule for `.mjs` files vs `.ts` files?
3. **Architecture**: Where is the main CLI entry point located?
4. **Forbidden**: Name 3 things you should NOT do.
5. **Process**: What command must you run before committing?

### Required Format
```
## Context Verification ✓
1. Export-first means: [your answer]
2. Semicolon rule: [your answer]
3. CLI entry point: [your answer]
4. Forbidden actions: [your answer]
5. Pre-commit command: [your answer]

I have read and understood AGENT_CONTEXT.md. Proceeding with task.
```

**If you cannot answer these questions, re-read this entire file before continuing.**

---

## Project Vision
Build a hybrid platform where users can prototype apps in a web UI, then export to full local ownership via a single `npx` command. Zero lock-in, unlimited customization.

## Core Philosophy
1. **Export-First**: Everything designed for local ownership
2. **Cursor-Native**: Optimized for Claude Code + Cursor workflow
3. **Zero Lock-In**: Platform is optional after export
4. **Transparency**: Explicit complexity, no magic black boxes
5. **Developer-Centric**: Built for developers, by developers

## Architecture Overview
```
dawson-does-framework/
├── bin/framework.js       # Main CLI entry point
├── src/dd/                 # Core framework modules
├── website/                # Next.js web configurator
├── templates/              # Starter templates (saas, seo-directory, etc.)
├── packages/               # Shared packages (ai-agent, deploy-engine, etc.)
└── docs/                   # Documentation
```

## Key Flows
1. **Web → Local**: User configures in web UI → saves to Supabase → `npx @jrdaws/framework pull <token>` → full project locally
2. **CLI Export**: `framework export saas ./my-app --auth supabase` → scaffolds project with integrations
3. **Development**: Open in Cursor → Claude Code assists → deploy

## Coding Standards
- **Language**: TypeScript for website, JavaScript (.mjs) for CLI
- **Style**: 2-space indent, no semicolons in .mjs, semicolons in .ts
- **AI Prompts**: Follow `docs/standards/PROMPT_STANDARDS.md` (token-optimized from start)
- **API Endpoints**: Follow `docs/standards/API_CONTRACTS.md` (use `apiError`/`apiSuccess` helpers)
- **Naming**: camelCase for functions/variables, PascalCase for components/classes
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Testing**: Node.js test runner for CLI, Playwright for E2E

## Integration Patterns
- Integrations are optional add-ons, never required
- Each integration has its own directory: `templates/{template}/integrations/{type}/{provider}/`
- Integration metadata lives in `integration.json`
- Missing env vars should warn, not error

## Error Handling
- Always provide actionable error messages
- Include recovery guidance (see `src/dd/recovery-guidance.mjs`)
- Never crash silently - log what went wrong

## Dependencies
- Minimize external dependencies
- Prefer Node.js built-ins when possible
- Pin versions in package.json

## What NOT to Do
- Don't add features not requested
- Don't refactor unrelated code
- Don't change shared configs without coordination
- Don't add console.log debugging (use logger.mjs)
- Don't commit .env files or secrets
- **Don't delete protected files** (see below)
- **Don't create feature branches** (work on `main` only)
- **Don't split fenced output** (see Fenced Output Integrity below)
- **Don't write unoptimized prompts** (see `docs/standards/PROMPT_STANDARDS.md`)
  - No "You are an expert..." role declarations
  - No "IMPORTANT/CRITICAL/NOTE" markers
  - No duplicate "Return ONLY JSON" reminders

---

## 📝 Fenced Output Integrity (CRITICAL)

**All agents MUST follow these rules when outputting code blocks, prompts, or documents.**

### The One Block Rule
1. **ONE BLOCK**: All related content goes in ONE fenced block - NEVER split
2. **NO MID-FENCE BREAKS**: Never close a fence to add explanation, then reopen
3. **COMMENTS OVER INTERRUPTIONS**: If clarification needed, use inline comments inside the fence
4. **PRE-FLIGHT CHECK**: Before closing \`\`\`, verify: "Have I included ALL the requested content?"

### Explanation Placement
- **BEFORE**: Explanations go BEFORE the opening fence
- **AFTER**: Follow-up notes go AFTER the closing fence
- **NEVER BETWEEN**: NOTHING goes between multiple fences that should be one

### Pre-Output Verification
Before outputting fenced content:
- [ ] Is this ONE continuous block?
- [ ] Does it contain EVERYTHING requested?
- [ ] Am I about to break out of the fence? (DON'T - use comments instead)

### If Content Is Too Long
1. **SAY SO EXPLICITLY** - Don't silently split
2. **ASK FIRST** - Get user confirmation before splitting
3. **LOGICAL BOUNDARIES** - If splitting, use natural boundaries (by file, by section)

---

## 🛡️ Protected Files - NEVER DELETE

The following files are **critical to project governance**. Deleting them breaks agent continuity:

| File | Purpose |
|------|---------|
| `AGENT_CONTEXT.md` | Project context and standards |
| `CLAUDE.md` | Claude Code CLI auto-context |
| `.cursorrules` | Cursor IDE auto-rules |
| `docs/GOVERNANCE_ROADMAP.md` | Governance documentation |
| `docs/standards/CODING_STANDARDS.md` | Code style reference |
| `prompts/agents/UNIVERSAL_BOOTSTRAP.md` | Agent initialization |
| `prompts/agents/roles/ROLE_PROTOCOL.md` | Agent lifecycle |
| `prompts/agents/memory/*_MEMORY.md` | Persistent agent memory |

**See `.protected-files` for the complete list.**

If you accidentally delete a protected file, restore it immediately:
```bash
git checkout HEAD -- <file-path>
```

---

## 🔀 Git Branch Policy

**All AI agents MUST work on `main` branch only.**

Why:
- Prevents branch divergence and lost work
- Keeps memory files in sync across agents
- Avoids complex merge conflicts
- Changes are immediately visible to all agents

Rules:
1. **Never create feature branches** (humans do that)
2. **Commit frequently** (after each significant change)
3. **Pull before starting**: `git pull origin main`
4. **Push after committing**: `git push origin main`

---

## ⚡ Commit Checkpoint Policy

**Commit every 15-20 minutes or after any significant change.**

Commit when:
- ✅ Completing any task in the task queue
- ✅ Updating memory files
- ✅ Creating or modifying 3+ files
- ✅ Before ending session (ALWAYS)

Commit message format:
```
<type>(<scope>): <description>

Types: feat, fix, docs, chore, test, refactor
Example: docs(agents): update CLI memory with session notes
```

---

## 🔍 Check for Active Agents (Anti-Collision)

Before starting work, check if other agents might be active:

```bash
# 1. Check recent commits (last 10 minutes = potential active agent)
git log --oneline --since="10 minutes ago"

# 2. Check for uncommitted changes
git status

# 3. Check terminal files (Cursor-specific)
ls -la ~/.cursor/projects/*/terminals/
```

**If you detect another agent may be active:**
- Coordinate tasks to avoid overlap
- Focus on different files/areas
- Commit and push frequently

---

## Before You Start

1. **Sync check** (CRITICAL - do this FIRST):
   ```bash
   git pull origin main
   git status
   git checkout HEAD -- .  # Restores any missing tracked files
   ```
2. Run `npm test` to ensure tests pass
3. Check for active agents (see above)
4. Read the specific files for your task area
5. Ask if anything is unclear

## When You're Done

1. Run `npm test` to verify
2. Run `npm run lint` if available
3. Update your memory file (`prompts/agents/memory/[ROLE]_MEMORY.md`)
4. Commit with conventional commit message
5. Push to origin: `git push origin main`
6. Note any follow-up tasks needed

---

## 🏷️ Tab Naming & Agent Identity (MANDATORY)

### Role Short Codes
| Role | Code |
|------|------|
| CLI Agent | `CLI` |
| Website Agent | `WEB` |
| Documentation Agent | `DOC` |
| Testing Agent | `TST` |
| Platform Agent | `PLT` |
| Template Agent | `TPL` |
| Integration Agent | `INT` |

### First Response Tab Suggestion
In your FIRST response, suggest a short tab name:
```
**Tab**: `[CODE] [2-3 word task]`
```
Examples: `**Tab**: \`CLI pull cmd\`` | `**Tab**: \`DOC rules\`` | `**Tab**: \`WEB auth fix\``

### Identity Declaration
**Every agent MUST end ALL responses with:**
```
([CODE] Agent)
```

Examples: `(CLI Agent)` | `(DOC Agent)` | `(WEB Agent)` | `(PLT Agent)`

This rule is non-negotiable and applies to ALL responses.

---

## 📚 Additional Resources

| Document | Purpose |
|----------|---------|
| `docs/standards/PROMPT_STANDARDS.md` | **Required** - Token-optimized AI prompt writing |
| `docs/standards/API_CONTRACTS.md` | **Required** - Standard API response formats and error handling |
| `docs/standards/CODING_STANDARDS.md` | Code style and conventions |
| `prompts/agents/UNIVERSAL_BOOTSTRAP.md` | For initializing agents on any platform |
| `prompts/agents/roles/ROLE_PROTOCOL.md` | Agent lifecycle and memory management |
| `prompts/agents/MEMORY_FORMAT.md` | Standard format for memory files (append-only) |
| `docs/CONSOLIDATION_CHECKLIST.md` | Human checklist for daily branch consolidation |
| `.protected-files` | List of files agents must never delete |

## 🛠️ Scripts for Agents

### Session Management
| Script | Usage |
|--------|-------|
| `./scripts/agent-session.sh start <role>` | Start session, display memory for continuity |
| `./scripts/agent-session.sh end <role>` | End session, verify memory updated |
| `./scripts/session-token.sh generate <role>` | Generate session token (include in first response) |
| `./scripts/session-token.sh verify <token>` | Verify agent token is correct |

### Lock & Sync
| Script | Usage |
|--------|-------|
| `./scripts/agent-lock.sh acquire <role>` | Acquire workspace lock before starting |
| `./scripts/agent-lock.sh release` | Release lock when done |
| `./scripts/agent-lock.sh status` | Check if workspace is locked |
| `./scripts/git-push-safe.sh` | Push with auto-retry on conflict |

### Validation
| Script | Usage |
|--------|-------|
| `./scripts/validate-agent-work.sh` | Validate agent followed governance rules |
| `./scripts/validate-agent-work.sh --strict` | Strict mode (fail on warnings) |
| `./scripts/install-hooks.sh` | Install git hooks (run once after clone) |

---
*Governance Version 2.0 | This context applies to all agents working on dawson-does-framework.*

