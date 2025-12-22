# API Contracts - Dawson-Does Framework

> **Version:** 1.0
> **Last Updated:** 2025-12-22
> **Status:** Production

This document defines the API contracts for the dawson-does framework platform APIs.

---

## Table of Contents

1. [Preview Generation API](#preview-generation-api)
2. [Projects API](#projects-api)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Authentication](#authentication)

---

## Preview Generation API

### `POST /api/preview/generate`

Generates an AI-powered HTML preview based on template configuration and user inputs.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```typescript
{
  template: string;              // Required: Template type (saas, blog, dashboard, etc.)
  projectName?: string;          // Optional: Project name (defaults to "My App")
  integrations: {                // Required: Selected integrations
    [key: string]: string;       // e.g., { auth: "supabase", payments: "stripe" }
  };
  inspirations: Array<{          // Required: Can be empty array
    type: string;                // "url", "image", or "figma"
    value: string;               // URL or reference
    preview?: string;            // Optional: Preview URL for images
  }>;
  description: string;           // Required: Can be empty string
  vision?: string;               // Optional: Project vision statement
  mission?: string;              // Optional: Project mission statement
  userApiKey?: string;           // Optional: User's Anthropic API key
  sessionId: string;             // Required: Session identifier for rate limiting
  seed?: number;                 // Optional: Deterministic generation seed
}
```

**Validation Rules:**
- `template` must be non-empty string
- `sessionId` must be non-empty string
- `description` must be ≤ 10,000 characters
- `inspirations` must be array (can be empty)

#### Response (Success)

**Status:** `200 OK`

**Body:**
```typescript
{
  success: true;
  html: string;                              // Complete HTML document
  components: string[];                      // Detected components (e.g., ["Nav", "Hero", "Features"])
  generatedAt: string;                       // ISO 8601 timestamp
  seed: number;                              // Seed used (provided or generated)
  usage: {                                   // Token usage stats
    input_tokens: number;
    output_tokens: number;
    service_tier: string;
  };
  remainingDemoGenerations: number | null;   // Remaining demo uses (null if using API key)
  cached?: boolean;                          // True if served from cache
  redisEnabled: boolean;                     // Whether Redis caching is active
}
```

#### Response (Error)

**Status:** `400 Bad Request` (Validation Error)
```typescript
{
  error: "Validation failed";
  message: string;  // Human-readable error message
}
```

**Status:** `401 Unauthorized` (Invalid API Key)
```typescript
{
  error: "Invalid API key" | "No API key available";
  message: string;
  details?: string;  // Additional guidance (e.g., console.anthropic.com URL)
}
```

**Status:** `429 Too Many Requests` (Rate Limited)
```typescript
{
  error: "Rate limit exceeded";
  message: string;
  rateLimited: true;
  resetAt?: number;    // Unix timestamp when limit resets
  remaining: 0;
}
```

**Status:** `500 Internal Server Error` (Generation Failed)
```typescript
{
  error: "Generation failed";
  message: string;
  details?: string;    // Only in development mode
  stack?: string;      // Only in development mode
}
```

**Status:** `503 Service Unavailable` (Anthropic API Down)
```typescript
{
  error: "Service temporarily unavailable";
  message: string;
}
```

#### Performance Targets

- **Generation Time:** < 5 seconds (uncached)
- **Cache Hit Time:** < 1 second (with seed)
- **Cache TTL:** 30 minutes
- **Max Tokens:** 4096

#### Caching Strategy

- **Cache Key:** SHA-256 hash of: template, projectName, integrations, inspirations, description, vision, mission, seed
- **Cache Storage:** Redis (production) or in-memory (development)
- **Cache Behavior:**
  - Only caches requests with explicit `seed` parameter
  - Non-seeded requests use temperature 0.3 for variety
  - Cache automatically cleaned when > 100 entries

#### Rate Limiting

- **Demo Users:** 5 generations per 24 hours
- **API Key Users:** Unlimited
- **Tracking:** Redis (production) or localStorage (development)
- **Session Scope:** Based on `sessionId`

---

## Projects API

### `POST /api/projects`

Saves a configured project to Supabase and returns a unique token.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```typescript
{
  template: string;
  integrations: Record<string, string>;
  projectName: string;
  description?: string;
  vision?: string;
  mission?: string;
  previewHtml?: string;
  features?: string[];
  // ... additional project config
}
```

#### Response (Success)

**Status:** `200 OK`

**Body:**
```typescript
{
  success: true;
  token: string;           // 12-character unique token
  pullCommand: string;     // Ready-to-use CLI command
}
```

#### Response (Error)

**Status:** `500 Internal Server Error`
```typescript
{
  error: string;
  message: string;
}
```

---

### `GET /api/projects/[token]`

Retrieves a project configuration by token.

#### Request

**Parameters:**
- `token` (path): 12-character project token

#### Response (Success)

**Status:** `200 OK`

**Body:**
```typescript
{
  id: string;
  token: string;
  template: string;
  integrations: Record<string, string>;
  projectName: string;
  description?: string;
  vision?: string;
  mission?: string;
  previewHtml?: string;
  features?: string[];
  createdAt: string;
  // ... additional fields
}
```

#### Response (Error)

**Status:** `404 Not Found`
```typescript
{
  error: "Project not found";
  message: string;
}
```

---

### `GET /api/projects/[token]/download`

Exports a project as a ZIP file.

#### Request

**Parameters:**
- `token` (path): 12-character project token

#### Response (Success)

**Status:** `200 OK`

**Headers:**
```http
Content-Type: application/zip
Content-Disposition: attachment; filename="[project-name].zip"
```

**Body:** Binary ZIP file

#### Response (Error)

**Status:** `404 Not Found`
```typescript
{
  error: "Project not found";
  message: string;
}
```

**Status:** `500 Internal Server Error`
```typescript
{
  error: "Export failed";
  message: string;
  details?: string;
}
```

---

## Error Handling

### Standard Error Response Format

All API errors follow this structure:

```typescript
{
  error: string;        // Machine-readable error code
  message: string;      // Human-readable error message
  details?: any;        // Optional: Additional context
  code?: string;        // Optional: Specific error code
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

### Error Handling Best Practices

1. **Always include user-actionable messages**
   - ❌ "Invalid input"
   - ✅ "Project name must be between 1 and 50 characters"

2. **Provide recovery guidance**
   - Include links to documentation
   - Suggest next steps (e.g., "Add API key for unlimited access")

3. **Log errors with context**
   - Include duration, API endpoint, user session
   - Use structured logging format

4. **Never expose sensitive data in errors**
   - Don't include API keys, tokens, or internal paths
   - Only show stack traces in development mode

---

## Rate Limiting

### Configuration

```typescript
{
  DEMO_RATE_LIMIT: 5,                    // Requests per window
  RATE_LIMIT_WINDOW: 86400,              // 24 hours in seconds
  RATE_LIMIT_STORAGE: "Redis" | "Memory" // Storage backend
}
```

### Headers

Rate limit information is included in error responses, not headers (for simplicity).

### Bypass

Users can bypass rate limiting by providing their own Anthropic API key via the `userApiKey` field.

---

## Authentication

### Current Implementation

- **Platform APIs:** No authentication required (public demo)
- **User API Keys:** Optional, stored client-side only
- **Session Tracking:** Via `sessionId` parameter

### Future Considerations

- Add OAuth for user accounts
- API keys for programmatic access
- JWT tokens for authenticated sessions

---

## Performance Benchmarks

### Preview Generation

| Metric | Target | Sonnet 4 | Haiku | Status |
|--------|--------|----------|-------|--------|
| Uncached generation | < 5s | ~41s | ~20-29s | ⚠️ Improved but still over target |
| Cached response | < 1s | ~0.9s | ~0.9s | ✅ Passing |
| Token limit | 4096 | 4096 | 4096 | ✅ Passing |
| Cache hit rate | > 30% | TBD | TBD | ⚠️ Needs monitoring |

**Current Model:** `claude-3-haiku-20240307` (as of 2025-12-22)

**Test Results (2025-12-22):**
- Blog template: 19.8s (Haiku)
- Dashboard with auth: 28.9s (Haiku)
- Original Sonnet 4: 41s
- Cached responses: < 1s ✅

**Analysis:**
- Haiku provides ~2x improvement over Sonnet 4 (41s → 20-29s)
- Still exceeds 5s target due to 4096 token generation
- Quality remains acceptable for preview purposes
- Further optimization requires token reduction or streaming

### Recommendations for Performance Improvement

1. ✅ **Use Claude Haiku** - IMPLEMENTED (2025-12-22)
   - Switched to `claude-3-haiku-20240307`
   - ~2x speed improvement vs Sonnet 4
   - Acceptable quality for preview purposes
   - Cost reduction benefit

2. **Reduce token count** - HIGH PRIORITY
   - Lower `MAX_TOKENS` to 1500-2500
   - Generate essential components only (Hero, Nav, Features)
   - Skip detailed multi-page implementations
   - Estimated: Would bring generation to 8-12s

3. **Implement streaming**
   - Stream HTML as it's generated
   - Show progressive preview to user
   - Reduce perceived latency (not actual generation time)

4. **Add CDN caching**
   - Cache common template previews at CDN edge
   - Serve static previews for unauthenticated users
   - Pre-generate popular configurations

---

## Changelog

### Version 1.0 (2025-12-22)
- Initial API contract documentation
- Preview Generation API fully documented
- Projects API documented
- Error handling standards defined
- Rate limiting specification added

---

## Contributing

To update this API contract:

1. Read `AGENT_CONTEXT.md` first
2. Follow project coding standards
3. Update version and changelog
4. Test changes against implementation
5. Commit with `docs: update API contracts` message

---

**Maintained by:** Platform Agent
**Contact:** See `AGENT_CONTEXT.md` for agent coordination
