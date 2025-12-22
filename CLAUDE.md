# CLAUDE.md - Automatic Context for Claude Code CLI

> **This file is automatically read by Claude Code CLI when starting a session in this project.**

## 🛑 MANDATORY FIRST STEP

Before responding to ANY prompt or doing ANY work, you MUST:

1. **Read the governing documents:**
   ```bash
   cat AGENT_CONTEXT.md
   ```

2. **Confirm understanding by stating:**
   - The project's core philosophy (export-first, zero lock-in)
   - The coding standards for your task area
   - What you should NOT do

3. **Only then proceed** with the user's request.

If you skip this step, your work may be rejected for not following project standards.

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

*This file is loaded automatically by Claude Code CLI. For full context, see AGENT_CONTEXT.md.*

