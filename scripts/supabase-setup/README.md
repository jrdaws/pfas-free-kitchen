# Supabase Setup Guide

Complete guide to enable user accounts, project saving, and service connections for the Dawson-Does Framework.

## What You'll Get

After setup, your website will support:

| Feature | Description |
|---------|-------------|
| **User Accounts** | Sign up/login with email, Google, or GitHub |
| **Save Projects** | Configurator progress saved to your account |
| **My Projects Dashboard** | Return to any project anytime |
| **Connect Services** | OAuth integration with Supabase, GitHub, Vercel |
| **NPX Token** | Unique CLI command: `npx @dawson-does/framework fast-eagle-1234` |

---

## Quick Start (15 minutes)

### Option A: Interactive Script

```bash
cd /path/to/dawson-does-framework
chmod +x scripts/supabase-setup/setup.sh
./scripts/supabase-setup/setup.sh
```

### Option B: Manual Setup

Follow the steps below.

---

## Step-by-Step Manual Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `dawson-does-framework` (or your choice)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy these values:

| Setting | Example | Where to Find |
|---------|---------|---------------|
| **Project URL** | `https://abcd1234.supabase.co` | Under "Project URL" |
| **anon public key** | `eyJhbGciOiJIUzI1...` | Under "Project API keys" |
| **service_role key** | `eyJhbGciOiJIUzI1...` | Under "Project API keys" (click reveal) |

> ⚠️ **Keep your service_role key secret!** Never expose it in client-side code.

### Step 3: Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy the entire contents of `scripts/supabase-setup/complete-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**

You should see:
```
projects           | 14 columns
user_projects      | 17 columns
connected_services | 9 columns
feedback           | 6 columns
```

### Step 4: Configure Vercel Environment Variables

#### Option A: Using Vercel CLI

```bash
# Add each variable (prompts for value)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Or with values inline
echo "https://your-project.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
```

#### Option B: Using Vercel Dashboard

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings → Environment Variables**
3. Add each variable:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Production, Preview, Development |

### Step 5: Enable Authentication Providers

Go to **Authentication → Providers** in Supabase Dashboard.

#### Email (Required)

1. Toggle **"Enable Email provider"** ON
2. Configure settings:
   - ✅ Enable email confirmations (recommended)
   - Set email templates if desired

#### Google OAuth (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-site.vercel.app`
   - Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Copy the **Client ID** and **Client Secret**
7. In Supabase, enable Google provider and paste credentials

#### GitHub OAuth (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Configure:
   - Application name: `Dawson-Does Framework`
   - Homepage URL: `https://your-site.vercel.app`
   - Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy **Client ID** and generate **Client Secret**
5. In Supabase, enable GitHub provider and paste credentials

### Step 6: Redeploy

```bash
vercel --prod
```

Or push to your main branch to trigger a deployment.

---

## Verify Setup

### Test Authentication

1. Visit your website
2. Click **"Sign Up"** or **"Login"**
3. Create an account with email or OAuth
4. You should be redirected to `/configure`

### Test Project Saving

1. After logging in, go to the configurator
2. Configure some options
3. Your progress should auto-save
4. Refresh the page - your selections should persist

### Test Connected Services

1. Go to the Supabase step in the configurator
2. You should no longer see "Sign in required"
3. Click "Connect Supabase" to link your Supabase account

---

## Troubleshooting

### "Sign in required" still appearing

**Cause**: You're not logged into the website itself.

**Fix**: 
1. Visit `/login` on your website
2. Sign up for an account
3. Then access the configurator

### "Supabase not configured" error

**Cause**: Environment variables not set or not deployed.

**Fix**:
1. Verify env vars in Vercel dashboard
2. Redeploy: `vercel --prod`
3. Check browser console for specific errors

### Google/GitHub OAuth not working

**Cause**: Incorrect callback URL.

**Fix**:
The callback URL must be exactly:
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

### Database tables not created

**Cause**: Schema wasn't run or had errors.

**Fix**:
1. Go to SQL Editor in Supabase
2. Run the verification query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. You should see: `projects`, `user_projects`, `connected_services`, `feedback`

---

## Local Development

For local testing, create a `.env.local` file:

```bash
# website/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:
```bash
cd website
npm run dev
```

---

## Security Notes

1. **Never commit** `.env.local` to git (it's in `.gitignore`)
2. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in client-side code
3. **Enable RLS** on all tables (already done in schema)
4. **Use email confirmation** in production

---

## Support

If you encounter issues:
1. Check the [Supabase docs](https://supabase.com/docs)
2. Check the [Next.js + Supabase guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
3. Open an issue on the repository


