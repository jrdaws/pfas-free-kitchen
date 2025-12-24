# SOP Opportunities Log

> **Purpose**: Track patterns and issues that might need formal SOPs
> **Maintained By**: Quality Agent
> **Last Updated**: 2025-12-23

---

## How to Use This File

1. **During ANY review session**, note:
   - Repeated issues you're flagging
   - Unclear processes you're following
   - Questions that come up multiple times

2. **Log observations** in the table below

3. **When count reaches 3+**, escalate to Documentation Agent for SOP creation

---

## Observations

| Date | Observation | Category | Count | Notes |
|------|-------------|----------|-------|-------|
| 2025-12-23 | Agents not outputting next agent prompts | Handoff | 3 | ✅ Resolved - added to policies |
| 2025-12-23 | Inconsistent image naming conventions | Media | 1 | Monitoring |
| 2025-12-23 | No clear process for template versioning | Templates | 1 | Monitoring |
| 2025-12-23 | AI code generation token limit truncation | Code | 5 | ✅ **SOP CREATED** - `docs/sops/AI_MODEL_SELECTION_SOP.md` |
| 2025-12-23 | Haiku model JSON schema compliance issues | Code | 4 | JSON repair mitigates but pattern persists |
| 2025-12-23 | Template node_modules committed accidentally | Templates | 2 | Cleaned twice, may need pre-commit check |
| 2025-12-23 | SSR compatibility for client-only components | Code | 1 | Fixed with dynamic imports |

---

## Categories

- **Handoff**: Agent-to-agent communication
- **Media**: Image/asset generation and review
- **Templates**: Template creation and maintenance
- **Testing**: Test procedures and validation
- **Deployment**: Release and deployment processes
- **Documentation**: Doc creation and updates
- **Code**: Coding standards and patterns

---

## Escalation Template

When count reaches 3+, create an SOP proposal:

```markdown
## SOP Proposal: [Name]

**Observation**: [What pattern you've seen]
**Frequency**: [How often / count]
**Impact**: [What problems this causes]
**Proposed Solution**: [Brief outline of SOP]

### Escalation

## Next Agent: Documentation Agent

Copy this to activate:

Read output/media-pipeline/quality-agent/workspace/sop-opportunities.md and review the proposal for [topic]. Create a formal SOP in docs/sops/ if warranted.
```

---

## Active SOP Proposals

### SOP Proposal: AI Model Selection & Token Limit Handling

**Observation**: AI code generation frequently truncates output when token limit is insufficient. Seen in 5+ testing sessions.

**Frequency**: 5+ occurrences across multiple testing sessions (2025-12-23)

**Impact**: 
- Code generation failures for complex projects
- Retry exhaustion wasting API credits
- Incomplete JSON outputs requiring manual intervention

**Proposed Solution**:
1. Document token limits per model (Haiku: 4K, Sonnet: 32K)
2. Add pre-generation size estimation
3. Implement chunked generation for large outputs (>5 files)
4. Add automatic fallback to higher token limit on truncation

**Status**: Escalate to Documentation Agent

---

**Added by**: Testing Agent
**Date**: 2025-12-23

