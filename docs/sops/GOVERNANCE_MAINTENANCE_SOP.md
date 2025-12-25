# Governance Maintenance SOP

> **Version**: 1.0
> **Purpose**: Prevent governance bloat by establishing rules for adding/modifying agent rules
> **Enforced By**: Auditor Agent

---

## The Bloat Problem

Governance files grew from ~500 lines to 2,526 lines over time because:
- Rules added without removing old ones
- Same concepts explained multiple times
- No token budget enforcement
- No deduplication checks
- No sunset/review process

**This SOP prevents that from happening again.**

---

## Core Principles

### 1. Token Budget Enforcement

Every governance file has a **maximum line limit**:

| File | Max Lines | Current | Status |
|------|-----------|---------|--------|
| `.cursorrules` | 150 | ~120 | ✅ Under budget |
| `AGENT_CONTEXT.md` | 120 | ~100 | ✅ Under budget |
| `AGENT_POLICIES.md` | 400 | ~300 | ✅ Under budget |
| `GOVERNANCE_CARD.md` | 60 | ~50 | ✅ Under budget |
| `MINDFRAME.md` | 400 | ~390 | ⚠️ Near limit |

**Rule**: If a file is at 90%+ of its limit, adding content requires removing/condensing existing content first.

### 2. One-In-One-Out Rule

**To add a new rule, you must either:**
- Remove an equivalent amount of content
- Condense existing content to make room
- Move content to `docs/governance/` (reference docs)

**Exception**: Critical security or compliance rules can exceed budget temporarily, but must be reviewed within 7 days.

### 3. Deduplication Check (MANDATORY)

Before adding any rule, search for existing coverage:

```bash
# Check if concept already documented
grep -r "your concept" .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md docs/governance/
```

**If found**: Update existing section, don't create new one.
**If not found**: Proceed with addition.

### 4. Placement Priority

New rules should be added to the **smallest appropriate file**:

| Rule Type | Add To | NOT To |
|-----------|--------|--------|
| Universal behavior | `.cursorrules` | AGENT_POLICIES.md |
| Project context | `AGENT_CONTEXT.md` | Multiple files |
| Operational protocol | `AGENT_POLICIES.md` | .cursorrules |
| Reference/verbose | `docs/governance/*` | Core files |
| Role-specific | Role SOP file | Core governance |

### 5. Sunset Clause

All new rules must include a review date:

```markdown
> **Added**: 2025-12-25 | **Review By**: 2026-03-25
```

**At review date**, evaluate:
- Is this rule still needed?
- Has it been followed?
- Can it be condensed?
- Should it be archived?

---

## Rule Addition Process

### Step 1: Justification (Required)

Before proposing a new rule, answer:

| Question | Your Answer |
|----------|-------------|
| What problem does this solve? | |
| How many times has this problem occurred? | |
| Can existing rules cover this? | |
| What's the token cost (line count)? | |
| What will you remove/condense to add this? | |

**Minimum occurrence threshold**: Problem must have occurred **3+ times** before creating a rule.

### Step 2: Deduplication Check

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework
grep -rn "related keywords" .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md
```

If similar content exists, propose an **update** instead of an **addition**.

### Step 3: Budget Check

```bash
wc -l .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md
```

Compare against limits. If at 90%+, identify what to condense/remove.

### Step 4: Draft Rule

Write the rule in the **minimum lines possible**:

❌ **Bad** (verbose):
```markdown
## Important Rule About Commit Messages

When you are finishing your work and ready to commit, you should always use
conventional commit message format. This means starting with a type like feat,
fix, docs, or chore, followed by a scope in parentheses, then a colon and space,
then a description. For example, you might write "feat(cli): add new flag" or
"fix(website): resolve hydration error". This helps maintain consistency...
[15 lines]
```

✅ **Good** (condensed):
```markdown
## Commits
Format: `type(scope): description`
Types: feat, fix, docs, chore, test, refactor
```
[3 lines]

### Step 5: Propose via SOP Process

Create proposal in `output/shared/sop-proposals/`:

```markdown
# Rule Proposal: [Name]

**Problem**: [1 sentence]
**Occurrences**: [number]
**Token Cost**: [line count]
**Trade-off**: [what you'll condense/remove]
**Target File**: [where it goes]
**Review Date**: [3 months from now]

## Proposed Rule

[Your condensed rule text]
```

### Step 6: Auditor Review

Auditor Agent evaluates:

| Criterion | Weight | Pass/Fail |
|-----------|--------|-----------|
| Problem occurred 3+ times | 25% | |
| No duplication found | 20% | |
| Under token budget (or trade-off) | 20% | |
| Condensed to minimum lines | 15% | |
| Placed in correct file | 10% | |
| Has review date | 10% | |

**Must score 80%+ to approve.**

---

## Anti-Bloat Patterns

### ❌ Patterns That Cause Bloat

| Pattern | Example | Why It's Bad |
|---------|---------|--------------|
| Multiple examples | 3 handoff format examples | 1 example is enough |
| Verbose explanations | 10 lines to explain 1 rule | Condense to 2 lines |
| Version history in-file | Changelog in AGENT_POLICIES | Move to separate doc |
| Repeated content | Same rule in 4 files | Single source of truth |
| "Just in case" rules | Rules for problems that never happened | Wait for 3+ occurrences |
| Inline documentation | Full SOP in governance file | Reference SOP, don't embed |

### ✅ Patterns That Prevent Bloat

| Pattern | Example | Why It Works |
|---------|---------|--------------|
| Tables over prose | Rule matrix in 10 lines vs 50 lines prose | 80% shorter |
| One example max | Single handoff example | Agents extrapolate |
| Reference links | "See docs/governance/EXAMPLES.md" | Details on demand |
| Layered governance | .cursorrules → AGENT_CONTEXT → docs/ | Slim defaults |
| Token budgets | Max 150 lines per file | Forces condensation |
| Review dates | "Review by 2026-03-25" | Removes stale rules |

---

## Quarterly Governance Audit

Every 3 months, Auditor Agent performs:

### 1. Size Check
```bash
wc -l .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md
```

Flag any file at 90%+ of limit.

### 2. Duplication Scan
```bash
# Find repeated phrases (potential duplication)
grep -rh "export-first\|zero lock-in\|protected files" .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md | sort | uniq -c | sort -rn
```

### 3. Review Date Audit
```bash
grep -rn "Review By:" .cursorrules AGENT_CONTEXT.md prompts/agents/AGENT_POLICIES.md docs/sops/
```

Act on any past-due review dates.

### 4. Effectiveness Check

For each rule section, ask:
- Has any agent violated this in last 3 months?
- If never violated, is it obvious enough to remove?
- If frequently violated, is it unclear and needs rewriting?

---

## Emergency Override

For critical issues (security, compliance, breaking bugs):

1. Add rule immediately (skip proposal process)
2. Mark with `⚡ EMERGENCY` tag
3. Must review within 7 days
4. Either formalize through process or remove

---

## Quick Reference

### Adding a Rule
1. Problem occurred 3+ times? → Proceed
2. Already documented? → Update existing
3. At budget limit? → Condense something first
4. Write in minimum lines
5. Submit proposal
6. Auditor approves (80%+ score)

### Maximum Lines
- `.cursorrules`: 150
- `AGENT_CONTEXT.md`: 120
- `AGENT_POLICIES.md`: 400
- `GOVERNANCE_CARD.md`: 60
- `MINDFRAME.md`: 400

### Review Cycle
- New rules: Review in 3 months
- Quarterly: Full governance audit
- Annual: Major consolidation review

---

*This SOP prevents governance files from re-bloating by enforcing token budgets, deduplication, and sunset clauses.*

