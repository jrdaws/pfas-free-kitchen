# Sentry Error Monitoring Setup

Complete guide to setting up Sentry error monitoring in your framework project.

## What It Does

Sentry provides comprehensive error monitoring:

- Real-time error tracking and alerting
- Stack traces with source maps
- Performance monitoring (traces)
- Session replay to see user actions
- Release tracking and deploy notifications
- Issue grouping and assignment
- Slack/email/PagerDuty integrations
- Error context (user, browser, OS)
- Free tier: 5,000 errors/month

## Prerequisites

- [ ] Sentry account ([sign up](https://sentry.io/signup))
- [ ] Project created in Sentry dashboard
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

## Step-by-Step Setup

### 1. Create Sentry Account

1. Go to [sentry.io/signup](https://sentry.io/signup)
2. Sign up with email or GitHub
3. Create organization
4. Select platform: **Next.js**

### 2. Get Project DSN

1. In Sentry dashboard, go to **Settings** → **Projects** → Your Project
2. Go to **Client Keys (DSN)**
3. Copy the DSN URL

### 3. Install Sentry SDK

```bash
npx @sentry/wizard@latest -i nextjs
```

This wizard will:
- Install `@sentry/nextjs`
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Create example API route

### 4. Manual Setup (Alternative)

If the wizard doesn't work:

```bash
npm install @sentry/nextjs
```

Create config files:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

Update `next.config.js`:

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Your existing config
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
```

### 5. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

Get auth token: **Settings** → **Auth Tokens** → **Create New Token**

### 6. Test Error Capture

Create a test button:

```typescript
'use client';

export default function TestSentry() {
  return (
    <button
      onClick={() => {
        throw new Error('Test Sentry Error');
      }}
    >
      Test Sentry
    </button>
  );
}
```

Check Sentry dashboard for the error.

## Code Examples

### Capture Exceptions

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'checkout',
      priority: 'high',
    },
    extra: {
      orderId: '12345',
      userId: user.id,
    },
  });
  throw error;
}
```

### Capture Messages

```typescript
import * as Sentry from '@sentry/nextjs';

// Warning level
Sentry.captureMessage('User attempted unauthorized action', 'warning');

// With context
Sentry.captureMessage('Payment processing slow', {
  level: 'warning',
  tags: { gateway: 'stripe' },
  extra: { processingTime: 5000 },
});
```

### Set User Context

```typescript
import * as Sentry from '@sentry/nextjs';

// After user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  subscription: user.plan,
});

// On logout
Sentry.setUser(null);
```

### Add Breadcrumbs

```typescript
import * as Sentry from '@sentry/nextjs';

// Track user actions
Sentry.addBreadcrumb({
  category: 'user',
  message: 'Added item to cart',
  level: 'info',
  data: {
    productId: '123',
    quantity: 2,
  },
});

// Track navigation
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'Navigated to checkout',
  level: 'info',
});
```

### Error Boundary Component

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack });
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-gray-600 mt-2">
              Error ID: {this.state.eventId}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### API Route Error Handling

```typescript
// app/api/users/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/users' },
    });
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

### Performance Monitoring

```typescript
import * as Sentry from '@sentry/nextjs';

async function processOrder(orderId: string) {
  return Sentry.startSpan(
    { name: 'processOrder', op: 'function' },
    async (span) => {
      span.setAttribute('orderId', orderId);

      // Child span for database
      await Sentry.startSpan(
        { name: 'fetchOrder', op: 'db' },
        async () => {
          return await db.order.findUnique({ where: { id: orderId } });
        }
      );

      // Child span for payment
      await Sentry.startSpan(
        { name: 'chargePayment', op: 'http' },
        async () => {
          return await stripe.charges.create({ ... });
        }
      );

      return { success: true };
    }
  );
}
```

### Session Replay

Enable session replay to watch user sessions:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});
```

### Custom Tags and Context

```typescript
import * as Sentry from '@sentry/nextjs';

// Set global tags
Sentry.setTags({
  environment: process.env.NODE_ENV,
  version: process.env.NEXT_PUBLIC_APP_VERSION,
});

// Set context for a specific scope
Sentry.setContext('order', {
  id: order.id,
  total: order.total,
  items: order.items.length,
});
```

### Release Tracking

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  environment: process.env.NODE_ENV,
});
```

In CI/CD:

```bash
# Create release
sentry-cli releases new $VERSION

# Associate commits
sentry-cli releases set-commits $VERSION --auto

# Upload source maps
sentry-cli sourcemaps upload --release=$VERSION ./out

# Finalize release
sentry-cli releases finalize $VERSION

# Deploy notification
sentry-cli releases deploys $VERSION new -e production
```

## Alert Configuration

### Set Up Alerts in Dashboard

1. Go to **Alerts** → **Create Alert**
2. Choose alert type:
   - **Issue Alert**: New errors, regressions
   - **Metric Alert**: Error rate, performance
3. Configure conditions:
   - Error count threshold
   - Affected users threshold
   - Error rate percentage
4. Set notification channels:
   - Email
   - Slack
   - PagerDuty
   - Webhooks

### Example Alert Rules

**High Priority Errors:**
```
When: An issue is first seen
Filter: level:error AND environment:production
Then: Send Slack notification to #alerts
```

**Error Spike:**
```
When: Error count > 100 in 1 hour
Filter: environment:production
Then: Send PagerDuty alert
```

## Troubleshooting

### Errors Not Appearing

**Solutions:**
1. Verify DSN is correct
2. Check browser console for Sentry errors
3. Ensure `NEXT_PUBLIC_` prefix on DSN
4. Restart dev server after config changes
5. Check Sentry project settings for rate limits

### Source Maps Not Working

**Solutions:**
1. Verify `SENTRY_AUTH_TOKEN` has project:releases scope
2. Check source maps are uploading during build
3. Ensure `hideSourceMaps: true` in production
4. Verify release version matches

### Performance Impact

**Solutions:**
1. Reduce `tracesSampleRate` (0.1 = 10% of transactions)
2. Reduce `replaysSessionSampleRate`
3. Use `beforeSend` to filter events
4. Exclude noisy errors with `ignoreErrors`

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // Only 10% of transactions
  beforeSend(event) {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^Loading chunk \d+ failed/,
  ],
});
```

## Production Checklist

- [ ] DSN configured for production project
- [ ] Source maps uploading in CI/CD
- [ ] Release tracking enabled
- [ ] User context set after login
- [ ] Alert rules configured
- [ ] Notification channels set up
- [ ] Sample rates optimized
- [ ] Sensitive data filtered
- [ ] Session replay configured
- [ ] Performance monitoring enabled

## Pricing Notes

Sentry pricing tiers:

- **Developer:** Free, 5,000 errors/month
- **Team:** $26/month, 50,000 errors/month
- **Business:** $80/month, 100,000 errors/month
- **Enterprise:** Custom pricing

Features by tier:
- Developer: Basic error tracking
- Team: Performance monitoring, session replay
- Business: Advanced alerting, integrations
- Enterprise: SSO, SLA, dedicated support

## Next Steps

- [Analytics Integration](../analytics/posthog.md) - Correlate errors with analytics
- [Database Integration](../database/supabase.md) - Add user context
- [Sentry Documentation](https://docs.sentry.io/) - Official docs
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/) - Framework guide

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js SDK Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Alerting Guide](https://docs.sentry.io/product/alerts/)

