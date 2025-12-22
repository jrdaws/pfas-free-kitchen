# Analytics Integrations

Track user behavior and product analytics with PostHog or Plausible.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **PostHog** | Product analytics & experiments | Events, funnels, session replay, feature flags, A/B tests | [Guide →](posthog.md) |
| **Plausible** | Privacy-first web analytics | Simple, lightweight, GDPR compliant, no cookies | [Guide →](plausible.md) |

## Provider Comparison

### PostHog

✅ **Full product analytics** - Events, funnels, retention
✅ **Session replay** - Watch user sessions
✅ **Feature flags** - Toggle features remotely
✅ **A/B testing** - Run experiments
✅ **Heatmaps** - See where users click
✅ **Self-hosted option** - Keep data private
✅ **Free tier** - 1M events/month

**Best for:** SaaS products, data-driven teams, product managers

### Plausible

✅ **Privacy-first** - No cookies, GDPR compliant
✅ **Lightweight** - < 1KB script
✅ **Simple dashboard** - Easy to understand
✅ **Open source** - Transparent codebase
✅ **Fast** - No performance impact
✅ **EU hosting** - Data stays in EU

**Best for:** Content sites, privacy-conscious projects, simple analytics

## Quick Start

### PostHog Setup

```bash
# Install
npm install posthog-js

# Add keys
echo "NEXT_PUBLIC_POSTHOG_KEY=phc_xxx" >> .env.local
echo "NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com" >> .env.local

# Initialize
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

# Track event
posthog.capture('button_clicked', { button: 'signup' })
```

### Plausible Setup

```bash
# Add script to layout
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
/>

# Track custom events
window.plausible('signup', { props: { plan: 'pro' } })
```

## Common Use Cases

### Page Views

Track which pages users visit:

```typescript
// PostHog
posthog.capture('$pageview')

// Plausible - automatic
```

### Custom Events

Track user actions:

```typescript
// PostHog
posthog.capture('purchase_completed', {
  product: 'Pro Plan',
  amount: 29.99,
  currency: 'USD'
})

// Plausible
window.plausible('purchase', {
  props: {
    product: 'Pro Plan',
    amount: 29.99
  }
})
```

### User Identification

Identify logged-in users:

```typescript
// PostHog
posthog.identify(
  userId,
  {
    email: user.email,
    name: user.name,
    plan: 'pro'
  }
)

// Plausible - no user identification (privacy-first)
```

### Funnels

Track conversion paths:

```typescript
// PostHog
posthog.capture('funnel_step_1_landing')
posthog.capture('funnel_step_2_signup')
posthog.capture('funnel_step_3_payment')
```

### Feature Flags

Toggle features remotely:

```typescript
// PostHog
const showNewFeature = posthog.isFeatureEnabled('new-dashboard')

if (showNewFeature) {
  return <NewDashboard />
}

// Plausible - not supported
```

### A/B Testing

Run experiments:

```typescript
// PostHog
const variant = posthog.getFeatureFlag('pricing-test')

if (variant === 'control') {
  return <PricingA />
} else {
  return <PricingB />
}

// Plausible - not supported
```

## Integration Patterns

### Next.js App Router

```typescript
// app/providers.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function AnalyticsProvider({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
      })
    }
  }, [])

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview')
    }
  }, [pathname, searchParams])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### Track Button Clicks

```typescript
'use client'

import { usePostHog } from 'posthog-js/react'

export default function SignUpButton() {
  const posthog = usePostHog()

  return (
    <button
      onClick={() => {
        posthog.capture('signup_button_clicked', {
          location: 'hero'
        })
      }}
    >
      Sign Up
    </button>
  )
}
```

### Track Form Submissions

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  posthog.capture('form_submitted', {
    form: 'contact',
    fields: ['name', 'email', 'message']
  })

  // Submit form...
}
```

## Privacy Compliance

### GDPR Compliance

```typescript
// PostHog - opt-in/opt-out
posthog.opt_out_capturing() // Stop tracking
posthog.opt_in_capturing() // Resume tracking

// Show cookie banner
if (!hasConsent) {
  posthog.opt_out_capturing()
}
```

### Cookie-less Tracking

```typescript
// Plausible - no cookies by default

// PostHog - disable cookies
posthog.init(key, {
  persistence: 'memory' // Don't use cookies
})
```

## Performance

### Lazy Loading

```typescript
// Load analytics after page interactive
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(key, { api_host })
    })
  }
}, [])
```

### Minimal Script Size

```html
<!-- Plausible: < 1KB -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>

<!-- PostHog: ~20KB -->
```

## Common Issues

### Events Not Appearing

**Solutions:**
1. Check API key is correct
2. Verify domain matches
3. Check browser console for errors
4. Disable ad blockers for testing

### Ad Blockers

**PostHog:** Often blocked by ad blockers

**Solutions:**
1. Use custom domain (analytics.yourdomain.com)
2. Self-host PostHog
3. Use Plausible (rarely blocked)

### Performance Impact

**Solutions:**
1. Load analytics after page interactive
2. Use lightweight provider (Plausible)
3. Defer script loading
4. Don't track too many events

## Next Steps

- [PostHog Setup Guide](posthog.md) - Full product analytics
- [Plausible Setup Guide](plausible.md) - Privacy-first analytics
- [Authentication](../auth/supabase.md) - Track authenticated users
- [Database](../database/supabase.md) - Store analytics data

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [Plausible Documentation](https://plausible.io/docs)
- [Web Analytics Guide](https://web.dev/vitals/)
