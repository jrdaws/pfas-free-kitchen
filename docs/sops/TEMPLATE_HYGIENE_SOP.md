# Template Hygiene SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-23
> 
> **Purpose**: Prevent accidental commits of generated files and ensure consistent template structure
> **Audience**: Template Agent, CLI Agent, all agents working with templates
> **Observation Count**: 2 occurrences (node_modules), 1 occurrence (versioning)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prohibited Files](#2-prohibited-files)
3. [Pre-Commit Checks](#3-pre-commit-checks)
4. [Template Versioning](#4-template-versioning)
5. [Directory Structure](#5-directory-structure)
6. [Validation Commands](#6-validation-commands)

---

## 1. Overview

### Problems Addressed

1. **node_modules committed** (2 occurrences)
   - Bloats repository
   - Causes merge conflicts
   - Wastes CI/CD time

2. **No template versioning process** (1 occurrence)
   - Hard to track template changes
   - Drift between templates and exports unclear

---

## 2. Prohibited Files

### Never Commit These

| Pattern | Reason |
|---------|--------|
| `node_modules/` | Generated dependency folder |
| `.next/` | Next.js build output |
| `dist/` | Build output |
| `.env` | Secrets |
| `.env.local` | Local secrets |
| `*.log` | Log files |
| `.DS_Store` | macOS metadata |
| `*.tsbuildinfo` | TypeScript cache |
| `.turbo/` | Turborepo cache |

### Template-Specific .gitignore

Every template MUST have a `.gitignore` with:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
out/
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Cache
*.log
*.tsbuildinfo
.turbo/
.vercel/
```

---

## 3. Pre-Commit Checks

### Automatic Check (Git Hook)

Located in: `.git/hooks/pre-commit`

```bash
#!/bin/bash

# Check for prohibited files in templates
PROHIBITED=(
  "templates/*/node_modules"
  "templates/*/.next"
  "templates/*/dist"
  "templates/*/.env"
)

for pattern in "${PROHIBITED[@]}"; do
  if git diff --cached --name-only | grep -q "$pattern"; then
    echo "❌ ERROR: Attempting to commit prohibited file: $pattern"
    echo "   Run: git reset HEAD $pattern"
    exit 1
  fi
done

echo "✅ Pre-commit check passed"
```

### Manual Check Before Commit

```bash
# Check for any node_modules in staged files
cd /Users/joseph.dawson/Documents/dawson-does-framework && git diff --cached --name-only | grep -E "(node_modules|\.next|dist)" && echo "⚠️ Prohibited files staged!" || echo "✅ Clean"
```

### Install Hook

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework && ./scripts/install-hooks.sh
```

---

## 4. Template Versioning

### Version File

Every template MUST have a `template.json` with version info:

```json
{
  "name": "saas",
  "version": "1.2.0",
  "lastUpdated": "2025-12-23",
  "minFrameworkVersion": "0.3.0",
  "changelog": [
    {
      "version": "1.2.0",
      "date": "2025-12-23",
      "changes": ["Added Stripe integration", "Updated to Next.js 15"]
    },
    {
      "version": "1.1.0",
      "date": "2025-12-20",
      "changes": ["Added dark mode support"]
    }
  ]
}
```

### Version Bump Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| New integration | Minor (1.x.0) | Add Stripe |
| Bug fix | Patch (1.0.x) | Fix typo |
| Breaking change | Major (x.0.0) | Change file structure |
| New feature | Minor (1.x.0) | Add dashboard page |
| Dependency update | Patch (1.0.x) | Update React |

### Updating Template Version

```bash
# After making template changes:
cd /Users/joseph.dawson/Documents/dawson-does-framework/templates/saas

# Update template.json version
# Add changelog entry

# Commit with template scope
git commit -m "feat(template/saas): add Stripe integration"
```

---

## 5. Directory Structure

### Required Structure

Every template MUST follow this structure:

```
templates/{template-name}/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities
├── integrations/           # Optional integrations
│   ├── auth/               # Auth providers
│   ├── payments/           # Payment providers
│   └── storage/            # Storage providers
├── public/                 # Static assets
├── template.json           # Template metadata (REQUIRED)
├── package.json            # Dependencies
├── .gitignore              # Git ignore rules (REQUIRED)
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
└── README.md               # Template documentation
```

### Validation

```bash
# Check template structure
cd /Users/joseph.dawson/Documents/dawson-does-framework && node bin/framework.js doctor templates/saas
```

---

## 6. Validation Commands

### Check All Templates

```bash
# Verify no prohibited files exist
cd /Users/joseph.dawson/Documents/dawson-does-framework && find templates -type d -name "node_modules" 2>/dev/null && echo "⚠️ Found node_modules!" || echo "✅ Clean"

# Verify all templates have required files
cd /Users/joseph.dawson/Documents/dawson-does-framework && for dir in templates/*/; do
  if [ ! -f "${dir}template.json" ]; then
    echo "⚠️ Missing template.json in $dir"
  fi
  if [ ! -f "${dir}.gitignore" ]; then
    echo "⚠️ Missing .gitignore in $dir"
  fi
done && echo "✅ Template check complete"
```

### Clean Template

If node_modules was accidentally committed:

```bash
# Remove from git tracking (keeps local copy)
cd /Users/joseph.dawson/Documents/dawson-does-framework && git rm -r --cached templates/*/node_modules

# Commit the removal
git commit -m "chore(templates): remove accidentally committed node_modules"

# Ensure .gitignore is updated
echo "node_modules/" >> templates/saas/.gitignore
```

### Template Drift Check

```bash
# Check for template drift
cd /Users/joseph.dawson/Documents/dawson-does-framework && node bin/framework.js drift templates/saas
```

---

## Related Documents

- [Template Agent Role](../../prompts/agents/roles/TEMPLATE_AGENT.md)
- [Framework Doctor Command](../../bin/framework.js)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | DOC Agent | Initial creation (node_modules + versioning) |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Observer | Quality Agent | 2025-12-23 | ✅ Logged |
| Drafter | Documentation Agent | 2025-12-23 | ✅ Complete |
| Reviewer | Auditor Agent | 2025-12-23 | ✅ Approved (96/100) |

