# Integrations

Integrations extend templates with specific third-party services and functionality, allowing you to add authentication, payments, email, databases, and more to your projects.

## Table of Contents

- [What Are Integrations?](#what-are-integrations)
- [Why Integrations Exist](#why-integrations-exist)
- [How Integrations Work](#how-integrations-work)
- [Integration Architecture](#integration-architecture)
- [Provider Abstraction Pattern](#provider-abstraction-pattern)
- [Integration Lifecycle](#integration-lifecycle)
- [Available Integrations](#available-integrations)
- [When to Use Integrations](#when-to-use-integrations)
- [Creating Custom Integrations](#creating-custom-integrations)
- [Examples](#examples)
- [Best Practices](#best-practices)

## What Are Integrations?

An integration is a pre-built, tested implementation of a third-party service that can be added to a template during export. Each integration includes:

- **Service Configuration**: Setup code and configuration
- **API Wrappers**: Type-safe client libraries
- **UI Components**: Pre-built components (login forms, payment buttons, etc.)
- **Environment Variables**: Required credentials and settings
- **Dependencies**: npm packages needed
- **Documentation**: Usage instructions

### Integration Structure

```
templates/saas/integrations/auth/supabase/
├── integration.json           # Metadata
├── lib/
│   ├── supabase.ts           # Client setup
│   └── auth.ts               # Auth helpers
├── components/
│   ├── LoginForm.tsx         # Login UI
│   └── SignupForm.tsx        # Signup UI
├── app/
│   ├── login/                # Route handlers
│   └── api/auth/            # API routes
└── README.md                 # Integration docs
```

## Why Integrations Exist

### 1. Eliminate Boilerplate

**Without Integrations**:
```bash
# Manual setup process
1. Read Supabase documentation
2. Install dependencies
3. Create client configuration
4. Build auth components
5. Set up API routes
6. Handle edge cases
7. Test thoroughly
Time: 4-8 hours
```

**With Integrations**:
```bash
framework export saas ./my-app --auth supabase
# Everything configured and working
Time: 2 minutes
```

### 2. Best Practices Included

Integrations include production-ready patterns:
- Error handling
- Type safety
- Security best practices
- Performance optimizations
- Accessibility features

### 3. Consistent Patterns

Same integration pattern across all templates:
```typescript
// Same auth pattern everywhere
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) return unauthorized();
  // ...
}
```

### 4. Easy Switching

Swap providers without rewriting code:
```bash
# Start with Supabase
framework export saas ./app --auth supabase

# Later switch to Clerk
# (update integration, keep same patterns)
```

## How Integrations Work

### Integration Discovery

When you request an integration:

```
1. Template declares supported integrations
   ↓
2. Framework validates compatibility
   ↓
3. Integration files are located
   ↓
4. Dependencies are merged
   ↓
5. Files are copied to project
   ↓
6. Environment template is updated
```

### Integration Application

```typescript
// Framework applies integration during export
async function applyIntegration(
  projectDir: string,
  integration: Integration
) {
  // 1. Copy source files
  await copyIntegrationFiles(projectDir, integration);

  // 2. Merge package.json dependencies
  await mergeDependencies(projectDir, integration.dependencies);

  // 3. Update .env.example
  await mergeEnvExample(projectDir, integration.envVars);

  // 4. Run post-install hooks
  await runPostInstallHooks(integration);
}
```

### Integration Metadata

Each integration has an `integration.json`:

```json
{
  "provider": "supabase",
  "type": "auth",
  "version": "1.0.0",
  "description": "Supabase authentication integration",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10"
  },
  "devDependencies": {},
  "envVars": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "files": {
    "lib": ["lib/supabase/**", "lib/auth/**"],
    "components": ["components/auth/**"],
    "app": ["app/(auth)/**", "app/api/auth/**"]
  },
  "conflicts": ["clerk"],
  "requires": [],
  "postInstallInstructions": "Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local"
}
```

## Integration Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Application Code                │
│  (Your business logic)                  │
└────────────┬────────────────────────────┘
             │ uses
             ↓
┌─────────────────────────────────────────┐
│      Integration Layer                  │
│  (Provider-specific implementations)    │
│  • auth/supabase/                       │
│  • payments/stripe/                     │
└────────────┬────────────────────────────┘
             │ implements
             ↓
┌─────────────────────────────────────────┐
│      Provider Abstractions              │
│  (Standard interfaces)                  │
│  • AuthProvider                         │
│  • PaymentProvider                      │
└────────────┬────────────────────────────┘
             │ defined in
             ↓
┌─────────────────────────────────────────┐
│      Framework Core                     │
│  (src/platform/providers/)              │
└─────────────────────────────────────────┘
```

### Integration Types

**1. Authentication**
- User signup/login
- Session management
- Password reset
- OAuth providers
- Providers: Supabase, Clerk, Auth0

**2. Payments**
- Subscription billing
- One-time payments
- Invoice generation
- Webhook handling
- Providers: Stripe, Paddle

**3. Email**
- Transactional emails
- Marketing campaigns
- Template management
- Delivery tracking
- Providers: SendGrid, Resend, Postmark

**4. Database**
- Data persistence
- Migrations
- Query building
- Connection pooling
- Providers: Postgres, MongoDB, MySQL

**5. AI**
- Text generation
- Embeddings
- Function calling
- Streaming responses
- Providers: Anthropic, OpenAI

**6. Analytics**
- Event tracking
- User behavior
- Conversion funnels
- A/B testing
- Providers: PostHog, Mixpanel, Amplitude

**7. Storage**
- File uploads
- Image optimization
- CDN distribution
- Access control
- Providers: Supabase Storage, S3, Cloudinary

## Provider Abstraction Pattern

The framework uses provider abstractions to enable easy switching:

### Abstract Interface

```typescript
// src/platform/providers/auth.ts
export interface AuthProvider {
  // Session management
  getSession(): Promise<Session | null>;
  createSession(credentials: Credentials): Promise<Session>;
  destroySession(): Promise<void>;

  // User management
  getUser(id: string): Promise<AuthUser | null>;
  updateUser(id: string, data: Partial<AuthUser>): Promise<AuthUser>;

  // OAuth
  signInWithOAuth(provider: OAuthProvider): Promise<{ url: string }>;

  // Health check
  healthCheck(): Promise<ProviderHealth>;
}
```

### Concrete Implementation

```typescript
// src/platform/providers/impl/auth.supabase.ts
export class SupabaseAuthProvider implements AuthProvider {
  private client: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new AuthError(error.message);
    return data.session ? this.mapSession(data.session) : null;
  }

  async createSession(credentials: Credentials): Promise<Session> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw new AuthError(error.message);
    return this.mapSession(data.session);
  }

  // ... other methods
}
```

### Usage in Templates

```typescript
// Templates use the abstract interface
import { getAuthProvider } from '@/lib/auth';

export async function GET() {
  const auth = getAuthProvider();
  const session = await auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

### Benefits

1. **Swappable**: Change providers without rewriting code
2. **Testable**: Mock the interface for testing
3. **Type-Safe**: TypeScript catches errors
4. **Consistent**: Same API across providers

## Integration Lifecycle

### Phase 1: Definition

Create integration structure:

```bash
templates/saas/integrations/auth/supabase/
├── integration.json
├── lib/
├── components/
└── app/
```

### Phase 2: Validation

Framework validates during export:

```typescript
// Validate integration compatibility
const validation = await validateIntegrations(templatePath, {
  auth: 'supabase',
  payments: 'stripe',
});

if (!validation.valid) {
  console.error('Integration errors:', validation.errors);
  process.exit(1);
}
```

### Phase 3: Application

Integration is applied to project:

```
1. Copy integration files
   ↓
2. Merge dependencies into package.json
   ↓
3. Add env vars to .env.example
   ↓
4. Run post-install hooks
   ↓
5. Integration ready for use
```

### Phase 4: Configuration

Developer configures:

```bash
# Set environment variables
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
EOF

# Install dependencies
npm install

# Integration is now active
```

### Phase 5: Usage

Use in application code:

```typescript
// app/api/users/route.ts
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getUser();
  if (!user) return unauthorized();

  const profile = await db.profiles.findUnique({
    where: { userId: user.id },
  });

  return Response.json(profile);
}
```

## Available Integrations

### Authentication

#### Supabase
**Tier**: Free
**Features**:
- Email/password auth
- Magic links
- OAuth (Google, GitHub, etc.)
- Row-level security
- Real-time subscriptions

**Setup**:
```bash
framework export saas ./app --auth supabase
```

**Configuration**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

#### Clerk
**Tier**: Free
**Features**:
- Pre-built UI components
- Multi-factor authentication
- User management dashboard
- Webhooks
- Organizations

**Setup**:
```bash
framework export saas ./app --auth clerk
```

**Configuration**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
```

### Payments

#### Stripe
**Tier**: Pro
**Features**:
- Subscription billing
- One-time payments
- Customer portal
- Webhook handling
- Invoice generation

**Setup**:
```bash
framework export saas ./app --payments stripe
```

**Configuration**:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Email

#### Resend
**Tier**: Free
**Features**:
- Transactional emails
- React email templates
- Delivery tracking
- Simple API

**Setup**:
```bash
framework export saas ./app --email resend
```

**Configuration**:
```env
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@example.com
```

#### SendGrid
**Tier**: Free
**Features**:
- Transactional & marketing
- Template builder
- Analytics
- A/B testing

**Setup**:
```bash
framework export saas ./app --email sendgrid
```

**Configuration**:
```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@example.com
```

### Database

#### Postgres
**Tier**: Free
**Features**:
- Prisma ORM
- Migrations
- Type-safe queries
- Connection pooling

**Setup**:
```bash
framework export saas ./app --db postgres
```

**Configuration**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### AI

#### Anthropic
**Tier**: Pro
**Features**:
- Claude 3.5 Sonnet
- Streaming responses
- Function calling
- Vision support

**Setup**:
```bash
framework export saas ./app --ai anthropic
```

**Configuration**:
```env
ANTHROPIC_API_KEY=sk-ant-xxx
```

#### OpenAI
**Tier**: Pro
**Features**:
- GPT-4
- Embeddings
- Function calling
- Vision

**Setup**:
```bash
framework export saas ./app --ai openai
```

**Configuration**:
```env
OPENAI_API_KEY=sk-xxx
```

### Analytics

#### PostHog
**Tier**: Pro
**Features**:
- Product analytics
- Session replay
- Feature flags
- A/B testing

**Setup**:
```bash
framework export saas ./app --analytics posthog
```

**Configuration**:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## When to Use Integrations

### Use Integrations When:

**1. Starting a New Project**
```bash
# Get everything configured from the start
framework export saas ./app \
  --auth supabase \
  --payments stripe \
  --email resend
```

**2. Adding Standard Functionality**
- User authentication
- Payment processing
- Email sending
- Database connections

**3. Following Best Practices**
- Integrations include error handling
- Security considerations
- Performance optimizations

### Don't Use Integrations When:

**1. Custom Requirements**
- Unique business logic
- Non-standard flows
- Highly specialized needs

**2. Existing Projects**
- Prefer manual integration
- Risk of conflicts

**3. Learning**
- If understanding the service deeply
- Build integration manually first

## Creating Custom Integrations

### Step 1: Create Directory Structure

```bash
mkdir -p templates/my-template/integrations/custom/my-provider
cd templates/my-template/integrations/custom/my-provider
```

### Step 2: Create integration.json

```json
{
  "provider": "my-provider",
  "type": "custom",
  "version": "1.0.0",
  "description": "My custom integration",
  "dependencies": {
    "my-sdk": "^1.0.0"
  },
  "devDependencies": {},
  "envVars": [
    "MY_PROVIDER_API_KEY",
    "MY_PROVIDER_SECRET"
  ],
  "files": {
    "lib": ["lib/my-provider/**"],
    "components": ["components/my-provider/**"]
  },
  "conflicts": [],
  "requires": [],
  "postInstallInstructions": "Visit https://my-provider.com to get API keys"
}
```

### Step 3: Implement Provider

```typescript
// lib/my-provider/client.ts
import { MyProviderSDK } from 'my-sdk';

export function createClient() {
  return new MyProviderSDK({
    apiKey: process.env.MY_PROVIDER_API_KEY,
    secret: process.env.MY_PROVIDER_SECRET,
  });
}

// lib/my-provider/helpers.ts
export async function myProviderAction() {
  const client = createClient();
  const result = await client.doSomething();
  return result;
}
```

### Step 4: Add Components (Optional)

```typescript
// components/my-provider/MyComponent.tsx
'use client';

export function MyComponent() {
  return (
    <div>
      <h2>My Provider Integration</h2>
      {/* Component implementation */}
    </div>
  );
}
```

### Step 5: Document Usage

```markdown
# My Provider Integration

## Setup

1. Get API keys from https://my-provider.com
2. Add to .env.local:
   ```
   MY_PROVIDER_API_KEY=xxx
   MY_PROVIDER_SECRET=xxx
   ```
3. Use in your app:
   ```typescript
   import { myProviderAction } from '@/lib/my-provider/helpers';
   await myProviderAction();
   ```
```

### Step 6: Test Integration

```bash
# Test export with integration
framework export my-template ./test \
  --custom my-provider \
  --template-source local

# Verify files copied
cd test
ls -la lib/my-provider/
ls -la components/my-provider/

# Check package.json
grep "my-sdk" package.json

# Check .env.example
cat .env.example
```

## Examples

### Example 1: Auth + Database

```bash
framework export saas ./app \
  --auth supabase \
  --db postgres
```

Result:
- Supabase auth configured
- Postgres database with Prisma
- Auth checks in API routes
- Database queries type-safe

### Example 2: Full Stack SaaS

```bash
framework export saas ./app \
  --auth supabase \
  --payments stripe \
  --email resend \
  --db postgres \
  --analytics posthog
```

Result:
- Complete SaaS infrastructure
- All integrations configured
- Ready for production use

### Example 3: Blog with Analytics

```bash
framework export blog ./blog \
  --analytics posthog
```

Result:
- MDX blog
- PostHog analytics tracking
- Page view events

## Best Practices

### 1. Use Environment Variables

```typescript
// Good: Use env vars
const client = createClient({
  apiKey: process.env.MY_API_KEY,
});

// Bad: Hardcode credentials
const client = createClient({
  apiKey: 'sk_live_xxx', // Never do this!
});
```

### 2. Handle Errors Gracefully

```typescript
// Good: Handle errors
try {
  const result = await api.call();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  return fallbackValue;
}

// Bad: Let errors crash app
const result = await api.call();
```

### 3. Type Everything

```typescript
// Good: Full type safety
interface ApiResponse {
  data: User[];
  error?: string;
}

async function fetchUsers(): Promise<ApiResponse> {
  // ...
}

// Bad: Untyped
async function fetchUsers() {
  // Returns any
}
```

### 4. Abstract Provider Details

```typescript
// Good: Hide implementation
export async function sendEmail(to: string, subject: string, body: string) {
  const client = getEmailClient(); // Could be any provider
  return client.send({ to, subject, body });
}

// Bad: Expose provider
export async function sendEmailWithResend(to: string, subject: string) {
  // Tightly coupled to Resend
}
```

### 5. Document Configuration

```typescript
/**
 * Initialize payment client
 *
 * @requires env:STRIPE_SECRET_KEY
 * @requires env:STRIPE_WEBHOOK_SECRET
 */
export function initializePayments() {
  // ...
}
```

### 6. Validate Environment

```typescript
// Check required env vars on startup
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```

### 7. Test Integrations

```typescript
describe('Auth Integration', () => {
  it('should create session', async () => {
    const auth = getAuthProvider();
    const session = await auth.createSession({
      email: 'test@example.com',
      password: 'password',
    });
    expect(session).toBeDefined();
    expect(session.user.email).toBe('test@example.com');
  });
});
```

## Related Concepts

- **[Templates](./templates.md)**: Templates declare supported integrations
- **[Capabilities](./capabilities.md)**: Some integrations require specific plan tiers
- **[Provider Abstractions](../architecture/design-decisions.md#provider-pattern)**: How integrations are abstracted
- **[Configuration](../guides/configuration.md)**: Setting up integrations

## Next Steps

- Explore [Available Integrations](../guides/integration-catalog.md)
- Learn about [Capabilities](./capabilities.md)
- Read the [Configuration Guide](../guides/configuration.md)
- Create a [Custom Integration](../guides/creating-integrations.md)

---

**Previous**: [Capabilities](./capabilities.md)
**Next**: [Plugins](./plugins.md)
