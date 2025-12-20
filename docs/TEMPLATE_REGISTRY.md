# Template Registry Documentation

The dawson-does-framework template registry allows discovery and distribution of templates through local and remote sources.

## Table of Contents

- [Template Metadata](#template-metadata)
- [Local Registry](#local-registry)
- [CLI Commands](#cli-commands)
- [Remote Registry API](#remote-registry-api)
- [Creating Templates](#creating-templates)
- [Publishing Templates](#publishing-templates)

## Template Metadata

Each template includes a `template.json` file with rich metadata:

```json
{
  "id": "saas",
  "name": "SaaS Starter",
  "version": "1.0.0",
  "description": "Full-stack SaaS template with authentication and billing",
  "author": "Your Name",
  "category": "SaaS",
  "tags": ["nextjs", "react", "saas", "auth", "billing"],
  "minFrameworkVersion": "0.1.0",
  "capabilities": ["auth.supabase", "billing.stripe"],
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0"
  },
  "features": [
    "Next.js 15 with App Router",
    "Supabase authentication",
    "Stripe billing"
  ],
  "license": "MIT"
}
```

### Required Fields

- **id** (string): Unique template identifier (lowercase, hyphen-separated)
- **name** (string): Human-readable template name
- **version** (string): Semantic version (e.g., "1.0.0")
- **description** (string): Clear, concise description

### Optional Fields

- **author** (string): Template creator
- **category** (string): Template category (e.g., "SaaS", "Blog", "Directory")
- **tags** (array): Keywords for discovery
- **minFrameworkVersion** (string): Minimum framework version required
- **capabilities** (array): Required framework capabilities
- **dependencies** (object): npm dependencies
- **features** (array): Key features list
- **license** (string): License identifier (e.g., "MIT")

## Local Registry

Templates are stored locally in the `templates/` directory. Each template is a subdirectory with:

```
templates/
├── saas/
│   ├── template.json          # Template metadata
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
└── seo-directory/
    ├── template.json
    └── ...
```

### Template Discovery

The framework automatically discovers templates with:

1. **Metadata-based discovery**: Templates with `template.json` get full metadata
2. **Fallback discovery**: Directories without metadata are listed as "legacy" templates

## CLI Commands

### List Templates

```bash
# List all templates
framework templates list

# Filter by category
framework templates list --category "SaaS"

# Filter by tag
framework templates list --tag "nextjs"

# Sort by field
framework templates list --sort name
framework templates list --sort category
```

### Search Templates

```bash
# Search by keyword (searches id, name, description, tags)
framework templates search "blog"
framework templates search "nextjs"
```

### Template Information

```bash
# Show detailed info for a template
framework templates info saas
```

Example output:
```
📦 SaaS Starter

ID:          saas
Version:     1.0.0
Category:    SaaS
Author:      Dawson Framework Team

Description:
  Full-stack SaaS template with authentication and billing

Tags: nextjs, react, saas, auth, billing

Capabilities:
  - auth.supabase
  - billing.stripe

Dependencies:
  - next: ^15.0.0
  - react: ^19.0.0

Framework Compatibility:
  Requires: v0.1.0 or higher
  Current:  v0.2.0
  Status:   ✅ Compatible

Usage:
  framework export saas <project-dir>
```

### Categories and Tags

```bash
# List all categories
framework templates categories

# List all tags
framework templates tags
```

## Remote Registry API

The framework supports remote template registries for community templates and private distributions.

### Registry Configuration

Configure registries in `.dd/config.json`:

```json
{
  "registries": [
    {
      "type": "local",
      "path": "./templates"
    },
    {
      "type": "remote",
      "url": "https://registry.example.com/templates",
      "name": "Community Registry"
    },
    {
      "type": "remote",
      "url": "https://private.company.com/templates",
      "name": "Company Templates",
      "auth": {
        "type": "bearer",
        "token": "${COMPANY_REGISTRY_TOKEN}"
      }
    }
  ]
}
```

### Remote Registry Endpoint

A remote registry must implement the following API:

#### GET /templates

Returns a list of available templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "community-blog",
      "name": "Community Blog",
      "version": "2.1.0",
      "description": "Modern blog template",
      "author": "Community",
      "category": "Blog",
      "tags": ["nextjs", "blog", "mdx"],
      "minFrameworkVersion": "0.2.0",
      "downloadUrl": "https://registry.example.com/download/community-blog",
      "source": "remote"
    }
  ],
  "metadata": {
    "registryName": "Community Registry",
    "version": "1.0.0",
    "totalTemplates": 1
  }
}
```

#### GET /templates/:id

Returns detailed information about a specific template.

**Response:**
```json
{
  "id": "community-blog",
  "name": "Community Blog",
  "version": "2.1.0",
  "description": "Modern blog template with MDX support",
  "author": "Community Team",
  "category": "Blog",
  "tags": ["nextjs", "blog", "mdx"],
  "minFrameworkVersion": "0.2.0",
  "capabilities": [],
  "dependencies": {
    "next": "^15.0.0",
    "mdx": "^3.0.0"
  },
  "features": [
    "MDX blog posts",
    "RSS feed",
    "Sitemap generation"
  ],
  "license": "MIT",
  "downloadUrl": "https://registry.example.com/download/community-blog",
  "readme": "Full README content here...",
  "documentation": "https://docs.example.com/templates/blog"
}
```

### Authentication

Remote registries can require authentication:

**Bearer Token:**
```json
{
  "type": "remote",
  "url": "https://registry.example.com/templates",
  "auth": {
    "type": "bearer",
    "token": "${REGISTRY_TOKEN}"
  }
}
```

**API Key:**
```json
{
  "type": "remote",
  "url": "https://registry.example.com/templates",
  "auth": {
    "type": "apikey",
    "key": "${REGISTRY_API_KEY}",
    "header": "X-API-Key"
  }
}
```

### Registry Priority

When multiple registries are configured, templates are merged with the following rules:

1. **First match wins**: If multiple registries have the same template ID, the first one is used
2. **Local first**: Local registry is always checked first
3. **Order matters**: Remote registries are checked in configuration order

## Creating Templates

### 1. Create Template Directory

```bash
mkdir templates/my-template
cd templates/my-template
```

### 2. Add template.json

```json
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "description": "A description of your template",
  "author": "Your Name",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "minFrameworkVersion": "0.2.0",
  "capabilities": [],
  "dependencies": {},
  "features": [
    "Feature 1",
    "Feature 2"
  ],
  "license": "MIT"
}
```

### 3. Add Template Files

Create your template structure:

```
my-template/
├── template.json
├── package.json
├── tsconfig.json
├── src/
│   └── ...
├── .dd/
│   ├── config.json
│   └── health.sh
└── README.md
```

### 4. Test Locally

```bash
framework templates info my-template
framework export my-template ./test-output
```

## Publishing Templates

### Local Distribution

For local or organizational use, simply add templates to the `templates/` directory.

### npm Distribution

Publish your template as an npm package:

```bash
# In your template directory
npm init
npm publish
```

Users can then reference it:
```bash
framework export @your-org/my-template ./project
```

### Remote Registry

Host your templates on a remote registry:

1. **Implement the Registry API** (see above)
2. **Configure authentication** if needed
3. **Users add your registry** to their config:

```json
{
  "registries": [
    {
      "type": "remote",
      "url": "https://your-registry.com/templates"
    }
  ]
}
```

### GitHub Distribution

Templates can be distributed via GitHub:

```bash
framework export github:user/repo/templates/my-template ./project
```

## Best Practices

### Versioning

Follow semantic versioning:
- **Major (1.0.0 → 2.0.0)**: Breaking changes
- **Minor (1.0.0 → 1.1.0)**: New features
- **Patch (1.0.0 → 1.0.1)**: Bug fixes

### Tags

Use descriptive tags for discoverability:
- Framework: `nextjs`, `react`, `vue`
- Purpose: `blog`, `saas`, `ecommerce`
- Features: `auth`, `billing`, `cms`

### Categories

Standard categories:
- **SaaS**: Subscription-based applications
- **Blog**: Content-focused sites
- **Directory**: List/directory sites
- **E-commerce**: Online stores
- **Portfolio**: Personal/company portfolios
- **Documentation**: Doc sites
- **Landing**: Landing pages

### Compatibility

Always specify `minFrameworkVersion`:

```json
{
  "minFrameworkVersion": "0.2.0"
}
```

This ensures users have the required framework features.

### Testing

Test your template thoroughly:

1. **Fresh install**: `framework export my-template ./test`
2. **Dependencies**: `cd test && npm install`
3. **Build**: `npm run build`
4. **Lint**: `npm run lint`
5. **Type check**: `npm run type-check`

## Future Enhancements

Planned features:

- **Template ratings** and reviews
- **Download statistics**
- **Template previews** (screenshots, demos)
- **Version history** and changelogs
- **Template dependencies** (template extends another)
- **Template generator** (scaffold new templates)
- **Private registries** with auth
- **Template marketplace** UI

## Support

- Documentation: https://github.com/jrdaws/framework/tree/main/docs
- Issues: https://github.com/jrdaws/framework/issues
- Templates: https://github.com/jrdaws/framework/tree/main/templates
