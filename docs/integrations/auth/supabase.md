# Supabase Authentication Setup

Complete guide to setting up Supabase authentication in your framework project.

## What It Does

Supabase Auth provides a complete authentication system with:
- Email/password authentication with verification
- Magic link (passwordless) authentication
- OAuth social login (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Row Level Security (RLS) integration
- Session management

## Prerequisites

- [ ] Supabase account ([sign up](https://supabase.com))
- [ ] Project created in Supabase dashboard
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations
```

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name:** my-saas-app
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to your users
4. Click **Create new project**
5. Wait 2-3 minutes for provisioning

### 2. Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxx.supabase.co`
   - **anon public:** `eyJhbGc...` (safe to expose)
   - **service_role:** `eyJhbGc...` (keep secret!)

### 3. Export Template with Supabase Auth

```bash
framework export saas ./my-app --auth supabase
cd my-app
```

This generates:
- `/lib/supabase.ts` - Supabase clients for different contexts
- `/app/auth/` - Auth callback routes
- `/app/login/` - Login page
- `/app/signup/` - Sign up page
- `/middleware.ts` - Session refresh middleware
- `/types/supabase.ts` - TypeScript types

### 4. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for anon key)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - keep secret
- Never commit `.env.local` to Git

### 5. Configure Auth Settings

In Supabase dashboard, go to **Authentication** → **URL Configuration**:

1. **Site URL:** `http://localhost:3000` (development)
   - Update to production URL before deploying
2. **Redirect URLs:** Add allowed callback URLs:
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

### 6. Enable Email Templates (Optional)

Customize auth emails in **Authentication** → **Email Templates**:

- **Confirm signup:** Welcome email with verification link
- **Magic Link:** Passwordless login link
- **Change Email Address:** Verify new email
- **Reset Password:** Password reset link

Example custom template:

```html
<h2>Welcome to {{ .SiteURL }}</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

### 7. Set Up OAuth Providers (Optional)

Enable social login providers:

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth consent screen
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URI:
   ```
   https://xxx.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret**
7. In Supabase dashboard: **Authentication** → **Providers** → **Google**
8. Enable and paste Client ID and Secret

#### GitHub OAuth

1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** My App
   - **Homepage URL:** `https://yourdomain.com`
   - **Authorization callback URL:** `https://xxx.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Generate a **Client Secret**
6. In Supabase dashboard: **Authentication** → **Providers** → **GitHub**
7. Enable and paste Client ID and Secret

### 8. Test Authentication

Start dev server:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/signup`:

1. Enter email and password
2. Check email for confirmation link
3. Click link to verify
4. Sign in at `/login`

## Code Examples

### Sign Up with Email/Password

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // User created - check email for verification
    router.push('/verify-email')
  }

  return (
    <form onSubmit={handleSignUp}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
```

### Sign In with Email/Password

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSignIn}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

### Magic Link Authentication

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div>
        <p>Check your email for a magic link!</p>
        <p className="text-sm text-gray-600">
          Click the link in the email to sign in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
    </form>
  )
}
```

### OAuth Sign In

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function OAuthButtons() {
  const supabase = createClientComponentClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  async function signInWithGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="space-y-2">
      <button onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <button onClick={signInWithGitHub}>
        Sign in with GitHub
      </button>
    </div>
  )
}
```

### Sign Out

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut}>
      Sign out
    </button>
  )
}
```

### Get Current User (Server Component)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
    </div>
  )
}
```

### Get Current User (Client Component)

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  )
}
```

### Protect API Routes

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // User is authenticated - return protected data
  return NextResponse.json({
    message: 'Protected data',
    userId: session.user.id
  })
}
```

### Password Reset

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div>
        <p>Check your email for a password reset link!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleReset}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Reset password'}
      </button>
    </form>
  )
}
```

### Update Password

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleUpdate}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
```

## Row Level Security (RLS)

Protect database tables with user-level access control:

### Create Profiles Table

```sql
-- Run in Supabase SQL Editor
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Create Profile on Sign Up

```sql
-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Query with RLS

```typescript
// Client-side query - RLS automatically filters to current user
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single()

// Only returns current user's profile
```

## Common Issues

### Email Confirmation Not Working

**Symptom:** Confirmation email never arrives

**Solutions:**
1. Check spam folder
2. Verify SMTP settings in Supabase dashboard (Authentication → Settings)
3. For development, disable email confirmation:
   - Go to **Authentication** → **Providers** → **Email**
   - Uncheck **Confirm email**
   - ⚠️ Re-enable for production!

### Session Not Persisting

**Symptom:** User logged out after refresh

**Solution:**
Ensure middleware is set up correctly in `middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  return res
}
```

### Invalid Redirect URL

**Symptom:** Error: `redirect_to URL is not allowed`

**Solution:**
Add your URL to allowed redirects:
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

### RLS Policy Denying Access

**Symptom:** Database queries return empty results

**Solution:**
1. Check RLS policies in Supabase dashboard (Database → Policies)
2. Verify `auth.uid()` matches user ID in policy
3. Test policy:
   ```sql
   SELECT * FROM profiles WHERE auth.uid() = id;
   ```

### Anon Key vs Service Role

**Problem:** Confused about which key to use

**Answer:**
- **Anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`):
  - Use in client-side code
  - Safe to expose to browser
  - Respects Row Level Security
  - Use for user operations

- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`):
  - Use in server-side code only
  - Never expose to browser
  - Bypasses Row Level Security
  - Use for admin operations

## Testing

### Test Email/Password Sign Up

```typescript
import { createClient } from '@supabase/supabase-js'

describe('Supabase Auth', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  afterEach(async () => {
    // Clean up test users
    const { data: { users } } = await supabase.auth.admin.listUsers()
    for (const user of users) {
      if (user.email?.includes('test')) {
        await supabase.auth.admin.deleteUser(user.id)
      }
    }
  })

  it('should create new user', async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test-password',
      email_confirm: true
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('test@example.com')
  })

  it('should sign in with correct credentials', async () => {
    // Create user first
    await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test-password',
      email_confirm: true
    })

    // Test sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test-password'
    })

    expect(error).toBeNull()
    expect(data.session).toBeDefined()
  })
})
```

## Production Checklist

Before deploying to production:

- [ ] Update Site URL to production domain
- [ ] Add production URL to Redirect URLs
- [ ] Enable email confirmation
- [ ] Set up custom SMTP (optional)
- [ ] Configure RLS policies on all tables
- [ ] Set up database backups
- [ ] Enable MFA for sensitive operations
- [ ] Test OAuth providers with production URLs
- [ ] Review auth emails and templates
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Rotate and secure service role key
- [ ] Test password reset flow
- [ ] Verify session persistence

## Next Steps

- [Database Integration](../database/supabase.md) - Connect auth with database
- [Payments Integration](../payments/stripe.md) - Add Stripe with user accounts
- [Profile Management](../../getting-started/first-project.md#user-profiles) - Build user profile pages
- [Supabase Documentation](https://supabase.com/docs/guides/auth) - Official docs

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Provider Setup](https://supabase.com/docs/guides/auth/social-login)
