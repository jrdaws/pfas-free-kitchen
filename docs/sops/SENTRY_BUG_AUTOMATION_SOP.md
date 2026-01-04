# Sentry → Bug Report Automation SOP

> **Version**: 1.0 | **Created**: 2025-12-25
> **Purpose**: Automatically create bug reports from Sentry errors
> **Related**: [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md), [Sentry Setup](../integrations/monitoring/sentry.md)

---

## Overview

This system automatically creates bug reports when Sentry captures errors, ensuring no production issues are missed.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Error   │───▶│  Sentry  │───▶│ Webhook  │───▶│   Bug    │
│ Occurs   │    │ Captures │    │  Fires   │    │  Report  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
                              output/shared/bugs/
                              active/P[0-3]/
```

---

## 1. Severity Mapping

| Sentry Level | Bug Priority | Criteria |
|--------------|--------------|----------|
| `fatal` | **P0** | Application crash, unrecoverable |
| `error` (high frequency) | **P1** | >10 occurrences in 1 hour |
| `error` (low frequency) | **P2** | <10 occurrences |
| `warning` | **P3** | Non-blocking issues |
| `info` | Skip | Not a bug |

### Auto-Escalation Rules

```
IF error.level = 'fatal' → P0
ELSE IF error.users_affected > 100 → P0
ELSE IF error.occurrences > 10 AND time < 1 hour → P1
ELSE IF error.level = 'error' → P2
ELSE IF error.level = 'warning' → P3
ELSE → Skip (info/debug)
```

---

## 2. Webhook Configuration

### Sentry Dashboard Setup

1. Go to **Settings** → **Integrations** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/sentry`
3. Select events:
   - ✅ `issue.created` - New error first seen
   - ✅ `issue.resolved` - Error marked resolved
   - ✅ `issue.ignored` - Error ignored
   - ✅ `event.alert` - Alert threshold triggered

### Environment Variables

```bash
# .env.local
SENTRY_WEBHOOK_SECRET=your-webhook-secret
SENTRY_PROJECT_SLUG=your-project
SENTRY_ORG_SLUG=your-org
```

---

## 3. Webhook Handler

### API Route Implementation

```typescript
// app/api/webhooks/sentry/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface SentryWebhook {
  action: 'created' | 'resolved' | 'ignored';
  data: {
    issue: {
      id: string;
      title: string;
      culprit: string;
      shortId: string;
      level: 'fatal' | 'error' | 'warning' | 'info';
      status: string;
      count: number;
      userCount: number;
      firstSeen: string;
      lastSeen: string;
      permalink: string;
      metadata: {
        type: string;
        value: string;
        filename?: string;
        function?: string;
      };
    };
    event?: {
      eventID: string;
      tags: Array<{ key: string; value: string }>;
      contexts: Record<string, unknown>;
    };
  };
  installation?: {
    uuid: string;
  };
}

// Map Sentry level to bug priority
function mapSeverity(level: string, count: number, userCount: number): string {
  if (level === 'fatal') return 'P0';
  if (userCount > 100) return 'P0';
  if (level === 'error' && count > 10) return 'P1';
  if (level === 'error') return 'P2';
  if (level === 'warning') return 'P3';
  return 'SKIP';
}

// Generate bug report from Sentry data
function generateBugReport(data: SentryWebhook['data']): string {
  const { issue } = data;
  const priority = mapSeverity(issue.level, issue.count, issue.userCount);
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].substring(0, 5);
  
  return `# Bug Report: ${issue.title}

**ID**: BUG-${date.replace(/-/g, '')}-sentry-${issue.shortId.toLowerCase()}
**Severity**: ${priority}
**Status**: Reported
**Reported By**: Sentry Automation
**Date Reported**: ${date} ${time}
**Assigned To**: [To be triaged]

---

## Description

${issue.title}

**Error Type**: ${issue.metadata.type || 'Unknown'}
**Error Message**: ${issue.metadata.value || issue.title}
${issue.metadata.filename ? `**File**: ${issue.metadata.filename}` : ''}
${issue.metadata.function ? `**Function**: ${issue.metadata.function}` : ''}

## Sentry Details

- **Issue ID**: ${issue.shortId}
- **Sentry Link**: ${issue.permalink}
- **First Seen**: ${issue.firstSeen}
- **Last Seen**: ${issue.lastSeen}
- **Occurrences**: ${issue.count}
- **Users Affected**: ${issue.userCount}
- **Culprit**: ${issue.culprit}

## Steps to Reproduce

1. Check Sentry for full stack trace
2. Review user context and breadcrumbs
3. [To be filled by investigating agent]

## Expected Behavior

Application should not throw this error.

## Actual Behavior

${issue.metadata.value || issue.title}

## Environment

- **Level**: ${issue.level}
- **Status**: ${issue.status}
- See Sentry for full context

## Impact Assessment

- **Users Affected**: ${issue.userCount}
- **Workaround Available**: Unknown
- **Revenue Impact**: [To be assessed]

## Fix Notes

[To be filled by fixing agent]

- **Root Cause**: 
- **Fix Applied**: 
- **Files Changed**: 
- **Test Added**: [Yes/No - test name]

## Verification

- **Verified By**: 
- **Verification Date**: 
- **Verification Notes**: 
`;
}

export async function POST(request: Request) {
  try {
    // 1. Verify webhook signature
    const signature = request.headers.get('sentry-hook-signature');
    const body = await request.text();
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.SENTRY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid Sentry webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse payload
    const payload: SentryWebhook = JSON.parse(body);
    
    // 3. Only handle issue.created events
    if (payload.action !== 'created') {
      return NextResponse.json({ message: 'Ignored non-create event' });
    }

    // 4. Determine severity
    const { issue } = payload.data;
    const priority = mapSeverity(issue.level, issue.count, issue.userCount);
    
    if (priority === 'SKIP') {
      return NextResponse.json({ message: 'Skipped info/debug level' });
    }

    // 5. Generate bug report
    const report = generateBugReport(payload.data);
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `BUG-${date}-sentry-${issue.shortId.toLowerCase()}.md`;
    
    // 6. Write bug report file
    const bugPath = path.join(
      process.cwd(),
      'output/shared/bugs/active',
      priority,
      filename
    );
    
    await fs.mkdir(path.dirname(bugPath), { recursive: true });
    await fs.writeFile(bugPath, report, 'utf-8');

    console.log(`Created bug report: ${bugPath}`);

    // 7. For P0, create alert file
    if (priority === 'P0') {
      const alertPath = path.join(
        process.cwd(),
        'output/shared/bugs/active/P0',
        `ALERT-${date}-${issue.shortId}.txt`
      );
      await fs.writeFile(
        alertPath,
        `P0 ALERT: ${issue.title}\nSentry: ${issue.permalink}\nCreated: ${new Date().toISOString()}`,
        'utf-8'
      );
    }

    return NextResponse.json({
      success: true,
      bugId: filename,
      priority,
    });

  } catch (error) {
    console.error('Sentry webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4. Auto-Generated Report Template

Reports follow this structure:

```markdown
# Bug Report: [Sentry Issue Title]

**ID**: BUG-YYYYMMDD-sentry-{sentry-short-id}
**Severity**: P[0-3]
**Status**: Reported
**Reported By**: Sentry Automation
**Date Reported**: YYYY-MM-DD HH:MM
**Assigned To**: [To be triaged]

---

## Description
[Error message and type from Sentry]

## Sentry Details
- Issue ID, link, first/last seen, occurrences, users affected

## Steps to Reproduce
[Placeholder - to be filled]

## Expected vs Actual Behavior
[From error message]

## Environment
[From Sentry context]

## Fix Notes
[To be filled by agent]
```

---

## 5. Workflow Integration

### On New Sentry Error

```
1. Sentry captures error
2. Webhook fires to /api/webhooks/sentry
3. Handler determines priority
4. Bug report created in output/shared/bugs/active/P[X]/
5. P0 errors create ALERT file
6. Auditor/Strategist triages during next session
```

### Agent Response to Auto-Reports

1. **Check for new Sentry bugs**:
   ```bash
   ls output/shared/bugs/active/*/BUG-*-sentry-*.md
   ```

2. **Prioritize by severity folder**:
   - P0: Immediate attention
   - P1: High priority queue
   - P2-P3: Regular triage

3. **Investigate via Sentry link in report**

4. **Update report with findings**

---

## 6. Testing the Webhook

### Local Testing

```bash
# Simulate Sentry webhook
curl -X POST http://localhost:3000/api/webhooks/sentry \
  -H "Content-Type: application/json" \
  -H "sentry-hook-signature: test-sig" \
  -d '{
    "action": "created",
    "data": {
      "issue": {
        "id": "123",
        "title": "TypeError: Cannot read property x of undefined",
        "shortId": "TEST-1",
        "level": "error",
        "count": 5,
        "userCount": 3,
        "firstSeen": "2025-12-25T10:00:00Z",
        "lastSeen": "2025-12-25T10:30:00Z",
        "permalink": "https://sentry.io/issue/123",
        "culprit": "src/components/Button.tsx",
        "metadata": {
          "type": "TypeError",
          "value": "Cannot read property x of undefined"
        }
      }
    }
  }'
```

### Verify Report Created

```bash
ls -la output/shared/bugs/active/P2/BUG-*-sentry-test-1.md
```

---

## 7. Monitoring

### Daily Check

```bash
# Count auto-generated bugs by priority
for p in P0 P1 P2 P3; do
  count=$(find output/shared/bugs/active/$p -name "*sentry*" 2>/dev/null | wc -l | tr -d ' ')
  echo "$p: $count Sentry bugs"
done
```

### Webhook Health

- Monitor Sentry dashboard for webhook delivery status
- Check application logs for webhook errors
- Set up alert if webhook fails repeatedly

---

## Related Documents

- [BUG_TRIAGE_SOP.md](./BUG_TRIAGE_SOP.md) - Full bug lifecycle
- [Sentry Setup](../integrations/monitoring/sentry.md) - Sentry integration
- [CODE_QUALITY_SOP.md](./CODE_QUALITY_SOP.md) - Prevent bugs

---

*Sentry Bug Automation SOP v1.0 | Bug Prevention System | 2025-12-25*

