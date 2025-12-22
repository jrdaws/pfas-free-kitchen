# Contributing to Dawson Does Framework

Welcome! This guide will help you contribute to the framework, whether you're fixing bugs, adding features, creating templates, or improving documentation.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure for Contributors](#project-structure-for-contributors)
- [Adding New Templates](#adding-new-templates)
- [Adding New Integrations](#adding-new-integrations)
- [Adding New Providers](#adding-new-providers)
- [Testing Guidelines](#testing-guidelines)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git 2.28+ installed
- Basic understanding of TypeScript/JavaScript
- Familiarity with Next.js (for template work)

### Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/dawson-does-framework.git
cd dawson-does-framework

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Try local framework
npm link
framework --help

# 5. Create a branch
git checkout -b feature/my-contribution
```

## Development Setup

### Local Installation

```bash
# Install dependencies
npm install

# Link for local development
npm link

# Now `framework` command uses local code
framework export saas ./test-app
```

### Development Workflow

```bash
# 1. Make changes to src/
vim src/dd/manifest.mjs

# 2. Test changes immediately
framework export saas ./test

# 3. Run tests
npm test

# 4. Run specific tests
npm test -- manifest

# 5. Check linting
npm run lint  # If configured
```

### Unlink After Development

```bash
# Unlink local version
npm unlink

# Install published version
npm install -g @jrdaws/framework
```

## Project Structure for Contributors

### Key Directories

```
dawson-does-framework/
├── bin/framework.js          # CLI entry point
├── src/
│   ├── commands/             # Command implementations
│   ├── dd/                   # Core services
│   └── platform/             # Provider layer
├── templates/                # Templates you can create
├── tests/                    # Tests (please add tests!)
└── docs/                     # Documentation (please improve!)
```

### What to Work On

**Good First Issues**:
- Documentation improvements
- Bug fixes in existing commands
- Adding tests
- Improving error messages

**Intermediate**:
- New integrations
- New templates
- CLI command improvements
- Provider implementations

**Advanced**:
- Core services modifications
- New CLI commands
- Architecture changes

## Adding New Templates

### 1. Create Template Directory

```bash
mkdir -p templates/my-template
cd templates/my-template
```

### 2. Create Next.js App

```bash
# Start with create-next-app
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir

# Or copy from existing template
cp -r ../saas/* .
```

### 3. Add Template Metadata

Create `template.json`:

```json
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "description": "Description of your template",
  "author": "Your Name",
  "category": "Category",
  "tags": ["nextjs", "react", "your-tags"],
  "minFrameworkVersion": "0.3.0",
  "supportedIntegrations": {
    "auth": ["supabase"],
    "payments": ["stripe"]
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0"
  },
  "features": [
    "Feature 1",
    "Feature 2"
  ],
  "license": "MIT"
}
```

### 4. Add Framework Config

Create `.dd/config.json`:

```json
{
  "plan": "free",
  "featureOverrides": {}
}
```

### 5. Register in CLI

Add to `bin/framework.js`:

```javascript
const TEMPLATES = {
  "my-template": "jrdaws/dawson-does-framework/templates/my-template",
  // ... existing templates
};
```

### 6. Test Locally

```bash
# Export from local
framework export my-template ./test \
  --template-source local

# Verify it works
cd test
npm install
npm run dev
```

### 7. Document

Create `docs/templates/my-template.md`:

```markdown
# My Template

## Overview
[Description]

## Features
- Feature 1
- Feature 2

## Getting Started
\`\`\`bash
framework export my-template ./my-app
\`\`\`

## Configuration
[How to configure]

## Deployment
[How to deploy]
```

### 8. Submit PR

```bash
git add templates/my-template/
git add bin/framework.js
git add docs/templates/my-template.md
git commit -m "feat(templates): add my-template"
git push origin feature/my-template
```

## Adding New Integrations

### 1. Create Integration Directory

```bash
mkdir -p templates/saas/integrations/auth/my-auth
cd templates/saas/integrations/auth/my-auth
```

### 2. Create integration.json

```json
{
  "provider": "my-auth",
  "type": "auth",
  "version": "1.0.0",
  "description": "My authentication provider",
  "dependencies": {
    "my-auth-sdk": "^1.0.0"
  },
  "envVars": [
    "MY_AUTH_API_KEY",
    "MY_AUTH_SECRET"
  ],
  "files": {
    "lib": ["lib/my-auth/**"],
    "components": ["components/auth/**"],
    "app": ["app/(auth)/**"]
  },
  "conflicts": ["supabase", "clerk"],
  "postInstallInstructions": "Visit https://my-auth.com to get API keys"
}
```

### 3. Implement Integration

```typescript
// lib/my-auth/client.ts
import { MyAuthSDK } from 'my-auth-sdk';

export function createAuthClient() {
  return new MyAuthSDK({
    apiKey: process.env.MY_AUTH_API_KEY!,
    secret: process.env.MY_AUTH_SECRET!,
  });
}

// lib/my-auth/server.ts
import { cookies } from 'next/headers';
import { createAuthClient } from './client';

export async function getSession() {
  const client = createAuthClient();
  const sessionId = cookies().get('session')?.value;
  if (!sessionId) return null;
  return await client.getSession(sessionId);
}
```

### 4. Add UI Components

```tsx
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 5. Test Integration

```bash
# Export with integration
framework export saas ./test \
  --auth my-auth \
  --template-source local

# Check files copied
cd test
ls -la lib/my-auth/
ls -la components/auth/

# Check package.json
grep "my-auth-sdk" package.json

# Test it works
npm install
npm run dev
```

## Adding New Providers

### 1. Define Interface

If interface doesn't exist, create it:

```typescript
// src/platform/providers/auth.ts
export interface AuthProvider {
  getSession(): Promise<Session | null>;
  createSession(credentials: Credentials): Promise<Session>;
  destroySession(): Promise<void>;
  // ... more methods
}
```

### 2. Implement Provider

```typescript
// src/platform/providers/impl/auth.myauth.ts
import { AuthProvider } from '../auth.ts';
import type { Session, Credentials } from '../types.ts';

export class MyAuthProvider implements AuthProvider {
  private client: MyAuthClient;

  constructor(config: MyAuthConfig) {
    this.client = new MyAuthClient(config);
  }

  async getSession(): Promise<Session | null> {
    try {
      const session = await this.client.getSession();
      return this.mapSession(session);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async createSession(credentials: Credentials): Promise<Session> {
    const session = await this.client.signIn(
      credentials.email,
      credentials.password
    );
    return this.mapSession(session);
  }

  async destroySession(): Promise<void> {
    await this.client.signOut();
  }

  private mapSession(raw: any): Session {
    return {
      userId: raw.id,
      email: raw.email,
      expiresAt: new Date(raw.expires_at),
    };
  }
}
```

### 3. Add Tests

```typescript
// tests/unit/providers/auth.myauth.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MyAuthProvider } from '../../../src/platform/providers/impl/auth.myauth.ts';

describe('MyAuthProvider', () => {
  it('creates session successfully', async () => {
    const provider = new MyAuthProvider({
      apiKey: 'test-key',
    });

    const session = await provider.createSession({
      email: 'test@example.com',
      password: 'password',
    });

    assert.ok(session);
    assert.equal(session.email, 'test@example.com');
  });
});
```

## Testing Guidelines

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- manifest

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

Use Node.js built-in test runner:

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('manifest', () => {
  describe('sha256File', () => {
    it('calculates correct hash', () => {
      const hash = sha256File('./test-file.txt');
      assert.equal(hash.length, 64);  // SHA256 is 64 hex chars
    });

    it('returns same hash for same content', () => {
      const hash1 = sha256File('./file.txt');
      const hash2 = sha256File('./file.txt');
      assert.equal(hash1, hash2);
    });
  });
});
```

### Test Structure

```
tests/
├── unit/              # Unit tests (fast, isolated)
│   ├── manifest.test.mjs
│   └── drift.test.mjs
│
├── integration/       # Integration tests (slower)
│   └── export-flow.test.mjs
│
└── fixtures/          # Test data
    └── templates/
```

### What to Test

**Must Test**:
- Core business logic
- Data transformations
- Error handling
- Edge cases

**Nice to Test**:
- CLI command routing
- Integration application
- Provider implementations

**Don't Test**:
- Third-party libraries
- Node.js built-ins
- Simple getters/setters

## Code Style

### JavaScript/TypeScript

```javascript
// Use const/let, never var
const name = "value";
let counter = 0;

// Use async/await, not callbacks
async function fetchData() {
  const data = await fetch(url);
  return data;
}

// Use template literals
const message = `Hello, ${name}!`;

// Use destructuring
const { templateId, projectDir } = context;

// Use arrow functions for callbacks
const filtered = items.filter(item => item.active);

// Add JSDoc comments for public APIs
/**
 * Calculate SHA256 hash of a file
 * @param {string} filePath - Absolute path to file
 * @returns {string} Hex-encoded hash
 */
export function sha256File(filePath) {
  // ...
}
```

### TypeScript

```typescript
// Use interfaces for object shapes
interface AuthProvider {
  getSession(): Promise<Session | null>;
}

// Use type for unions/intersections
type Status = 'active' | 'inactive';

// Prefer explicit return types
function getUser(id: string): Promise<User> {
  return fetchUser(id);
}

// Use unknown instead of any
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}
```

### File Organization

```javascript
// 1. Imports (Node built-ins first)
import fs from 'node:fs';
import path from 'node:path';

// 2. External dependencies
import degit from 'degit';
import fse from 'fs-extra';

// 3. Internal imports
import { writeManifest } from './manifest.mjs';

// 4. Constants
const TEMPLATES = { /* ... */ };

// 5. Helper functions
function validateName(name) { /* ... */ }

// 6. Main exports
export function cmdExport(templateId, projectDir) {
  // ...
}
```

### Error Handling

```javascript
// Validate inputs early
function validateProject(name) {
  if (!name) {
    throw new Error('Project name is required');
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error('Project name must be lowercase alphanumeric');
  }
}

// Use try-catch for async operations
async function fetchData() {
  try {
    const data = await fetch(url);
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw new Error('Data fetch failed');
  }
}

// Provide helpful error messages
throw new Error(
  `Unknown template: ${templateId}\n` +
  `Valid templates: ${Object.keys(TEMPLATES).join(', ')}`
);
```

## Pull Request Process

### Before Submitting

1. **Test your changes**: `npm test`
2. **Check for lint errors**: Review any diagnostics
3. **Update documentation**: If adding features
4. **Add tests**: For new functionality
5. **Update FRAMEWORK_MAP.md**: Run `npm run framework:map`

### PR Title Format

Use conventional commits:

```
feat(templates): add e-commerce template
fix(drift): handle deleted files correctly
docs(architecture): add design decisions document
chore(deps): update Next.js to 15.1.0
```

### PR Description Template

```markdown
## What

Brief description of changes.

## Why

Explanation of why this change is needed.

## How

Technical details of implementation.

## Testing

How did you test this?

## Screenshots

If UI changes, include screenshots.

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] FRAMEWORK_MAP.md regenerated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks**: Tests must pass
2. **Code review**: At least one approval
3. **Documentation**: Must be updated
4. **Breaking changes**: Require discussion

### After Approval

Maintainers will:
1. Merge your PR
2. Update version
3. Publish to npm (if needed)
4. Thank you!

## Community Guidelines

### Be Respectful

- Be kind and welcoming
- Assume good intentions
- Give constructive feedback
- Accept constructive criticism

### Be Helpful

- Answer questions
- Help newcomers
- Share knowledge
- Celebrate contributions

### Be Collaborative

- Discuss before major changes
- Ask for help when stuck
- Share your ideas
- Work together

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas
- **Pull Requests**: Code contributions
- **Documentation**: Improve docs directly

## Getting Help

### Stuck on Something?

1. **Read the docs**: Check existing documentation
2. **Search issues**: Your question might be answered
3. **Ask in Discussions**: Community can help
4. **Open an issue**: If you found a bug

### Need Guidance?

- Add `good first issue` label to issues
- Ask for help in PR comments
- Request code review
- Reach out to maintainers

## Thank You!

Every contribution matters, whether it's:
- Fixing a typo in documentation
- Reporting a bug
- Suggesting a feature
- Writing code
- Helping others

Thank you for making the Dawson Does Framework better!

---

**Related Documentation**:
- [Architecture Overview](./README.md)
- [Project Structure](./project-structure.md)
- [Design Decisions](./design-decisions.md)
- [Plugin API](/Users/joseph.dawson/Documents/dawson-does-framework/docs/PLUGIN_API.md)
- [Template Registry](/Users/joseph.dawson/Documents/dawson-does-framework/docs/TEMPLATE_REGISTRY.md)
