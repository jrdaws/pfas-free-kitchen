# Agent Memory File Format

> **Version: 1.0** | Last Updated: 2025-12-22

This document defines the standard format for agent memory files.
All agents MUST follow this format to prevent conflicts and ensure continuity.

---

## Core Principles

1. **Append-Only**: New entries go at TOP, never overwrite existing content
2. **Timestamped**: Every entry has ISO timestamp
3. **Structured**: Use consistent section headers
4. **Bounded**: Archive entries older than 30 days

---

## File Structure

```markdown
# [ROLE] Agent Memory

> **Version**: 1.0
> **Last Updated**: [ISO timestamp]
> **Session Count**: [number]

---

## 📅 Recent Sessions (Newest First)

### Session [ID] - [Date]
- **Duration**: [time]
- **Task**: [brief description]
- **Outcome**: [completed/partial/blocked]
- **Key Changes**:
  - [change 1]
  - [change 2]
- **Decisions Made**:
  - [decision]: [reasoning]
- **Next Steps**:
  - [step 1]

---

## 🔍 Active Context

### Current State
- [status item 1]
- [status item 2]

### In Progress
- [task 1]

### Blocked
- [blocker 1]

---

## 📋 Task Queue

### High Priority
- [ ] [task 1]
- [x] [completed task]

### Medium Priority
- [ ] [task 2]

---

## 🐛 Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| [issue] | High/Medium/Low | [details] |

---

## 💭 Insights for Next Agent

1. [insight 1]
2. [insight 2]

---

## 📜 Archived Sessions

<details>
<summary>Sessions older than 30 days (click to expand)</summary>

### Session [OLD-ID] - [Date]
- [summary]

</details>

---

*Memory Version 1.0 | Format: Append-Only*
```

---

## How to Add a New Session Entry

1. Open your memory file: `prompts/agents/memory/[ROLE]_MEMORY.md`
2. Find the "## 📅 Recent Sessions" section
3. Add your new entry **immediately after** the section header (before older entries)
4. Use this template:

```markdown
### Session [ROLE]-[XXX] - [YYYY-MM-DD]
- **Duration**: [X]min
- **Task**: [What you worked on]
- **Outcome**: completed | partial | blocked
- **Key Changes**:
  - [File/feature changed]
- **Decisions Made**:
  - [Decision]: [Why]
- **Next Steps**:
  - [What should happen next]

---
```

5. Update the "Last Updated" timestamp at the top
6. Increment the "Session Count"

---

## Conflict Prevention Rules

1. **Never delete existing entries** - Only add new ones
2. **Never edit old session entries** - Add corrections as new entries
3. **Use unique session IDs** - Format: `[ROLE]-[XXX]` (e.g., CLI-042)
4. **Timestamp everything** - ISO format: YYYY-MM-DD HH:MM:SS
5. **Keep entries concise** - 10 lines max per session

---

## Archiving Old Sessions

When the "Recent Sessions" section exceeds 20 entries:

1. Move entries older than 30 days to "Archived Sessions"
2. Wrap archived content in `<details>` tags
3. Keep only summary for archived sessions

---

## Memory File Locations

| Role | File |
|------|------|
| CLI | `prompts/agents/memory/CLI_MEMORY.md` |
| Website | `prompts/agents/memory/WEBSITE_MEMORY.md` |
| Template | `prompts/agents/memory/TEMPLATE_MEMORY.md` |
| Integration | `prompts/agents/memory/INTEGRATION_MEMORY.md` |
| Documentation | `prompts/agents/memory/DOCUMENTATION_MEMORY.md` |
| Testing | `prompts/agents/memory/TESTING_MEMORY.md` |
| Platform | `prompts/agents/memory/PLATFORM_MEMORY.md` |

---

*This format ensures lossless memory across agent sessions.*

