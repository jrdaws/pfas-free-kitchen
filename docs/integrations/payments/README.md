# Payments Integrations

Accept payments and manage subscriptions with Stripe integration.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **Stripe** | All payment needs | One-time payments, subscriptions, invoicing | [Guide →](stripe.md) |

## Why Stripe

Stripe is the industry standard for online payments:

✅ **One-time payments** - Charge for products or services
✅ **Subscriptions** - Recurring billing with multiple plans
✅ **Invoicing** - B2B billing and quotes
✅ **Global support** - 135+ currencies, 45+ countries
✅ **Security** - PCI compliant, fraud prevention
✅ **Webhooks** - Real-time event notifications
✅ **Testing** - Full test mode with test cards

## Quick Start

### 1. Export with Stripe

```bash
framework export saas ./my-app --payments stripe --auth supabase
cd my-app
```

### 2. Get Stripe Credentials

1. Sign up at [stripe.com](https://stripe.com)
2. Get API keys from dashboard
3. Add to `.env.local`

### 3. Create Products

In Stripe dashboard:
1. Create products (Basic, Pro, Enterprise)
2. Set up pricing (monthly/annual)
3. Note price IDs

### 4. Configure Environment

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Test Checkout

```bash
npm run dev
```

Navigate to `/pricing` and test checkout with test cards.

## Common Use Cases

### SaaS Subscriptions

Monthly/annual billing with multiple tiers:

```typescript
const plans = [
  {
    name: 'Basic',
    price: '$9/month',
    priceId: 'price_basic_monthly',
    features: ['Feature 1', 'Feature 2']
  },
  {
    name: 'Pro',
    price: '$29/month',
    priceId: 'price_pro_monthly',
    features: ['Everything in Basic', 'Feature 3', 'Feature 4']
  }
]
```

### One-Time Payments

Charge for digital products, courses, or services:

```typescript
const checkout = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price: 'price_product',
    quantity: 1
  }],
  success_url: `${origin}/success`,
  cancel_url: `${origin}/pricing`
})
```

### Usage-Based Billing

Charge based on API calls, storage, or other metrics:

```typescript
// Record usage
await stripe.subscriptionItems.createUsageRecord(
  'si_xxx',
  {
    quantity: 100, // API calls
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  }
)
```

### Invoicing

Send invoices for B2B customers:

```typescript
const invoice = await stripe.invoices.create({
  customer: 'cus_xxx',
  collection_method: 'send_invoice',
  days_until_due: 30
})

await stripe.invoices.sendInvoice(invoice.id)
```

## Payment Flow

### Subscription Checkout

1. User clicks "Subscribe to Pro"
2. Create Checkout Session (API route)
3. Redirect to Stripe Checkout
4. User completes payment
5. Stripe redirects to success page
6. Webhook confirms subscription
7. Update database with subscription status

### Webhook Processing

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(...)

  switch (event.type) {
    case 'checkout.session.completed':
      // Grant access to subscription
      break
    case 'customer.subscription.updated':
      // Update subscription status
      break
    case 'customer.subscription.deleted':
      // Revoke access
      break
  }

  return new Response('Webhook processed', { status: 200 })
}
```

## Integration Patterns

### With Supabase Auth

Store subscription data in Supabase:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### With Clerk Auth

Use Clerk webhooks to create Stripe customers:

```typescript
// When user signs up (Clerk webhook)
const customer = await stripe.customers.create({
  email: user.emailAddresses[0].emailAddress,
  name: `${user.firstName} ${user.lastName}`,
  metadata: {
    clerkUserId: user.id
  }
})

// Store customer ID
await db.user.update({
  where: { clerkId: user.id },
  data: { stripeCustomerId: customer.id }
})
```

### Feature Gating

Restrict features based on subscription:

```typescript
import { getSubscription } from '@/lib/stripe'

export default async function AIFeature() {
  const subscription = await getSubscription()

  if (subscription.plan !== 'pro') {
    return <UpgradePrompt />
  }

  return <AIFeatureContent />
}
```

## Security Best Practices

### 1. Verify Webhooks

Always verify webhook signatures:

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

### 2. Use Server Components

Handle sensitive operations server-side:

```typescript
// Server Component
import Stripe from 'stripe'

export default async function PricingPage() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const prices = await stripe.prices.list()

  return <PricingCards prices={prices.data} />
}
```

### 3. Validate Amounts

Always verify amounts in webhooks:

```typescript
if (event.type === 'checkout.session.completed') {
  const session = event.data.object
  const amount = session.amount_total

  // Verify amount matches expected price
  if (amount !== EXPECTED_AMOUNT) {
    console.error('Amount mismatch')
    return
  }
}
```

### 4. Use Stripe Elements

Never handle raw card data:

```typescript
// ❌ Don't do this
<input type="text" name="card-number" />

// ✅ Use Stripe Elements
import { CardElement } from '@stripe/react-stripe-js'
<CardElement />
```

## Testing

### Test Cards

Use Stripe test cards in test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined card |
| `4000 0027 6000 3184` | Requires authentication (3D Secure) |

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

### Stripe CLI

Test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

### Test Subscriptions

```typescript
import Stripe from 'stripe'

describe('Stripe Subscriptions', () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  it('should create subscription', async () {
    const customer = await stripe.customers.create({
      email: 'test@example.com'
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_test_123' }]
    })

    expect(subscription.status).toBe('active')

    // Clean up
    await stripe.subscriptions.cancel(subscription.id)
    await stripe.customers.del(customer.id)
  })
})
```

## Common Issues

### Webhook Not Receiving Events

**Symptom:** Subscriptions created but database not updated

**Solution:**
1. Verify webhook endpoint is publicly accessible
2. Check webhook secret matches Stripe dashboard
3. Use Stripe CLI for local development
4. Verify webhook events are enabled in dashboard

### "No such price: price_xxx"

**Symptom:** Error when creating checkout session

**Solution:**
1. Verify price IDs exist in Stripe dashboard
2. Check you're using correct environment (test vs live)
3. Ensure price is active

### Customer Portal Not Working

**Symptom:** Redirect to portal fails

**Solution:**
1. Configure Customer Portal in Stripe dashboard
2. Add return URL to allowed list
3. Verify customer has active subscription

### Payment Fails with 3D Secure

**Symptom:** Payment requires authentication

**Solution:**
Use Payment Intents instead of legacy Checkout for better auth handling.

## Stripe Dashboard Overview

Key sections:

- **Payments:** View all transactions
- **Customers:** Manage customer records
- **Subscriptions:** View all subscriptions
- **Products:** Manage products and pricing
- **Billing:** Configure invoicing
- **Webhooks:** Configure webhook endpoints
- **Developers → API keys:** Get API credentials

## Pricing Notes

Stripe fees:

- **Online payments:** 2.9% + $0.30 per transaction
- **International cards:** +1.5%
- **Currency conversion:** +1%
- **Disputes:** $15 per dispute

**No monthly fees** - only pay for transactions.

## Next Steps

- [Complete Stripe Setup Guide](stripe.md) - Detailed setup instructions
- [Authentication](../auth/README.md) - Connect payments with user accounts
- [Database](../database/README.md) - Store subscription data
- [Stripe Documentation](https://stripe.com/docs) - Official docs

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Testing Guide](https://stripe.com/docs/testing)
- [Security Best Practices](https://stripe.com/docs/security/guide)
