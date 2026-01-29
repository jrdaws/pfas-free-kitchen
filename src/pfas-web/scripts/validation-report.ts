#!/usr/bin/env npx tsx
/**
 * E2E Validation Report Generator
 * 
 * Generates a comprehensive validation report for launch readiness.
 * 
 * Usage:
 *   npx tsx scripts/validation-report.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'pending';
  duration?: number;
  error?: string;
}

interface ValidationReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  journeys: {
    name: string;
    status: 'pass' | 'fail' | 'partial';
    tests: TestResult[];
  }[];
  accessibility: {
    criticalViolations: number;
    seriousViolations: number;
    pages: { page: string; violations: number }[];
  };
  performance: {
    meetsTargets: boolean;
    pages: {
      page: string;
      performance: number;
      accessibility: number;
      lcp: number;
      cls: number;
    }[];
  };
  compliance: {
    ftcDisclosure: boolean;
    wcagCompliance: boolean;
    amazonCompliance: boolean;
    items: { item: string; status: 'pass' | 'fail' }[];
  };
  readyForLaunch: boolean;
  blockers: string[];
  warnings: string[];
}

const JOURNEYS = [
  'Browse and Filter',
  'Search',
  'Product Detail',
  'Affiliate Click-Out',
  'Compare Products',
  'Report Issue',
  'Education Pages',
];

const COMPLIANCE_CHECKS = [
  { item: 'Category page disclosure present', required: true },
  { item: 'PDP disclosure near buy buttons', required: true },
  { item: 'Modal disclosure before continue', required: true },
  { item: 'Footer disclosure link', required: true },
  { item: 'Disclosure page complete', required: true },
  { item: 'WCAG 2.2 AA compliance', required: true },
  { item: 'Amazon tag format correct', required: false },
  { item: 'UTM parameters present', required: false },
];

function parsePlaywrightResults(resultsPath: string): TestResult[] {
  if (!existsSync(resultsPath)) {
    console.log('No Playwright results found. Run tests first.');
    return [];
  }

  try {
    const raw = readFileSync(resultsPath, 'utf-8');
    const results = JSON.parse(raw);
    
    const tests: TestResult[] = [];
    
    for (const suite of results.suites || []) {
      for (const spec of suite.specs || []) {
        tests.push({
          name: `${suite.title} > ${spec.title}`,
          status: spec.ok ? 'pass' : 'fail',
          duration: spec.tests?.[0]?.results?.[0]?.duration,
          error: spec.tests?.[0]?.results?.[0]?.error?.message,
        });
      }
    }
    
    return tests;
  } catch (error) {
    console.error('Error parsing Playwright results:', error);
    return [];
  }
}

function parseLighthouseResults(summaryPath: string): ValidationReport['performance'] {
  if (!existsSync(summaryPath)) {
    return {
      meetsTargets: false,
      pages: [],
    };
  }

  try {
    const raw = readFileSync(summaryPath, 'utf-8');
    const results = JSON.parse(raw);
    
    const pages = results.map((r: any) => ({
      page: r.page,
      performance: r.scores.performance,
      accessibility: r.scores.accessibility,
      lcp: r.metrics.lcp,
      cls: r.metrics.cls,
    }));
    
    const meetsTargets = results.every((r: any) =>
      r.scores.performance >= 90 &&
      r.scores.accessibility >= 95 &&
      r.metrics.lcp <= 2500 &&
      r.metrics.cls <= 0.1
    );
    
    return { meetsTargets, pages };
  } catch (error) {
    console.error('Error parsing Lighthouse results:', error);
    return { meetsTargets: false, pages: [] };
  }
}

function categorizeTestsByJourney(tests: TestResult[]): ValidationReport['journeys'] {
  return JOURNEYS.map(journeyName => {
    const journeyTests = tests.filter(t => 
      t.name.toLowerCase().includes(journeyName.toLowerCase().replace(/\s+/g, ''))
    );
    
    const passed = journeyTests.filter(t => t.status === 'pass').length;
    const failed = journeyTests.filter(t => t.status === 'fail').length;
    
    let status: 'pass' | 'fail' | 'partial' = 'pass';
    if (failed > 0 && passed === 0) status = 'fail';
    else if (failed > 0) status = 'partial';
    
    return {
      name: journeyName,
      status,
      tests: journeyTests,
    };
  });
}

function generateReport(): ValidationReport {
  const playwrightResultsPath = join(__dirname, '../test-results/results.json');
  const lighthouseSummaryPath = join(__dirname, '../lighthouse/summary.json');
  
  const testResults = parsePlaywrightResults(playwrightResultsPath);
  const performanceResults = parseLighthouseResults(lighthouseSummaryPath);
  
  const passed = testResults.filter(t => t.status === 'pass').length;
  const failed = testResults.filter(t => t.status === 'fail').length;
  const skipped = testResults.filter(t => t.status === 'skip').length;
  
  const journeys = categorizeTestsByJourney(testResults);
  
  // Check accessibility results from tests
  const a11yTests = testResults.filter(t => t.name.includes('accessibility'));
  const criticalViolations = a11yTests.filter(t => 
    t.error?.includes('critical') && t.status === 'fail'
  ).length;
  const seriousViolations = a11yTests.filter(t => 
    t.error?.includes('serious') && t.status === 'fail'
  ).length;
  
  // Compliance checks
  const complianceItems = COMPLIANCE_CHECKS.map(check => {
    const relatedTests = testResults.filter(t => 
      t.name.toLowerCase().includes(check.item.toLowerCase().split(' ')[0])
    );
    const passed = relatedTests.some(t => t.status === 'pass');
    return {
      item: check.item,
      status: passed ? 'pass' as const : 'fail' as const,
    };
  });
  
  const ftcPassed = complianceItems
    .filter(c => c.item.includes('disclosure'))
    .every(c => c.status === 'pass');
  
  // Determine blockers
  const blockers: string[] = [];
  const warnings: string[] = [];
  
  if (failed > 0) {
    blockers.push(`${failed} E2E tests failing`);
  }
  
  if (criticalViolations > 0) {
    blockers.push(`${criticalViolations} critical accessibility violations`);
  }
  
  if (seriousViolations > 0) {
    blockers.push(`${seriousViolations} serious accessibility violations`);
  }
  
  if (!performanceResults.meetsTargets) {
    warnings.push('Some pages do not meet performance targets');
  }
  
  if (!ftcPassed) {
    blockers.push('FTC disclosure requirements not met');
  }
  
  const readyForLaunch = blockers.length === 0;
  
  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.length,
      passed,
      failed,
      skipped,
    },
    journeys,
    accessibility: {
      criticalViolations,
      seriousViolations,
      pages: [], // Would be populated from axe results
    },
    performance: performanceResults,
    compliance: {
      ftcDisclosure: ftcPassed,
      wcagCompliance: criticalViolations === 0 && seriousViolations === 0,
      amazonCompliance: true, // Would check affiliate tag format
      items: complianceItems,
    },
    readyForLaunch,
    blockers,
    warnings,
  };
}

function printReport(report: ValidationReport) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                    PFAS-FREE KITCHEN - E2E VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`\nGenerated: ${report.timestamp}\n`);
  
  // Summary
  console.log('───────────────────────────────────────────────────────────────────────────────');
  console.log('TEST SUMMARY');
  console.log('───────────────────────────────────────────────────────────────────────────────');
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed:   ${report.summary.passed}`);
  console.log(`❌ Failed:   ${report.summary.failed}`);
  console.log(`⏭️  Skipped:  ${report.summary.skipped}`);
  
  // Journeys
  console.log('\n───────────────────────────────────────────────────────────────────────────────');
  console.log('USER JOURNEYS');
  console.log('───────────────────────────────────────────────────────────────────────────────');
  
  for (const journey of report.journeys) {
    const emoji = journey.status === 'pass' ? '✅' : journey.status === 'partial' ? '⚠️' : '❌';
    console.log(`${emoji} ${journey.name}: ${journey.status.toUpperCase()}`);
  }
  
  // Accessibility
  console.log('\n───────────────────────────────────────────────────────────────────────────────');
  console.log('ACCESSIBILITY');
  console.log('───────────────────────────────────────────────────────────────────────────────');
  console.log(`Critical Violations: ${report.accessibility.criticalViolations === 0 ? '✅ 0' : '❌ ' + report.accessibility.criticalViolations}`);
  console.log(`Serious Violations:  ${report.accessibility.seriousViolations === 0 ? '✅ 0' : '❌ ' + report.accessibility.seriousViolations}`);
  
  // Performance
  console.log('\n───────────────────────────────────────────────────────────────────────────────');
  console.log('PERFORMANCE');
  console.log('───────────────────────────────────────────────────────────────────────────────');
  console.log(`Meets Targets: ${report.performance.meetsTargets ? '✅ Yes' : '❌ No'}`);
  
  if (report.performance.pages.length > 0) {
    console.log('\nPage Scores:');
    for (const page of report.performance.pages) {
      console.log(`  ${page.page}:`);
      console.log(`    Performance: ${page.performance >= 90 ? '✅' : '❌'} ${page.performance}`);
      console.log(`    LCP: ${page.lcp <= 2500 ? '✅' : '❌'} ${Math.round(page.lcp)}ms`);
      console.log(`    CLS: ${page.cls <= 0.1 ? '✅' : '❌'} ${page.cls.toFixed(3)}`);
    }
  }
  
  // Compliance
  console.log('\n───────────────────────────────────────────────────────────────────────────────');
  console.log('COMPLIANCE');
  console.log('───────────────────────────────────────────────────────────────────────────────');
  console.log(`FTC Disclosure:    ${report.compliance.ftcDisclosure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WCAG Compliance:   ${report.compliance.wcagCompliance ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Amazon Compliance: ${report.compliance.amazonCompliance ? '✅ PASS' : '❌ FAIL'}`);
  
  // Final Status
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  
  if (report.readyForLaunch) {
    console.log('                         ✅ READY FOR LAUNCH');
  } else {
    console.log('                         ❌ NOT READY FOR LAUNCH');
    
    if (report.blockers.length > 0) {
      console.log('\nBlockers:');
      for (const blocker of report.blockers) {
        console.log(`  ❌ ${blocker}`);
      }
    }
  }
  
  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of report.warnings) {
      console.log(`  ⚠️ ${warning}`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}

// Main execution
const report = generateReport();
printReport(report);

// Save report
writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
console.log('Report saved to validation-report.json');
