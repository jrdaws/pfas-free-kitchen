# Algolia Search Setup

Complete guide to setting up Algolia search in your framework project.

## What It Does

Algolia provides instant search capabilities:

- Full-text search with typo tolerance
- Faceted filtering and sorting
- Autocomplete suggestions
- Analytics on search queries
- AI-powered recommendations
- Geo-search for location-based results
- Multi-language support
- Real-time indexing
- Free tier: 10,000 requests/month

## Prerequisites

- [ ] Algolia account ([sign up](https://www.algolia.com/users/sign_up))
- [ ] Application created in Algolia dashboard
- [ ] Node.js 18+ installed

## Environment Variables Required

```bash
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_only_api_key
ALGOLIA_ADMIN_KEY=your_admin_api_key
ALGOLIA_INDEX_NAME=your_index_name
```

## Step-by-Step Setup

### 1. Create Algolia Account

1. Go to [algolia.com/users/sign_up](https://www.algolia.com/users/sign_up)
2. Sign up with email or GitHub
3. Create your first application
4. Note your Application ID

### 2. Get API Keys

1. In Algolia dashboard, go to **Settings** → **API Keys**
2. Copy these values:
   - **Application ID**: Used for all API calls
   - **Search-Only API Key**: Safe to expose in browser
   - **Admin API Key**: Keep secret (server-side only)

### 3. Install Algolia Packages

```bash
npm install algoliasearch react-instantsearch
```

### 4. Create Algolia Client

```typescript
// lib/algolia.ts
import algoliasearch from 'algoliasearch/lite';

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export const indexName = process.env.ALGOLIA_INDEX_NAME || 'products';
```

### 5. Create Admin Client (Server-Side)

```typescript
// lib/algolia-admin.ts
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

export const adminIndex = client.initIndex(
  process.env.ALGOLIA_INDEX_NAME || 'products'
);

export { client as algoliaAdmin };
```

### 6. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_only_key
ALGOLIA_ADMIN_KEY=your_admin_key
ALGOLIA_INDEX_NAME=products
```

## Code Examples

### Basic Search Component

```typescript
'use client';

import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { searchClient, indexName } from '@/lib/algolia';

function Hit({ hit }: { hit: any }) {
  return (
    <article className="p-4 border rounded-lg">
      <h2 className="font-bold">{hit.name}</h2>
      <p className="text-gray-600">{hit.description}</p>
      <span className="text-blue-600">${hit.price}</span>
    </article>
  );
}

export default function SearchPage() {
  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <div className="max-w-4xl mx-auto p-4">
        <SearchBox
          placeholder="Search products..."
          classNames={{
            input: 'w-full p-3 border rounded-lg',
            submit: 'hidden',
            reset: 'hidden',
          }}
        />
        <Hits hitComponent={Hit} className="mt-4 space-y-4" />
      </div>
    </InstantSearch>
  );
}
```

### Search with Filters

```typescript
'use client';

import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
} from 'react-instantsearch';
import { searchClient, indexName } from '@/lib/algolia';

export default function SearchWithFilters() {
  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <div className="flex gap-8 max-w-6xl mx-auto p-4">
        {/* Sidebar filters */}
        <aside className="w-64 space-y-6">
          <div>
            <h3 className="font-bold mb-2">Category</h3>
            <RefinementList attribute="category" />
          </div>
          <div>
            <h3 className="font-bold mb-2">Brand</h3>
            <RefinementList attribute="brand" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <SearchBox
            placeholder="Search..."
            classNames={{
              input: 'w-full p-3 border rounded-lg',
            }}
          />
          <Stats className="my-4 text-gray-600" />
          <Hits
            hitComponent={({ hit }) => (
              <div className="p-4 border rounded-lg">
                <h2>{hit.name}</h2>
                <p>{hit.description}</p>
              </div>
            )}
          />
          <Pagination className="mt-8" />
        </main>
      </div>
    </InstantSearch>
  );
}
```

### Autocomplete Search

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchBox, useHits } from 'react-instantsearch';

export function Autocomplete() {
  const { query, refine } = useSearchBox();
  const { hits } = useHits();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          refine(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search..."
        className="w-full p-3 border rounded-lg"
      />

      {isOpen && hits.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-64 overflow-auto">
          {hits.map((hit: any) => (
            <li
              key={hit.objectID}
              className="p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                // Handle selection
                setIsOpen(false);
              }}
            >
              {hit.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Index Data (Server-Side)

```typescript
// app/api/algolia/index/route.ts
import { adminIndex } from '@/lib/algolia-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { records } = await req.json();

    // Add records to Algolia index
    const result = await adminIndex.saveObjects(records, {
      autoGenerateObjectIDIfNotExist: true,
    });

    return NextResponse.json({
      success: true,
      objectIDs: result.objectIDs,
    });
  } catch (error) {
    console.error('Algolia indexing error:', error);
    return NextResponse.json(
      { error: 'Failed to index records' },
      { status: 500 }
    );
  }
}
```

### Sync Database to Algolia

```typescript
// scripts/sync-algolia.ts
import { adminIndex } from '@/lib/algolia-admin';
import { db } from '@/lib/db';

async function syncProducts() {
  // Fetch products from database
  const products = await db.product.findMany({
    include: { category: true },
  });

  // Transform for Algolia
  const records = products.map((product) => ({
    objectID: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category.name,
    image: product.imageUrl,
    createdAt: product.createdAt.getTime(),
  }));

  // Bulk update Algolia
  await adminIndex.saveObjects(records);

  console.log(`Synced ${records.length} products to Algolia`);
}

syncProducts();
```

### Search with Highlighting

```typescript
'use client';

import { Highlight, Snippet } from 'react-instantsearch';

function Hit({ hit }: { hit: any }) {
  return (
    <article className="p-4 border rounded-lg">
      <h2 className="font-bold">
        <Highlight attribute="name" hit={hit} />
      </h2>
      <p className="text-gray-600">
        <Snippet attribute="description" hit={hit} />
      </p>
    </article>
  );
}
```

### Configure Index Settings

```typescript
// scripts/configure-algolia.ts
import { adminIndex } from '@/lib/algolia-admin';

async function configureIndex() {
  await adminIndex.setSettings({
    // Searchable attributes (ordered by priority)
    searchableAttributes: ['name', 'description', 'category', 'brand'],

    // Attributes for filtering
    attributesForFaceting: ['category', 'brand', 'filterOnly(price)'],

    // Custom ranking
    customRanking: ['desc(popularity)', 'asc(price)'],

    // Highlighting
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',

    // Typo tolerance
    typoTolerance: true,
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 8,

    // Query rules
    queryLanguages: ['en'],
  });

  console.log('Index configured successfully');
}

configureIndex();
```

### Real-Time Sync with Webhooks

```typescript
// app/api/webhooks/product/route.ts
import { adminIndex } from '@/lib/algolia-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { event, data } = await req.json();

  switch (event) {
    case 'product.created':
    case 'product.updated':
      await adminIndex.saveObject({
        objectID: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
      });
      break;

    case 'product.deleted':
      await adminIndex.deleteObject(data.id);
      break;
  }

  return NextResponse.json({ success: true });
}
```

## Advanced Features

### Voice Search

```typescript
'use client';

import { useVoiceSearch } from 'react-instantsearch';

export function VoiceSearch() {
  const { isBrowserSupported, isListening, toggleListening } = useVoiceSearch();

  if (!isBrowserSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-200'}`}
    >
      🎤
    </button>
  );
}
```

### Geo Search

```typescript
'use client';

import { Configure, GeoSearch } from 'react-instantsearch';

export function LocationSearch({ lat, lng }: { lat: number; lng: number }) {
  return (
    <>
      <Configure
        aroundLatLng={`${lat},${lng}`}
        aroundRadius={50000} // 50km radius
      />
      <Hits />
    </>
  );
}
```

### Analytics

```typescript
'use client';

import { useSearchBox, useHits } from 'react-instantsearch';
import aa from 'search-insights';

// Initialize analytics
aa('init', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
});

export function useSearchAnalytics() {
  const { query } = useSearchBox();
  const { hits } = useHits();

  const trackClick = (objectID: string, position: number) => {
    aa('clickedObjectIDsAfterSearch', {
      index: 'products',
      eventName: 'Product Clicked',
      queryID: hits.__queryID,
      objectIDs: [objectID],
      positions: [position],
    });
  };

  const trackConversion = (objectID: string) => {
    aa('convertedObjectIDsAfterSearch', {
      index: 'products',
      eventName: 'Product Purchased',
      queryID: hits.__queryID,
      objectIDs: [objectID],
    });
  };

  return { trackClick, trackConversion };
}
```

## Troubleshooting

### No Search Results

**Solutions:**
1. Verify index has data: Check Algolia dashboard → Indices
2. Check index name matches environment variable
3. Verify searchable attributes are configured
4. Check for typos in attribute names

### Slow Search Performance

**Solutions:**
1. Use `algoliasearch/lite` for client-side (smaller bundle)
2. Configure `attributesToRetrieve` to limit returned data
3. Use `attributesToHighlight` sparingly
4. Enable instant search caching

### API Key Errors

**Solutions:**
1. Verify `NEXT_PUBLIC_` prefix for client-side keys
2. Use Search API key (not Admin) for frontend
3. Check key permissions in Algolia dashboard
4. Restart dev server after adding env vars

### Index Not Updating

**Solutions:**
1. Check Admin API key has write permissions
2. Verify `objectID` is set on records
3. Check for rate limiting (10,000 ops/day on free tier)
4. Use `waitTask()` to confirm indexing completes

## Production Checklist

- [ ] Use production API keys
- [ ] Configure index settings (searchable attributes, ranking)
- [ ] Set up real-time sync from database
- [ ] Enable analytics tracking
- [ ] Configure synonyms for common terms
- [ ] Set up query rules for merchandising
- [ ] Test search relevance with real queries
- [ ] Monitor search analytics in dashboard
- [ ] Set up alerts for indexing failures
- [ ] Configure rate limiting if needed

## Pricing Notes

Algolia pricing tiers:

- **Free:** 10,000 requests/month, 10,000 records
- **Build:** $1 per 1,000 requests, unlimited records
- **Grow:** Custom pricing, advanced features
- **Premium:** Enterprise features, dedicated support

## Next Steps

- [Database Integration](../database/supabase.md) - Store searchable data
- [Analytics](../analytics/posthog.md) - Track search behavior
- [Algolia Documentation](https://www.algolia.com/doc/) - Official docs
- [InstantSearch Guide](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/) - React components

## Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [React InstantSearch](https://www.algolia.com/doc/api-reference/widgets/react/)
- [Index Configuration](https://www.algolia.com/doc/api-reference/settings-api-parameters/)
- [Search Analytics](https://www.algolia.com/doc/guides/search-analytics/overview/)

