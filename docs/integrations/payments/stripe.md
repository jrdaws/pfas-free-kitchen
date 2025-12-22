# Stripe Payment Integration

Complete guide to setting up Stripe payments in your framework project.

## What It Does

Stripe provides a complete payment infrastructure with:

- One-time payments for products and services
- Recurring subscriptions with multiple pricing tiers
- Checkout Sessions for hosted payment pages
- Customer Portal for subscription management
- Webhooks for real-time event notifications
- Payment Intents for custom payment flows
- Invoicing for B2B customers
- Usage-based billing for metered services
- Global currency and payment method support
- Built-in fraud prevention and PCI compliance

## Prerequisites

- [ ] Stripe account ([sign up](https://stripe.com))
- [ ] Node.js 18+ installed
- [ ] Authentication set up (Supabase or Clerk)
- [ ] Database configured for storing subscription data

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For redirects
```

## Step-by-Step Setup

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **Start now** and sign up
3. Complete account verification:
   - Business details
   - Bank account information
   - Identity verification
4. Account created - you start in test mode

### 2. Get API Keys

1. In Stripe dashboard, go to **Developers** → **API keys**
2. Copy these values:
   - **Publishable key:** `pk_test_...` (safe to expose in client)
   - **Secret key:** `sk_test_...` (keep secret, server-only)
3. Note: Test keys start with `test`, live keys don't

### 3. Export Template with Stripe

```bash
framework export saas ./my-app --payments stripe --auth supabase
cd my-app
```

This generates:

- `/lib/stripe.ts` - Stripe client configuration
- `/app/api/checkout/route.ts` - Create checkout sessions
- `/app/api/webhooks/stripe/route.ts` - Handle webhook events
- `/app/api/portal/route.ts` - Customer portal access
- `/app/pricing/` - Pricing page component
- `/types/stripe.ts` - TypeScript type definitions

### 4. Configure Environment

Create `.env.local`:

```bash
# Stripe keys
STRIPE_SECRET_KEY=sk_test_51Xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Security notes:**

- `STRIPE_SECRET_KEY` - Never expose to client
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Safe to expose
- `STRIPE_WEBHOOK_SECRET` - For verifying webhook signatures
- Never commit `.env.local` to Git

### 5. Create Products in Stripe

In Stripe dashboard:

1. Go to **Products** → **Add product**
2. Create your first product:
   - **Name:** Basic Plan
   - **Description:** For individuals and small teams
   - Click **Add pricing**
   - **Price:** $9.00
   - **Billing period:** Monthly
   - Click **Save product**
3. Copy the **Price ID** (starts with `price_`)
4. Repeat for other plans (Pro, Enterprise, etc.)

Example products:

| Plan | Monthly Price | Annual Price | Features |
|------|---------------|--------------|----------|
| Basic | $9/month | $90/year | 10 projects, 1GB storage |
| Pro | $29/month | $290/year | Unlimited projects, 10GB storage |
| Enterprise | $99/month | $990/year | Everything, priority support |

### 6. Configure Checkout Settings

In Stripe dashboard, go to **Settings** → **Checkout and payments**:

1. **Customer emails:** Collect email address
2. **Payment methods:** Enable card, Apple Pay, Google Pay
3. **Currency:** Set default currency (USD, EUR, etc.)
4. **Branding:** Upload logo and set brand color

### 7. Set Up Webhook Endpoint

For development (using Stripe CLI):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook secret starting with `whsec_`. Add this to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

For production:

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Set **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy **Signing secret** and add to production environment

### 8. Create Subscription Database Schema

If using Supabase, run in SQL Editor:

```sql
-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own customer record
CREATE POLICY "Users can view own customer"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
```

### 9. Test the Integration

Start the dev server:

```bash
npm install
npm run dev
```

In a separate terminal, start webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Visit `http://localhost:3000/pricing`:

1. Click **Subscribe** on a plan
2. Use test card: `4242 4242 4242 4242`
3. Expiry: Any future date (e.g., 12/34)
4. CVC: Any 3 digits (e.g., 123)
5. Complete checkout
6. Verify webhook received in terminal
7. Check database for subscription record

## Code Examples

### Create Checkout Session (API Route)

```typescript
// app/api/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { priceId } = await req.json()

    // Get or create Stripe customer
    let customerId: string

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    if (customer) {
      customerId = customer.stripe_customer_id
    } else {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id
        }
      })

      // Save to database
      await supabase.from('customers').insert({
        user_id: session.user.id,
        stripe_customer_id: stripeCustomer.id,
        email: session.user.email!
      })

      customerId = stripeCustomer.id
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Checkout Button (Client Component)

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckoutButtonProps {
  priceId: string
  planName: string
}

export default function CheckoutButton({ priceId, planName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckout() {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId })
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : `Subscribe to ${planName}`}
    </button>
  )
}
```

### Handle Webhooks (API Route)

```typescript
// app/api/webhooks/stripe/route.ts
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Get user ID from metadata
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Save subscription to database
        await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })

        console.log('Subscription created:', subscription.id)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('Subscription updated:', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as cancelled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('Subscription deleted:', subscription.id)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice paid:', invoice.id)
        // Optional: Send receipt email, update usage quotas, etc.
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment failed:', invoice.id)
        // Optional: Send notification to user, pause service, etc.
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
```

### Customer Portal (API Route)

```typescript
// app/api/portal/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    if (!customer) {
      return NextResponse.json(
        { error: 'No customer found' },
        { status: 404 }
      )
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Manage Subscription Button

```typescript
'use client'

import { useState } from 'react'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)

    try {
      const response = await fetch('/api/portal', {
        method: 'POST'
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        setLoading(false)
        return
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  )
}
```

### Get Current Subscription (Server Component)

```typescript
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single()

  return (
    <div>
      <h1>Dashboard</h1>
      {subscription ? (
        <div>
          <p>Plan: {subscription.price_id}</p>
          <p>Status: {subscription.status}</p>
          <p>Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
        </div>
      ) : (
        <div>
          <p>No active subscription</p>
          <a href="/pricing">View plans</a>
        </div>
      )}
    </div>
  )
}
```

### Feature Gating Helper

```typescript
// lib/subscription.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getSubscription() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single()

  return subscription
}

export async function hasActiveSubscription() {
  const subscription = await getSubscription()
  return subscription !== null
}

export async function isPro() {
  const subscription = await getSubscription()
  return subscription?.price_id === process.env.NEXT_PUBLIC_PRO_PRICE_ID
}
```

### Protected Feature Component

```typescript
// app/ai-feature/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isPro } from '@/lib/subscription'

export default async function AIFeaturePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const isProUser = await isPro()

  if (!isProUser) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Pro Feature</h1>
        <p className="text-gray-600 mb-8">
          Upgrade to Pro to access AI-powered features.
        </p>
        <a
          href="/pricing"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          View Plans
        </a>
      </div>
    )
  }

  return (
    <div>
      <h1>AI Feature</h1>
      {/* Pro feature content */}
    </div>
  )
}
```

### One-Time Payment Example

```typescript
// For selling digital products instead of subscriptions
export async function POST(req: Request) {
  // ... auth code ...

  const { productId, quantity = 1 } = await req.json()

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment', // One-time payment
    payment_method_types: ['card'],
    line_items: [
      {
        price: productId,
        quantity
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
    metadata: {
      userId: session.user.id,
      productId
    }
  })

  return NextResponse.json({ url: checkoutSession.url })
}
```

## Testing

### Test Cards

Use these test cards in test mode:

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242 4242 4242 4242` | Visa | Payment succeeds |
| `4000 0025 0000 3155` | Visa (3D Secure) | Requires authentication |
| `4000 0000 0000 9995` | Visa | Payment declined |
| `5555 5555 5555 4444` | Mastercard | Payment succeeds |
| `3782 822463 10005` | American Express | Payment succeeds |

**For all cards:**
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Testing Subscriptions

```typescript
// test/stripe.test.ts
import Stripe from 'stripe'

describe('Stripe Integration', () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })

  let testCustomer: Stripe.Customer
  let testSubscription: Stripe.Subscription

  beforeAll(async () => {
    // Create test customer
    testCustomer = await stripe.customers.create({
      email: 'test@example.com'
    })
  })

  afterAll(async () => {
    // Clean up
    if (testSubscription) {
      await stripe.subscriptions.cancel(testSubscription.id)
    }
    await stripe.customers.del(testCustomer.id)
  })

  it('should create subscription', async () => {
    testSubscription = await stripe.subscriptions.create({
      customer: testCustomer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }]
    })

    expect(testSubscription).toBeDefined()
    expect(testSubscription.status).toBe('active')
    expect(testSubscription.items.data[0].price.id).toBe(process.env.STRIPE_PRICE_ID)
  })

  it('should update subscription', async () => {
    const updated = await stripe.subscriptions.update(testSubscription.id, {
      cancel_at_period_end: true
    })

    expect(updated.cancel_at_period_end).toBe(true)
  })
})
```

### Test Webhooks with Stripe CLI

```bash
# Trigger specific webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.paid
stripe trigger invoice.payment_failed

# Listen for webhooks and see payloads
stripe listen --print-json

# Forward to specific endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe --events checkout.session.completed,customer.subscription.updated
```

## Common Issues

### Webhook Not Receiving Events

**Symptom:** Checkout completes but subscription not created in database

**Solutions:**

1. Check webhook secret is correct in `.env.local`
2. Verify webhook endpoint is running and accessible
3. For local dev, ensure Stripe CLI is forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Check webhook logs in Stripe dashboard (Developers → Webhooks)
5. Verify webhook signature validation is working:
   ```typescript
   const event = stripe.webhooks.constructEvent(body, signature, secret)
   ```

### "No such price: price_xxx"

**Symptom:** Error when creating checkout session

**Solutions:**

1. Verify price ID exists in Stripe dashboard (Products section)
2. Check you're using test price IDs with test keys
3. Ensure price is active (not archived)
4. Price IDs are case-sensitive - copy exactly

### Subscription Shows but User Can't Access Features

**Symptom:** Subscription exists in Stripe but not in database

**Solutions:**

1. Check webhook was processed successfully
2. Verify user ID is correctly stored in checkout metadata
3. Check database RLS policies aren't blocking inserts
4. Review webhook logs in application:
   ```typescript
   console.log('Processing webhook:', event.type)
   console.log('User ID:', metadata?.userId)
   ```

### Customer Portal Configuration Error

**Symptom:** "You must configure the customer portal" error

**Solutions:**

1. Go to Stripe dashboard → **Settings** → **Customer portal**
2. Click **Activate test link** or **Activate live link**
3. Configure portal settings:
   - Allow customers to update payment methods
   - Allow subscription cancellations
   - Add terms of service URL
4. Save settings

### Payment Requires Authentication (3D Secure)

**Symptom:** Payment fails with authentication required

**Solutions:**

This is expected behavior for certain cards. Use test cards:
- `4242 4242 4242 4242` - No authentication
- `4000 0025 0000 3155` - Tests authentication flow

For custom flows, use Payment Intents API instead of Checkout Sessions.

### Duplicate Subscriptions Created

**Symptom:** Multiple subscriptions for same user

**Solutions:**

1. Check for existing subscription before creating checkout:
   ```typescript
   const { data: existing } = await supabase
     .from('subscriptions')
     .select('*')
     .eq('user_id', userId)
     .eq('status', 'active')
     .single()

   if (existing) {
     return { error: 'Already subscribed' }
   }
   ```

2. Add unique constraint on user_id in database:
   ```sql
   CREATE UNIQUE INDEX idx_active_subscription
   ON subscriptions(user_id)
   WHERE status = 'active';
   ```

### Webhook Receiving Events Multiple Times

**Symptom:** Duplicate webhook processing

**Solutions:**

1. Implement idempotency in webhook handler
2. Use Stripe event ID to track processed events:
   ```typescript
   const processed = await supabase
     .from('processed_events')
     .select('id')
     .eq('stripe_event_id', event.id)
     .single()

   if (processed) {
     return NextResponse.json({ received: true })
   }

   // Process event...

   // Mark as processed
   await supabase.from('processed_events').insert({
     stripe_event_id: event.id
   })
   ```

## Production Checklist

Before going live:

### Stripe Configuration

- [ ] Switch to live mode in Stripe dashboard
- [ ] Get live API keys (Developers → API keys)
- [ ] Update environment variables with live keys
- [ ] Create live products and prices
- [ ] Configure live webhook endpoint
- [ ] Set up Customer Portal in live mode
- [ ] Configure payout schedule (Settings → Payouts)
- [ ] Add business information (Settings → Business details)
- [ ] Complete tax settings (Settings → Tax)
- [ ] Enable desired payment methods (Settings → Payment methods)

### Application Configuration

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set live `STRIPE_SECRET_KEY`
- [ ] Set live `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Set live `STRIPE_WEBHOOK_SECRET` from production webhook
- [ ] Test full subscription flow on production
- [ ] Test subscription cancellation
- [ ] Test subscription upgrade/downgrade
- [ ] Test failed payment handling
- [ ] Verify webhook events are received

### Security

- [ ] Never commit live API keys to Git
- [ ] Use environment variables for all secrets
- [ ] Verify webhook signatures on all requests
- [ ] Use HTTPS for all production URLs
- [ ] Implement rate limiting on API routes
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Review and test RLS policies

### Testing

- [ ] Test with real payment methods
- [ ] Verify email receipts are sent
- [ ] Test subscription renewal
- [ ] Test subscription cancellation
- [ ] Test payment failure scenarios
- [ ] Verify customer portal works
- [ ] Test refund process
- [ ] Check analytics and reporting

### Legal & Compliance

- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Add refund policy
- [ ] Configure tax collection (if required)
- [ ] Set up subscription terms in Customer Portal
- [ ] Verify PCI compliance requirements

## Advanced Features

### Usage-Based Billing

Charge based on API calls, storage, or other metrics:

```typescript
// Record usage
await stripe.subscriptionItems.createUsageRecord(
  'si_xxx', // Subscription item ID
  {
    quantity: 100, // Number of units used
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment' // or 'set'
  }
)
```

### Trial Periods

Add free trial to subscriptions:

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
  // ... other settings ...
  subscription_data: {
    trial_period_days: 14
  }
})
```

### Coupons and Discounts

Apply discount codes:

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
  // ... other settings ...
  discounts: [{
    coupon: 'SUMMER2024' // Coupon ID from Stripe dashboard
  }]
})
```

### Multiple Subscriptions

Allow users to have multiple subscriptions:

```typescript
// Remove unique constraint and query for all active
const { data: subscriptions } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
```

### Invoicing

Send manual invoices:

```typescript
const invoice = await stripe.invoices.create({
  customer: 'cus_xxx',
  collection_method: 'send_invoice',
  days_until_due: 30
})

// Add line items
await stripe.invoiceItems.create({
  customer: 'cus_xxx',
  invoice: invoice.id,
  description: 'Custom consulting service',
  amount: 50000 // $500.00
})

// Finalize and send
await stripe.invoices.finalizeInvoice(invoice.id)
await stripe.invoices.sendInvoice(invoice.id)
```

## Next Steps

- [Database Integration](../database/supabase.md) - Store subscription data
- [Email Integration](../email/resend.md) - Send subscription notifications
- [Authentication](../auth/supabase.md) - Connect payments with users
- [Stripe Documentation](https://stripe.com/docs) - Official docs

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Events Reference](https://stripe.com/docs/api/events/types)
- [Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Customer Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Security Best Practices](https://stripe.com/docs/security/guide)
- [PCI Compliance](https://stripe.com/docs/security/pci)
