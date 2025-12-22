# Templates

Templates are the foundation of the Dawson Does Framework. They provide complete, production-ready project structures that you can customize and extend for your specific needs.

## Table of Contents

- [What Are Templates?](#what-are-templates)
- [Why Templates Exist](#why-templates-exist)
- [How Templates Work](#how-templates-work)
- [Template Lifecycle](#template-lifecycle)
- [Template Composition](#template-composition)
- [When to Use Templates](#when-to-use-templates)
- [Available Templates](#available-templates)
- [Template Metadata](#template-metadata)
- [Creating Custom Templates](#creating-custom-templates)
- [Template Best Practices](#template-best-practices)

## What Are Templates?

A template is a complete, working application structure that serves as a starting point for your project. Think of it as a "project blueprint" that includes:

- **Application Code**: Full source code with working features
- **Configuration**: Build tools, linters, TypeScript config
- **Dependencies**: Pre-configured package.json with tested versions
- **Documentation**: README and setup instructions
- **Integrations**: Optional add-ons (auth, payments, etc.)
- **Metadata**: Template information and manifest

### Anatomy of a Template

```
templates/saas/
├── template.json              # Template metadata
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Framework config (Next.js)
├── src/                      # Application source
│   ├── app/                  # Routes (App Router)
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── types/                # TypeScript types
├── public/                   # Static assets
├── integrations/             # Optional features
│   ├── auth/
│   │   ├── supabase/
│   │   └── clerk/
│   └── payments/
│       └── stripe/
├── .dd/                      # Framework metadata
│   ├── config.json
│   └── health.sh
└── README.md                 # Project documentation
```

### Template vs Starter

**Template** (our approach):
- Complete, opinionated structure
- Integrated features and patterns
- Designed for customization
- One-time export, then it's yours

**Starter** (traditional approach):
- Minimal boilerplate
- You build everything on top
- More flexibility, more work
- Often lacks production features

## Why Templates Exist

Templates solve several common problems in project initialization:

### 1. Decision Fatigue

**Problem**: Starting a new project requires hundreds of decisions:
- Which framework version?
- What project structure?
- Which auth provider?
- How to handle errors?
- What testing setup?

**Solution**: Templates provide battle-tested decisions out of the box. You can accept defaults or customize as needed.

### 2. Boilerplate Burden

**Problem**: Setting up production-ready infrastructure takes days:
- Configure build tools
- Set up linting and formatting
- Add error boundaries
- Configure testing
- Set up CI/CD

**Solution**: Templates include all this infrastructure from day one. Start building features immediately.

### 3. Pattern Consistency

**Problem**: Different projects use different patterns:
- API route structure varies
- State management approaches differ
- Error handling is inconsistent

**Solution**: Templates enforce consistent patterns across projects, making maintenance easier.

### 4. Integration Complexity

**Problem**: Adding authentication, payments, or other services requires:
- Reading documentation
- Writing integration code
- Handling edge cases
- Testing thoroughly

**Solution**: Templates include pre-tested integrations that work out of the box.

## How Templates Work

### Template Resolution

When you export a template, the framework resolves it in this order:

```
1. Check for local template in templates/<name>/
   ↓ (if not found)
2. Fetch from remote GitHub repository
   ↓
3. Apply version pinning if specified
   ↓
4. Clone template to target directory
```

#### Resolution Modes

**Auto Mode** (default):
```bash
framework export saas ./my-app
# Uses local if available, otherwise remote
```

**Local Mode**:
```bash
framework export saas ./my-app --template-source local
# Only uses local templates/ directory
# Useful for development and testing
```

**Remote Mode**:
```bash
framework export saas ./my-app --template-source remote
# Always fetches from GitHub
# Ensures latest stable version
```

**Version Pinning**:
```bash
framework export saas ./my-app --framework-version v1.2.0
# Fetches specific version from GitHub
# Useful for reproducible builds
```

### Template Export Process

Here's what happens when you run `framework export`:

```
┌─────────────────────────────────────────┐
│ 1. Validation                           │
│    - Check template exists              │
│    - Validate flags                     │
│    - Check git availability             │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Pre-Export Hooks                     │
│    - Run plugin validation              │
│    - Check preconditions                │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Template Clone                       │
│    - Resolve template source            │
│    - Clone using degit or fs.copy       │
│    - Exclude node_modules, .git         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Manifest Creation                    │
│    - Hash all template files            │
│    - Write .dd/manifest.json            │
│    - Baseline for drift detection       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 5. Integration Application              │
│    - Validate integrations              │
│    - Copy integration files             │
│    - Merge dependencies                 │
│    - Update .env.example                │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 6. Starter Files                        │
│    - Create README.md                   │
│    - Write .gitignore                   │
│    - Generate .dd/config.json           │
│    - Copy health.sh                     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 7. Git Initialization                   │
│    - git init -b main                   │
│    - git add -A                         │
│    - git commit                         │
│    - (optional) configure remote & push │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 8. Post-Export Hooks                    │
│    - Run plugin post-processing         │
│    - Generate documentation             │
│    - (optional) run setup scripts       │
└─────────────────────────────────────────┘
```

### File Exclusions

These files/folders are never copied from templates:

- `node_modules/` - Install fresh dependencies
- `.git/` - Start with clean git history
- `.next/` - Build artifacts
- `.dd/agent-safety-log.json` - Project-specific logs

## Template Lifecycle

### Phase 1: Creation

A template starts as a regular Next.js (or other framework) application:

```bash
# Create a new Next.js app
npx create-next-app@latest my-template

# Add framework metadata
cd my-template
mkdir -p .dd
echo '{"plan": "free"}' > .dd/config.json

# Create template.json
cat > template.json << EOF
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "description": "A custom template",
  "category": "Custom",
  "tags": ["nextjs", "react"]
}
EOF
```

### Phase 2: Development

Build out the template with features:

1. **Core Functionality**: Implement main features
2. **Integrations**: Create optional add-ons in `integrations/`
3. **Documentation**: Write setup instructions
4. **Testing**: Ensure template exports and runs correctly

### Phase 3: Distribution

Make the template available:

**Local Development**:
```bash
# Place in framework templates/
cp -r my-template /path/to/framework/templates/
```

**GitHub Distribution**:
```bash
# Push to GitHub repository
git push origin main

# Users reference via degit
framework export github:user/repo/templates/my-template ./project
```

**npm Distribution**:
```bash
# Publish as npm package
npm publish

# Users install globally or locally
npm install -g @myorg/my-template
```

### Phase 4: Usage

Developers export and customize:

```bash
# Export template
framework export my-template ./my-project

# Customize code
cd my-project
# Edit files, add features

# Check drift
framework drift .
# Output: Shows what changed from template
```

### Phase 5: Evolution

Templates improve over time:

1. **Bug Fixes**: Address issues in template code
2. **New Features**: Add capabilities
3. **Version Bumps**: Semantic versioning
4. **Migration Guides**: Help users upgrade

## Template Composition

Templates support layered composition for maximum flexibility:

### Base Template

The core structure:

```typescript
// templates/base/
export const config = {
  typescript: true,
  tailwind: true,
  eslint: true,
};
```

### Template Extensions

Add features on top:

```typescript
// templates/saas/
import { config as baseConfig } from '../base';

export const config = {
  ...baseConfig,
  auth: true,
  payments: true,
};
```

### Integration Layers

Optional functionality:

```
templates/saas/
└── integrations/
    ├── auth/
    │   ├── supabase/        # Supabase auth integration
    │   │   ├── integration.json
    │   │   ├── lib/auth.ts
    │   │   └── components/
    │   └── clerk/           # Clerk auth integration
    │       ├── integration.json
    │       └── ...
    └── payments/
        └── stripe/          # Stripe payments integration
            ├── integration.json
            └── ...
```

### Composition at Export Time

```bash
# Base template only
framework export base ./app

# Base + auth integration
framework export base ./app --auth supabase

# Full composition
framework export saas ./app \
  --auth supabase \
  --payments stripe \
  --email resend
```

### Benefits of Composition

1. **Modularity**: Features are independent and testable
2. **Flexibility**: Pick only what you need
3. **Maintainability**: Update integrations separately
4. **Discoverability**: Clear structure for available features

## When to Use Templates

### Good Use Cases

**Starting a New Project**
```bash
# Perfect for greenfield projects
framework export saas ./my-saas
```

**Prototyping**
```bash
# Get a working app in minutes
framework demo landing-page
```

**Learning Best Practices**
```bash
# Study production-ready code
framework export saas ./study-project
```

**Internal Tools**
```bash
# Consistent structure across tools
framework export dashboard ./admin-panel
```

### When NOT to Use Templates

**Existing Projects**
- Don't retrofit templates into existing codebases
- Use manual integration copying instead

**Highly Custom Requirements**
- If you need significantly different structure
- Consider forking and modifying a template

**Learning Fundamentals**
- If you're learning React/Next.js basics
- Start with simpler tutorials first

**Experimental Projects**
- Templates are opinionated
- Might constrain experimentation

## Available Templates

### Production Templates

#### saas
**Purpose**: Full-featured SaaS application
**Framework**: Next.js 15 (App Router)
**Features**:
- Modern React patterns
- TypeScript throughout
- Tailwind CSS styling
- SEO optimized

**Integrations**:
- Auth: Supabase, Clerk
- Payments: Stripe
- Email: SendGrid, Resend
- Database: Postgres

**Best For**:
- Subscription-based products
- B2B SaaS applications
- User dashboards

```bash
framework export saas ./my-saas \
  --auth supabase \
  --payments stripe
```

#### seo-directory
**Purpose**: SEO-optimized directory website
**Framework**: Next.js 15 (App Router)
**Features**:
- Static generation
- Sitemap generation
- Schema.org markup
- Search functionality

**Integrations**:
- CMS: Contentful, Sanity
- Search: Algolia

**Best For**:
- Directory websites
- Resource aggregators
- Listing platforms

```bash
framework export seo-directory ./my-directory
```

#### blog
**Purpose**: Modern blog with MDX support
**Framework**: Next.js 15
**Features**:
- MDX for content
- Syntax highlighting
- RSS feed
- SEO optimized

**Integrations**:
- Analytics: Vercel, PostHog
- Comments: Giscus

**Best For**:
- Personal blogs
- Technical writing
- Documentation sites

```bash
framework export blog ./my-blog
```

#### dashboard
**Purpose**: Admin dashboard and data visualization
**Framework**: Next.js 15
**Features**:
- Chart components
- Data tables
- Form builders
- Real-time updates

**Integrations**:
- Auth: Required
- Database: Required
- Real-time: Supabase, Ably

**Best For**:
- Admin panels
- Internal tools
- Analytics dashboards

```bash
framework export dashboard ./admin \
  --auth supabase \
  --db postgres
```

#### landing-page
**Purpose**: Marketing landing page
**Framework**: Next.js 15
**Features**:
- Hero sections
- Feature grids
- Testimonials
- CTA components

**Integrations**:
- Email: For signups
- Analytics: For tracking

**Best For**:
- Product launches
- Marketing campaigns
- Lead generation

```bash
framework export landing-page ./marketing
```

### Choosing a Template

Ask yourself:

1. **What's the primary purpose?**
   - User-facing app → `saas`
   - Content site → `blog`
   - Data/admin → `dashboard`
   - Marketing → `landing-page`
   - Directory/listings → `seo-directory`

2. **What features do I need?**
   - Authentication? → Use `--auth`
   - Payments? → Use `--payments`
   - Content management? → Choose blog/seo-directory

3. **What's my expertise level?**
   - Beginner → Start with `landing-page` or `blog`
   - Intermediate → Try `saas` or `dashboard`
   - Advanced → Customize any template

## Template Metadata

Every template includes a `template.json` file:

```json
{
  "id": "saas",
  "name": "SaaS Starter",
  "version": "1.0.0",
  "description": "Full-stack SaaS template with auth and billing",
  "author": "Dawson Framework Team",
  "category": "SaaS",
  "tags": ["nextjs", "react", "saas", "typescript"],
  "minFrameworkVersion": "0.2.0",
  "supportedIntegrations": {
    "auth": ["supabase", "clerk"],
    "payments": ["stripe"],
    "email": ["sendgrid", "resend"]
  },
  "requiredIntegrations": [],
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0"
  },
  "features": [
    "Next.js 15 App Router",
    "TypeScript",
    "Tailwind CSS",
    "ESLint configuration"
  ],
  "license": "MIT"
}
```

### Metadata Fields

**Required**:
- `id`: Unique identifier (lowercase, hyphens)
- `name`: Display name
- `version`: Semantic version
- `description`: Brief summary

**Optional**:
- `author`: Creator name
- `category`: Classification
- `tags`: Search keywords
- `minFrameworkVersion`: Minimum CLI version
- `supportedIntegrations`: Available add-ons
- `requiredIntegrations`: Mandatory add-ons
- `dependencies`: npm packages
- `features`: Key highlights
- `license`: License identifier

## Creating Custom Templates

### Step 1: Create Base Structure

```bash
# Start with a working Next.js app
npx create-next-app@latest my-custom-template

cd my-custom-template
```

### Step 2: Add Framework Metadata

```bash
# Create framework directory
mkdir -p .dd

# Create config
cat > .dd/config.json << EOF
{
  "plan": "free",
  "featureOverrides": {}
}
EOF

# Create template metadata
cat > template.json << EOF
{
  "id": "my-template",
  "name": "My Custom Template",
  "version": "1.0.0",
  "description": "A custom template for my needs",
  "category": "Custom",
  "tags": ["nextjs", "custom"]
}
EOF
```

### Step 3: Build Features

Implement your template's core functionality:

```typescript
// src/app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>My Custom Template</h1>
      <p>Built with the Dawson Does Framework</p>
    </main>
  );
}
```

### Step 4: Add Integrations (Optional)

Create optional features:

```bash
mkdir -p integrations/auth/custom-provider

cat > integrations/auth/custom-provider/integration.json << EOF
{
  "provider": "custom-provider",
  "type": "auth",
  "version": "1.0.0",
  "description": "Custom authentication provider",
  "dependencies": {
    "custom-auth": "^1.0.0"
  },
  "envVars": [
    "CUSTOM_AUTH_KEY",
    "CUSTOM_AUTH_SECRET"
  ],
  "files": {
    "lib": ["lib/auth/**"],
    "components": ["components/auth/**"]
  }
}
EOF
```

### Step 5: Test Locally

```bash
# Copy to framework templates directory
cp -r . /path/to/framework/templates/my-template

# Test export
framework export my-template ./test-project --template-source local

# Verify
cd test-project
npm install
npm run dev
```

### Step 6: Document

Create a comprehensive README:

```markdown
# My Custom Template

## Features
- Feature 1
- Feature 2

## Getting Started

\`\`\`bash
framework export my-template ./my-project
cd my-project
npm install
npm run dev
\`\`\`

## Integrations

### Authentication
...

## Configuration
...
```

### Step 7: Version and Distribute

```bash
# Tag version
git tag v1.0.0
git push --tags

# Users can now export
framework export github:user/repo/templates/my-template ./project
```

## Template Best Practices

### 1. Start with Working Code

**Good**:
```typescript
// Template includes working auth
export async function getUser() {
  const session = await getServerSession();
  return session?.user;
}
```

**Bad**:
```typescript
// TODO: Implement authentication
export async function getUser() {
  throw new Error('Not implemented');
}
```

### 2. Use TypeScript

**Good**:
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
}

export function formatUser(user: User): string {
  return user.name || user.email;
}
```

**Bad**:
```javascript
// No types, harder to extend
export function formatUser(user) {
  return user.name || user.email;
}
```

### 3. Include Documentation

**Good**:
```typescript
/**
 * Fetches user profile from the database
 * @param userId - The user's unique identifier
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string) {
  // ...
}
```

### 4. Make Configuration Obvious

**Good**:
```typescript
// config/auth.ts
export const authConfig = {
  provider: process.env.AUTH_PROVIDER || 'supabase',
  redirectUrl: process.env.AUTH_REDIRECT_URL || '/dashboard',
};
```

**Bad**:
```typescript
// Hardcoded, hard to find
const AUTH_URL = 'https://example.com/auth';
```

### 5. Provide Examples

Include a working example of every major feature:

```
templates/saas/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Working login page
│   │   │   └── signup/         # Working signup page
│   │   └── (dashboard)/
│   │       └── page.tsx        # Example dashboard
```

### 6. Handle Errors Gracefully

**Good**:
```typescript
try {
  const user = await getUser();
  return user;
} catch (error) {
  console.error('Failed to fetch user:', error);
  return null;
}
```

**Bad**:
```typescript
// Unhandled error crashes app
const user = await getUser();
```

### 7. Keep It Updated

- Update dependencies regularly
- Fix reported issues
- Add requested features
- Document changes

### 8. Test Integration Points

```typescript
// Test that integrations work together
describe('Auth + Database', () => {
  it('should store user in database after signup', async () => {
    const user = await signUp(email, password);
    const stored = await db.users.findUnique({ where: { id: user.id } });
    expect(stored).toBeDefined();
  });
});
```

## Related Concepts

- **[Integrations](./integrations.md)**: Add features to templates
- **[Drift Detection](./drift-detection.md)**: Track template modifications
- **[Manifest Files](./drift-detection.md#manifest-files)**: Template snapshots
- **[Capabilities](./capabilities.md)**: Plan-gated features

## Next Steps

- Explore [Available Templates](../guides/template-catalog.md)
- Learn about [Integrations](./integrations.md)
- Read the [Template Registry Documentation](../TEMPLATE_REGISTRY.md)
- Create your [First Custom Template](../guides/creating-templates.md)

---

**Previous**: [Core Concepts](./README.md)
**Next**: [Capabilities](./capabilities.md)
