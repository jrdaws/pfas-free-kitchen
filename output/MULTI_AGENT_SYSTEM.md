# Multi-Agent Collaboration System

> **Version:** 1.0
> **Created:** 2025-12-22
> **Purpose:** Enable parallel AI agent work with file-based communication

---

## System Overview

This system enables multiple AI agents to work on the dawson-does-framework in parallel by using a file-based communication protocol. Each agent has dedicated folders for input/output, and a shared folder for cross-agent coordination.

---

## Folder Structure

```
output/
├── MULTI_AGENT_SYSTEM.md          # This file - system documentation
├── COORDINATION_PROTOCOL.md       # How agents coordinate
├── shared/                        # Cross-agent communication
│   ├── inbox/                     # Tasks for any available agent
│   ├── outbox/                    # Completed work announcements
│   └── workspace/                 # Shared working documents
│
├── cli-agent/
│   ├── inbox/                     # Tasks assigned to CLI Agent
│   ├── outbox/                    # CLI Agent's completed work
│   └── workspace/                 # CLI Agent's working files
│
├── website-agent/
│   ├── inbox/                     # Tasks assigned to Website Agent
│   ├── outbox/                    # Website Agent's completed work
│   └── workspace/                 # Website Agent's working files
│
├── platform-agent/
│   ├── inbox/                     # Tasks assigned to Platform Agent
│   ├── outbox/                    # Platform Agent's completed work
│   └── workspace/                 # Platform Agent's working files
│
├── testing-agent/
│   ├── inbox/                     # Tasks assigned to Testing Agent
│   ├── outbox/                    # Testing Agent's completed work
│   └── workspace/                 # Testing Agent's working files
│
├── template-agent/
│   ├── inbox/                     # Tasks assigned to Template Agent
│   ├── outbox/                    # Template Agent's completed work
│   └── workspace/                 # Template Agent's working files
│
├── integration-agent/
│   ├── inbox/                     # Tasks assigned to Integration Agent
│   ├── outbox/                    # Integration Agent's completed work
│   └── workspace/                 # Integration Agent's working files
│
└── documentation-agent/
    ├── inbox/                     # Tasks assigned to Documentation Agent
    ├── outbox/                    # Documentation Agent's completed work
    └── workspace/                 # Documentation Agent's working files
```

---

## Folder Purposes

### inbox/
- Contains task assignment files (`.txt` or `.md`)
- Agent reads these at session start
- Files named: `YYYYMMDD-HHMM-task-name.txt`
- Once processed, move to `workspace/` or delete

### outbox/
- Agent writes completion reports here
- Handoff prompts for other agents
- Files named: `YYYYMMDD-HHMM-completion-task-name.txt`
- Other agents can read to understand what was done

### workspace/
- Working documents, notes, drafts
- Agent-specific context that persists between sessions
- Can contain partial work, research notes, etc.

### shared/
- Cross-agent coordination
- `shared/inbox/` - Tasks that any agent can pick up
- `shared/outbox/` - Announcements visible to all agents
- `shared/workspace/` - Shared context documents

---

## Agent Domains (Reference)

| Agent | Primary Domain | Secondary Concerns |
|-------|---------------|-------------------|
| **CLI Agent** | `bin/framework.js`, `src/dd/`, `src/commands/` | Error handling, logging |
| **Website Agent** | `website/`, Next.js app | UI/UX, API routes |
| **Platform Agent** | `packages/`, API optimization | Token costs, streaming |
| **Testing Agent** | `tests/`, CI/CD, Playwright | Quality assurance |
| **Template Agent** | `templates/`, `template.json` | Starter templates |
| **Integration Agent** | Provider implementations | Auth, payments, deploy |
| **Documentation Agent** | `docs/`, `*.md`, governance | Standards, guides |

---

## File Naming Convention

```
YYYYMMDD-HHMM-[priority]-[type]-[description].txt

Priority: P0 (critical), P1 (high), P2 (medium), P3 (low)
Type: task, handoff, completion, blocker, question

Examples:
- 20251222-1430-P1-task-implement-streaming.txt
- 20251222-1530-P2-completion-streaming-done.txt
- 20251222-1600-P0-blocker-api-rate-limit.txt
- 20251222-1615-P1-handoff-needs-testing.txt
```

---

## Quick Start for Agents

### Starting a Session

1. **Check your inbox:**
   ```
   ls output/[your-agent]/inbox/
   ```

2. **Check shared inbox:**
   ```
   ls output/shared/inbox/
   ```

3. **Read any task files and begin work**

### Ending a Session

1. **Write completion report to your outbox:**
   ```
   output/[your-agent]/outbox/YYYYMMDD-HHMM-completion-[task].txt
   ```

2. **If handoff needed, write to target agent's inbox:**
   ```
   output/[target-agent]/inbox/YYYYMMDD-HHMM-P1-handoff-[task].txt
   ```

3. **Update your memory file as usual:**
   ```
   prompts/agents/memory/[ROLE]_MEMORY.md
   ```

---

## Integration with Existing System

This output folder system **supplements** (not replaces) the existing governance:

| System | Purpose | Location |
|--------|---------|----------|
| **Memory Files** | Long-term agent history | `prompts/agents/memory/` |
| **Role Files** | Agent capabilities/boundaries | `prompts/agents/roles/` |
| **Output Folders** | Real-time task coordination | `output/[agent]/` |
| **Governance** | Rules and standards | `AGENT_CONTEXT.md`, `.cursorrules` |

---

## See Also

- `COORDINATION_PROTOCOL.md` - Detailed protocols
- `shared/workspace/PROJECT_STATUS.md` - Current project state
- Individual agent `inbox/` folders for current tasks


