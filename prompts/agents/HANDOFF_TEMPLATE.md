# Agent Handoff Template

> Copy this template when assigning work to any AI agent (Claude Code CLI, Cursor, etc.)
> Fill in the [BRACKETS] with your specific task details.

---

## 🛑 MANDATORY: Read Context First

Before doing ANY work, execute these commands and read the output:

```bash
cat AGENT_CONTEXT.md
```

You MUST pass the verification test in that file. Include your answers in your first response using this format:

```
## Context Verification ✓
1. Export-first means: [answer]
2. Semicolon rule: [answer]
3. CLI entry point: [answer]
4. Forbidden actions: [answer]
5. Pre-commit command: [answer]

I have read and understood AGENT_CONTEXT.md. Proceeding with task.
```

**DO NOT proceed until you have answered these questions.**

---

## Your Task: [TASK TITLE]

### Context
[Brief background on why this task is needed]

### Objective
[Clear statement of what needs to be accomplished]

### Files to Create/Modify
- `[path/to/file1]` - [what to do]
- `[path/to/file2]` - [what to do]

### Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] Tests pass: `npm test`
- [ ] No lint errors

### Technical Requirements
[Any specific technical constraints or patterns to follow]

### Do NOT
- [ ] Touch files outside your scope
- [ ] Add unrequested features
- [ ] Change shared configuration
- [ ] Skip the context verification

### When Complete
1. Run `npm test` and confirm passing
2. Commit with message: `[type](scope): [description]`
3. List any follow-up tasks identified

---

## Reference Information

### Useful Commands
```bash
npm test              # Run tests
npm run lint          # Check linting  
git status            # Check state
framework doctor .    # Health check
```

### Related Files
- [List files the agent should reference]

### Dependencies
- [List any tasks this depends on]
- [List any tasks depending on this]

---

*Template version: 1.0 | Updated: 2024-12-21*

