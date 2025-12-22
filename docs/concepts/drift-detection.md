# Drift Detection

Drift detection tracks how your project changes from its original template, providing visibility into customizations and helping you make informed decisions about updates and maintenance.

## Table of Contents

- [What Is Drift Detection?](#what-is-drift-detection)
- [Why Drift Detection Matters](#why-drift-detection-matters)
- [How Drift Detection Works](#how-drift-detection-works)
- [Manifest Files](#manifest-files)
- [Using the Drift Command](#using-the-drift-command)
- [When to Check Drift](#when-to-check-drift)
- [Understanding Drift Reports](#understanding-drift-reports)
- [Drift in Practice](#drift-in-practice)
- [Limitations](#limitations)

## What Is Drift Detection?

Drift detection is the process of identifying differences between your current project and the original template it was exported from. Think of it as "git diff" but for your entire project against its template baseline.

### The Drift Problem

When you export a template:

```bash
framework export saas ./my-app
```

You get a snapshot of the template at that moment. Over time, your project evolves:

```
Day 1:  [Template] → Export → [Your Project]
        ✓ Identical

Day 30: [Template]           [Your Project]
        ↓                     ↓
        Updated               Customized
        New features          Added features
        Bug fixes             Modified files
        ✗ Diverged (drifted)
```

### What Drift Detection Tracks

Drift detection identifies:

- **Added Files**: New files you created
- **Modified Files**: Files you changed from the template
- **Deleted Files**: Files you removed from the template
- **Unchanged Files**: Files still matching the template

## Why Drift Detection Matters

### 1. Visibility Into Changes

**Problem**: After weeks of development, you forget what you've modified.

**Solution**: Drift detection shows exactly what changed:

```bash
framework drift .

# Output:
⚠️  Drift detected:

   Added (3):
     + src/app/admin/page.tsx
     + src/lib/custom-utils.ts
     + public/custom-logo.svg

   Modified (12):
     ~ src/app/layout.tsx
     ~ src/app/page.tsx
     ~ package.json
     ~ ...

   Unchanged: 147 files
```

### 2. Safe Updates

**Problem**: Template updates might overwrite your customizations.

**Solution**: Check drift before updating:

```bash
# Check what you've changed
framework drift .

# If drift is acceptable, update
framework templates update
```

### 3. Compliance and Auditing

**Problem**: Need to prove what changed for compliance.

**Solution**: Drift reports provide audit trail:

```bash
framework drift . > drift-report.txt
# Include in compliance documentation
```

### 4. Team Coordination

**Problem**: Team members don't know which files are safe to modify.

**Solution**: Drift report shows what's already customized:

```bash
# Files with high drift = heavily customized
# Files with no drift = safe to regenerate from template
```

### 5. Merge Conflict Prevention

**Problem**: Merging template updates causes conflicts.

**Solution**: Know what's drifted before attempting merge:

```bash
# Check drift first
framework drift .

# Only update files with no drift
# Manually merge drifted files
```

## How Drift Detection Works

### Snapshot Creation

When you export a template, the framework creates a manifest:

```
┌─────────────────────────────────────────┐
│ 1. Template Export                      │
│    framework export saas ./my-app       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Files Copied                         │
│    - Copy template files                │
│    - Apply integrations                 │
│    - Create starter files               │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Hash All Files (SHA256)              │
│    For each file:                       │
│    - Calculate SHA256 hash              │
│    - Store path and hash                │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Write Manifest                       │
│    .dd/template-manifest.json           │
│    {                                    │
│      "files": [                         │
│        {                                │
│          "path": "src/app/page.tsx",    │
│          "sha256": "abc123..."          │
│        }                                │
│      ]                                  │
│    }                                    │
└─────────────────────────────────────────┘
```

### Drift Detection Process

When you run `framework drift`:

```
┌─────────────────────────────────────────┐
│ 1. Load Manifest                        │
│    Read .dd/template-manifest.json      │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Build Current File List              │
│    List all files in project            │
│    (excluding .git, node_modules, etc.) │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Compare                              │
│    For each manifest file:              │
│    - Does it still exist?               │
│    - Calculate current SHA256           │
│    - Compare to manifest hash           │
│    - Categorize: unchanged/modified     │
│                                         │
│    For each current file:               │
│    - Is it in manifest?                 │
│    - If not → added                     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Generate Report                      │
│    - List added files                   │
│    - List modified files                │
│    - List deleted files                 │
│    - Count unchanged files              │
└─────────────────────────────────────────┘
```

### SHA256 Hashing

The framework uses SHA256 to detect changes:

```javascript
import crypto from 'crypto';
import fs from 'fs';

function sha256File(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256')
    .update(content)
    .digest('hex');
}

// Example hashes
sha256File('src/app/page.tsx')
// Original: "a3f2e8c..."
// Modified: "b9d1c7a..."  ← Different = drift detected
```

## Manifest Files

### Manifest Structure

Located at `.dd/template-manifest.json`:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2025-12-21T10:30:00.000Z",
  "templateId": "saas",
  "templateSource": "remote",
  "frameworkVersion": null,
  "resolvedRef": "jrdaws/dawson-does-framework/templates/saas",
  "files": [
    {
      "path": "package.json",
      "sha256": "a3f2e8c1b9d7f5e3a2c8d4f6b1e9c7a5d3f8b2e6c4a9d7f5e3b1c8a6d4f2e9c7"
    },
    {
      "path": "src/app/layout.tsx",
      "sha256": "d4f6b1e9c7a5d3f8b2e6c4a9d7f5e3b1c8a6d4f2e9c7a5d3f8b2e6c4a9d7f5e3"
    },
    {
      "path": "src/app/page.tsx",
      "sha256": "b1e9c7a5d3f8b2e6c4a9d7f5e3b1c8a6d4f2e9c7a5d3f8b2e6c4a9d7f5e3b1c8"
    }
  ]
}
```

### Manifest Metadata

| Field | Description |
|-------|-------------|
| `schemaVersion` | Manifest format version (currently 1) |
| `generatedAt` | Timestamp of export |
| `templateId` | Template identifier (e.g., "saas") |
| `templateSource` | "local", "remote", or "auto" |
| `frameworkVersion` | Framework version if pinned |
| `resolvedRef` | Full template reference |
| `files` | Array of file snapshots |

### File Entries

Each file entry contains:

```json
{
  "path": "src/app/page.tsx",
  "sha256": "a3f2e8c..."
}
```

- **path**: Relative path from project root
- **sha256**: SHA256 hash of file contents (hex)

### What's Excluded

Manifest never tracks these files:

- `.git/` - Git internals
- `node_modules/` - Dependencies
- `.next/` - Build artifacts
- `.dd/agent-safety-log.json` - Runtime logs

## Using the Drift Command

### Basic Usage

```bash
# Check drift in current directory
framework drift .

# Check drift in specific project
framework drift /path/to/project

# Check drift in parent directory
framework drift ..
```

### Example Output: No Drift

```bash
$ framework drift .

✅ No drift detected (147 files unchanged)
```

### Example Output: With Drift

```bash
$ framework drift .

⚠️  Drift detected:

   Added (3):
     + src/app/admin/page.tsx
     + src/lib/analytics.ts
     + public/logo.png

   Modified (12):
     ~ src/app/layout.tsx
     ~ src/app/page.tsx
     ~ src/components/Header.tsx
     ~ src/components/Footer.tsx
     ~ src/lib/auth.ts
     ~ package.json
     ~ tsconfig.json
     ~ next.config.js
     ~ README.md
     ~ .gitignore
     ~ tailwind.config.js
     ~ postcss.config.js

   Deleted (1):
     - src/app/example/page.tsx

   Unchanged: 132 files
```

### Exit Codes

```bash
framework drift .
echo $?

# Exit codes:
# 0 = No drift (or successful check)
# 1 = Error (missing manifest, etc.)
```

## When to Check Drift

### Before Major Changes

```bash
# Before refactoring
framework drift .
# Take snapshot of current state

# Do refactoring
git commit -am "Refactor authentication"

# Check what changed
framework drift .
```

### Before Updating Dependencies

```bash
# Before npm update
framework drift .
npm update
framework drift .

# See what npm changed
```

### During Code Review

```bash
# Reviewer checks drift
framework drift .

# High drift = lots of customization
# Low drift = close to template
```

### Before Template Updates

```bash
# Check current drift
framework drift .

# Decision:
# - Low drift → safe to update template
# - High drift → manual merge required
```

### For Compliance

```bash
# Generate drift report for audit
framework drift . > compliance/drift-report-2025-12.txt

# Include in compliance package
```

### After Onboarding New Developer

```bash
# New dev: what's been customized?
framework drift .

# Shows which files to be careful with
```

## Understanding Drift Reports

### Interpreting Added Files

```
Added (3):
  + src/app/admin/page.tsx
  + src/lib/analytics.ts
  + public/logo.png
```

**Meaning**: These files don't exist in the original template. They're your custom additions.

**Implications**:
- Safe from template updates
- Won't be overwritten
- Your responsibility to maintain

### Interpreting Modified Files

```
Modified (12):
  ~ src/app/layout.tsx
  ~ src/app/page.tsx
  ~ package.json
```

**Meaning**: These files exist in the template but you've changed them.

**Implications**:
- May conflict with template updates
- Need to manually merge updates
- Review changes before updating

### Interpreting Deleted Files

```
Deleted (1):
  - src/app/example/page.tsx
```

**Meaning**: These files exist in the template but you removed them.

**Implications**:
- Intentional removal (likely cleanup)
- Won't cause issues
- Template updates won't restore them

### Interpreting Unchanged Files

```
Unchanged: 132 files
```

**Meaning**: These files match the template exactly.

**Implications**:
- Safe to update from template
- No customizations to lose
- Can regenerate if needed

### Drift Percentage

Calculate drift percentage:

```
Total files: 148
Unchanged:   132
Changed:     16 (added, modified, deleted)

Drift %: (16 / 148) * 100 = 10.8%
```

**Interpretation**:
- 0-5%: Very low drift, close to template
- 5-20%: Moderate drift, typical for production apps
- 20-50%: High drift, heavily customized
- 50%+: Very high drift, significantly diverged

## Drift in Practice

### Example 1: Fresh Export

```bash
$ framework export saas ./my-app
$ cd my-app
$ framework drift .

✅ No drift detected (147 files unchanged)
```

**State**: Project exactly matches template.

### Example 2: After Initial Setup

```bash
$ # Edit .env.local, README.md
$ framework drift .

⚠️  Drift detected:

   Added (1):
     + .env.local

   Modified (1):
     ~ README.md

   Unchanged: 146 files
```

**State**: Minimal drift from configuration changes.

### Example 3: Active Development

```bash
$ # After 2 weeks of development
$ framework drift .

⚠️  Drift detected:

   Added (15):
     + src/app/admin/page.tsx
     + src/app/api/analytics/route.ts
     + src/app/api/webhooks/stripe/route.ts
     + src/components/AdminNav.tsx
     + src/components/Dashboard.tsx
     + src/lib/analytics.ts
     + src/lib/stripe-webhooks.ts
     + ... (8 more)

   Modified (23):
     ~ src/app/layout.tsx
     ~ src/app/page.tsx
     ~ src/components/Header.tsx
     ~ package.json
     ~ ... (19 more)

   Deleted (2):
     - src/app/example/page.tsx
     - src/components/Example.tsx

   Unchanged: 107 files
```

**State**: Significant drift from feature development.

### Example 4: Production App

```bash
$ # After 6 months
$ framework drift .

⚠️  Drift detected:

   Added (47):
     + src/app/admin/...
     + src/app/api/...
     + src/components/...
     + src/lib/...
     + ... (43 more)

   Modified (89):
     ~ Nearly all core files

   Deleted (5):
     - Example files removed

   Unchanged: 6 files
```

**State**: Very high drift. App has significantly evolved.

## Limitations

### 1. Content-Based Only

Drift detection uses file hashes, not semantic understanding:

```typescript
// Original
const x = 1;
const y = 2;

// Modified (functionally identical)
const y = 2;
const x = 1;
```

**Result**: Detected as drift even though functionally identical.

### 2. No Merge Assistance

Drift detection identifies differences but doesn't help merge:

```bash
framework drift .
# Shows: src/app/layout.tsx modified

# You still need to manually merge:
# - What changed in template?
# - What did you customize?
# - How to combine?
```

### 3. Binary Files

Binary files are tracked by hash, but diffs aren't shown:

```bash
Modified:
  ~ public/logo.png
```

No visual diff available for images.

### 4. Manifest Dependency

Drift detection requires the original manifest:

```bash
$ rm .dd/template-manifest.json
$ framework drift .

❌ Missing: .dd/template-manifest.json
Expected a manifest file tracking the original template.
```

**Solution**: Keep `.dd/` directory in version control.

### 5. No Cross-Template Comparison

Can't compare across different templates:

```bash
# Can't do:
framework drift --compare-template blog

# Can only compare to original template
```

### 6. Whitespace Sensitivity

Formatting changes count as drift:

```typescript
// Original
function hello() {
  return "world";
}

// Modified (added blank line)
function hello() {

  return "world";
}
```

**Result**: Detected as drift (different hash).

## Related Concepts

- **[Templates](./templates.md)**: Templates are the baseline for drift detection
- **[Manifest Files](#manifest-files)**: How drift detection tracks changes
- **[Agent Safety](./agent-safety.md)**: Use checkpoints before major changes
- **[Capabilities](./capabilities.md)**: Some features may affect drift

## Next Steps

- Learn about [Template Updates](/Users/joseph.dawson/Documents/dawson-does-framework/docs/guides/updating-templates.md)
- Understand [Manifest Format](/Users/joseph.dawson/Documents/dawson-does-framework/docs/cli/drift.md)
- Read about [Agent Safety](./agent-safety.md)
- Explore [Best Practices](/Users/joseph.dawson/Documents/dawson-does-framework/docs/guides/best-practices.md)

---

**Previous**: [Plugins](./plugins.md)
**Next**: [Agent Safety](./agent-safety.md)
