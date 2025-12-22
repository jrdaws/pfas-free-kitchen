# Clerk Authentication Setup

Complete guide to setting up Clerk authentication in your framework project.

## What It Does

Clerk provides a modern authentication system with:
- Beautiful pre-built UI components
- Email/password and passwordless authentication
- OAuth social login (Google, GitHub, LinkedIn, etc.)
- Multi-factor authentication (MFA)
- User management dashboard
- Organization/team support
- Webhooks for user events
- Session management

## Prerequisites

- [ ] Clerk account ([sign up](https://clerk.com))
- [ ] Application created in Clerk dashboard
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Step-by-Step Setup

### 1. Create Clerk Application

1. Go to [clerk.com/dashboard](https://clerk.com/dashboard)
2. Click **Create application**
3. Fill in:
   - **Application name:** My SaaS App
   - **Sign-in options:** Email, Google, GitHub (choose your providers)
4. Click **Create application**
5. You'll see your API keys immediately

### 2. Get API Keys

After creating the application:

1. Copy **Publishable key:** `pk_test_...` (safe to expose)
2. Copy **Secret key:** `sk_test_...` (keep secret!)
3. Keep this tab open - we'll use it for configuration

### 3. Export Template with Clerk Auth

```bash
framework export saas ./my-app --auth clerk
cd my-app
```

This generates:
- `/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `/app/api/webhooks/clerk/route.ts` - Webhook handler
- `/middleware.ts` - Auth middleware
- `/lib/clerk.ts` - Clerk utilities

### 4. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Security notes:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe to expose to the browser
- `CLERK_SECRET_KEY` must be kept secret (server-side only)
- Never commit `.env.local` to Git

### 5. Configure Auth Paths

In Clerk dashboard, go to **Paths**:

1. **Sign-in page:** `/sign-in`
2. **Sign-up page:** `/sign-up`
3. **Home URL:** `/` (after sign out)
4. **After sign-in:** `/dashboard` (where users go after login)
5. **After sign-up:** `/onboarding` or `/dashboard`

### 6. Enable Social Providers (Optional)

Enable OAuth providers in Clerk dashboard:

1. Go to **Social Connections** in sidebar
2. Enable providers (Google, GitHub, etc.)
3. For most providers, Clerk configures OAuth automatically
4. For custom configurations, click **Configure** and follow instructions

**No OAuth app setup required** - Clerk handles this for you (unlike Supabase).

### 7. Customize Appearance (Optional)

Customize auth UI in **Appearance** section:

1. Choose **Theme:** Light, Dark, or Auto
2. Customize colors, borders, fonts
3. Add your logo
4. Preview changes in real-time

Example customization:

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          card: 'shadow-xl',
        }
      }}
    />
  )
}
```

### 8. Set Up Webhooks (Optional)

Sync user data to your database with webhooks:

1. In Clerk dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. **Endpoint URL:** `https://yourdomain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy **Signing Secret**
6. Add to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### 9. Test Authentication

Start dev server:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/sign-up`:

1. Create account with email or social provider
2. Complete verification (if email)
3. Redirected to dashboard

## Code Examples

### Sign Up Page

```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-600 hover:text-blue-700'
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
```

### Sign In Page

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-600 hover:text-blue-700'
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
```

### User Button (Profile Dropdown)

```typescript
'use client'

import { UserButton } from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-10 h-10'
          }
        }}
        afterSignOutUrl="/"
      />
    </header>
  )
}
```

### Get Current User (Server Component)

```typescript
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
      <p>ID: {user.id}</p>
      <p>Name: {user.firstName} {user.lastName}</p>
      <img src={user.imageUrl} alt="Avatar" />
    </div>
  )
}
```

### Get Current User (Client Component)

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export default function UserProfile() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>
  }

  return (
    <div>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
      <p>ID: {user.id}</p>
      <p>Name: {user.firstName} {user.lastName}</p>
      <img src={user.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
    </div>
  )
}
```

### Protect Pages with Middleware

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/', '/pricing', '/about', '/api/webhooks/clerk'],

  // Routes that are always accessible (even when signed in)
  ignoredRoutes: ['/api/public']
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

### Protect Specific Routes

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
  // Only protect /dashboard and /settings routes
})

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
}
```

### Protect API Routes

```typescript
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    message: 'Protected data',
    userId
  })
}
```

### Get User in API Route

```typescript
// app/api/user/route.ts
import { currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    id: user.id,
    email: user.emailAddresses[0].emailAddress,
    name: `${user.firstName} ${user.lastName}`
  })
}
```

### Custom Sign Out Button

```typescript
'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <button onClick={handleSignOut}>
      Sign out
    </button>
  )
}
```

### Handle Webhooks

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db' // Your database

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env')
  }

  // Get headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle events
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    // Create user in your database
    await db.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      }
    })
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    // Update user in your database
    await db.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      }
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    // Delete user from your database
    await db.user.delete({
      where: { clerkId: id }
    })
  }

  return new Response('Webhook processed', { status: 200 })
}
```

### Update User Metadata

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export default function UpdateProfile() {
  const { user } = useUser()

  async function updateMetadata() {
    if (!user) return

    await user.update({
      unsafeMetadata: {
        onboarded: true,
        plan: 'pro'
      }
    })
  }

  return (
    <button onClick={updateMetadata}>
      Complete onboarding
    </button>
  )
}
```

### Organizations (Teams)

Enable organizations in Clerk dashboard (**Organization Settings**), then:

```typescript
'use client'

import { OrganizationSwitcher, OrganizationList } from '@clerk/nextjs'

export default function TeamSwitcher() {
  return (
    <div>
      {/* Dropdown to switch between personal and org accounts */}
      <OrganizationSwitcher
        appearance={{
          elements: {
            rootBox: 'flex items-center'
          }
        }}
      />
    </div>
  )
}
```

Check organization membership:

```typescript
import { auth } from '@clerk/nextjs'

export default async function TeamPage() {
  const { userId, orgId, orgRole } = auth()

  if (!orgId) {
    return <div>Join an organization to access this page</div>
  }

  return (
    <div>
      <h1>Team Dashboard</h1>
      <p>Your role: {orgRole}</p>
    </div>
  )
}
```

## Advanced Features

### Multi-Factor Authentication

Enable MFA in Clerk dashboard:

1. Go to **User & Authentication** → **Multi-factor**
2. Enable **SMS** or **TOTP** (authenticator apps)
3. Users can enable MFA in their profile

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export default function MFASettings() {
  const { user } = useUser()

  const hasMFA = user?.twoFactorEnabled

  return (
    <div>
      <h2>Multi-Factor Authentication</h2>
      <p>Status: {hasMFA ? 'Enabled' : 'Disabled'}</p>
      {/* Clerk provides pre-built MFA UI */}
    </div>
  )
}
```

### Session Management

Configure session behavior in Clerk dashboard (**Sessions**):

- **Session lifetime:** How long sessions last
- **Inactivity timeout:** Auto sign-out after inactivity
- **Multi-session handling:** Allow multiple sessions

Get all sessions:

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export default function ActiveSessions() {
  const { user } = useUser()

  return (
    <div>
      <h2>Active Sessions</h2>
      <ul>
        {user?.sessions?.map(session => (
          <li key={session.id}>
            {session.lastActiveAt.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Custom Session Claims

Add custom data to session tokens:

1. In Clerk dashboard, go to **Sessions** → **Customize session token**
2. Add custom claims:
   ```json
   {
     "plan": "{{user.public_metadata.plan}}",
     "role": "{{user.public_metadata.role}}"
   }
   ```
3. Access in API routes:
   ```typescript
   import { auth } from '@clerk/nextjs'

   const { sessionClaims } = auth()
   const plan = sessionClaims?.plan
   const role = sessionClaims?.role
   ```

## Common Issues

### "Clerk: Missing publishableKey"

**Symptom:** Error on page load

**Solution:**
1. Ensure `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Restart dev server after adding environment variable
3. Check for typos in variable name

### Redirect Loop

**Symptom:** Infinite redirects between sign-in and protected page

**Solution:**
Update middleware to exclude auth pages:

```typescript
export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up']
})
```

### Webhook Signature Verification Failed

**Symptom:** Webhooks return 400 error

**Solution:**
1. Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
2. Check webhook endpoint is publicly accessible
3. For local development, use Clerk's webhook forwarding or ngrok

### User Button Not Showing

**Symptom:** `<UserButton />` doesn't render

**Solution:**
1. Ensure user is signed in
2. Wrap in client component (`'use client'`)
3. Check Clerk providers are set up in layout

## Testing

### Test Authentication

```typescript
import { clerkClient } from '@clerk/nextjs'

describe('Clerk Auth', () => {
  it('should create test user', async () => {
    const user = await clerkClient.users.createUser({
      emailAddress: ['test@example.com'],
      password: 'test-password'
    })

    expect(user).toBeDefined()
    expect(user.emailAddresses[0].emailAddress).toBe('test@example.com')

    // Clean up
    await clerkClient.users.deleteUser(user.id)
  })
})
```

### Mock Clerk in Tests

```typescript
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'user_test123' }),
  currentUser: () => ({
    id: 'user_test123',
    emailAddresses: [{ emailAddress: 'test@example.com' }]
  })
}))
```

## Production Checklist

Before deploying to production:

- [ ] Switch to production API keys (from Clerk dashboard)
- [ ] Update allowed origins in Clerk dashboard (Production → Domains)
- [ ] Configure production webhook endpoint
- [ ] Set up custom email domain (optional)
- [ ] Configure session lifetime for production
- [ ] Enable MFA (optional)
- [ ] Test social OAuth providers with production URLs
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Review organization settings (if using teams)
- [ ] Test webhook delivery
- [ ] Configure rate limiting (Clerk dashboard → Security)

## Pricing Notes

Clerk pricing tiers:

- **Free:** Up to 10,000 monthly active users
- **Pro:** $25/month + $0.02/MAU after 10k
- **Enterprise:** Custom pricing

Features by tier:
- Free: Basic auth, 3 social providers, 100k API calls/month
- Pro: Unlimited social providers, custom email domain, organizations
- Enterprise: SAML SSO, advanced security, SLA

## Next Steps

- [Database Integration](../database/README.md) - Store user data
- [Payments Integration](../payments/stripe.md) - Add subscriptions with Clerk users
- [Organizations Guide](https://clerk.com/docs/organizations/overview) - Team/org support
- [Clerk Documentation](https://clerk.com/docs) - Official docs

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Webhooks Guide](https://clerk.com/docs/integration/webhooks)
- [Organizations](https://clerk.com/docs/organizations/overview)
- [Custom Session Claims](https://clerk.com/docs/backend-requests/making/custom-session-token)
