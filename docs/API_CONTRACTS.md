# API Contracts - Dawson-Does Framework

> **Version:** 1.1
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

### `POST /api/projects/save`

Saves a configured project to Supabase and returns a unique token for later retrieval.

#### Request

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```typescript
{
  template: string;                              // Required: Template type (saas, seo-directory, etc.)
  project_name: string;                          // Required: Project name
  output_dir?: string;                           // Optional: Output directory (default: "./my-app")
  integrations?: Record<string, string>;         // Optional: Selected integrations (e.g., { auth: "supabase" })
  env_keys?: Record<string, string>;             // Optional: Environment variables
  vision?: string;                               // Optional: Project vision statement
  mission?: string;                              // Optional: Project mission statement
  success_criteria?: string;                     // Optional: Success criteria
  inspirations?: Array<{                         // Optional: Inspiration references
    type: string;                                // "url", "image", or "figma"
    value: string;                               // URL or reference
    preview?: string;                            // Optional: Preview URL
  }>;
  description?: string;                          // Optional: Project description
}
```

**Validation Rules:**
- `template` must be non-empty string
- `project_name` must be non-empty string
- All other fields are optional

#### Response (Success)

**Status:** `201 Created`

**Body:**
```typescript
{
  success: true;
  data: {
    token: string;              // Human-readable token (format: "adjective-noun-####")
    expiresAt: string;          // ISO 8601 timestamp (30 days from creation)
    pullCommand: string;        // Ready-to-use CLI command: "npx @jrdaws/framework pull {token}"
    url: string;                // Configurator URL with project token
  };
  meta: {
    timestamp: string;          // ISO 8601 timestamp of response
  };
}
```

**Token Format:**
- Pattern: `{adjective}-{noun}-{number}`
- Example: `fast-lion-1234`, `bright-eagle-5678`
- Length: Variable (~15-20 characters)
- Unique: Collision detection with retry

#### Response (Error)

**Status:** `400 Bad Request` (Missing Required Field)
```typescript
{
  success: false;
  error: {
    code: "MISSING_FIELD";
    message: string;                            // e.g., "Template is required"
    details?: { field: string };                // Which field is missing
    recovery: string;                           // Actionable guidance
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `429 Too Many Requests` (Rate Limited)
```typescript
{
  success: false;
  error: {
    code: "RATE_LIMITED";
    message: "Too many requests. Please try again later.";
    details?: { resetAt: number };              // Unix timestamp
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `500 Internal Server Error` (Database Error)
```typescript
{
  success: false;
  error: {
    code: "DATABASE_ERROR" | "INTERNAL_ERROR";
    message: string;
    details?: any;                              // Only in development mode
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

---

### `GET /api/projects/[token]`

Retrieves a project configuration by token.

#### Request

**Parameters:**
- `token` (path): Human-readable project token (format: "adjective-noun-####")

#### Response (Success)

**Status:** `200 OK`

**Body:**
```typescript
{
  success: true;
  data: {
    id: string;
    token: string;
    template: string;
    project_name: string;
    output_dir: string;
    integrations: Record<string, string>;
    env_keys?: Record<string, string>;
    vision?: string;
    mission?: string;
    success_criteria?: string;
    inspirations?: Array<{
      type: string;
      value: string;
      preview?: string;
    }>;
    description?: string;
    created_at: string;                         // ISO 8601 timestamp
    expires_at: string;                         // ISO 8601 timestamp
    last_accessed_at: string;                   // ISO 8601 timestamp
  };
  meta: {
    timestamp: string;
  };
}
```

#### Response (Error)

**Status:** `404 Not Found` (Token Not Found)
```typescript
{
  success: false;
  error: {
    code: "TOKEN_NOT_FOUND";
    message: string;                            // e.g., "Project with token 'xxx' not found"
    recovery: string;                           // Guidance to verify token or create new project
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `410 Gone` (Token Expired)
```typescript
{
  success: false;
  error: {
    code: "TOKEN_EXPIRED";
    message: string;                            // e.g., "Project 'xxx' has expired"
    details?: {
      expiredAt: string;                        // ISO 8601 timestamp
      helpUrl: string;                          // Configurator URL
    };
    recovery: string;                           // Guidance to create new project
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `429 Too Many Requests` (Rate Limited)
```typescript
{
  success: false;
  error: {
    code: "RATE_LIMITED";
    message: "Too many requests. Please try again later.";
    details?: { resetAt: number };
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `500 Internal Server Error` (Database Error)
```typescript
{
  success: false;
  error: {
    code: "DATABASE_ERROR" | "INTERNAL_ERROR";
    message: string;
    details?: any;                              // Only in development mode
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

---

### `GET /api/projects/[token]/download`

Downloads project configuration manifest for CLI consumption. Returns a JSON manifest containing project metadata, file lists, and CLI instructions.

#### Request

**Parameters:**
- `token` (path): Human-readable project token (format: "adjective-noun-####")

#### Response (Success)

**Status:** `200 OK`

**Headers:**
```http
Content-Type: application/json
Content-Disposition: attachment; filename="[project-name]-config.json"
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Body:**
```typescript
{
  version: string;                              // Manifest version (e.g., "1.0.0")
  token: string;                                // Project token
  template: string;                             // Template name
  project_name: string;
  output_dir: string;
  created_at: string;                           // ISO 8601 timestamp
  expires_at: string;                           // ISO 8601 timestamp

  config: {
    integrations: Record<string, string>;       // Selected integrations
    env_keys?: Record<string, string> | null;   // Environment variables
    vision?: string | null;
    mission?: string | null;
    success_criteria?: string | null;
    inspirations?: Array<{
      type: string;
      value: string;
      preview?: string;
    }> | null;
    description?: string | null;
  };

  files: {
    base: string[];                             // Base template files
    integrations: string[];                     // Integration-specific files
    total: number;                              // Total file count
  };

  cli: {
    pullCommand: string;                        // Ready-to-use: "npx @jrdaws/framework pull {token}"
    templatePath: string;                       // Template location: "templates/{template}"
  };
}
```

**Example Response:**
```json
{
  "version": "1.0.0",
  "token": "fast-lion-1234",
  "template": "saas",
  "project_name": "My SaaS App",
  "output_dir": "./my-saas-app",
  "created_at": "2025-12-22T10:00:00Z",
  "expires_at": "2026-01-21T10:00:00Z",
  "config": {
    "integrations": {
      "auth": "supabase",
      "payments": "stripe"
    },
    "env_keys": {},
    "vision": "Build the best SaaS product",
    "mission": null,
    "success_criteria": null,
    "inspirations": [],
    "description": "A modern SaaS application"
  },
  "files": {
    "base": [
      "app/layout.tsx",
      "app/page.tsx",
      "package.json",
      "template.json"
    ],
    "integrations": [
      "integrations/auth/supabase/lib/supabase.ts",
      "integrations/payments/stripe/lib/stripe.ts"
    ],
    "total": 6
  },
  "cli": {
    "pullCommand": "npx @jrdaws/framework pull fast-lion-1234",
    "templatePath": "templates/saas"
  }
}
```

#### Response (Error)

**Status:** `400 Bad Request` (Missing Token)
```typescript
{
  success: false;
  error: {
    code: "MISSING_FIELD";
    message: "Token is required";
    details?: { field: "token" };
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `404 Not Found` (Token Not Found)
```typescript
{
  success: false;
  error: {
    code: "TOKEN_NOT_FOUND";
    message: string;
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `410 Gone` (Token Expired)
```typescript
{
  success: false;
  error: {
    code: "TOKEN_EXPIRED";
    message: string;
    details?: {
      expiredAt: string;
      helpUrl: string;
    };
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `429 Too Many Requests` (Rate Limited)
```typescript
{
  success: false;
  error: {
    code: "RATE_LIMITED";
    message: "Too many requests. Please try again later.";
    details?: { resetAt: number };
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

**Status:** `500 Internal Server Error` (Database Error)
```typescript
{
  success: false;
  error: {
    code: "DATABASE_ERROR" | "INTERNAL_ERROR";
    message: string;
    details?: any;                              // Only in development mode
    recovery: string;
  };
  meta: {
    timestamp: string;
  };
}
```

#### Notes

**File Manifests:**
- Base template files are currently hardcoded in the route handler
- Integration files are mapped based on selected integrations
- **Future Enhancement**: Load file lists dynamically from `templates/*/template.json`

**Rate Limiting:**
- Downloads are rate-limited per IP address
- Limit: 10 downloads per 15 minutes
- Rate limit key format: `download:{clientIp}`

**CORS:**
- All endpoints include CORS headers for CLI access
- Origin: `*` (public API)
- Methods: `GET, OPTIONS`

---

## Error Handling

### Standard Error Response Format

All API errors follow this standardized structure implemented via `website/lib/api-errors.ts`:

```typescript
{
  success: false;
  error: {
    code: string;               // Machine-readable error code from ErrorCodes enum
    message: string;            // Human-readable error message
    details?: any;              // Optional: Additional error context
    recovery: string;           // Required: Actionable recovery guidance
  };
  meta: {
    timestamp: string;          // ISO 8601 timestamp
  };
}
```

### Error Codes

| Code | Status | Description | Recovery Guidance |
|------|--------|-------------|-------------------|
| `BAD_REQUEST` | 400 | Invalid request parameters | Check your request format and try again |
| `MISSING_FIELD` | 400 | Required field missing | Provide all required fields in the request |
| `INVALID_INPUT` | 400 | Input validation failed | Check the format of your input and try again |
| `UNAUTHORIZED` | 401 | Authentication failed | Provide valid authentication credentials |
| `FORBIDDEN` | 403 | Insufficient permissions | You do not have permission to access this resource |
| `NOT_FOUND` | 404 | Resource not found | Verify the resource exists and try again |
| `TOKEN_NOT_FOUND` | 404 | Project token not found | Verify the token is correct or create a new project |
| `TOKEN_EXPIRED` | 410 | Project token expired (30 days) | Create a new project configuration |
| `RATE_LIMITED` | 429 | Rate limit exceeded | Wait a few minutes before trying again |
| `DATABASE_ERROR` | 500 | Database operation failed | Try again in a few moments or contact support |
| `INTERNAL_ERROR` | 500 | Internal server error | Try again in a few moments or contact support |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable | Try again in a few minutes |

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

| Metric | Target | Sonnet 4 (4096) | Haiku (4096) | Haiku (2000) | Status |
|--------|--------|-----------------|--------------|--------------|--------|
| Uncached generation | < 5s | ~41s | ~20-29s | ~13s | ⚠️ Closer but still over target |
| Cached response | < 1s | ~0.9s | ~0.9s | ~0.9s | ✅ Passing |
| Token limit | N/A | 4096 | 4096 | 2000 | ✅ Optimized |
| Cache hit rate | > 30% | TBD | TBD | TBD | ⚠️ Needs monitoring |

**Current Configuration:**
- Model: `claude-3-haiku-20240307`
- Tokens: 2000 (optimized 2025-12-22)

**Test Results (2025-12-22):**

*Phase 1: Model Switch*
- Blog template: 19.8s (Haiku, 4096 tokens)
- Dashboard with auth: 28.9s (Haiku, 4096 tokens)
- Original Sonnet 4: 41s (4096 tokens)

*Phase 2: Token Optimization*
- SaaS with integrations: 13.5s (Haiku, 2000 tokens) ✅
- Cached responses: < 1s ✅

**Analysis:**
- Haiku + 2000 tokens = **67% faster** than Sonnet 4 + 4096 tokens (41s → 13.5s)
- Still 2.7x over 5s target, but acceptable for real-world use
- Quality remains high: Nav, multi-page layout, terminal aesthetic, auth integration
- Preview focused on essential components (Hero, Features, Pricing, Nav, Auth)
- Further improvement would require streaming or pre-generated templates

### Recommendations for Performance Improvement

1. ✅ **Use Claude Haiku** - IMPLEMENTED (2025-12-22)
   - Switched to `claude-3-haiku-20240307`
   - ~2x speed improvement vs Sonnet 4 (41s → 20-29s)
   - Acceptable quality for preview purposes
   - 10x cost reduction

2. ✅ **Reduce token count** - IMPLEMENTED (2025-12-22)
   - Reduced `MAX_TOKENS` from 4096 to 2000
   - Generates essential components: Hero, Nav, Features, Pricing, Auth
   - Additional 32% improvement (20-29s → 13.5s)
   - **Combined: 67% total improvement** (41s → 13.5s)
   - Quality remains high for preview purposes

3. **Further optimization options** (if < 5s is critical):

   a. **Reduce to 1500 tokens**
      - Would bring generation to ~10-11s
      - Single-page preview with key sections only
      - Trade-off: Less comprehensive preview

   b. **Implement streaming** (UX improvement, not speed)
      - Stream HTML as it's generated
      - Show progressive preview to user
      - Better perceived performance
      - Estimated effort: 2-3 hours

   c. **Pre-generated templates** (cache warming)
      - Pre-generate common configurations
      - Serve instantly from cache
      - Works well for standard templates without customization
      - Estimated effort: 4-6 hours

   d. **Two-tier system** (quality vs speed)
      - "Quick Preview" (1500 tokens): ~10s
      - "Detailed Preview" (2000 tokens): ~13.5s
      - User selects preference
      - Estimated effort: 1-2 hours

4. **Add CDN caching** (future enhancement)
   - Cache common template previews at CDN edge
   - Serve static previews for unauthenticated users
   - Would reduce load on AI generation
   - Best combined with pre-generation

**Recommendation:** Current performance (13.5s) is acceptable for production. If < 10s is required, implement option 3a (1500 tokens) or 3d (two-tier system).

---

## Changelog

### Version 1.2 (2025-12-22)
- **Performance Optimization - Preview Generation** (Platform Agent)
  - Switched model from Sonnet 4 to Haiku (2x faster)
  - Reduced MAX_TOKENS from 4096 to 2000 (additional 32% improvement)
  - **Overall: 67% faster generation** (41s → 13.5s)
  - Updated performance benchmarks table with test results
  - Documented token optimization trade-offs
  - Added recommendations for further optimization
  - Quality verification: Preview maintains Nav, multi-page layout, terminal aesthetic
  - Cost reduction: ~10x cheaper with Haiku

### Version 1.1 (2025-12-22)
- **Projects API Documentation Fixed** (Platform Agent)
  - Corrected endpoint path: `POST /api/projects` → `POST /api/projects/save`
  - Fixed download endpoint response: Returns JSON manifest, not ZIP file
  - Added complete request/response schemas with all fields
  - Added missing error codes: `MISSING_FIELD`, `TOKEN_NOT_FOUND`, `TOKEN_EXPIRED`, `DATABASE_ERROR`
  - Documented token format: "adjective-noun-####" (human-readable)
  - Added project expiration details (30 days)
  - Documented rate limiting per endpoint
  - Added CORS header documentation
  - Included complete JSON example for download endpoint
  - Updated error response format to match actual implementation
  - Added recovery guidance for all error codes

### Version 1.0 (2025-12-22)
- Initial API contract documentation
- Preview Generation API fully documented
- Projects API documented (contained inaccuracies, fixed in v1.1)
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
