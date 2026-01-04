/**
 * Sentry → Bug Report Generator
 * 
 * Standalone script version of the webhook handler.
 * Can be used for manual bug report generation or testing.
 * 
 * Usage:
 *   npx ts-node scripts/automation/sentry-bug-report.ts --issue-url <sentry-url>
 */

import fs from 'fs/promises';
import path from 'path';

interface SentryIssue {
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
}

/**
 * Map Sentry level to bug priority
 */
function mapSeverity(level: string, count: number, userCount: number): string {
  if (level === 'fatal') return 'P0';
  if (userCount > 100) return 'P0';
  if (level === 'error' && count > 10) return 'P1';
  if (level === 'error') return 'P2';
  if (level === 'warning') return 'P3';
  return 'SKIP';
}

/**
 * Generate bug report markdown from Sentry issue data
 */
function generateBugReport(issue: SentryIssue): string {
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

/**
 * Create bug report file from Sentry issue
 */
async function createBugReport(issue: SentryIssue): Promise<string> {
  const priority = mapSeverity(issue.level, issue.count, issue.userCount);
  
  if (priority === 'SKIP') {
    console.log('Skipping info/debug level issue');
    return '';
  }

  const report = generateBugReport(issue);
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `BUG-${date}-sentry-${issue.shortId.toLowerCase()}.md`;
  
  const bugDir = path.join(
    process.cwd(),
    'output/shared/bugs/active',
    priority
  );
  
  await fs.mkdir(bugDir, { recursive: true });
  
  const bugPath = path.join(bugDir, filename);
  await fs.writeFile(bugPath, report, 'utf-8');
  
  console.log(`✅ Created bug report: ${bugPath}`);
  console.log(`   Priority: ${priority}`);
  console.log(`   Issue: ${issue.title}`);
  
  return bugPath;
}

/**
 * Example usage for testing
 */
async function main() {
  // Example Sentry issue data
  const exampleIssue: SentryIssue = {
    id: '12345',
    title: 'TypeError: Cannot read property "id" of undefined',
    culprit: 'src/components/UserCard.tsx in renderUser',
    shortId: 'EXAMPLE-1',
    level: 'error',
    status: 'unresolved',
    count: 5,
    userCount: 3,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    permalink: 'https://sentry.io/issues/12345/',
    metadata: {
      type: 'TypeError',
      value: 'Cannot read property "id" of undefined',
      filename: 'src/components/UserCard.tsx',
      function: 'renderUser',
    },
  };

  console.log('🔧 Sentry Bug Report Generator');
  console.log('================================');
  console.log('');
  console.log('Creating example bug report...');
  
  await createBugReport(exampleIssue);
}

// Export for use as module
export { createBugReport, generateBugReport, mapSeverity, SentryIssue };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

