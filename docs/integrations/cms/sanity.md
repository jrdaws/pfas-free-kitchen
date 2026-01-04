# Sanity CMS Setup

Complete guide to setting up Sanity headless CMS in your framework project.

## What It Does

Sanity provides a flexible headless CMS:

- Real-time collaborative editing
- Customizable content studio
- Structured content with schemas
- Image transformations and CDN
- GROQ query language
- Portable Text rich editor
- Webhooks for content changes
- Draft/published content states
- Localization support
- Free tier: 100K API requests/month

## Prerequisites

- [ ] Sanity account ([sign up](https://www.sanity.io/get-started))
- [ ] Project created in Sanity
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_api_token
```

## Step-by-Step Setup

### 1. Create Sanity Account

1. Go to [sanity.io/get-started](https://www.sanity.io/get-started)
2. Sign up with email or GitHub
3. Create new project
4. Note your Project ID

### 2. Install Sanity Packages

```bash
npm install @sanity/client @sanity/image-url next-sanity
```

For the Studio (content editor):

```bash
npm install sanity @sanity/vision
```

### 3. Get API Credentials

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project
3. Go to **API** → **Tokens**
4. Create token with **Editor** permissions

### 4. Create Sanity Client

```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});

// For mutations (writing data)
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Image URL builder
const builder = imageUrlBuilder(client);
export function urlFor(source: any) {
  return builder.image(source);
}
```

### 5. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_token
```

### 6. Create Content Schema

```typescript
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `by ${author}` : '',
        media,
      };
    },
  },
});
```

### 7. Create Sanity Studio Config

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'My Blog',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

### 8. Add Studio Route

```typescript
// app/studio/[[...index]]/page.tsx
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

```typescript
// app/studio/[[...index]]/layout.tsx
export const metadata = {
  title: 'Sanity Studio',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Code Examples

### Fetch All Posts

```typescript
// lib/queries.ts
export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  "author": author->name,
  "categories": categories[]->title
}`;

// app/blog/page.tsx
import { client } from '@/lib/sanity';
import { postsQuery } from '@/lib/queries';

export default async function BlogPage() {
  const posts = await client.fetch(postsQuery);

  return (
    <div className="grid gap-8">
      {posts.map((post: any) => (
        <article key={post._id} className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <p className="text-gray-600">By {post.author}</p>
          <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  );
}
```

### Fetch Single Post

```typescript
// lib/queries.ts
export const postQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  mainImage,
  body,
  "author": author->{name, image, bio},
  "categories": categories[]->title
}`;

// app/blog/[slug]/page.tsx
import { client, urlFor } from '@/lib/sanity';
import { postQuery } from '@/lib/queries';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await client.fetch(postQuery, { slug: params.slug });

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold">{post.title}</h1>

      {post.mainImage && (
        <img
          src={urlFor(post.mainImage).width(800).url()}
          alt={post.title}
          className="my-8 rounded-lg"
        />
      )}

      <div className="prose">
        <PortableText value={post.body} />
      </div>
    </article>
  );
}
```

### Generate Static Paths

```typescript
// app/blog/[slug]/page.tsx
import { client } from '@/lib/sanity';

export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "post"].slug.current`);

  return slugs.map((slug: string) => ({
    slug,
  }));
}
```

### Image Component

```typescript
// components/SanityImage.tsx
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';

interface Props {
  image: any;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function SanityImage({
  image,
  alt,
  width = 800,
  height = 600,
  className,
}: Props) {
  if (!image) return null;

  return (
    <Image
      src={urlFor(image).width(width).height(height).url()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      placeholder="blur"
      blurDataURL={urlFor(image).width(50).blur(50).url()}
    />
  );
}
```

### Portable Text Components

```typescript
// components/PortableTextComponents.tsx
import { PortableTextComponents } from '@portabletext/react';
import { SanityImage } from './SanityImage';
import Link from 'next/link';

export const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <SanityImage
        image={value}
        alt={value.alt || ''}
        className="my-8 rounded-lg"
      />
    ),
    code: ({ value }) => (
      <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
        <code>{value.code}</code>
      </pre>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || '';
      const isExternal = href.startsWith('http');

      return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
};
```

### Draft Preview

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  draftMode().enable();
  redirect(`/blog/${slug}`);
}
```

```typescript
// lib/sanity.ts
import { draftMode } from 'next/headers';

export function getClient() {
  const isDraft = draftMode().isEnabled;

  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: !isDraft,
    token: isDraft ? process.env.SANITY_API_TOKEN : undefined,
    perspective: isDraft ? 'previewDrafts' : 'published',
  });
}
```

### Webhook for Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Verify webhook secret
  const secret = request.headers.get('x-sanity-secret');
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Revalidate based on document type
  const { _type, slug } = body;

  if (_type === 'post') {
    revalidatePath('/blog');
    if (slug?.current) {
      revalidatePath(`/blog/${slug.current}`);
    }
  }

  return NextResponse.json({ revalidated: true });
}
```

### Create Content

```typescript
// app/api/posts/route.ts
import { writeClient } from '@/lib/sanity';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const result = await writeClient.create({
    _type: 'post',
    title: body.title,
    slug: {
      _type: 'slug',
      current: body.title.toLowerCase().replace(/\s+/g, '-'),
    },
    publishedAt: new Date().toISOString(),
    body: body.content,
  });

  return NextResponse.json({ id: result._id });
}
```

## Advanced Features

### Real-Time Updates

```typescript
'use client';

import { client } from '@/lib/sanity';
import { useEffect, useState } from 'react';

export function useLiveQuery<T>(query: string, params = {}) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    // Initial fetch
    client.fetch(query, params).then(setData);

    // Subscribe to updates
    const subscription = client
      .listen(query, params)
      .subscribe((update) => {
        if (update.result) {
          setData(update.result);
        }
      });

    return () => subscription.unsubscribe();
  }, [query]);

  return data;
}
```

### Localization

```typescript
// sanity/schemas/post.ts
defineField({
  name: 'title',
  title: 'Title',
  type: 'localeString', // Custom type
}),

// sanity/schemas/localeString.ts
export const localeString = defineType({
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    { name: 'en', title: 'English', type: 'string' },
    { name: 'es', title: 'Spanish', type: 'string' },
    { name: 'fr', title: 'French', type: 'string' },
  ],
});
```

### SEO Fields

```typescript
// sanity/schemas/seo.ts
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
    }),
  ],
});
```

## Troubleshooting

### Studio Not Loading

**Solutions:**
1. Check Project ID and Dataset are correct
2. Add CORS origin in Sanity dashboard: **API** → **CORS origins**
3. Add `http://localhost:3000` for development
4. Clear browser cache

### Content Not Updating

**Solutions:**
1. Disable CDN for real-time updates: `useCdn: false`
2. Set up webhook for cache revalidation
3. Check API version is recent
4. Verify token has read permissions

### Images Not Displaying

**Solutions:**
1. Check image asset is uploaded (not just referenced)
2. Verify `@sanity/image-url` is configured correctly
3. Use correct image dimensions
4. Check CDN is not blocking images

### GROQ Query Errors

**Solutions:**
1. Test query in Vision plugin at `/studio`
2. Check field names match schema
3. Escape special characters
4. Use proper projection syntax

## Production Checklist

- [ ] Environment variables set in production
- [ ] CORS origins configured
- [ ] Webhook for cache revalidation
- [ ] Draft preview working
- [ ] CDN enabled for performance
- [ ] Image optimization configured
- [ ] SEO fields populated
- [ ] Backup strategy (dataset export)
- [ ] User roles configured
- [ ] Studio access restricted

## Pricing Notes

Sanity pricing tiers:

- **Free:** 100K API requests/month, 5GB assets
- **Team:** $99/month, 1M requests, 50GB assets
- **Business:** $949/month, 10M requests, 500GB assets
- **Enterprise:** Custom pricing

Features by tier:
- Free: 3 users, basic features
- Team: 10 users, custom roles
- Business: SSO, advanced permissions
- Enterprise: SLA, dedicated support

## Next Steps

- [Search Integration](../search/algolia.md) - Add search to your content
- [Analytics](../analytics/posthog.md) - Track content performance
- [Sanity Documentation](https://www.sanity.io/docs) - Official docs
- [GROQ Cheat Sheet](https://www.sanity.io/docs/groq-syntax) - Query reference

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Next.js Integration](https://www.sanity.io/guides/nextjs-app-router-live-preview)
- [Portable Text](https://www.sanity.io/docs/presenting-block-text)
- [Schema Types](https://www.sanity.io/docs/schema-types)

