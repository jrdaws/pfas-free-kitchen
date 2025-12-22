# CLAUDE.md - Automatic Context for Claude Code CLI

> **Governance Version: 2.0** | Last Updated: 2025-12-22
> 
> **This file is automatically read by Claude Code CLI when starting a session in this project.**

## 🛑 MANDATORY FIRST STEPS (Do ALL Before Any Work)

### Step 0: Sync Check (CRITICAL - Do This FIRST)

Before ANYTHING else, ensure your working directory is in sync:

```bash
# Pull latest changes
git pull origin main

# Check for uncommitted changes or missing files
git status

# Restore any missing tracked files
git checkout HEAD -- .

# Check if other agents might be active (commits in last 10 min)
git log --oneline --since="10 minutes ago"
```

**If you see recent commits from other agents**: Coordinate to avoid file conflicts.

### Step 1: Read Governing Documents

```bash
cat AGENT_CONTEXT.md
```

### Step 2: Confirm Understanding

State in your response:
- The project's core philosophy (export-first, zero lock-in)
- The coding standards for your task area
- What you should NOT do (including protected files)

### Step 3: Proceed with Work

Only after completing Steps 0-2, proceed with the user's request.

**If you skip these steps, your work may be rejected for not following project standards.**

---

## Project: Dawson-Does Framework

A hybrid platform for building web apps with a visual configurator, then exporting to full local ownership.

### Core Philosophy
1. **Export-First** - Everything designed for local ownership
2. **Zero Lock-In** - Platform is optional after export
3. **Cursor-Native** - Optimized for Claude + Cursor workflow
4. **Transparency** - No magic, explicit complexity
5. **Fail Gracefully** - Helpful errors with recovery guidance

### Quick Reference

| Area | Location | Language |
|------|----------|----------|
| CLI | `bin/framework.js` | JavaScript ESM |
| Core modules | `src/dd/*.mjs` | JavaScript ESM |
| Website | `website/` | TypeScript + Next.js 15 |
| Templates | `templates/` | TypeScript + Next.js |
| Packages | `packages/` | TypeScript |

### Coding Standards
- **JavaScript (.mjs)**: No semicolons, 2-space indent
- **TypeScript (.ts/.tsx)**: Semicolons, 2-space indent
- **Commits**: Conventional format (`feat:`, `fix:`, `docs:`, `chore:`)
- **Tests**: Run `npm test` before committing

### Key Commands
```bash
npm test                    # Run tests
npm run lint                # Check linting
framework doctor .          # Health check
framework export saas ./app # Export template
framework pull <token>      # Pull from platform
```

### What NOT To Do
- ❌ Add features not requested
- ❌ Refactor unrelated code
- ❌ Change shared configs without coordination
- ❌ Skip reading AGENT_CONTEXT.md
- ❌ Commit .env files or secrets
- ❌ Use console.log for debugging (use logger.mjs)
- ❌ **Delete protected files** (see `.protected-files`)
- ❌ **Create feature branches** (always work on `main`)
- ❌ **Skip the sync check** (Step 0 above)

### Important Files
- `AGENT_CONTEXT.md` - Full context (READ THIS)
- `FRAMEWORK_MAP.md` - Architecture and dependencies
- `.cursorrules` - Cursor-specific rules
- `bin/framework.js` - Main CLI entry point

---

## Verification Checkpoint

Before starting work, confirm you can answer:

1. What is the export-first philosophy?
2. What language/style is used for CLI code?
3. What command runs tests?
4. What should you NOT do?

If you cannot answer these, re-read AGENT_CONTEXT.md.

---

## 🏁 Before Ending Your Session

**ALWAYS do these before ending:**

1. **Run tests**: `npm test`
2. **Commit your work**:
   ```bash
   git add -A
   git commit -m "<type>(<scope>): <description>"
   ```
3. **Push to origin**: `git push origin main`
4. **Update memory file** (if applicable): `prompts/agents/memory/[ROLE]_MEMORY.md`

**Never leave uncommitted work** - the next agent won't see it!

---

## 🛡️ Protected Files

Some files are critical and must **NEVER be deleted**:
- `AGENT_CONTEXT.md`, `CLAUDE.md`, `.cursorrules`
- All files in `prompts/agents/memory/`
- All files in `prompts/agents/roles/`
- `docs/standards/*`

See `.protected-files` for the complete list.

If you accidentally delete one, restore immediately:
```bash
git checkout HEAD -- <file-path>
```

---

*This file is loaded automatically by Claude Code CLI. For full context, see AGENT_CONTEXT.md.*

