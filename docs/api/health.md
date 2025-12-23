# Health Check API

> **Endpoint**: `GET /api/health`
>
> Check the health status of all platform services.

---

## Overview

This endpoint provides real-time health status for monitoring and alerting. It checks:
- API availability
- Database connectivity (Supabase)
- Cache availability (Redis)
- AI service availability (Anthropic)
- Cost tracking status

---

## Request

### Endpoint

```
GET https://dawson.dev/api/health
```

### Headers

No special headers required.

---

## Response

### Healthy Response (200)

```json
{
  "status": "healthy",
  "services": {
    "api": { "status": "up" },
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "anthropic": { "status": "up" },
    "costTracking": { "status": "up" }
  },
  "timestamp": "2025-12-23T10:00:00Z",
  "version": "0.3.1",
  "responseTimeMs": 45
}
```

### Degraded Response (200)

```json
{
  "status": "degraded",
  "services": {
    "api": { "status": "up" },
    "database": { "status": "up" },
    "redis": { 
      "status": "degraded", 
      "message": "Redis not available, using in-memory rate limiting" 
    },
    "anthropic": { "status": "up" },
    "costTracking": { 
      "status": "degraded", 
      "message": "Running in memory-only mode (Redis not configured)" 
    }
  },
  "timestamp": "2025-12-23T10:00:00Z",
  "version": "0.3.1",
  "responseTimeMs": 52
}
```

### Unhealthy Response (503)

```json
{
  "status": "unhealthy",
  "services": {
    "api": { "status": "up" },
    "database": { 
      "status": "down", 
      "message": "Connection timeout" 
    },
    "redis": { "status": "degraded" },
    "anthropic": { "status": "up" },
    "costTracking": { "status": "degraded" }
  },
  "timestamp": "2025-12-23T10:00:00Z",
  "version": "0.3.1",
  "responseTimeMs": 5032
}
```

---

## Response Fields

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall status: `healthy`, `degraded`, `unhealthy` |
| `services` | object | Status of individual services |
| `timestamp` | string | ISO 8601 timestamp |
| `version` | string | Platform version |
| `responseTimeMs` | number | Health check response time in milliseconds |

### Service Status Object

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Service status: `up`, `down`, `degraded` |
| `message` | string | Optional message explaining status |

---

## Status Definitions

### Overall Status

| Status | Meaning | HTTP Code |
|--------|---------|-----------|
| `healthy` | All critical services operational | 200 |
| `degraded` | Non-critical services have issues | 200 |
| `unhealthy` | Critical services are down | 503 |

### Service Status

| Status | Meaning |
|--------|---------|
| `up` | Service is fully operational |
| `degraded` | Service has issues but is functional |
| `down` | Service is not available |

---

## Services Monitored

### API (`api`)

The API service itself. Always `up` if you receive a response.

### Database (`database`)

Supabase PostgreSQL database connectivity.

**Checks:**
- Supabase URL and key configuration
- Database query execution

**Failure causes:**
- Missing `NEXT_PUBLIC_SUPABASE_URL`
- Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database connection timeout
- Query errors

### Redis (`redis`)

Redis cache for rate limiting and session storage.

**Checks:**
- Redis connection availability
- Rate limiter functionality

**Degraded when:**
- Redis not configured (falls back to in-memory)
- Connection intermittent

### Anthropic (`anthropic`)

Anthropic Claude API availability.

**Checks:**
- API key presence
- API key format validation

**Notes:**
- Does not make actual API calls (to avoid costs)
- Only validates key format (`sk-ant-*`)

### Cost Tracking (`costTracking`)

Usage monitoring and cost control system.

**Checks:**
- Tracking system availability
- Current usage levels

**Degraded when:**
- Running in memory-only mode
- Approaching usage limits (>95%)

---

## Examples

### Basic Health Check

```bash
curl https://dawson.dev/api/health
```

### JavaScript Example

```typescript
const checkHealth = async () => {
  const response = await fetch('/api/health');
  const health = await response.json();
  
  if (health.status === 'unhealthy') {
    console.error('Platform is unhealthy!', health.services);
    // Send alert
  } else if (health.status === 'degraded') {
    console.warn('Platform is degraded:', health.services);
  } else {
    console.log('Platform is healthy');
  }
  
  return health;
};
```

### Python Monitoring Example

```python
import requests
import time

def monitor_health(interval_seconds=60):
    while True:
        try:
            response = requests.get('https://dawson.dev/api/health', timeout=10)
            health = response.json()
            
            if health['status'] == 'unhealthy':
                print(f"ALERT: Platform unhealthy at {health['timestamp']}")
                # Send notification
            elif health['status'] == 'degraded':
                print(f"WARNING: Platform degraded at {health['timestamp']}")
                for service, status in health['services'].items():
                    if status['status'] != 'up':
                        print(f"  - {service}: {status['status']} - {status.get('message', '')}")
            else:
                print(f"OK: Platform healthy (response: {health['responseTimeMs']}ms)")
                
        except Exception as e:
            print(f"ERROR: Health check failed - {e}")
            
        time.sleep(interval_seconds)

monitor_health(60)
```

### Uptime Monitoring Integration

```bash
# For use with uptime monitoring services (UptimeRobot, Pingdom, etc.)
# Configure your monitoring service to:
# 1. Check: GET https://dawson.dev/api/health
# 2. Expect: HTTP 200
# 3. Expect body contains: "status":"healthy"
```

---

## Use Cases

### CI/CD Pipeline

```yaml
# GitHub Actions example
jobs:
  deploy:
    steps:
      - name: Wait for healthy
        run: |
          for i in {1..30}; do
            status=$(curl -s https://dawson.dev/api/health | jq -r '.status')
            if [ "$status" = "healthy" ]; then
              echo "Platform is healthy"
              exit 0
            fi
            echo "Waiting for healthy status... ($i/30)"
            sleep 10
          done
          echo "Health check timeout"
          exit 1
```

### Load Balancer Health Check

Configure your load balancer to:
- Path: `/api/health`
- Expected status: `200`
- Interval: `30s`
- Timeout: `10s`
- Healthy threshold: `2`
- Unhealthy threshold: `3`

---

## Related

- [API Overview](./README.md) - General API documentation
- [Error Reference](./errors.md) - All error codes

