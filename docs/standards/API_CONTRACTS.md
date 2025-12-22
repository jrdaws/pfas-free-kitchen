# API Contracts

> **Standard API response formats, error codes, and recovery guidance for dawson-does-framework**
> **Version**: 1.0.0
> **Last Updated**: 2025-12-22

---

## Overview

All API endpoints in the dawson-does-framework follow a consistent response format to ensure predictable behavior for CLI and web clients. This document defines:

1. Standard response structures
2. Error codes and meanings
3. HTTP status code usage
4. Recovery guidance patterns
5. CORS requirements

---

## Response Format

### Success Response

All successful API responses follow this structure:

```typescript
{
  success: true,
  data: {
    // Endpoint-specific data
  },
  meta: {
    timestamp: string; // ISO 8601 format
  }
}
```

**Example:**

```json
{
  "success": true,
  "data": {
    "token": "fast-lion-1234",
    "expiresAt": "2025-01-21T00:00:00Z"
  },
  "meta": {
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

---

### Error Response

All error responses follow this structure:

```typescript
{
  success: false,
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
    details?: any;       // Optional additional context
    recovery: string;    // Actionable recovery guidance
  },
  meta: {
    timestamp: string;   // ISO 8601 format
  }
}
```

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_NOT_FOUND",
    "message": "Project with token \"invalid-123\" not found",
    "recovery": "Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure"
  },
  "meta": {
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

---

## Error Codes

### Client Errors (400-499)

#### `MISSING_FIELD`
- **Status**: 400 Bad Request
- **Meaning**: Required field missing from request
- **Details**: `{ field: string }` - which field is missing
- **Recovery**: "Provide {field} in the request body" or "Provide {field} in the URL path"
- **Example**:
  ```json
  {
    "success": false,
    "error": {
      "code": "MISSING_FIELD",
      "message": "Token is required",
      "details": { "field": "token" },
      "recovery": "Provide a valid project token in the URL path"
    },
    "meta": { "timestamp": "2025-12-22T10:30:00Z" }
  }
  ```

#### `INVALID_INPUT`
- **Status**: 400 Bad Request
- **Meaning**: Field value is invalid or malformed
- **Details**: `{ field: string, reason: string }`
- **Recovery**: "Check {field} format. {reason}"
- **Example**: Invalid template name, malformed JSON

#### `TOKEN_NOT_FOUND`
- **Status**: 404 Not Found
- **Meaning**: Project token doesn't exist in database
- **Recovery**: "Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure"

#### `TOKEN_EXPIRED`
- **Status**: 410 Gone
- **Meaning**: Project token has passed its 30-day expiration
- **Details**: `{ expiredAt: string, helpUrl: string }`
- **Recovery**: "Create a new project configuration at https://dawson.dev/configure"

#### `RATE_LIMITED`
- **Status**: 429 Too Many Requests
- **Meaning**: Client exceeded rate limit
- **Details**: `{ resetAt: string }` - when limit resets
- **Recovery**: "Wait a few minutes before trying again. Rate limits reset every 15 minutes."

---

### Server Errors (500-599)

#### `DATABASE_ERROR`
- **Status**: 500 Internal Server Error
- **Meaning**: Database query failed
- **Details**: `{ details: string }` - error message (dev only)
- **Recovery**: "Try again in a few moments. If the issue persists, contact support."

#### `INTERNAL_ERROR`
- **Status**: 500 Internal Server Error
- **Meaning**: Unexpected server error
- **Details**: `{ details: string }` - error message (dev only)
- **Recovery**: "Try again in a few moments. If the issue persists, contact support."

#### `SERVICE_UNAVAILABLE`
- **Status**: 503 Service Unavailable
- **Meaning**: Service temporarily unavailable (maintenance, overload)
- **Recovery**: "The service is temporarily unavailable. Please try again in a few minutes."

---

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST that creates a resource |
| 204  | No Content | Successful DELETE, OPTIONS (CORS preflight) |
| 400  | Bad Request | Invalid input, missing required fields |
| 401  | Unauthorized | Missing or invalid authentication |
| 403  | Forbidden | Valid auth but insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 410  | Gone | Resource existed but is now deleted/expired |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Unexpected server error |
| 503  | Service Unavailable | Temporary service disruption |

---

## Recovery Guidance

Recovery messages must be **actionable** and **specific**. Follow these patterns:

### ✅ Good Recovery Messages

```
"Provide a valid project token in the URL path"
"Create a new project configuration at https://dawson.dev/configure"
"Wait a few minutes before trying again. Rate limits reset every 15 minutes."
"Verify the token is correct. If the project expired, create a new one at https://dawson.dev/configure"
```

### ❌ Bad Recovery Messages

```
"Invalid request" (not actionable)
"Error occurred" (not specific)
"Try again" (no context on when or how)
"Check your input" (not specific enough)
```

### Recovery Message Templates

| Error Type | Template |
|------------|----------|
| Missing field | "Provide {field} in the {location}" |
| Invalid format | "Check {field} format. {expected format}" |
| Not found | "Verify {resource} is correct. {alternative action}" |
| Expired | "Create a new {resource} at {url}" |
| Rate limited | "Wait {duration} before trying again. Rate limits reset every {interval}." |
| Server error | "Try again in a few moments. If the issue persists, contact support." |

---

## CORS Configuration

All API endpoints must include CORS headers for CLI access:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

**Requirements:**
1. Include CORS headers on **both success and error** responses
2. Implement OPTIONS handler for preflight requests (return 204)
3. Allow `*` origin for public APIs used by CLI

---

## Endpoint-Specific Contracts

### POST /api/projects/save

**Request:**
```typescript
{
  template: string;                    // required
  project_name: string;                // required
  output_dir?: string;                 // optional, default: "./my-app"
  integrations?: Record<string, string>; // optional
  env_keys?: Record<string, string>;   // optional
  vision?: string;
  mission?: string;
  success_criteria?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  description?: string;
}
```

**Success Response (201):**
```typescript
{
  success: true,
  data: {
    token: string;
    expiresAt: string;  // ISO 8601
    pullCommand: string; // "npx @jrdaws/framework pull {token}"
    url: string;         // Web configurator URL with token
  },
  meta: {
    timestamp: string;
  }
}
```

**Errors:**
- `MISSING_FIELD` (400) - template or project_name missing
- `INVALID_INPUT` (400) - invalid template name
- `RATE_LIMITED` (429) - too many saves from same IP
- `DATABASE_ERROR` (500) - failed to save to Supabase
- `INTERNAL_ERROR` (500) - unexpected error

---

### GET /api/projects/[token]

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    token: string;
    template: string;
    project_name: string;
    output_dir: string;
    integrations: Record<string, string>;
    env_keys: Record<string, string>;
    vision?: string;
    mission?: string;
    success_criteria?: string;
    inspirations?: Array<{ type: string; value: string; preview?: string }>;
    description?: string;
    created_at: string;
    expires_at: string;
    last_accessed_at: string;
  },
  meta: {
    timestamp: string;
  }
}
```

**Errors:**
- `MISSING_FIELD` (400) - token parameter missing
- `TOKEN_NOT_FOUND` (404) - token doesn't exist
- `TOKEN_EXPIRED` (410) - project expired (>30 days old)
- `RATE_LIMITED` (429) - too many fetches from same IP
- `DATABASE_ERROR` (500) - failed to fetch from Supabase
- `INTERNAL_ERROR` (500) - unexpected error

---

### GET /api/projects/[token]/download

**Success Response (200):**

Returns a downloadable JSON manifest file:

```typescript
{
  version: string;     // Manifest version (semver)
  token: string;
  template: string;
  project_name: string;
  output_dir: string;
  created_at: string;
  expires_at: string;
  config: {
    integrations: Record<string, string>;
    env_keys: Record<string, string>;
    vision?: string;
    mission?: string;
    success_criteria?: string;
    inspirations?: Array<any>;
    description?: string;
  };
  files: {
    base: string[];         // Base template files
    integrations: string[]; // Integration files
    total: number;          // Total file count
  };
  cli: {
    pullCommand: string;
    templatePath: string;
  };
}
```

**Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="{project_name}-config.json"
Access-Control-Allow-Origin: *
```

**Errors:**
- Same as GET /api/projects/[token]
- All errors follow the standard error response format

---

### DELETE /api/projects/[token] (Optional)

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    deleted: true,
    token: string;
  },
  meta: {
    timestamp: string;
  }
}
```

**Errors:**
- `MISSING_FIELD` (400) - token parameter missing
- `TOKEN_NOT_FOUND` (404) - token doesn't exist
- `RATE_LIMITED` (429) - too many deletes from same IP
- `DATABASE_ERROR` (500) - failed to delete from Supabase
- `INTERNAL_ERROR` (500) - unexpected error

---

## Implementation Guidelines

### 1. Use the apiError Helper

```typescript
import { apiError, ErrorCodes } from "@/lib/api-errors";

// Example usage
return apiError(
  ErrorCodes.TOKEN_NOT_FOUND,
  `Project with token "${token}" not found`,
  404,
  undefined,
  "Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure",
  corsHeaders
);
```

### 2. Always Include Timestamps

```typescript
const meta = {
  timestamp: new Date().toISOString()
};
```

### 3. Success Responses

```typescript
return NextResponse.json(
  {
    success: true,
    data: {
      // Your data here
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  },
  { status: 200, headers: corsHeaders }
);
```

### 4. Implement OPTIONS Handler

```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}
```

### 5. Never Expose Sensitive Details in Production

```typescript
details: process.env.NODE_ENV === "development" ? errorMessage : undefined
```

---

## Testing Checklist

When implementing an endpoint, ensure:

- [ ] Success response follows standard format
- [ ] All error responses follow standard format
- [ ] All error codes have recovery guidance
- [ ] CORS headers on all responses (success and error)
- [ ] OPTIONS handler implemented
- [ ] Rate limiting configured
- [ ] Timestamps in ISO 8601 format
- [ ] Sensitive info not exposed in production
- [ ] Tests cover success and all error cases
- [ ] Status codes match this spec

---

## Versioning

**Current Version**: 1.0.0

**Changelog:**
- **1.0.0** (2025-12-22): Initial API contracts documentation

---

**For implementation details, see:**
- `website/lib/api-errors.ts` - Error handling utilities
- `website/app/api/projects/` - Projects API endpoints
- `tests/api/` - API tests

---

*This document is the source of truth for all API responses in dawson-does-framework.*
