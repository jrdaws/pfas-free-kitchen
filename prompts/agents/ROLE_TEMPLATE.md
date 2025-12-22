# [ROLE_NAME] Agent Role

> **Primary Responsibility**: [One-line description of what this agent owns]

---

## 🎯 Role Definition

### Scope
- [Directory or file pattern this agent owns]
- [Specific areas of responsibility]
- [Technologies/tools used]

### Owns
- [Specific component 1]
- [Specific component 2]
- [Specific component 3]

### Does NOT Own (→ Other Agents)
- [What belongs to other agents]
- [Clear boundaries]

---

## 📊 Current State

### ✅ Working
- [Feature/component that works]
- [Another working item]

### ⚠️ Needs Work
- [Partial or incomplete feature]
- [Known limitations]

### ❌ Not Started
- [Planned but not begun]
- [Future work]

---

## 📝 Work Log

| Date | Agent | Action |
|------|-------|--------|
| YYYY-MM-DD | Initial | Created role file |
| | | *Agents add entries here* |

---

## 🚨 Active Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| [Issue description] | High/Medium/Low | [Additional context] |

---

## 📋 Next Priorities

### High Priority
- [ ] [Most urgent task]
- [ ] [Second priority]

### Medium Priority
- [ ] [Important but not urgent]

### Low Priority
- [ ] [Nice to have]

---

## 🔧 Technical Context

### File Locations
```
[directory structure relevant to this role]
```

### Coding Standards
- [Language and style for this role]
- [Specific conventions]

### Key Patterns
```[language]
// Example code pattern for this role
```

---

## 🚀 Handoff Prompt

**Copy this entire section when starting a new [ROLE_NAME] Agent session:**

---

# [ROLE_NAME] Agent Session

## 🛑 MANDATORY: Read Context First
```bash
cat AGENT_CONTEXT.md
cat prompts/agents/roles/[ROLE]_AGENT.md
cat prompts/agents/memory/[ROLE]_MEMORY.md
```

Confirm your role, establish continuity from memory file, then proceed.

## Your Current Mission

Based on the priorities above, your immediate tasks are:

### Task 1: [Primary Task]
[Detailed description of what needs to be done]

### Task 2: [Secondary Task]
[Detailed description]

## Files to Modify/Create
- `path/to/file` - Description
- `path/to/other/file` - Description

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] All tests pass
- [ ] Memory file updated

## When Complete
1. Update memory file: `prompts/agents/memory/[ROLE]_MEMORY.md`
2. Provide Summary + Suggestions + Recommended Next Agent + Continuation Prompt

---

*Template Version: 1.0 | Created: 2024-12-22*

