# Documentation Sync SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Keep documentation synchronized with code and system changes
> **Audience**: All 13 agents
> **Maintained By**: Documentation Agent

---

## Table of Contents

1. [Sync Triggers](#1-sync-triggers)
2. [Documentation Update Checklist](#2-documentation-update-checklist)
3. [Freshness Check Process](#3-freshness-check-process)
4. [Document Ownership](#4-document-ownership)
5. [Review Cycle](#5-review-cycle)
6. [Cross-Reference Requirements](#6-cross-reference-requirements)
7. [Quick Reference](#7-quick-reference)

---

## 1. Sync Triggers

Documentation MUST be updated when these events occur:

| Event | Documents to Update | Responsible Agent | Deadline |
|-------|---------------------|-------------------|----------|
| **New feature added** | User guide, README, API docs | Documentation | Before merge |
| **API endpoint changed** | API_CONTRACTS.md, examples | Documentation + Platform | Before merge |
| **Config option added** | COMPLETE_SETUP_GUIDE.md | Any (notify DOC) | Before merge |
| **New agent created** | Memory README, AGENT_POLICIES.md | Documentation | Same session |
| **SOP added/changed** | Role files, policies | Documentation | Same session |
| **Breaking change** | Migration guide, CHANGELOG | Documentation | Before release |
| **Dependency updated** | COMPLETE_SETUP_GUIDE.md, package.json | Any (notify DOC) | Same day |
| **Command added/changed** | CLI docs, README | CLI + Documentation | Before merge |
| **Environment variable added** | .env.example, setup guide | Platform + Documentation | Before merge |
| **Folder structure changed** | FRAMEWORK_MAP.md | Any (notify DOC) | Same session |

### Trigger Detection

Ask yourself after ANY work:

```
□ Did I add a new feature?        → Update user docs
□ Did I change an API?            → Update API_CONTRACTS.md
□ Did I add a config?             → Update setup guide
□ Did I change behavior?          → Update relevant docs
□ Did I add dependencies?         → Update requirements
□ Did I create new files/folders? → Update FRAMEWORK_MAP.md
```

---

## 2. Documentation Update Checklist

### Pre-Merge Checklist

Before completing ANY task, verify:

```markdown
## Documentation Pre-Merge Checklist

### Required Updates
- [ ] Feature documentation updated (if new feature)
- [ ] API documentation updated (if API changed)
- [ ] README updated (if user-facing change)
- [ ] CHANGELOG.md entry added (if notable change)

### Configuration Changes
- [ ] .env.example updated (if new env var)
- [ ] COMPLETE_SETUP_GUIDE.md updated (if setup changed)
- [ ] Config examples updated (if config format changed)

### Code Documentation
- [ ] JSDoc/TSDoc comments added for new functions
- [ ] Inline comments for complex logic
- [ ] Type definitions documented

### Cross-References
- [ ] Related docs linked
- [ ] Version numbers updated
- [ ] Last updated date set
```

### Session End Checklist

```markdown
## Documentation Session End Checklist

- [ ] Memory file updated with changes made
- [ ] Any doc changes committed
- [ ] Handoff notes include doc status
- [ ] Notification sent if DOC agent action needed
```

---

## 3. Freshness Check Process

### Weekly Freshness Check

Run this script weekly or before releases:

```bash
#!/bin/bash
# scripts/check-doc-freshness.sh

echo "📚 Documentation Freshness Check"
echo "================================="
echo ""

# Check README
echo "1. README.md"
if git log -1 --format="%ar" -- README.md | grep -q "months\|year"; then
  echo "   ⚠️  WARNING: README not updated recently"
else
  echo "   ✅ Recently updated"
fi

# Check Setup Guide version
echo ""
echo "2. COMPLETE_SETUP_GUIDE.md"
GUIDE_VERSION=$(head -5 docs/COMPLETE_SETUP_GUIDE.md | grep "Version" | head -1)
echo "   Current: $GUIDE_VERSION"

# Check for dead links (basic)
echo ""
echo "3. Checking for potential dead links..."
grep -r "](/" docs/ | grep -v node_modules | head -10

# Check API contracts vs actual routes
echo ""
echo "4. API Routes vs Documentation"
echo "   Routes in code: $(find website/app/api -name "route.ts" | wc -l | tr -d ' ')"
echo "   Check: docs/standards/API_CONTRACTS.md"

# Check command documentation
echo ""
echo "5. CLI Commands"
echo "   Commands in code: $(grep -c "case '" bin/framework.js || echo 0)"
echo "   Check: README.md commands section"

# Check memory files
echo ""
echo "6. Memory Files (last updated)"
for mem in prompts/agents/memory/*_MEMORY.md; do
  updated=$(git log -1 --format="%ar" -- "$mem" 2>/dev/null || echo "never")
  echo "   $(basename $mem): $updated"
done

echo ""
echo "================================="
echo "Check complete. Review warnings above."
```

### Freshness Indicators

| Indicator | Status | Action |
|-----------|--------|--------|
| Updated within 1 week | ✅ Fresh | None |
| Updated 1-4 weeks ago | 🟡 Aging | Review needed |
| Updated >1 month ago | 🔴 Stale | Update required |
| Never tracked | ⚠️ Unknown | Add to git |

---

## 4. Document Ownership

### Primary Ownership

| Document Category | Primary Owner | Backup Owner |
|-------------------|---------------|--------------|
| **README.md** | Documentation | Platform |
| **API docs** | Platform | Documentation |
| **Setup guides** | Documentation | Platform |
| **Agent roles** | Documentation | - |
| **Agent memory** | Each agent | - |
| **SOPs** | Documentation | Auditor |
| **CLI docs** | CLI | Documentation |
| **Template docs** | Template | Documentation |
| **Integration docs** | Integration | Documentation |

### Notification Protocol

When you make changes requiring doc updates but can't update yourself:

```bash
# Create notification for Documentation Agent
cat > output/documentation-agent/inbox/doc-update-needed-$(date +%Y%m%d-%H%M).txt << EOF
DOC UPDATE NEEDED

Requested By: [Your Role]
Date: $(date)
Priority: [P1-P3]

Changes Made:
- [What you changed]

Documentation Affected:
- [Which docs need updating]

Specific Updates Needed:
- [Bullet list of what to update]

Context:
[Any additional context]
EOF
```

---

## 5. Review Cycle

### Scheduled Reviews

| Document Type | Frequency | Reviewer | Checklist |
|---------------|-----------|----------|-----------|
| **Setup guides** | Every release | Documentation | Works from scratch |
| **API docs** | When API changes | Platform + Doc | Matches implementation |
| **User guides** | Monthly | Documentation | Accurate and clear |
| **SOPs** | Quarterly | Auditor + Doc | Still relevant |
| **Memory files** | Every session | Each agent | Updated after work |
| **README** | Monthly | Documentation | Current and welcoming |
| **CHANGELOG** | Every release | Documentation | All changes noted |

### Review Process

```
1. Open document
2. Run through content as if new user
3. Verify all links work
4. Check code examples still run
5. Confirm dates/versions current
6. Update or create issue for fixes
```

---

## 6. Cross-Reference Requirements

### Every Document Must Include

```markdown
> **Version**: X.X.X | **Last Updated**: YYYY-MM-DD
> 
> **Purpose**: [One line description]
> **Audience**: [Who should read this]
> **Maintained By**: [Agent role]
```

### Link Requirements

- Reference related documents at end of file
- Use relative paths for internal links
- Check links work before committing

### Example Footer

```markdown
---

## Related Documents

- [Parent Document](./PARENT.md)
- [Related SOP](./RELATED_SOP.md)
- [Agent Role](../../prompts/agents/roles/AGENT.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation |
```

---

## 7. Quick Reference

### Check If Doc Update Needed

```bash
# See what files changed in last commit
git diff --name-only HEAD~1

# Check if any are code files that might need doc updates
git diff --name-only HEAD~1 | grep -E "\.(ts|tsx|js|mjs)$"
```

### Create Doc Update Request

```bash
# Quick notification to DOC agent
echo "DOC UPDATE: [description]" > output/documentation-agent/inbox/update-$(date +%Y%m%d-%H%M).txt
```

### Update Document Header

```bash
# Update last modified date
sed -i '' "s/Last Updated: .*/Last Updated: $(date +%Y-%m-%d)/" docs/YOUR_DOC.md
```

### Common Documentation Locations

| What | Where |
|------|-------|
| Setup instructions | `docs/COMPLETE_SETUP_GUIDE.md` |
| API contracts | `docs/standards/API_CONTRACTS.md` |
| Coding standards | `docs/standards/CODING_STANDARDS.md` |
| Agent policies | `prompts/agents/AGENT_POLICIES.md` |
| Agent memory | `prompts/agents/memory/[ROLE]_MEMORY.md` |
| Framework map | `FRAMEWORK_MAP.md` |
| Changelog | `CHANGELOG.md` |

---

## Related Documents

- [Bug Triage SOP](./BUG_TRIAGE_SOP.md) - Document bugs properly
- [Deployment SOP](./DEPLOYMENT_SOP.md) - Pre-deploy doc check
- [File Update Policy](../FILE_UPDATE_POLICY.md) - When files need updating
- [Documentation Agent Role](../../prompts/agents/roles/DOCUMENTATION_AGENT.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation |

