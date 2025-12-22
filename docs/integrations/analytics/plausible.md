# Plausible Analytics Setup

Complete guide to setting up Plausible privacy-first web analytics.

## What It Does

Plausible provides simple, privacy-friendly analytics:

- Lightweight script (< 1KB)
- No cookies or personal data collection
- GDPR, CCPA, PECR compliant by default
- Simple, easy-to-understand dashboard
- Real-time visitor data
- Page views and traffic sources
- Custom event tracking
- Goal tracking for conversions
- Open source
- EU-hosted data (optional)

## Prerequisites

- [ ] Plausible account ([sign up](https://plausible.io/register))
- [ ] Website added to Plausible
- [ ] Domain verified

## Environment Variables Required

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

## Step-by-Step Setup

### 1. Create Plausible Account

1. Go to [plausible.io/register](https://plausible.io/register)
2. Choose plan (30-day free trial)
3. Add your website domain
4. Complete verification

### 2. Get Tracking Script

1. In Plausible dashboard, go to your site
2. Click **Settings** → **General**
3. Copy the script snippet

### 3. Add Script to Next.js

```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Verify Installation

1. Visit your website
2. Check Plausible dashboard for real-time visitor
3. You should see your visit within seconds

## Code Examples

### Basic Setup (Automatic Page Views)

```typescript
// app/layout.tsx - Page views tracked automatically
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          defer
          data-domain="yourdomain.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Track Custom Events

Enable custom events:

```typescript
// app/layout.tsx
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
/>
```

Track events in components:

```typescript
'use client'

export default function SignUpButton() {
  function handleClick() {
    // @ts-ignore
    window.plausible('signup', {
      props: {
        location: 'homepage',
        plan: 'pro'
      }
    })
  }

  return <button onClick={handleClick}>Sign Up</button>
}
```

### TypeScript Support

Add type definitions:

```typescript
// types/plausible.d.ts
interface PlausibleOptions {
  props?: Record<string, string | number | boolean>
  callback?: () => void
}

interface Window {
  plausible: (eventName: string, options?: PlausibleOptions) => void
}
```

Use with type safety:

```typescript
window.plausible('button_clicked', {
  props: {
    button: 'signup',
    location: 'hero'
  }
})
```

### Track Outbound Links

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.outbound-links.js"
/>
```

Outbound links are tracked automatically.

### Track File Downloads

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.file-downloads.js"
/>
```

Downloads tracked automatically (PDF, ZIP, etc.).

### Track 404 Pages

```typescript
// app/not-found.tsx
'use client'

import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    window.plausible('404', {
      props: { path: window.location.pathname }
    })
  }, [])

  return <h1>Page Not Found</h1>
}
```

### Track Form Submissions

```typescript
'use client'

export default function ContactForm() {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    window.plausible('form_submit', {
      props: {
        form: 'contact'
      }
    })

    // Submit form...
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Track E-commerce

```typescript
// Product viewed
window.plausible('product_view', {
  props: {
    product: 'Wireless Mouse',
    price: 29.99
  }
})

// Purchase completed
window.plausible('purchase', {
  props: {
    value: 29.99,
    currency: 'USD',
    product: 'Wireless Mouse'
  }
})
```

### Revenue Tracking

```typescript
window.plausible('purchase', {
  props: {
    amount: 29.99,
    currency: 'USD'
  }
})
```

Set up revenue goal in Plausible dashboard to track total revenue.

## Goals Setup

### 1. Create Goal in Dashboard

1. Go to **Settings** → **Goals**
2. Click **Add goal**
3. Choose type:
   - **Pageview goal:** Track specific page visits
   - **Custom event:** Track custom events

### 2. Pageview Goal Example

Track visits to `/thank-you` page:

```
Goal: Pageview
Page path: /thank-you
```

### 3. Custom Event Goal Example

Track `signup` event:

```
Goal: Custom event
Event name: signup
```

## Advanced Features

### Hash-based Routing

For SPAs with hash routing:

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.hash.js"
/>
```

### Local Development

Exclude localhost:

```typescript
{process.env.NODE_ENV === 'production' && (
  <Script
    defer
    data-domain="yourdomain.com"
    src="https://plausible.io/js/script.js"
  />
)}
```

### Multiple Domains

Track multiple domains:

```typescript
<Script
  defer
  data-domain="domain1.com,domain2.com"
  src="https://plausible.io/js/script.js"
/>
```

### Custom API Host (Self-hosted)

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  data-api="https://analytics.yourdomain.com/api/event"
  src="https://analytics.yourdomain.com/js/script.js"
/>
```

### Exclude Specific Pages

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  data-exclude="/admin,/dashboard"
  src="https://plausible.io/js/script.js"
/>
```

## Integration with Next.js

### Track Route Changes

```typescript
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PlausibleTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    window.plausible('pageview')
  }, [pathname, searchParams])

  return null
}
```

Add to layout:

```typescript
// app/layout.tsx
import { PlausibleTracker } from './plausible-tracker'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js" />
      </head>
      <body>
        <PlausibleTracker />
        {children}
      </body>
    </html>
  )
}
```

### Environment-based Setup

```typescript
// lib/analytics.ts
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props })
  }
}
```

Use anywhere:

```typescript
import { trackEvent } from '@/lib/analytics'

trackEvent('button_clicked', { button: 'signup' })
```

## Privacy Compliance

### GDPR Compliant by Default

Plausible is GDPR compliant out of the box:

- No cookies
- No personal data collection
- No cross-site tracking
- EU-hosted data option

**No cookie banner required!**

### Data Retention

Set data retention period in settings:

1. Go to **Settings** → **General**
2. Set **Data retention:** 6 months, 12 months, 24 months, or forever

### Data Export

Export your data:

1. Go to **Settings** → **Imports & Exports**
2. Click **Export data**
3. Download CSV

## Testing

### Test in Development

```typescript
// Always track in development
<Script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
/>
```

Check Plausible dashboard for real-time visitor.

### Test Custom Events

```typescript
// Test event tracking
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Tracking event:', eventName)
  }
  window.plausible(eventName, { props })
}, [])
```

## Common Issues

### Script Not Loading

**Solutions:**
1. Check domain in `data-domain` matches Plausible site
2. Verify script URL is correct
3. Check browser console for errors
4. Disable ad blockers for testing

### Events Not Appearing

**Solutions:**
1. Check goal is created in Plausible dashboard
2. Verify event name matches exactly
3. Check browser console for errors
4. Wait a few seconds for data to appear

### Blocked by Ad Blockers

**Solutions:**
1. Use custom domain proxy
2. Self-host Plausible
3. Educate users about privacy-friendly tracking

### Custom Domain Proxy

Set up proxy to avoid ad blockers:

```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/js/script.js',
        destination: 'https://plausible.io/js/script.js'
      },
      {
        source: '/api/event',
        destination: 'https://plausible.io/api/event'
      }
    ]
  }
}
```

Update script:

```typescript
<Script
  defer
  data-domain="yourdomain.com"
  data-api="/api/event"
  src="/js/script.js"
/>
```

## Production Checklist

- [ ] Script added to production site
- [ ] Domain verified in Plausible
- [ ] Goals configured
- [ ] Custom events tested
- [ ] Real-time data appearing
- [ ] Team members invited (if needed)
- [ ] Email reports configured (optional)
- [ ] Data retention set

## Pricing

Plausible pricing (as of 2024):

- **10K pageviews/month:** $9/month
- **100K pageviews/month:** $19/month
- **1M pageviews/month:** $69/month

30-day free trial, no credit card required.

## Next Steps

- [PostHog Setup](posthog.md) - Full product analytics
- [Authentication](../auth/supabase.md) - Track authenticated users
- [Database](../database/supabase.md) - Store user data
- [Plausible Documentation](https://plausible.io/docs) - Official docs

## Resources

- [Plausible Documentation](https://plausible.io/docs)
- [Custom Events Guide](https://plausible.io/docs/custom-event-goals)
- [Goals Guide](https://plausible.io/docs/goal-conversions)
- [Self-hosting Guide](https://plausible.io/docs/self-hosting)
