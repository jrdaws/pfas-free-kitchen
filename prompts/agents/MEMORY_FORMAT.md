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
5. **5 Categories**: Every session captures the 5 distillation categories

---

## The 5 Distillation Categories

Every checkpoint/session entry MUST consider these 5 categories:

| # | Category | What to Save | When | Required? |
|---|----------|--------------|------|-----------|
| 1 | **📋 OPERATIONAL** | Tasks, decisions, files changed | Every session | ✅ ALWAYS |
| 2 | **📊 METRICS** | Duration, task count, errors | Every session | ✅ ALWAYS |
| 3 | **🔄 PATTERNS** | Recurring errors, common questions | When count ≥2 | 🟡 If applicable |
| 4 | **💡 INSIGHTS** | Commands, gotchas, workarounds | When novel | 🟡 If applicable |
| 5 | **🤝 RELATIONSHIPS** | Handoffs, agent coordination | When new | 🟡 If applicable |

### Why These Categories?

- **Operational**: Core work tracking - what happened
- **Metrics**: Performance tracking - how long, how much
- **Patterns**: SOP candidates - repeated issues need process
- **Insights**: Knowledge capture - don't re-learn lessons
- **Relationships**: Coordination - how agents work together

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
4. Use this template with the **5 Distillation Categories**:

```markdown
### Session [ROLE]-[XXX] - [YYYY-MM-DD HH:MM]

#### 📋 OPERATIONAL (Required)
- **Tasks**: [What you completed]
- **Decision**: [Key decision]: [Reasoning]
- **Files**: [Key files changed]
- **Outcome**: completed | partial | blocked

#### 📊 METRICS (Required)
- **Duration**: [X] minutes
- **Tasks Completed**: [N]
- **Errors**: [N]

#### 🔄 PATTERNS (If count ≥2)
- [Recurring issue]: [How often seen]

#### 💡 INSIGHTS (If novel)
- [Useful command/gotcha discovered]

#### 🤝 RELATIONSHIPS (If new)
- [Handoff to/from agent] or [Dependency discovered]

---
```

5. Update the "Last Updated" timestamp at the top
6. Increment the "Session Count"

### Quick Category Checklist

Before finishing your entry, ask yourself:
- □ **OPERATIONAL**: What did I do? What did I decide?
- □ **METRICS**: How long? How many tasks? Any errors?
- □ **PATTERNS**: Did I see this issue before?
- □ **INSIGHTS**: Did I learn something useful?
- □ **RELATIONSHIPS**: Did I coordinate with another agent?

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

