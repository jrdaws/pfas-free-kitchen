# Memory Update Protocol

> **Version 1.0** | When, what, and how to update memory files.

---

## 🎯 The Core Problem

AI agents don't know when a session will end. "Before ending" is vague. This document defines **concrete triggers** for memory updates.

---

## ⏰ When to Update Memory

### Trigger-Based Updates (Not Time-Based)

Update your memory file when ANY of these occur:

| Trigger | Example | Update Contains |
|---------|---------|-----------------|
| **Task Completed** | Finished implementing feature | Task marked done, what was done |
| **Major Decision Made** | Chose approach X over Y | Decision + reasoning |
| **Blocker Encountered** | Can't proceed without API change | Blocker description, who to notify |
| **Significant Discovery** | Found existing code that helps | What was found, implications |
| **Before Handoff** | Need to pass to another agent | Full context for next agent |
| **Error/Bug Found** | Discovered test failure | Error details, reproduction steps |
| **Milestone Reached** | First successful test | What milestone, current state |

### The "Checkpoint" Rule

**Update memory every time you would tell a colleague "let me save my work."**

In practice, this means:
- After completing each discrete task
- After making a decision that affects future work
- Before moving to a different area of code
- When you've learned something important

### NOT a Trigger

Do NOT update memory for:
- Every small code change
- Trivial observations
- Things that are obvious from the code
- Routine operations (running tests, linting)

---

## 📊 Significance Criteria

### What Goes in Memory (Significant)

| Category | Include | Example |
|----------|---------|---------|
| **Decisions** | Choices with reasoning | "Used edge functions because lower latency" |
| **Completions** | Tasks finished | "✅ Stripe webhooks complete" |
| **Blockers** | Things preventing progress | "Need Platform Agent to add API endpoint" |
| **Discoveries** | Non-obvious findings | "Found existing util that handles this" |
| **Changes** | What changed and why | "Refactored to support new flag" |
| **Warnings** | Things next agent should know | "Don't modify X without updating Y" |
| **Patterns** | Reusable approaches | "This pattern works well for this case" |

### What Doesn't Go in Memory (Insignificant)

| Category | Skip | Why |
|----------|------|-----|
| **Routine Operations** | "Ran npm test" | Obvious from workflow |
| **Small Edits** | "Fixed typo in line 42" | Git history has this |
| **Reading Files** | "Read the config file" | Normal exploration |
| **Failed Attempts** | "Tried X, didn't work" | Only include if instructive |
| **Obvious Facts** | "Next.js uses React" | Everyone knows |

### The "Would Future Me Care?" Test

Before adding to memory, ask:
> "If I was starting a new session in 2 weeks, would this information help me?"

- Yes → Add it
- No → Skip it

---

## 📝 Memory Entry Formats

### Session Entry Format
```markdown
| 2024-12-22 | 30min | Session-ID | Brief summary of what was accomplished |
```

**Good Example:**
```markdown
| 2024-12-22 | 45min | CLI-7 | Added --cursor flag to pull command, generates .cursorrules and START_PROMPT.md on export |
```

**Bad Example:**
```markdown
| 2024-12-22 | ? | - | Worked on stuff |
```

### Decision Entry Format
```markdown
| Decision | Reasoning | Date |
|----------|-----------|------|
| [What was decided] | [Why this choice] | [Date] |
```

**Good Example:**
```markdown
| Used Zod for validation | Better TypeScript inference than Yup, smaller bundle | 2024-12-22 |
```

### Issue Entry Format
```markdown
| Issue | Severity | Notes |
|-------|----------|-------|
| [Problem] | High/Medium/Low | [Context, reproduction steps] |
```

### Insight Entry Format
```markdown
## 💭 Insights for Next Agent
1. [Specific, actionable insight]
2. [Another insight with context]
```

**Good Example:**
```markdown
## 💭 Insights for Next Agent
1. The webhook handler expects raw body - don't use bodyParser middleware
2. Test with `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Signature verification fails silently - add logging to debug
```

---

## 🔄 Memory Update Workflow

### Step 1: Identify Trigger
Ask: "Did I just complete a task, make a decision, find something, or hit a blocker?"

### Step 2: Apply Significance Test
Ask: "Would future me care about this?"

### Step 3: Choose Format
- Task done → Session History
- Decision made → Key Decisions
- Issue found → Known Issues
- Tip discovered → Insights

### Step 4: Write Entry
Use the appropriate format from above.

### Step 5: Verify Context
Ask: "Could someone else understand this without my current context?"

---

## 🚨 Mandatory Update Points

Even if no triggers occurred, you MUST update memory at these points:

1. **Before providing final response** - Always add session entry
2. **Before handoff to another agent** - Full context required
3. **Before asking user for input** - Save current state
4. **When you realize you made a mistake** - Document what went wrong

---

## 📋 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOULD I UPDATE MEMORY?                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ YES - Update Memory                                         │
│  ───────────────────                                            │
│  • Completed a task                                             │
│  • Made a decision with alternatives                            │
│  • Found a blocker                                              │
│  • Discovered something non-obvious                             │
│  • About to hand off                                            │
│  • Found a bug                                                  │
│  • Reached a milestone                                          │
│  • Would tell colleague "let me save my work"                   │
│                                                                 │
│  ❌ NO - Skip Update                                            │
│  ───────────────────                                            │
│  • Just read a file                                             │
│  • Made a tiny edit                                             │
│  • Ran routine command                                          │
│  • Obvious from code/git                                        │
│  • "Future me wouldn't care"                                    │
│                                                                 │
│  📝 FORMAT                                                      │
│  ───────────────────                                            │
│  Task → Session History table                                   │
│  Decision → Key Decisions table                                 │
│  Bug → Known Issues table                                       │
│  Tip → Insights section                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Related Documents

- `prompts/agents/memory/[ROLE]_MEMORY.md` - Your memory file
- `prompts/agents/AGENT_POLICIES.md` - Corporate standards
- `prompts/agents/AGENT_ORG_STRUCTURE.md` - Who to notify

---

*Version 1.0 | Clear triggers > vague "before ending"*

