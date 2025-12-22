# Database Integrations

Store and manage application data with Supabase PostgreSQL database.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **Supabase** | PostgreSQL with real-time features | SQL database, real-time subscriptions, Row Level Security | [Guide →](supabase.md) |

## Why Supabase Database

Supabase provides a complete PostgreSQL database with modern features:

✅ **PostgreSQL** - Industry-standard relational database
✅ **Real-time subscriptions** - Listen to database changes
✅ **Row Level Security** - User-level access control
✅ **Auto-generated APIs** - REST and GraphQL endpoints
✅ **TypeScript types** - Auto-generated from schema
✅ **Migrations** - Version control for database schema
✅ **Backups** - Automatic daily backups
✅ **Scalable** - From prototype to production

## Quick Start

### 1. Export with Supabase

```bash
framework export saas ./my-app --database supabase --auth supabase
cd my-app
```

### 2. Get Supabase Credentials

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get credentials from Settings → API
4. Add to `.env.local`

### 3. Create Database Schema

Run SQL in Supabase SQL Editor:

```sql
-- Example: User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

### 4. Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

### 5. Query Database

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single()

  return <div>{profile.username}</div>
}
```

## Common Use Cases

### User Profiles

Store user information linked to auth:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Blog Posts

Content management:

```sql
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### SaaS Subscriptions

Store subscription data:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### E-commerce Products

Product catalog:

```sql
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  image_url TEXT,
  inventory_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Database Patterns

### CRUD Operations

```typescript
// Create
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...' })
  .select()
  .single()

// Read
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })

// Update
await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)

// Delete
await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### Relations

```typescript
// Fetch post with author profile
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(username, avatar_url)
  `)
  .eq('id', postId)
  .single()
```

### Real-time Subscriptions

```typescript
// Listen to database changes
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('New post:', payload.new)
    }
  )
  .subscribe()

// Clean up
channel.unsubscribe()
```

### Row Level Security

```sql
-- Policy: Users can only update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Policy: Everyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (published = TRUE);
```

## Integration with Auth

### Auto-create Profile on Sign Up

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Query User's Data

```typescript
// Automatically filtered by RLS
const { data: userPosts } = await supabase
  .from('posts')
  .select('*')
  .eq('author_id', session.user.id)
```

## Migrations

### Create Migration

```bash
npx supabase migration new create_posts_table
```

Edit the generated file:

```sql
-- supabase/migrations/20240101_create_posts_table.sql
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Apply Migrations

```bash
# Local development
npx supabase db push

# Production
npx supabase db push --project-ref your-project-id
```

## TypeScript Types

### Generate Types from Schema

```bash
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

### Use Types in Code

```typescript
import { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type NewPost = Database['public']['Tables']['posts']['Insert']

// Type-safe queries
const { data } = await supabase
  .from('posts')
  .select('*')
  .returns<Post[]>()
```

## Performance

### Indexes

Add indexes for frequently queried columns:

```sql
-- Index on foreign key
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- Index on search column
CREATE INDEX idx_posts_title ON posts USING gin(to_tsvector('english', title));

-- Composite index
CREATE INDEX idx_posts_author_published ON posts(author_id, published);
```

### Pagination

```typescript
const ITEMS_PER_PAGE = 20
const page = 1

const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
```

### Caching

Use Next.js caching for expensive queries:

```typescript
import { cache } from 'react'

export const getPosts = cache(async () => {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase
    .from('posts')
    .select('*')
  return data
})
```

## Backup and Recovery

### Automatic Backups

Supabase provides:
- **Daily backups** - Last 7 days (free tier)
- **Point-in-time recovery** - Up to 30 days (paid plans)

### Manual Backup

```bash
# Export database
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# Import database
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

## Security Best Practices

### 1. Enable RLS on All Tables

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### 2. Create Specific Policies

```sql
-- Don't allow all access
-- ❌ Bad
CREATE POLICY "Allow all" ON posts USING (true);

-- ✅ Good - specific policies
CREATE POLICY "Users read own posts" ON posts FOR SELECT USING (auth.uid() = author_id);
```

### 3. Use Service Role Key Carefully

Only use service role key for admin operations. Never expose to client.

### 4. Validate Input

```typescript
// Validate before inserting
if (!title || title.length > 200) {
  return { error: 'Invalid title' }
}

await supabase.from('posts').insert({ title })
```

## Testing

### Test Database Queries

```typescript
import { createClient } from '@supabase/supabase-js'

describe('Database', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  it('should create post', async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert({ title: 'Test Post' })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.title).toBe('Test Post')

    // Clean up
    await supabase.from('posts').delete().eq('id', data.id)
  })
})
```

## Common Issues

### RLS Policy Blocking Access

**Symptom:** Queries return empty results

**Solution:** Check RLS policies and ensure user is authenticated:

```sql
-- Debug: View which policies apply
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Temporarily disable RLS for testing (development only!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

### Foreign Key Constraint Error

**Symptom:** Insert fails with foreign key violation

**Solution:** Ensure referenced record exists:

```typescript
// Check if user exists before creating post
const { data: user } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', userId)
  .single()

if (!user) {
  return { error: 'User not found' }
}
```

### Connection Pool Exhausted

**Symptom:** Database queries timeout

**Solution:** Use connection pooling and close connections:

```typescript
// Use Supabase client singleton
// Don't create new client on every request
```

## Next Steps

- [Complete Supabase Database Guide](supabase.md) - Detailed setup instructions
- [Authentication](../auth/supabase.md) - Connect database with auth
- [Storage](../storage/supabase.md) - File uploads and storage
- [Supabase Documentation](https://supabase.com/docs/guides/database) - Official docs

## Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)
