# Export Command

The `export` command creates a new project from a template, initializes git, and optionally sets up a remote repository.

## Usage

```bash
framework export <templateId> <projectDir> [options]
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--name <repoName>` | Name for the project | Folder name |
| `--remote <gitUrl>` | Git remote URL to add as origin | None |
| `--push` | Push to remote after init (requires `--remote`) | `false` |
| `--branch <branch>` | Branch name for initial commit | `main` |
| `--dry-run` | Show what would happen without making changes | `false` |
| `--force` | Overwrite existing non-empty directory | `false` |

## Available Templates

- `seo-directory` - SEO-focused directory website
- `saas` - SaaS application starter
- `internal-tool` - Internal tooling template
- `automation` - Automation scripts template

## Examples

### Basic export

```bash
framework export seo-directory ~/Documents/Cursor/my-app
```

### Export with remote and push

```bash
framework export saas ~/Documents/Cursor/my-saas \
  --remote https://github.com/me/my-saas.git \
  --push
```

### Export with custom branch

```bash
framework export internal-tool ./tool --name tool --branch main
```

### Dry run (preview operations)

```bash
framework export saas ./my-project --dry-run
```

## What It Does

1. **Clones template** - Uses degit to clone the specified template into `projectDir`
2. **Creates starter files** (if they don't exist):
   - `README.md` - Project readme with getting started instructions
   - `.gitignore` - Sensible defaults for Node.js projects
   - `.dd/config.json` - Framework configuration with `plan: "free"`
   - `.dd/health.sh` - Health check script (if available in package)
   - `START_PROMPT.md` - Cursor prompt template (if available in package)
3. **Initializes git** - `git init` with specified branch
4. **Creates initial commit** - Commits all files
5. **Sets up remote** (if `--remote` provided)
6. **Pushes to remote** (if `--push` specified)

## Safety Guarantees

- **Zero framework repo mutation** - All operations target only the specified `projectDir`
- **Non-destructive** - Won't overwrite existing directories unless `--force` is used
- **Deterministic** - No interactive prompts; behavior is fully determined by flags
- **Works globally** - Functions correctly when CLI is installed via `npm -g` or `npm link`

## Error Handling

| Error | Resolution |
|-------|------------|
| Directory exists and not empty | Use `--force` to overwrite |
| `--push` without `--remote` | Provide `--remote` URL |
| Unknown template | Check available templates above |
| Git not installed | Install git and ensure it's in PATH |

## Requirements

- Node.js 18+
- Git (for repository initialization)
- Network access (for cloning templates and pushing)

