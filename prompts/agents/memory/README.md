# Agent Memory Files

> **Persistent memory for AI agents. Each role has a dedicated memory file that persists context across sessions.**

---

## 🧠 What This Is

Each AI agent role has a **memory file** that:
1. Tracks what previous agents did
2. Stores decisions and reasoning
3. Maintains a task queue
4. Provides insights for the next agent
5. Ensures **zero information loss** between sessions

## 📁 Memory Files

| Role | Memory File | Purpose |
|------|-------------|---------|
| CLI | `CLI_MEMORY.md` | CLI commands, bin/framework.js |
| Website | `WEBSITE_MEMORY.md` | Next.js configurator UI |
| Template | `TEMPLATE_MEMORY.md` | Starter templates |
| Integration | `INTEGRATION_MEMORY.md` | Auth, payments, etc. |
| Documentation | `DOCS_MEMORY.md` | Docs and guides |
| Testing | `TESTING_MEMORY.md` | Tests and coverage |
| Platform | `PLATFORM_MEMORY.md` | Cloud features, APIs |

---

## 🔄 How It Works

### New Session Starts
```
1. Agent reads AGENT_CONTEXT.md
2. Agent identifies their role
3. Agent reads their memory file
4. Agent establishes continuity with previous session
5. Agent does work
6. Agent updates memory file ← CRITICAL
7. Agent provides handoff prompt
```

### Memory Update (End of Session)

Every agent MUST update their memory file with:

1. **Session Entry**
   ```markdown
   | 2024-12-22 | 45min | Session-X | What was done |
   ```

2. **Decisions Made**
   ```markdown
   | Used approach X | Because Y reason | 2024-12-22 |
   ```

3. **Task Updates**
   - ✅ Mark completed tasks
   - Add new tasks discovered
   - Reprioritize if needed

4. **Issues Found**
   ```markdown
   | Bug description | Severity | Notes |
   ```

5. **Insights for Next Agent**
   - Gotchas to avoid
   - Tips that helped
   - Context needed

---

## 💡 Why This Matters

### Without Memory Files
```
Agent A: Does work, exits
Agent B: Starts fresh, asks same questions
Agent C: Repeats work, inconsistent decisions
→ Information loss, wasted effort, drift
```

### With Memory Files
```
Agent A: Does work, updates memory, exits
Agent B: Reads memory, continues seamlessly
Agent C: Reads memory, builds on progress
→ Zero information loss, consistent decisions
```

---

## 📝 Memory File Structure

```markdown
# [ROLE] Agent Memory

## 🧠 Persistent Context
[Critical facts that never change]

## 📅 Session History
[Chronological log of all sessions]

## 💡 Key Decisions
[Important choices and why]

## 🔍 Active Context
[Current state, in-progress, blocked]

## 📋 Task Queue
[High/medium/low priority tasks]

## 🐛 Known Issues
[Bugs and problems]

## 💭 Insights for Next Agent
[Tips, gotchas, learnings]

## 🔗 Related Files
[Key files for this role]
```

---

## ⚠️ Rules

1. **ALWAYS update** before ending a session
2. **NEVER delete** session history entries
3. **ADD** to insights, don't replace
4. **BE SPECIFIC** - vague entries don't help
5. **DATE EVERYTHING** - timestamps matter

---

## 🚀 Quick Start for Agents

```bash
# 1. Read context
cat AGENT_CONTEXT.md

# 2. Identify your role (example: CLI Agent)

# 3. Read your memory
cat prompts/agents/roles/CLI_AGENT.md
cat prompts/agents/memory/CLI_MEMORY.md

# 4. Do work...

# 5. Before ending, update memory file
# Edit: prompts/agents/memory/CLI_MEMORY.md
```

---

*Memory system created: 2024-12-22*

