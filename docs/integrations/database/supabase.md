# Supabase Database Setup

Complete guide to setting up Supabase PostgreSQL database in your framework project.

## What It Does

Supabase Database provides a complete PostgreSQL database with:

- Full PostgreSQL database with all SQL features
- Auto-generated REST API endpoints
- Real-time subscriptions to database changes
- Row Level Security (RLS) for user-level access control
- Database functions and triggers
- Full-text search capabilities
- TypeScript type generation from schema
- Database migrations with version control
- Automatic daily backups
- Built-in connection pooling

## Prerequisites

- [ ] Supabase account ([sign up](https://supabase.com))
- [ ] Project created in Supabase dashboard
- [ ] Supabase Auth set up (recommended)
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres  # Optional, for direct connections
```

## Step-by-Step Setup

### 1. Access Database

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in left sidebar
3. You can now run SQL commands directly

### 2. Create Your First Table

Run in SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for fast lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 3. Create Auto-Profile Trigger

Automatically create profile when user signs up:

```sql
-- Function to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Create Posts Table (Example)

```sql
-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published, published_at DESC);

-- Full-text search index
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);
```

### 5. Add Updated_At Trigger

Auto-update `updated_at` timestamp:

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. Generate TypeScript Types

Install Supabase CLI:

```bash
npm install -g supabase
```

Generate types:

```bash
# Login to Supabase
supabase login

# Generate types
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

Add to your project:

```typescript
// types/database.ts is auto-generated

// lib/database.types.ts
import { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type NewProfile = Database['public']['Tables']['profiles']['Insert']
export type NewPost = Database['public']['Tables']['posts']['Insert']
```

### 7. Set Up Migrations (Optional)

Initialize Supabase locally:

```bash
# Initialize
npx supabase init

# Link to project
npx supabase link --project-ref your-project-id

# Pull current schema
npx supabase db pull

# Create new migration
npx supabase migration new add_comments_table
```

Edit migration file:

```sql
-- supabase/migrations/20240101000000_add_comments_table.sql
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
```

Apply migration:

```bash
npx supabase db push
```

## Code Examples

### Query Data (Server Component)

```typescript
// app/posts/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function PostsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch all published posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching posts:', error)
    return <div>Error loading posts</div>
  }

  return (
    <div>
      <h1>Recent Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Query with Relations

```typescript
// Fetch posts with author profile
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles(username, avatar_url)
  `)
  .eq('published', true)

// Type-safe access
posts?.forEach(post => {
  console.log(post.title)
  console.log(post.author.username) // Related data
})
```

### Create Record (Server Action)

```typescript
// app/posts/actions.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Validate
  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters' }
  }

  // Create slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Insert post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: session.user.id,
      title,
      slug,
      content,
      published: false
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  return { data }
}
```

### Update Record

```typescript
// Update post
export async function updatePost(postId: string, updates: Partial<Post>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  return { data }
}
```

### Delete Record

```typescript
// Delete post
export async function deletePost(postId: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  return { success: true }
}
```

### Real-time Subscriptions (Client Component)

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import type { Post } from '@/types/database'

export default function RealtimePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial posts
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (data) {
        setPosts(data)
      }
    }

    fetchPosts()

    // Subscribe to new posts
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'published=eq.true'
        },
        (payload) => {
          setPosts(current => [payload.new as Post, ...current])
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(current =>
            current.map(post =>
              post.id === payload.new.id ? payload.new as Post : post
            )
          )
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(current =>
            current.filter(post => post.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

### Full-Text Search

```typescript
// Search posts
export async function searchPosts(query: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .textSearch('title', query, {
      type: 'websearch',
      config: 'english'
    })
    .eq('published', true)
    .limit(20)

  return { data, error }
}
```

### Pagination

```typescript
// Paginated posts
export async function getPaginatedPosts(page: number = 0, pageSize: number = 20) {
  const supabase = createServerComponentClient({ cookies })

  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  return {
    data,
    error,
    total: count,
    pages: count ? Math.ceil(count / pageSize) : 0
  }
}
```

### Filtering and Sorting

```typescript
// Advanced filtering
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .gte('created_at', '2024-01-01')
  .lte('view_count', 1000)
  .in('category', ['tech', 'design'])
  .order('view_count', { ascending: false })
  .limit(10)
```

### Aggregation

```typescript
// Count posts by author
const { data } = await supabase
  .from('posts')
  .select('author_id, count')
  .eq('published', true)

// With RPC function for complex aggregations
const { data: stats } = await supabase
  .rpc('get_post_stats', { author_id: userId })
```

### Database Functions (RPC)

Create function in SQL Editor:

```sql
-- Create function
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

Call from code:

```typescript
// Increment view count
await supabase.rpc('increment_view_count', {
  post_id: postId
})
```

### Transactions

```typescript
// Use database function for transactions
CREATE OR REPLACE FUNCTION transfer_post(
  post_id UUID,
  new_author_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update post author
  UPDATE posts SET author_id = new_author_id WHERE id = post_id;

  -- Update stats
  UPDATE profiles SET post_count = post_count - 1 WHERE id = (SELECT author_id FROM posts WHERE id = post_id);
  UPDATE profiles SET post_count = post_count + 1 WHERE id = new_author_id;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security Examples

### User-Owned Data

```sql
-- Users can only access their own data
CREATE POLICY "Users access own data"
  ON user_data FOR ALL
  USING (auth.uid() = user_id);
```

### Public Read, Owner Write

```sql
-- Anyone can read, only owner can write
CREATE POLICY "Public read" ON posts FOR SELECT USING (true);
CREATE POLICY "Owner write" ON posts FOR ALL USING (auth.uid() = author_id);
```

### Role-Based Access

```sql
-- Admin users can access all data
CREATE POLICY "Admin access" ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

### Team-Based Access

```sql
-- Team members can access team data
CREATE POLICY "Team access" ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = projects.id
      AND team_members.user_id = auth.uid()
    )
  );
```

## Performance Optimization

### Add Indexes

```sql
-- Single column index
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- Composite index
CREATE INDEX idx_posts_author_published ON posts(author_id, published);

-- Partial index
CREATE INDEX idx_published_posts ON posts(published_at)
  WHERE published = TRUE;

-- Full-text search index
CREATE INDEX idx_posts_search ON posts
  USING gin(to_tsvector('english', title || ' ' || content));
```

### Use Select Specific Columns

```typescript
// ❌ Don't fetch all columns if not needed
const { data } = await supabase.from('posts').select('*')

// ✅ Select only needed columns
const { data } = await supabase
  .from('posts')
  .select('id, title, excerpt, created_at')
```

### Connection Pooling

Supabase handles connection pooling automatically. For direct connections:

```typescript
// Use connection pooling for serverless
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

### Caching

```typescript
// Cache expensive queries
import { cache } from 'react'

export const getPosts = cache(async () => {
  const supabase = createServerComponentClient({ cookies })
  return await supabase.from('posts').select('*')
})
```

## Common Issues

### RLS Policy Blocking Queries

**Symptom:** Queries return empty despite data existing

**Solution:** Check RLS policies:

```sql
-- View all policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Temporarily disable for debugging (dev only!)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### Foreign Key Constraint Errors

**Symptom:** Insert fails with "violates foreign key constraint"

**Solution:** Ensure referenced record exists:

```typescript
// Check before inserting
const { data: author } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', authorId)
  .single()

if (!author) {
  return { error: 'Author not found' }
}
```

### Unique Constraint Errors

**Symptom:** Insert fails with "duplicate key value"

**Solution:** Check for existing record first:

```typescript
// Check if username taken
const { data: existing } = await supabase
  .from('profiles')
  .select('username')
  .eq('username', username)
  .single()

if (existing) {
  return { error: 'Username already taken' }
}
```

### Query Timeout

**Symptom:** Long-running queries timeout

**Solutions:**
1. Add indexes to frequently queried columns
2. Reduce result set with pagination
3. Optimize complex joins
4. Use database functions for heavy operations

## Testing

### Test Database Queries

```typescript
import { createClient } from '@supabase/supabase-js'

describe('Database', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for tests
  )

  let testUserId: string
  let testPostId: string

  beforeAll(async () => {
    // Create test user
    const { data } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test-password',
      email_confirm: true
    })
    testUserId = data.user!.id
  })

  afterAll(async () => {
    // Clean up
    if (testPostId) {
      await supabase.from('posts').delete().eq('id', testPostId)
    }
    await supabase.auth.admin.deleteUser(testUserId)
  })

  it('should create post', async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: testUserId,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content'
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.title).toBe('Test Post')
    testPostId = data.id
  })

  it('should fetch posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', testUserId)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })
})
```

## Production Checklist

Before deploying to production:

### Database Configuration

- [ ] Enable RLS on all tables
- [ ] Create appropriate RLS policies
- [ ] Add indexes to frequently queried columns
- [ ] Set up database functions and triggers
- [ ] Test all CRUD operations
- [ ] Verify foreign key constraints
- [ ] Test data validation

### Security

- [ ] Review all RLS policies
- [ ] Never expose service role key to client
- [ ] Validate all user input
- [ ] Use prepared statements (automatic with Supabase)
- [ ] Enable database audit logs
- [ ] Set up database backups

### Performance

- [ ] Add appropriate indexes
- [ ] Test query performance
- [ ] Implement pagination
- [ ] Cache expensive queries
- [ ] Monitor connection pool usage
- [ ] Set up query performance monitoring

### Migrations

- [ ] Document database schema
- [ ] Set up migration workflow
- [ ] Test migrations on staging
- [ ] Plan rollback strategy
- [ ] Version control migration files

## Next Steps

- [Authentication](../auth/supabase.md) - Connect database with auth
- [Storage](../storage/supabase.md) - Add file uploads
- [Payments](../payments/stripe.md) - Store subscription data
- [Supabase Database Docs](https://supabase.com/docs/guides/database) - Official docs

## Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Query Performance](https://supabase.com/docs/guides/database/query-optimization)
