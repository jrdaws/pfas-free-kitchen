# Agent Organizational Structure

> **Version 1.0** | How agents relate to each other, report, and coordinate.

---

## 🏛️ Org Chart

```
                    ┌─────────────────────────────┐
                    │     PROJECT GOVERNANCE      │
                    │  (AGENT_CONTEXT, POLICIES)  │
                    └──────────────┬──────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│   CORE TRACK    │    │   PLATFORM TRACK    │    │  QUALITY TRACK  │
│                 │    │                     │    │                 │
│  ┌───────────┐  │    │  ┌───────────────┐  │    │  ┌───────────┐  │
│  │ CLI Agent │  │    │  │ Website Agent │  │    │  │Docs Agent │  │
│  └───────────┘  │    │  └───────────────┘  │    │  └───────────┘  │
│        ↓        │    │          ↓          │    │        ↓        │
│  ┌───────────┐  │    │  ┌───────────────┐  │    │  ┌───────────┐  │
│  │ Template  │  │    │  │Platform Agent │  │    │  │ Testing   │  │
│  │   Agent   │  │    │  └───────────────┘  │    │  │   Agent   │  │
│  └───────────┘  │    │                     │    │  └───────────┘  │
│        ↓        │    │                     │    │                 │
│  ┌───────────┐  │    │                     │    │                 │
│  │Integration│  │    │                     │    │                 │
│  │   Agent   │  │    │                     │    │                 │
│  └───────────┘  │    │                     │    │                 │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
```

---

## 🔄 Information Flow

### Who Reports What to Whom

| When... | Agent Reports To | Via |
|---------|-----------------|-----|
| CLI changes affect website | CLI Agent → Website Agent | Memory file + handoff |
| Template needs new integration | Template Agent → Integration Agent | Memory file + handoff |
| API contract changes | Platform Agent → CLI Agent + Website Agent | Memory file + handoff |
| Test failures found | Testing Agent → Owning Agent | Memory file + handoff |
| Docs need code examples | Docs Agent → Relevant Agent | Memory file + handoff |

### Cross-Agent Dependencies

```
┌────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCY MAP                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLI Agent ◄────────► Template Agent                              │
│      │                     │                                       │
│      │                     ▼                                       │
│      │            Integration Agent                                │
│      │                     │                                       │
│      ▼                     ▼                                       │
│  Platform Agent ◄──────────┘                                       │
│      │                                                             │
│      ▼                                                             │
│  Website Agent                                                     │
│                                                                    │
│  Testing Agent ◄──── Validates all agents                         │
│  Docs Agent ◄──── Documents all agents                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Role Relationships

### Core Track (Build the framework)

| Role | Upstream | Downstream | Coordinates With |
|------|----------|------------|------------------|
| **CLI Agent** | None | Template Agent | Platform Agent (pull/deploy) |
| **Template Agent** | CLI Agent | Integration Agent | Website Agent (previews) |
| **Integration Agent** | Template Agent | None | Platform Agent (services) |

### Platform Track (Build the platform)

| Role | Upstream | Downstream | Coordinates With |
|------|----------|------------|------------------|
| **Website Agent** | None | Platform Agent | CLI Agent (commands) |
| **Platform Agent** | Website Agent | None | CLI Agent (pull API) |

### Quality Track (Ensure quality)

| Role | Upstream | Downstream | Coordinates With |
|------|----------|------------|------------------|
| **Docs Agent** | All agents | None | All agents |
| **Testing Agent** | All agents | None | All agents |

---

## 📋 Handoff Protocols

### Same-Track Handoffs
Direct handoff with full context:
```
CLI Agent → Template Agent
"I've updated the export command to support X. You'll need to 
update templates to use this new capability. See CLI_MEMORY.md 
for details."
```

### Cross-Track Handoffs
Handoff with coordination note:
```
CLI Agent → Website Agent
"I've added a new CLI flag --cursor. The website's export 
view should offer this as an option. Coordinate with Platform 
Agent if API changes are needed."
```

### Quality Track Handoffs
Quality agents can report to any agent:
```
Testing Agent → CLI Agent
"Found failing test in pull command when token is invalid. 
See TESTING_MEMORY.md for reproduction steps."
```

---

## 🎯 Decision Authority

### Who Decides What

| Decision Type | Authority | Consulted |
|--------------|-----------|-----------|
| CLI interface changes | CLI Agent | Website Agent |
| Template structure | Template Agent | CLI Agent |
| Integration patterns | Integration Agent | Template Agent |
| API contracts | Platform Agent | CLI Agent, Website Agent |
| UI/UX changes | Website Agent | Platform Agent |
| Test requirements | Testing Agent | All agents |
| Documentation standards | Docs Agent | All agents |
| **Project-wide standards** | Governance docs | All agents |

### Escalation Path
If an agent needs to make a decision outside their authority:
1. Document the decision needed in memory file
2. Note which agent should decide
3. Create handoff prompt for that agent
4. Do not make the decision yourself

---

## 🔔 When to Notify Other Agents

### Always Notify

| Change | Notify |
|--------|--------|
| CLI command added/changed | Website Agent, Docs Agent |
| API endpoint added/changed | CLI Agent, Website Agent, Docs Agent |
| Template structure changed | CLI Agent, Integration Agent |
| Integration pattern changed | Template Agent, Docs Agent |
| Test pattern changed | All agents |

### Notification Format
In your handoff prompt:
```markdown
## ⚠️ Notification for [AGENT]
**Change**: [What changed]
**Impact**: [How it affects them]
**Action Needed**: [What they should do]
```

---

## 🤝 Coordination Rules

1. **Single Source of Truth**: Memory files are the coordination mechanism
2. **No Side Channels**: All info goes through memory files, not direct messages
3. **Explicit Dependencies**: If you need another agent's output, say so
4. **No Blocking**: Don't wait for another agent - note dependency and continue
5. **Broadcast Changes**: Major changes notify all affected agents

---

## 📁 Shared Resources

All agents have access to:

| Resource | Purpose | Owner |
|----------|---------|-------|
| `AGENT_CONTEXT.md` | Core standards | Governance |
| `AGENT_POLICIES.md` | Corporate policies | Governance |
| `VISION_MISSION.md` | Project goals | Governance |
| `docs/GLOSSARY.md` | Term definitions | Docs Agent |
| `docs/standards/` | Coding standards | Docs Agent |
| `FRAMEWORK_MAP.md` | Architecture | Auto-generated |

---

*Version 1.0 | Agents should understand their place in this structure.*

