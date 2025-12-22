# PostHog Analytics Setup

Complete guide to setting up PostHog product analytics, feature flags, and session replay.

## What It Does

PostHog provides comprehensive product analytics:

- Event tracking for user actions
- Funnels to track conversion paths
- Retention analysis
- Session replay to watch user sessions
- Feature flags for remote feature toggles
- A/B testing and experiments
- User identification and properties
- Heatmaps to see clicks
- Self-hosted option for data privacy
- Free tier: 1M events/month

## Prerequisites

- [ ] PostHog account ([sign up](https://app.posthog.com/signup))
- [ ] Project created in PostHog
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Step-by-Step Setup

### 1. Create PostHog Account

1. Go to [app.posthog.com/signup](https://app.posthog.com/signup)
2. Sign up with email or GitHub
3. Create organization and project
4. Choose cloud or self-hosted

### 2. Get Project API Key

1. In PostHog dashboard, go to **Settings** → **Project**
2. Copy **Project API Key** (starts with `phc_`)
3. Note **API Host** (usually `https://app.posthog.com`)

### 3. Install PostHog

```bash
npm install posthog-js
```

For React hooks:

```bash
npm install posthog-js
```

### 4. Create PostHog Provider

```typescript
// app/providers/posthog-provider.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We'll manually capture
        capture_pageleave: true,
        autocapture: true
      })
    }
  }, [])

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url
      })
    }
  }, [pathname, searchParams])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

### 5. Add to Root Layout

```typescript
// app/layout.tsx
import { PostHogProvider } from './providers/posthog-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

### 6. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Code Examples

### Track Custom Events

```typescript
'use client'

import { usePostHog } from 'posthog-js/react'

export default function SignUpButton() {
  const posthog = usePostHog()

  function handleClick() {
    posthog.capture('signup_clicked', {
      location: 'homepage',
      button_color: 'blue'
    })
  }

  return <button onClick={handleClick}>Sign Up</button>
}
```

### Identify Users

```typescript
// After user logs in
import { usePostHog } from 'posthog-js/react'

export function useIdentifyUser(user: User) {
  const posthog = usePostHog()

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        plan: user.subscription?.plan,
        created_at: user.created_at
      })
    }
  }, [user, posthog])
}
```

### Feature Flags

```typescript
'use client'

import { useFeatureFlagEnabled } from 'posthog-js/react'

export default function Dashboard() {
  const showNewDashboard = useFeatureFlagEnabled('new-dashboard')

  if (showNewDashboard) {
    return <NewDashboard />
  }

  return <OldDashboard />
}
```

Get flag value (not just boolean):

```typescript
import { useFeatureFlagVariantKey } from 'posthog-js/react'

export default function PricingPage() {
  const pricingVariant = useFeatureFlagVariantKey('pricing-test')

  switch (pricingVariant) {
    case 'control':
      return <PricingA />
    case 'variant-b':
      return <PricingB />
    default:
      return <PricingA />
  }
}
```

### Session Replay

Enable session replay to watch user sessions:

```typescript
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  session_recording: {
    maskAllInputs: true, // Mask sensitive inputs
    maskTextContent: false
  }
})
```

### Group Analytics

Track organizations or teams:

```typescript
posthog.group('company', 'company_id_123', {
  name: 'Acme Inc',
  plan: 'enterprise',
  employees: 50
})
```

### Track E-commerce

```typescript
// Product viewed
posthog.capture('product_viewed', {
  product_id: '123',
  product_name: 'Wireless Mouse',
  category: 'Electronics',
  price: 29.99
})

// Added to cart
posthog.capture('product_added_to_cart', {
  product_id: '123',
  quantity: 1,
  price: 29.99
})

// Purchase completed
posthog.capture('purchase_completed', {
  order_id: 'order_123',
  total: 29.99,
  currency: 'USD',
  products: [
    { id: '123', name: 'Wireless Mouse', price: 29.99 }
  ]
})
```

### Track Form Submissions

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  posthog.capture('form_submitted', {
    form_name: 'contact',
    fields: ['name', 'email', 'message']
  })

  // Submit form...
}
```

### Track Errors

```typescript
try {
  // Your code
} catch (error) {
  posthog.capture('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    component: 'CheckoutForm'
  })

  throw error
}
```

### Server-Side Tracking

```typescript
// app/api/purchase/route.ts
import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST }
)

export async function POST(req: Request) {
  const { userId, amount } = await req.json()

  // Track on server
  posthog.capture({
    distinctId: userId,
    event: 'server_purchase',
    properties: {
      amount,
      currency: 'USD'
    }
  })

  await posthog.shutdown() // Flush events

  return Response.json({ success: true })
}
```

## A/B Testing

### Create Experiment

1. In PostHog, go to **Experiments**
2. Click **New experiment**
3. Set up variants and goals
4. Launch experiment

### Use in Code

```typescript
'use client'

import { useFeatureFlagVariantKey, usePostHog } from 'posthog-js/react'

export default function CallToAction() {
  const posthog = usePostHog()
  const variant = useFeatureFlagVariantKey('cta-button-test')

  function handleClick() {
    posthog.capture('cta_clicked', {
      variant
    })
  }

  const buttonText = variant === 'variant-b' ? 'Get Started Free' : 'Try Now'

  return <button onClick={handleClick}>{buttonText}</button>
}
```

## Funnels

Track conversion funnels:

```typescript
// Step 1: Landing page
posthog.capture('funnel_landing_page_viewed')

// Step 2: Sign up form viewed
posthog.capture('funnel_signup_form_viewed')

// Step 3: Sign up completed
posthog.capture('funnel_signup_completed')

// Step 4: First action taken
posthog.capture('funnel_first_action_completed')
```

View funnel in PostHog dashboard to see drop-off rates.

## Privacy & GDPR

### Opt Out

```typescript
// User opts out of tracking
posthog.opt_out_capturing()

// Resume tracking
posthog.opt_in_capturing()

// Check status
const hasOptedOut = posthog.has_opted_out_capturing()
```

### Cookie Consent

```typescript
'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
      posthog.opt_out_capturing() // Opt out by default
    }
  }, [])

  function acceptCookies() {
    localStorage.setItem('cookie-consent', 'true')
    posthog.opt_in_capturing()
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <p>We use cookies to improve your experience.</p>
      <button onClick={acceptCookies}>Accept</button>
    </div>
  )
}
```

### Mask Sensitive Data

```typescript
posthog.init(key, {
  session_recording: {
    maskAllInputs: true, // Mask all input fields
    maskTextSelector: '.sensitive', // Mask specific elements
  }
})
```

## Performance Optimization

### Lazy Load PostHog

```typescript
useEffect(() => {
  // Load after page is interactive
  if (typeof window !== 'undefined') {
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(key, { api_host })
    })
  }
}, [])
```

### Batch Events

```typescript
posthog.init(key, {
  api_host,
  loaded: (posthog) => {
    posthog.set_config({
      batch_size: 10, // Send every 10 events
      batch_flush_interval_ms: 5000 // Or every 5 seconds
    })
  }
})
```

## Testing

### Test Events Locally

```typescript
// Enable debug mode
posthog.init(key, {
  api_host,
  debug: true, // See events in console
  autocapture: false // Disable for testing
})

// Capture test event
posthog.capture('test_event', { foo: 'bar' })
```

Check PostHog dashboard → Live Events to see events in real-time.

## Common Issues

### Events Not Showing

**Solutions:**
1. Check API key is correct
2. Verify `NEXT_PUBLIC_` prefix on env vars
3. Check browser console for errors
4. Enable debug mode
5. Check ad blockers aren't blocking

### Feature Flags Not Loading

**Solutions:**
1. Ensure user is identified: `posthog.identify(userId)`
2. Wait for flags to load: `posthog.onFeatureFlags(() => {...})`
3. Check flag is enabled in PostHog dashboard

### Session Replay Not Recording

**Solutions:**
1. Verify session recording is enabled in project settings
2. Check `session_recording` config in init
3. Ensure domain is whitelisted

## Production Checklist

- [ ] API key set in production environment
- [ ] GDPR compliance implemented
- [ ] Cookie consent banner added
- [ ] Sensitive data masked in session replay
- [ ] Feature flags tested
- [ ] Funnels defined
- [ ] Error tracking set up
- [ ] Rate limiting considered
- [ ] Performance impact measured

## Next Steps

- [Plausible Setup](plausible.md) - Alternative analytics
- [Database Integration](../database/supabase.md) - Store user data
- [Authentication](../auth/supabase.md) - Identify users
- [PostHog Documentation](https://posthog.com/docs) - Official docs

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [Feature Flags Guide](https://posthog.com/docs/feature-flags)
- [Session Replay Guide](https://posthog.com/docs/session-replay)
- [Experiments Guide](https://posthog.com/docs/experiments)
