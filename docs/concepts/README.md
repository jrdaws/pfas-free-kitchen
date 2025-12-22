# Core Concepts

This section explains the fundamental concepts that power the Dawson Does Framework. Understanding these concepts will help you effectively use the framework to build and deploy production-ready applications.

## What is the Dawson Does Framework?

The Dawson Does Framework is a CLI-based project scaffolding and management tool designed to help developers quickly bootstrap production-ready applications. It combines opinionated templates with flexible integrations, enabling rapid development without sacrificing code quality or architecture.

### Core Philosophy

1. **Opinionated but Flexible**: Start with battle-tested patterns, customize as needed
2. **AI-Native**: Built from the ground up to work seamlessly with AI coding assistants
3. **Zero Lock-in**: Generated projects are standalone - no hidden framework dependencies
4. **Developer Experience First**: Every feature prioritizes clear feedback and reversibility

## Core Concepts Overview

The framework is built around several interconnected systems:

```
┌─────────────────────────────────────────────────────────────┐
│                     Dawson Does Framework                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Templates   │  │ Integrations │  │  Capabilities│     │
│  │              │  │              │  │              │     │
│  │  Pre-built   │◄─┤  Add features│◄─┤  Plan-based  │     │
│  │  projects    │  │  to projects │  │  entitlements│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ▲                 ▲                  ▲              │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                   ┌───────┴────────┐                        │
│                   │    Plugins     │                        │
│                   │                │                        │
│                   │  Extend CLI    │                        │
│                   │  functionality │                        │
│                   └────────────────┘                        │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Drift Detection│  │Agent Safety  │  │ Manifest     │     │
│  │              │  │              │  │              │     │
│  │Track changes │  │Checkpoint    │  │Track original│     │
│  │from template │  │& rollback    │  │template state│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1. Templates

Templates are the foundation of every project. They provide:
- Complete, working application code
- Best practices and architecture patterns
- Framework configuration and metadata
- Integration points for additional features

**Learn more**: [Templates Documentation](./templates.md)

### 2. Integrations

Integrations add specific functionality to templates:
- Authentication providers (Supabase, Clerk)
- Payment processors (Stripe)
- Email services (SendGrid, Resend)
- Database connections (Postgres, MongoDB)
- AI capabilities (Anthropic, OpenAI)

**Learn more**: [Integrations Documentation](./integrations.md)

### 3. Capabilities

Capabilities are plan-based features that control what functionality is available:
- Free tier: Basic templates and integrations
- Pro tier: Advanced features and deployments
- Team tier: Collaboration and advanced automation

**Learn more**: [Capabilities Documentation](./capabilities.md)

### 4. Plugins

Plugins extend the CLI with custom functionality:
- Hook into template export lifecycle
- Add validation and checks
- Integrate with external tools
- Customize workflows

**Learn more**: [Plugins Documentation](./plugins.md)

### 5. Drift Detection

Drift detection tracks how your project changes from the original template:
- Compare current files with template manifest
- Identify added, modified, and deleted files
- Understand customization impact
- Aid in template upgrades

**Learn more**: [Drift Detection Documentation](./drift-detection.md)

### 6. Agent Safety

Agent safety features enable AI assistants to work safely on your codebase:
- Checkpoint creation before major changes
- Automatic rollback on failures
- Audit logging of all operations
- Constitutional invariants for safety

**Learn more**: [Agent Safety Documentation](./agent-safety.md)

## How Concepts Relate

Understanding how these concepts work together is key to mastering the framework:

### Project Creation Flow

```
1. Choose Template
   ↓
2. Select Integrations (optional)
   ↓
3. Framework validates compatibility
   ↓
4. Template exported with integrations
   ↓
5. Manifest created (drift detection baseline)
   ↓
6. Git repository initialized
   ↓
7. Post-export hooks run (plugins)
   ↓
8. Project ready for development
```

### Runtime Flow

```
Developer Edits Code
   ↓
Drift Detection: Track changes from template
   ↓
Plugin Hooks: Validate changes
   ↓
Capability Check: Ensure features are allowed
   ↓
Agent Safety: Checkpoint before major changes
```

### Integration Application Flow

```
Integration Requested
   ↓
Validate against template support
   ↓
Check for conflicts
   ↓
Copy integration files
   ↓
Merge dependencies
   ↓
Update environment templates
   ↓
Integration ready for configuration
```

## Learning Path

We recommend learning the framework concepts in this order:

### 1. Beginner Path (Start Here)

1. **Templates** - Understand what templates are and how to use them
2. **Basic CLI Commands** - Learn `export`, `demo`, and `pull` commands
3. **Project Structure** - Understand the `.dd/` directory and configuration

### 2. Intermediate Path

4. **Integrations** - Add authentication, payments, and other features
5. **Drift Detection** - Track your customizations
6. **Capabilities** - Understand plan tiers and feature gates

### 3. Advanced Path

7. **Plugins** - Create custom extensions
8. **Agent Safety** - Work safely with AI assistants
9. **Architecture** - Understand the framework internals

## Key Files and Directories

Every project created with the framework has this structure:

```
my-project/
├── .dd/                          # Framework metadata
│   ├── config.json              # Project configuration
│   ├── manifest.json            # Template snapshot for drift detection
│   ├── context.json             # Project context (from web platform)
│   └── agent-safety-log.json   # Checkpoint audit log
├── src/                         # Application source code
├── package.json                 # Dependencies
├── .env.example                 # Environment variable template
└── README.md                    # Project documentation
```

### The `.dd/` Directory

The `.dd/` directory contains all framework-specific metadata:

- **config.json**: Controls capabilities, plan tier, and feature overrides
- **manifest.json**: Snapshot of template files for drift detection
- **context.json**: Project vision, mission, and goals (from web configurator)
- **agent-safety-log.json**: Audit log of all checkpoints and operations

**Important**: The `.dd/` directory is intentionally minimal. Your project is not "locked in" to the framework - it's just regular code with some metadata.

## Design Principles

### 1. Explainability

Every action the framework takes is explainable and visible:
- Clear console output with step-by-step progress
- Detailed error messages with recovery steps
- Audit logs for all mutations
- Dry-run mode for previewing operations

### 2. Reversibility

All operations should be reversible:
- Git integration for version control
- Checkpoint system for major changes
- Manifest files for drift detection
- No hidden state or side effects

### 3. Zero Lock-in

Generated projects are standalone:
- No runtime dependency on the framework
- Standard package.json and dependencies
- Human-readable, modifiable code
- Can "eject" at any time

### 4. AI-Native Design

Built for AI coding assistants:
- `.cursorrules` file generation
- `START_PROMPT.md` for onboarding
- Context files in `.dd/` directory
- Constitutional safety guarantees

### 5. Progressive Disclosure

Complexity is revealed gradually:
- Simple commands for common tasks
- Advanced features available when needed
- Sensible defaults with override options
- Clear documentation hierarchy

## Common Patterns

### Starting a New Project

```bash
# Quick start with template
framework export saas ./my-saas-app

# With integrations
framework export saas ./my-saas-app --auth supabase --payments stripe

# From web configurator
framework pull swift-eagle-1234 --cursor --open
```

### Checking Project Health

```bash
# Check for drift
framework drift .

# Validate capabilities
framework capabilities .

# Run health checks
framework doctor .
```

### Working with AI

```bash
# Pull with Cursor files
framework pull <token> --cursor

# Create checkpoint before refactor
framework checkpoint create "Before auth refactor"

# Restore if needed
framework checkpoint restore agent-checkpoint-1734567890
```

## Next Steps

Now that you understand the core concepts, dive deeper into each area:

### Essential Reading

1. [Templates](./templates.md) - Learn how templates work
2. [Integrations](./integrations.md) - Add features to your project
3. [CLI Commands](../guides/cli-reference.md) - Master the command-line interface

### Advanced Topics

4. [Plugins](./plugins.md) - Extend the framework
5. [Agent Safety](./agent-safety.md) - Work safely with AI
6. [Architecture](../architecture/README.md) - Understand the internals

## Terminology

Key terms used throughout the documentation:

- **Template**: A pre-built project structure with code and configuration
- **Integration**: Optional functionality that can be added to a template
- **Capability**: A plan-gated feature or integration
- **Manifest**: A snapshot of template files used for drift detection
- **Checkpoint**: A git stash-based snapshot for safety and rollback
- **Plugin**: A custom extension that hooks into the framework lifecycle
- **Drift**: Changes made to a project after export from a template
- **Export**: The process of creating a new project from a template
- **Pull**: Download a project configuration from the web platform
- **Plan Tier**: Subscription level (free, pro, team) that controls access

## Getting Help

- **Documentation**: Start with the [Quick Start Guide](../guides/quick-start.md)
- **Examples**: Check out [Example Projects](../examples/)
- **Issues**: Report bugs on [GitHub](https://github.com/jrdaws/framework/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/jrdaws/framework/discussions)

---

**Previous**: [Documentation Home](../README.md)
**Next**: [Templates Concept](./templates.md)
