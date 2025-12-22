# Vision, Mission & Strategy

> **Version 1.0** | The "why" and "where" for all agents working on dawson-does-framework.

---

## 🎯 Vision Statement

**"Make professional app development accessible to everyone while ensuring complete ownership."**

We envision a world where:
- Non-developers can build production-quality apps through natural language
- Developers can accelerate 10x with AI-assisted scaffolding
- Everyone owns their code completely - no platform lock-in
- The gap between "idea" and "deployed app" is minutes, not months

---

## 🚀 Mission Statement

**"Build a hybrid platform where users prototype in the browser, then export to full local ownership via a single command."**

We accomplish this by:
1. Providing a web-based visual configurator for app design
2. Using AI to generate production-ready code from descriptions
3. Enabling one-command export to local development
4. Optimizing for Claude + Cursor workflow
5. Maintaining zero lock-in at every step

---

## 💡 Core Principles

| Principle | Meaning | Example |
|-----------|---------|---------|
| **Export-First** | Everything designed for local ownership | Code is yours after export |
| **Zero Lock-In** | Platform is optional after export | Don't need us to run your app |
| **Cursor-Native** | Optimized for Claude + Cursor | .cursorrules, START_PROMPT.md |
| **Transparency** | No magic, explicit complexity | Show what's happening |
| **Fail Gracefully** | Helpful errors with recovery | Never crash silently |
| **Developer-Centric** | Built for devs, by devs | Clean code, good DX |

---

## 📊 Strategic Goals

### Phase 1: Foundation (Current)
- ✅ CLI export working
- ✅ Template system with integrations
- ⏳ Web configurator with preview
- ⏳ Pull command for web→local
- ❌ AI generation in preview

### Phase 2: AI Generation
- AI generates code from description
- Visual editing of generated code
- Real-time preview updates
- Multiple template support

### Phase 3: Collaboration
- Real-time multiplayer editing
- Team workspaces
- Role-based access
- Version history

### Phase 4: Enterprise
- Self-hosted option
- Custom templates
- SSO integration
- Analytics dashboard

---

## ✅ Success Metrics

### For Users
| Metric | Target | How Measured |
|--------|--------|--------------|
| Time to first app | < 5 minutes | From sign-up to running app |
| Export success rate | > 99% | Exports that run without errors |
| User satisfaction | > 4.5/5 | Post-export survey |
| Return users | > 60% | Users who export again |

### For Code Quality
| Metric | Target | How Measured |
|--------|--------|--------------|
| Test coverage | > 80% | c8 coverage report |
| Lint errors | 0 | npm run lint |
| Build success | 100% | CI pipeline |
| Documentation | Complete | All public APIs documented |

### For Agents
| Metric | Target | How Measured |
|--------|--------|--------------|
| Information loss | 0% | Handoffs contain all context |
| Task completion | > 90% | Tasks done without re-work |
| Memory quality | Specific | Entries are actionable |
| Role adherence | 100% | Stay in assigned role |

---

## 🏢 How Success is Defined

### Project Success
The project succeeds when:
1. A non-developer can describe an app and have it running locally in 10 minutes
2. A developer can scaffold a production-ready app in 5 minutes
3. Exported apps are indistinguishable from hand-crafted ones
4. Users never feel locked in to the platform

### Agent Success
An agent session succeeds when:
1. Assigned task is completed correctly
2. No regressions introduced (tests pass)
3. Memory file is updated with specifics
4. Next agent can continue without loss
5. Code follows project standards

### Individual Role Success
| Role | Success Looks Like |
|------|-------------------|
| CLI Agent | Commands work, good error messages |
| Website Agent | UI is responsive, accessible |
| Template Agent | Templates run out of the box |
| Integration Agent | Integrations work with one command |
| Documentation Agent | Docs are clear, complete |
| Testing Agent | Coverage > 80%, no flaky tests |
| Platform Agent | APIs are fast, reliable |

---

## 🎓 What Every Agent Must Know

1. **We exist to give users ownership** - Not to create dependency
2. **Simplicity wins** - Complex solutions need justification
3. **Users first, code second** - UX matters more than clever code
4. **Explicit > implicit** - Show what's happening
5. **Test everything** - Untested code is broken code
6. **Document as you go** - Future agents need context

---

## 🔗 Related Documents

| For... | Read... |
|--------|---------|
| How to work | `AGENT_CONTEXT.md` |
| Corporate standards | `prompts/agents/AGENT_POLICIES.md` |
| Your role specifics | `prompts/agents/roles/[ROLE]_AGENT.md` |
| Previous work | `prompts/agents/memory/[ROLE]_MEMORY.md` |

---

*Version 1.0 | All agents should internalize these principles.*

