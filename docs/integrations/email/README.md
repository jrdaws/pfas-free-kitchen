# Email Integrations

Send transactional emails with Resend and React Email templates.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **Resend** | Modern transactional emails | React Email templates, simple API, great deliverability | [Guide →](resend.md) |

## Why Resend

Resend is the modern email API built for developers:

✅ **React Email templates** - Write emails with React components
✅ **Simple API** - Send emails with one function call
✅ **Great deliverability** - High inbox placement rates
✅ **Custom domains** - Send from your own domain
✅ **Email validation** - Verify email addresses
✅ **Webhooks** - Track opens, clicks, bounces
✅ **Testing** - Test mode with preview URLs
✅ **Fast setup** - Start sending in minutes

## Quick Start

### 1. Export with Resend

```bash
framework export saas ./my-app --email resend
cd my-app
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env.local`

```bash
RESEND_API_KEY=re_xxx
```

### 3. Send Your First Email

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Welcome to our app!</p>'
})
```

## Common Use Cases

### Welcome Emails

Send when user signs up:

```typescript
await resend.emails.send({
  from: 'welcome@yourdomain.com',
  to: user.email,
  subject: 'Welcome to AppName!',
  react: WelcomeEmail({ name: user.name })
})
```

### Password Reset

Send reset link:

```typescript
await resend.emails.send({
  from: 'security@yourdomain.com',
  to: user.email,
  subject: 'Reset your password',
  react: PasswordResetEmail({ resetUrl })
})
```

### Subscription Notifications

Notify about subscription changes:

```typescript
await resend.emails.send({
  from: 'billing@yourdomain.com',
  to: user.email,
  subject: 'Subscription Confirmed',
  react: SubscriptionEmail({ plan, amount })
})
```

### Order Receipts

E-commerce order confirmations:

```typescript
await resend.emails.send({
  from: 'orders@yourdomain.com',
  to: customer.email,
  subject: 'Order #12345 Confirmed',
  react: OrderReceiptEmail({ order })
})
```

## React Email Templates

Create beautiful, responsive emails with React:

```tsx
// emails/welcome.tsx
import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components'

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Welcome, {name}!</Heading>
          <Text>Thanks for signing up. We're excited to have you.</Text>
          <Button href="https://yourapp.com/dashboard">
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

## Integration Patterns

### With Supabase Auth

Send welcome email on signup:

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to send email
  PERFORM net.http_post(
    'https://your-app.com/api/emails/welcome',
    jsonb_build_object('email', new.email, 'name', new.raw_user_meta_data->>'full_name')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION send_welcome_email();
```

### With Stripe Webhooks

Send receipt on successful payment:

```typescript
// Handle checkout.session.completed webhook
if (event.type === 'checkout.session.completed') {
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: session.customer_email,
    subject: 'Payment Receipt',
    react: PaymentReceiptEmail({ amount, date })
  })
}
```

## Email Testing

### Development Mode

Resend provides test mode:

```typescript
// In development, emails go to test inbox
const { data } = await resend.emails.send({
  from: 'onboarding@resend.dev', // Test domain
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>'
})

console.log('Preview URL:', data.url)
```

### Preview Emails Locally

```bash
# Install React Email CLI
npm install -g react-email

# Start preview server
email dev
```

Visit `http://localhost:3000` to preview templates.

## Common Issues

### Emails Going to Spam

**Solutions:**
1. Set up custom domain with SPF/DKIM
2. Verify domain in Resend dashboard
3. Avoid spam trigger words
4. Include unsubscribe link
5. Warm up IP gradually

### Domain Not Verified

**Symptom:** Emails fail to send

**Solution:** Add DNS records in domain registrar:
1. Go to Resend dashboard → Domains
2. Copy DNS records
3. Add to your domain DNS settings
4. Wait for verification (can take 24-48 hours)

## Next Steps

- [Complete Resend Setup Guide](resend.md) - Detailed setup instructions
- [React Email Documentation](https://react.email) - Template guides
- [Authentication](../auth/supabase.md) - Send auth emails
- [Payments](../payments/stripe.md) - Send receipts

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)
