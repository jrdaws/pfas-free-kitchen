# Resend Email Setup

Complete guide to setting up Resend email service with React Email templates.

## What It Does

Resend provides a modern email API with:

- Send transactional emails via simple API
- React Email templates for beautiful emails
- Custom domain support (send from your domain)
- Email tracking (opens, clicks, bounces)
- Webhooks for email events
- Email validation and verification
- Batch sending for multiple recipients
- Attachment support
- Built-in spam score checking
- 100 emails/day free tier

## Prerequisites

- [ ] Resend account ([sign up](https://resend.com))
- [ ] Domain for sending emails (optional but recommended)
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
RESEND_API_KEY=re_xxx
```

## Step-by-Step Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **Sign up** and create account
3. Verify your email address
4. Account created!

### 2. Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name: "Production" or "Development"
4. Permission: Full Access
5. Copy the API key (starts with `re_`)
6. Add to `.env.local`:

```bash
RESEND_API_KEY=re_xxx
```

**Security note:** Never commit API keys to Git.

### 3. Set Up Custom Domain (Recommended)

For production, send from your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `yourdomain.com`
4. Copy the DNS records shown
5. Add DNS records to your domain registrar:

**DNS Records:**
```
Type: TXT
Name: @
Value: resend-verification=xxx

Type: MX
Name: @
Priority: 10
Value: mx1.resend.com

Type: MX
Name: @
Priority: 10
Value: mx2.resend.com

Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [DKIM key from Resend]
```

6. Wait for DNS propagation (can take 24-48 hours)
7. Click **Verify** in Resend dashboard

### 4. Install Packages

```bash
npm install resend react-email @react-email/components
```

### 5. Create Email Client

```typescript
// lib/email.ts
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
```

### 6. Create React Email Templates

Create email template directory:

```bash
mkdir -p emails
```

Create welcome email template:

```tsx
// emails/welcome.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  name: string
  loginUrl: string
}

export default function WelcomeEmail({
  name,
  loginUrl
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AppName - Get started today!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {name}!</Heading>

          <Text style={text}>
            Thanks for signing up for AppName. We're excited to have you on board.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>

          <Text style={text}>
            If you have any questions, just reply to this email—we're always happy to help.
          </Text>

          <Text style={footer}>
            AppName, Inc.
            <br />
            123 Street, City, ST 12345
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px'
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px'
}
```

### 7. Preview Emails Locally

Add script to `package.json`:

```json
{
  "scripts": {
    "email:dev": "email dev"
  }
}
```

Start preview server:

```bash
npm run email:dev
```

Visit `http://localhost:3000` to preview all email templates.

### 8. Send Test Email

Create API route to send test email:

```typescript
// app/api/test-email/route.ts
import { resend } from '@/lib/email'
import WelcomeEmail from '@/emails/welcome'

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: 'your-email@example.com',
      subject: 'Test Email',
      react: WelcomeEmail({
        name: 'John Doe',
        loginUrl: 'https://yourapp.com/login'
      })
    })

    if (error) {
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
```

Visit `/api/test-email` to send test.

## Code Examples

### Send Welcome Email

```typescript
// app/api/auth/welcome/route.ts
import { resend } from '@/lib/email'
import WelcomeEmail from '@/emails/welcome'

export async function POST(req: Request) {
  const { email, name } = await req.json()

  const { data, error } = await resend.emails.send({
    from: 'welcome@yourdomain.com',
    to: email,
    subject: 'Welcome to AppName!',
    react: WelcomeEmail({
      name,
      loginUrl: 'https://yourapp.com/login'
    })
  })

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ success: true })
}
```

### Password Reset Email

Create template:

```tsx
// emails/password-reset.tsx
import { Body, Button, Container, Head, Heading, Html, Text } from '@react-email/components'

interface PasswordResetEmailProps {
  resetUrl: string
  email: string
}

export default function PasswordResetEmail({ resetUrl, email }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f9fc' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px' }}>
          <Heading>Reset Your Password</Heading>

          <Text>Hi,</Text>

          <Text>
            Someone requested a password reset for your account ({email}).
            If this was you, click the button below to reset your password:
          </Text>

          <Button
            href={resetUrl}
            style={{
              backgroundColor: '#5469d4',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '5px',
              textDecoration: 'none'
            }}
          >
            Reset Password
          </Button>

          <Text>
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </Text>

          <Text style={{ color: '#8898aa', fontSize: '12px' }}>
            If the button doesn't work, copy and paste this link:
            <br />
            {resetUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

Send it:

```typescript
await resend.emails.send({
  from: 'security@yourdomain.com',
  to: user.email,
  subject: 'Reset Your Password',
  react: PasswordResetEmail({
    resetUrl: `https://yourapp.com/reset-password?token=${token}`,
    email: user.email
  })
})
```

### Payment Receipt Email

```tsx
// emails/payment-receipt.tsx
export default function PaymentReceiptEmail({
  customerName,
  amount,
  date,
  planName,
  invoiceUrl
}: {
  customerName: string
  amount: string
  date: string
  planName: string
  invoiceUrl: string
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Payment Received</Heading>

          <Text>Hi {customerName},</Text>

          <Text>
            Thank you for your payment. Here are the details:
          </Text>

          <Section style={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '5px' }}>
            <Text style={{ margin: 0 }}>
              <strong>Plan:</strong> {planName}
              <br />
              <strong>Amount:</strong> {amount}
              <br />
              <strong>Date:</strong> {date}
            </Text>
          </Section>

          <Button href={invoiceUrl}>View Invoice</Button>

          <Text>Thank you for your business!</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

### Notification Email

```tsx
// emails/notification.tsx
export default function NotificationEmail({
  title,
  message,
  actionUrl,
  actionText
}: {
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>{title}</Heading>
          <Text>{message}</Text>
          {actionUrl && actionText && (
            <Button href={actionUrl}>{actionText}</Button>
          )}
        </Container>
      </Body>
    </Html>
  )
}
```

### Send Batch Emails

```typescript
// Send to multiple recipients
const { data, error } = await resend.batch.send([
  {
    from: 'updates@yourdomain.com',
    to: 'user1@example.com',
    subject: 'New Feature Released',
    react: NotificationEmail({ title: 'New Feature', message: '...' })
  },
  {
    from: 'updates@yourdomain.com',
    to: 'user2@example.com',
    subject: 'New Feature Released',
    react: NotificationEmail({ title: 'New Feature', message: '...' })
  }
])
```

### Email with Attachments

```typescript
await resend.emails.send({
  from: 'documents@yourdomain.com',
  to: 'user@example.com',
  subject: 'Your Invoice',
  react: InvoiceEmail({ ... }),
  attachments: [
    {
      filename: 'invoice.pdf',
      content: Buffer.from(pdfContent), // Buffer or base64 string
      contentType: 'application/pdf'
    }
  ]
})
```

### Integration with Supabase Auth

Send welcome email on signup:

```typescript
// app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { resend } from '@/lib/email'
import WelcomeEmail from '@/emails/welcome'

export async function GET(req: Request) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.session) {
      // Send welcome email
      await resend.emails.send({
        from: 'welcome@yourdomain.com',
        to: data.session.user.email!,
        subject: 'Welcome to AppName!',
        react: WelcomeEmail({
          name: data.session.user.user_metadata.full_name || 'there',
          loginUrl: `${requestUrl.origin}/dashboard`
        })
      })
    }
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

### Integration with Stripe Webhooks

Send receipt on payment:

```typescript
// app/api/webhooks/stripe/route.ts
if (event.type === 'invoice.paid') {
  const invoice = event.data.object

  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: invoice.customer_email,
    subject: 'Payment Receipt',
    react: PaymentReceiptEmail({
      customerName: invoice.customer_name,
      amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
      date: new Date(invoice.created * 1000).toLocaleDateString(),
      planName: invoice.lines.data[0].description,
      invoiceUrl: invoice.hosted_invoice_url
    })
  })
}
```

## Testing

### Test in Development

```typescript
// Use test domain in development
const from = process.env.NODE_ENV === 'production'
  ? 'noreply@yourdomain.com'
  : 'onboarding@resend.dev'

const { data } = await resend.emails.send({
  from,
  to: 'test@example.com',
  subject: 'Test',
  react: WelcomeEmail({ name: 'Test User', loginUrl: '#' })
})

// In development, data.url contains preview URL
if (process.env.NODE_ENV === 'development') {
  console.log('Preview:', data.url)
}
```

### Preview Server

```bash
npm run email:dev
```

Navigate between templates at `http://localhost:3000`.

### Test Email Delivery

```typescript
// test/email.test.ts
import { resend } from '@/lib/email'
import WelcomeEmail from '@/emails/welcome'

describe('Email', () => {
  it('should send welcome email', async () => {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev', // Always delivers in test
      subject: 'Test Welcome Email',
      react: WelcomeEmail({
        name: 'Test User',
        loginUrl: 'https://example.com'
      })
    })

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.id).toBeTruthy()
  })
})
```

## Common Issues

### Emails Going to Spam

**Symptom:** Emails land in spam folder

**Solutions:**

1. **Set up custom domain** with SPF, DKIM, and DMARC records
2. **Warm up your domain:** Start with small volumes, gradually increase
3. **Avoid spam triggers:**
   - Don't use all caps in subject
   - Avoid excessive exclamation marks
   - Include plain text version
   - Add unsubscribe link
4. **Maintain good sender reputation:**
   - Remove bounced emails from list
   - Handle unsubscribes properly
   - Send only to engaged users

### Domain Not Verified

**Symptom:** Emails fail with "domain not verified"

**Solution:**

1. Check DNS records are added correctly
2. Use DNS checker tool: `dig TXT yourdomain.com`
3. Wait 24-48 hours for DNS propagation
4. Click "Verify" in Resend dashboard
5. Contact Resend support if issues persist

### Rate Limiting

**Symptom:** Error "Too many requests"

**Solution:**

Free tier limits:
- 100 emails/day
- 3,000 emails/month

Upgrade plan or implement queue:

```typescript
// Use queue for batch sending
import { Queue } from 'bullmq'

const emailQueue = new Queue('emails')

// Add to queue
await emailQueue.add('welcome', {
  to: user.email,
  name: user.name
})

// Process queue
emailQueue.process('welcome', async (job) => {
  await resend.emails.send({
    from: 'welcome@yourdomain.com',
    to: job.data.to,
    subject: 'Welcome!',
    react: WelcomeEmail(job.data)
  })
})
```

### Invalid API Key

**Symptom:** Error "Invalid API key"

**Solution:**

1. Check API key is correct in `.env.local`
2. Ensure no extra spaces or quotes
3. Verify environment variable is loaded:
   ```typescript
   console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10))
   ```
4. Restart dev server after changing `.env.local`

## Production Checklist

Before going live:

### Domain Setup
- [ ] Custom domain verified
- [ ] SPF record added
- [ ] DKIM record added
- [ ] DMARC policy configured
- [ ] Test domain deliverability

### Email Templates
- [ ] All templates tested
- [ ] Mobile responsive design verified
- [ ] Dark mode tested (if applicable)
- [ ] Unsubscribe links added
- [ ] Company information in footer
- [ ] Links tested

### API Configuration
- [ ] Production API key set
- [ ] API key kept secure (not in Git)
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Retry logic for failed sends

### Monitoring
- [ ] Email delivery tracking set up
- [ ] Bounce handling configured
- [ ] Complaint handling set up
- [ ] Analytics dashboard reviewed
- [ ] Alert system for failures

### Compliance
- [ ] CAN-SPAM compliance verified
- [ ] GDPR compliance (if EU users)
- [ ] Unsubscribe mechanism working
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Advanced Features

### Track Email Opens

```typescript
await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Newsletter',
  react: NewsletterEmail(),
  tags: [
    { name: 'category', value: 'newsletter' },
    { name: 'campaign', value: 'monthly-2024-01' }
  ]
})

// Check stats later
const { data } = await resend.emails.get(emailId)
console.log('Opens:', data.opens)
console.log('Clicks:', data.clicks)
```

### Webhooks for Email Events

Set up webhook endpoint:

```typescript
// app/api/webhooks/resend/route.ts
export async function POST(req: Request) {
  const event = await req.json()

  switch (event.type) {
    case 'email.sent':
      console.log('Email sent:', event.data.email_id)
      break
    case 'email.delivered':
      console.log('Email delivered:', event.data.email_id)
      break
    case 'email.opened':
      console.log('Email opened:', event.data.email_id)
      break
    case 'email.clicked':
      console.log('Link clicked:', event.data.link)
      break
    case 'email.bounced':
      console.log('Email bounced:', event.data.email)
      // Remove from mailing list
      break
    case 'email.complained':
      console.log('Spam complaint:', event.data.email)
      // Remove from mailing list immediately
      break
  }

  return Response.json({ received: true })
}
```

Configure in Resend dashboard:
1. Go to Webhooks
2. Add endpoint: `https://yourapp.com/api/webhooks/resend`
3. Select events to receive

## Next Steps

- [Authentication](../auth/supabase.md) - Send auth-related emails
- [Payments](../payments/stripe.md) - Send payment receipts
- [Database](../database/supabase.md) - Store email preferences
- [Resend Documentation](https://resend.com/docs) - Official docs

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)
- [Deliverability Guide](https://resend.com/docs/knowledge-base/deliverability)
- [Example Templates](https://github.com/resendlabs/react-email-templates)
