#!/usr/bin/env npx tsx
/**
 * Lighthouse Performance Audit Script
 * 
 * Runs Lighthouse audits on key pages and outputs results.
 * 
 * Usage:
 *   npx tsx scripts/run-lighthouse.ts
 *   npx tsx scripts/run-lighthouse.ts --json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface LighthouseResult {
  page: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    lcp: number;
    cls: number;
    fid: number;
    fcp: number;
    ttfb: number;
  };
}

const PAGES_TO_AUDIT = [
  { name: 'Homepage', path: '/' },
  { name: 'Category', path: '/cookware' },
  { name: 'Search', path: '/search?q=skillet' },
  { name: 'PDP', path: '/product/all-clad-d3-stainless-steel-12-skillet' },
];

const TARGET_SCORES = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 90,
};

const TARGET_METRICS = {
  lcp: 2500,  // ms
  cls: 0.1,
  fid: 100,   // ms
};

async function runLighthouse(url: string): Promise<any> {
  // Dynamic import for lighthouse
  const lighthouse = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  try {
    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      port: chrome.port,
    };

    const result = await lighthouse.default(url, options);
    return result?.lhr;
  } finally {
    await chrome.kill();
  }
}

function extractResults(lhr: any, pageName: string, url: string): LighthouseResult {
  return {
    page: pageName,
    url,
    scores: {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
    },
    metrics: {
      lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      fid: lhr.audits['max-potential-fid']?.numericValue || 0,
      fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
      ttfb: lhr.audits['server-response-time']?.numericValue || 0,
    },
  };
}

function formatScore(score: number, target: number): string {
  const emoji = score >= target ? '✅' : '❌';
  return `${emoji} ${score}`;
}

function formatMetric(value: number, target: number, unit: string = 'ms'): string {
  const emoji = value <= target ? '✅' : '❌';
  const formatted = unit === 'ms' ? `${Math.round(value)}${unit}` : value.toFixed(3);
  return `${emoji} ${formatted}`;
}

async function main() {
  const outputJson = process.argv.includes('--json');
  const results: LighthouseResult[] = [];

  console.log('🔍 Running Lighthouse audits...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Ensure output directory exists
  if (!existsSync('lighthouse')) {
    mkdirSync('lighthouse');
  }

  for (const page of PAGES_TO_AUDIT) {
    const url = `${BASE_URL}${page.path}`;
    console.log(`Auditing: ${page.name} (${url})...`);

    try {
      const lhr = await runLighthouse(url);
      const result = extractResults(lhr, page.name, url);
      results.push(result);

      // Save individual JSON
      writeFileSync(
        `lighthouse/${page.name.toLowerCase().replace(/\s+/g, '-')}.json`,
        JSON.stringify(lhr, null, 2)
      );

      console.log(`  ✓ Complete\n`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error}\n`);
      results.push({
        page: page.name,
        url,
        scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        metrics: { lcp: 0, cls: 0, fid: 0, fcp: 0, ttfb: 0 },
      });
    }
  }

  // Output results
  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    LIGHTHOUSE RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    for (const result of results) {
      console.log(`📄 ${result.page}`);
      console.log(`   ${result.url}\n`);
      
      console.log('   Scores:');
      console.log(`     Performance:    ${formatScore(result.scores.performance, TARGET_SCORES.performance)}`);
      console.log(`     Accessibility:  ${formatScore(result.scores.accessibility, TARGET_SCORES.accessibility)}`);
      console.log(`     Best Practices: ${formatScore(result.scores.bestPractices, TARGET_SCORES.bestPractices)}`);
      console.log(`     SEO:            ${formatScore(result.scores.seo, TARGET_SCORES.seo)}`);
      
      console.log('\n   Core Web Vitals:');
      console.log(`     LCP: ${formatMetric(result.metrics.lcp, TARGET_METRICS.lcp)}`);
      console.log(`     CLS: ${formatMetric(result.metrics.cls, TARGET_METRICS.cls, '')}`);
      console.log(`     FID: ${formatMetric(result.metrics.fid, TARGET_METRICS.fid)}`);
      
      console.log('\n───────────────────────────────────────────────────────────────\n');
    }

    // Summary
    const allPassing = results.every(r => 
      r.scores.performance >= TARGET_SCORES.performance &&
      r.scores.accessibility >= TARGET_SCORES.accessibility &&
      r.scores.bestPractices >= TARGET_SCORES.bestPractices &&
      r.scores.seo >= TARGET_SCORES.seo
    );

    if (allPassing) {
      console.log('✅ All pages meet target scores!');
    } else {
      console.log('❌ Some pages do not meet target scores.');
    }
  }

  // Save summary
  writeFileSync('lighthouse/summary.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to lighthouse/ directory');
}

main().catch(console.error);
