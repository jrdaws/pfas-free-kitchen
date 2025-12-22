# Agent Role Protocol

> **Version 1.0** | How AI agents self-identify, assume roles, and maintain persistent memory.

---

## 🔄 Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW AGENT SESSION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step 1: READ CONTEXT                                                       │
│    └── cat AGENT_CONTEXT.md                                                 │
│    └── Answer 5 verification questions                                      │
│                                                                             │
│  Step 2: SELF-IDENTIFY ROLE                                                 │
│    └── Based on task/prompt, identify which of 7 roles applies              │
│    └── Announce: "I am assuming the [ROLE_NAME] role"                       │
│                                                                             │
│  Step 3: LOAD ROLE MEMORY                                                   │
│    └── cat prompts/agents/roles/[ROLE]_AGENT.md                            │
│    └── cat prompts/agents/memory/[ROLE]_MEMORY.md                          │
│    └── Read work log, active issues, current state                          │
│                                                                             │
│  Step 4: CONFIRM CONTINUITY                                                 │
│    └── State: "Last session was [DATE] by [PREVIOUS AGENT]"                │
│    └── State: "Continuing from: [LAST ACTION]"                              │
│    └── State: "Current priorities: [PRIORITIES]"                            │
│                                                                             │
│  Step 5: DO WORK                                                            │
│    └── Execute assigned tasks                                               │
│    └── Follow coding standards                                              │
│    └── Track progress                                                       │
│                                                                             │
│  Step 6: UPDATE MEMORY (CRITICAL)                                           │
│    └── Update [ROLE]_MEMORY.md with:                                        │
│        - Session entry (date, duration, summary)                            │
│        - Decisions made and reasoning                                       │
│        - New issues discovered                                              │
│        - Tasks completed                                                    │
│        - Tasks remaining                                                    │
│        - Key insights for next agent                                        │
│                                                                             │
│  Step 7: HANDOFF                                                            │
│    └── Summary of achievements                                              │
│    └── Suggestions                                                          │
│    └── Continuation prompt                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 The 7 Roles

| Role ID | Role Name | Scope | Memory File |
|---------|-----------|-------|-------------|
| `CLI` | CLI Agent | Framework CLI, commands | `CLI_MEMORY.md` |
| `WEBSITE` | Website Agent | Next.js configurator | `WEBSITE_MEMORY.md` |
| `TEMPLATE` | Template Agent | Starter templates | `TEMPLATE_MEMORY.md` |
| `INTEGRATION` | Integration Agent | Auth, payments, etc. | `INTEGRATION_MEMORY.md` |
| `DOCS` | Documentation Agent | Guides, standards | `DOCS_MEMORY.md` |
| `TESTING` | Testing Agent | Tests, coverage | `TESTING_MEMORY.md` |
| `PLATFORM` | Platform Agent | Cloud features | `PLATFORM_MEMORY.md` |

---

## 🧠 Role Self-Identification

When a new session starts, the agent must identify their role based on:

### Identification Criteria

| If the task involves... | Assume Role |
|------------------------|-------------|
| CLI commands, bin/framework.js, src/dd/ | **CLI Agent** |
| Website UI, configurator, Next.js pages | **Website Agent** |
| Template creation, template.json | **Template Agent** |
| Integrations, auth, payments, email | **Integration Agent** |
| Documentation, README, guides | **Documentation Agent** |
| Tests, coverage, E2E | **Testing Agent** |
| APIs, preview, deploy, Supabase | **Platform Agent** |

### Self-Identification Format

```markdown
## Role Identification

**Assigned Role**: [ROLE_NAME] Agent
**Reason**: [Why this role applies to the task]
**Role File**: prompts/agents/roles/[ROLE]_AGENT.md
**Memory File**: prompts/agents/memory/[ROLE]_MEMORY.md

Loading role context...
```

---

## 📁 Memory File Structure

Each role has a dedicated memory file at `prompts/agents/memory/[ROLE]_MEMORY.md`:

```markdown
# [ROLE] Agent Memory

## 🧠 Persistent Context
[Critical context that must persist across sessions]

## 📅 Session History
| Date | Duration | Agent ID | Summary |
|------|----------|----------|---------|
| 2024-12-22 | 45min | Session-1 | Implemented X, fixed Y |

## 💡 Key Decisions
| Decision | Reasoning | Date |
|----------|-----------|------|
| Used X approach | Because Y | 2024-12-22 |

## 🔍 Active Context
### Current State
[What's working, what's not]

### In Progress
[Tasks actively being worked on]

### Blocked
[What's blocked and why]

## 📋 Task Queue
### High Priority
- [ ] Task 1
- [ ] Task 2

### Medium Priority
- [ ] Task 3

### Low Priority
- [ ] Task 4

## 🐛 Known Issues
| Issue | Severity | Notes |
|-------|----------|-------|
| Issue 1 | High | Details |

## 💭 Insights for Next Agent
[Important learnings, gotchas, tips]

## 🔗 Related Files
- `path/to/file.ts` - Why it's relevant
```

---

## 📝 Memory Update Protocol

**EVERY agent MUST update their memory file before ending a session.**

### Required Updates

1. **Add Session Entry**
   ```markdown
   | 2024-12-22 | 30min | Session-X | Brief summary of work done |
   ```

2. **Record Decisions**
   ```markdown
   | Chose Approach X | Because it handles edge case Y better | 2024-12-22 |
   ```

3. **Update Task Queue**
   - Mark completed tasks with ✅
   - Add new tasks discovered
   - Reprioritize if needed

4. **Update Active Context**
   - What changed?
   - What's the new state?

5. **Add Insights**
   - What would help the next agent?
   - What gotchas should they know?

### Memory Update Command

At the end of each session, agents should update their memory file:

```bash
# The agent should edit this file with new entries
# File: prompts/agents/memory/[ROLE]_MEMORY.md
```

---

## 🚫 Role Boundaries

### No Overlap Rule

Each role has clear boundaries. If work crosses boundaries:

1. **Complete your scope first**
2. **Note the cross-boundary need in your memory file**
3. **Include handoff in your continuation prompt**
4. **Do NOT do another role's work**

### Boundary Examples

| Situation | Correct Action |
|-----------|----------------|
| CLI Agent needs UI component | Note in memory, suggest Website Agent task |
| Website Agent needs API change | Note in memory, suggest Platform Agent task |
| Template Agent needs integration | Note in memory, suggest Integration Agent task |

---

## 🔄 Session Continuity Format

When starting a session, agents must establish continuity:

```markdown
## Session Continuity

**Previous Session**: 2024-12-22, 45 minutes ago
**Previous Agent**: Completed X, Y, Z
**Last Action**: Implemented feature ABC

**Picking Up From**:
- Task in progress: [description]
- Next priority: [description]

**Session Goals**:
1. [Goal 1]
2. [Goal 2]

Proceeding with work...
```

---

## ✅ Verification Checklist

Before ending a session, verify:

- [ ] Memory file updated with session entry
- [ ] Decisions documented with reasoning
- [ ] Task queue updated (completed/new)
- [ ] Active context reflects current state
- [ ] Insights added for next agent
- [ ] Summary provided
- [ ] Suggestions provided
- [ ] Continuation prompt provided

---

*Protocol Version: 1.0 | Last Updated: 2024-12-22*

