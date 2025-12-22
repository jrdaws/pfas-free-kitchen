# Supabase Setup Guide for Framework Pull Command

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new project:
   - **Name**: `dawson-does-framework`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is perfect

## Step 2: Run Database Migration

1. Once your project is created, go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `website/supabase/migrations/001_create_projects.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"

## Step 3: Verify Table Creation

1. Go to **Table Editor** in the left sidebar
2. You should see a new table called `projects`
3. Click on it to verify the columns:
   - id (uuid)
   - token (text)
   - template (text)
   - project_name (text)
   - output_dir (text)
   - integrations (jsonb)
   - env_keys (jsonb)
   - vision (text)
   - mission (text)
   - success_criteria (text)
   - inspirations (jsonb)
   - description (text)
   - created_at (timestamp)
   - expires_at (timestamp)
   - last_accessed_at (timestamp)

## Step 4: Get API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long token)

## Step 5: Test Locally (Optional)

Add to `website/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then test:
```bash
cd website
npm install
npm run dev
# Visit http://localhost:3000/configure
# Try the "Pull from Platform" option
```

## Step 6: Add to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/jrdaws-projects/dawson-does-framework
2. Click **Settings** → **Environment Variables**
3. Add these variables (for **All Environments**: Production, Preview, Development):

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (your Supabase URL)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)

4. Click **Save**

### Option B: Using Vercel CLI

```bash
cd website
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key when prompted
```

## Step 7: Trigger Redeployment

The push to GitHub should trigger an automatic deployment, but if not:

### Via Dashboard:
1. Go to https://vercel.com/jrdaws-projects/dawson-does-framework
2. Click **Deployments** tab
3. Click the three dots (...) on the latest deployment
4. Click **Redeploy**

### Via CLI:
```bash
cd website
vercel --prod
```

## Step 8: Verify Production Deployment

1. Visit https://dawson-does-framework-bv8x.vercel.app/configure
2. Configure a test project
3. Click **Option C: Pull from Platform**
4. You should see a token generated (e.g., `fast-lion-1234`)
5. Copy the pull command

Test locally:
```bash
npx @jrdaws/framework pull fast-lion-1234
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that both env vars are set in Vercel
- Make sure they're available in "Production" environment
- Redeploy after adding env vars

### Error: "Failed to save project"
- Check Supabase SQL Editor logs
- Verify the migration ran successfully
- Check RLS policies are enabled

### Error: "Project not found"
- Token might have expired (30 days)
- Check Supabase Table Editor to see if project exists
- Verify API is using correct Supabase URL

## Security Notes

- ✅ **Public anon key is safe** - It's designed to be exposed client-side
- ✅ **RLS (Row Level Security) is enabled** - Public can only read/insert their own projects
- ✅ **30-day expiration** - Projects auto-delete after 30 days
- ✅ **No sensitive data** - Only project configuration, not credentials

## Next Steps

Once deployed:
1. Test the full flow: Configure → Save → Pull → Develop
2. Share the platform with others to try
3. Monitor Supabase dashboard for usage
4. Set up cleanup cron job for expired projects (optional)

---

**Need help?** Check the Supabase logs or Vercel deployment logs for errors.
