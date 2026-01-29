/**
 * Data Quality Validation Script
 * Pre-launch validation for product data quality
 * 
 * Usage:
 *   npx ts-node scripts/validate-data-quality.ts
 *   npm run validate:data
 */

// ============================================================
// TYPES
// ============================================================

interface ValidationCheck {
  name: string;
  passed: boolean;
  value?: string;
  failures?: Array<{ id: string; name?: string; [key: string]: unknown }>;
  threshold?: string;
}

interface ValidationReport {
  passed: boolean;
  timestamp: Date;
  checks: ValidationCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

// ============================================================
// MOCK DATABASE (Replace with actual DB in production)
// ============================================================

interface MockProduct {
  id: string;
  name: string;
  status: 'draft' | 'pending_review' | 'published' | 'suspended';
  categoryId: string;
}

interface MockVerification {
  productId: string;
  tier: number;
}

interface MockEvidence {
  id: string;
  productId: string;
  type: 'brand_statement' | 'lab_report' | 'policy_document';
}

// Mock data for testing
const mockProducts: MockProduct[] = [
  { id: 'prod_1', name: 'Stainless Skillet', status: 'published', categoryId: 'cat_cookware' },
  { id: 'prod_2', name: 'Cast Iron Pan', status: 'published', categoryId: 'cat_cookware' },
  { id: 'prod_3', name: 'Glass Bakeware', status: 'published', categoryId: 'cat_bakeware' },
  { id: 'prod_4', name: 'Ceramic Pot', status: 'published', categoryId: 'cat_cookware' },
  { id: 'prod_5', name: 'Dutch Oven', status: 'draft', categoryId: 'cat_cookware' },
];

const mockVerifications: MockVerification[] = [
  { productId: 'prod_1', tier: 3 },
  { productId: 'prod_2', tier: 2 },
  { productId: 'prod_3', tier: 1 },
  { productId: 'prod_4', tier: 2 },
];

const mockEvidence: MockEvidence[] = [
  { id: 'ev_1', productId: 'prod_1', type: 'brand_statement' },
  { id: 'ev_2', productId: 'prod_1', type: 'lab_report' },
  { id: 'ev_3', productId: 'prod_2', type: 'brand_statement' },
  { id: 'ev_4', productId: 'prod_3', type: 'brand_statement' },
  { id: 'ev_5', productId: 'prod_4', type: 'brand_statement' },
];

// Mock DB queries
const db = {
  async query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }> {
    // Simulate queries based on SQL pattern
    if (sql.includes('products_without_evidence')) {
      const publishedProducts = mockProducts.filter(p => p.status === 'published');
      const productsWithEvidence = new Set(mockEvidence.map(e => e.productId));
      const withoutEvidence = publishedProducts.filter(p => !productsWithEvidence.has(p.id));
      return { rows: withoutEvidence };
    }
    
    if (sql.includes('products_without_tier')) {
      const publishedProducts = mockProducts.filter(p => p.status === 'published');
      const productsWithTier = new Set(mockVerifications.map(v => v.productId));
      const withoutTier = publishedProducts.filter(p => !productsWithTier.has(p.id));
      return { rows: withoutTier };
    }
    
    if (sql.includes('tier3_without_lab')) {
      const tier3Plus = mockVerifications.filter(v => v.tier >= 3);
      const productsWithLabReport = new Set(
        mockEvidence.filter(e => e.type === 'lab_report').map(e => e.productId)
      );
      const withoutLab = tier3Plus
        .filter(v => !productsWithLabReport.has(v.productId))
        .map(v => {
          const product = mockProducts.find(p => p.id === v.productId);
          return { id: v.productId, name: product?.name, tier: v.tier };
        });
      return { rows: withoutLab };
    }
    
    if (sql.includes('tier1_plus_pct')) {
      const publishedProducts = mockProducts.filter(p => p.status === 'published');
      const tier1Plus = mockVerifications.filter(v => v.tier >= 1);
      const publishedWithTier1Plus = tier1Plus.filter(v => 
        publishedProducts.some(p => p.id === v.productId)
      );
      const pct = (publishedWithTier1Plus.length / publishedProducts.length) * 100;
      return { rows: [{ tier1_plus_pct: pct.toString() }] };
    }
    
    if (sql.includes('category_counts')) {
      const publishedProducts = mockProducts.filter(p => p.status === 'published');
      const categoryCounts = new Map<string, number>();
      publishedProducts.forEach(p => {
        categoryCounts.set(p.categoryId, (categoryCounts.get(p.categoryId) || 0) + 1);
      });
      return { 
        rows: Array.from(categoryCounts.entries()).map(([categoryId, count]) => ({
          categoryId,
          count,
        }))
      };
    }
    
    if (sql.includes('total_published')) {
      const count = mockProducts.filter(p => p.status === 'published').length;
      return { rows: [{ count }] };
    }
    
    return { rows: [] };
  },
};

// ============================================================
// VALIDATION CHECKS
// ============================================================

async function checkProductsHaveEvidence(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- products_without_evidence
    SELECT p.id, p.name 
    FROM products p
    LEFT JOIN product_evidence pe ON p.id = pe.product_id
    WHERE p.status = 'published' AND pe.product_id IS NULL
  `);
  
  return {
    name: 'All published products have evidence',
    passed: result.rows.length === 0,
    failures: result.rows as ValidationCheck['failures'],
    value: result.rows.length === 0 ? 'All products have evidence' : `${result.rows.length} products missing evidence`,
  };
}

async function checkProductsHaveTier(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- products_without_tier
    SELECT p.id, p.name 
    FROM products p
    LEFT JOIN verification_status vs ON p.id = vs.product_id
    WHERE p.status = 'published' AND vs.id IS NULL
  `);
  
  return {
    name: 'All published products have verification tier',
    passed: result.rows.length === 0,
    failures: result.rows as ValidationCheck['failures'],
    value: result.rows.length === 0 ? 'All products have tier' : `${result.rows.length} products missing tier`,
  };
}

async function checkTier3HasLabReport(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- tier3_without_lab
    SELECT p.id, p.name, vs.tier
    FROM products p
    JOIN verification_status vs ON p.id = vs.product_id
    WHERE vs.tier >= 3 
      AND NOT EXISTS (
        SELECT 1 FROM product_evidence pe 
        JOIN evidence_objects eo ON pe.evidence_id = eo.id
        WHERE pe.product_id = p.id AND eo.type = 'lab_report'
      )
  `);
  
  return {
    name: 'Tier 3+ products have lab report',
    passed: result.rows.length === 0,
    failures: result.rows as ValidationCheck['failures'],
    value: result.rows.length === 0 ? 'All Tier 3+ products have lab reports' : `${result.rows.length} missing lab reports`,
  };
}

async function checkTier1Coverage(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- tier1_plus_pct
    SELECT 
      COUNT(*) FILTER (WHERE vs.tier >= 1) * 100.0 / COUNT(*) as tier1_plus_pct
    FROM products p
    LEFT JOIN verification_status vs ON p.id = vs.product_id
    WHERE p.status = 'published'
  `);
  
  const coverage = parseFloat((result.rows[0] as { tier1_plus_pct: string }).tier1_plus_pct);
  
  return {
    name: 'Tier 1+ coverage >= 80%',
    passed: coverage >= 80,
    value: `${coverage.toFixed(1)}%`,
    threshold: '≥ 80%',
  };
}

async function checkCategoryCoverage(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- category_counts
    SELECT category_id, COUNT(*) as count
    FROM products
    WHERE status = 'published'
    GROUP BY category_id
  `);
  
  const categories = result.rows as Array<{ categoryId: string; count: number }>;
  const underThreshold = categories.filter(c => c.count < 20);
  
  return {
    name: 'All categories have ≥ 20 products',
    passed: underThreshold.length === 0,
    failures: underThreshold.map(c => ({ id: c.categoryId, count: c.count })),
    value: underThreshold.length === 0 
      ? 'All categories meet threshold' 
      : `${underThreshold.length} categories under threshold`,
    threshold: '≥ 20 products per category',
  };
}

async function checkMinimumProductCount(): Promise<ValidationCheck> {
  const result = await db.query(`
    -- total_published
    SELECT COUNT(*) as count FROM products WHERE status = 'published'
  `);
  
  const count = (result.rows[0] as { count: number }).count;
  
  return {
    name: 'Minimum 500 published products',
    passed: count >= 500,
    value: `${count} products`,
    threshold: '≥ 500 products',
  };
}

// ============================================================
// MAIN VALIDATION
// ============================================================

async function validateDataQuality(): Promise<ValidationReport> {
  console.log('\n🔍 Running Data Quality Validation...\n');
  
  const checks: ValidationCheck[] = [];
  
  // Run all checks
  checks.push(await checkProductsHaveEvidence());
  checks.push(await checkProductsHaveTier());
  checks.push(await checkTier3HasLabReport());
  checks.push(await checkTier1Coverage());
  checks.push(await checkCategoryCoverage());
  checks.push(await checkMinimumProductCount());
  
  // Calculate summary
  const passed = checks.filter(c => c.passed).length;
  const failed = checks.filter(c => !c.passed).length;
  
  const report: ValidationReport = {
    passed: failed === 0,
    timestamp: new Date(),
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
    },
  };
  
  return report;
}

function printReport(report: ValidationReport): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                   DATA QUALITY REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const check of report.checks) {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (check.value) {
      console.log(`   Value: ${check.value}`);
    }
    if (check.threshold) {
      console.log(`   Threshold: ${check.threshold}`);
    }
    if (!check.passed && check.failures && check.failures.length > 0) {
      console.log(`   Failures (showing first 5):`);
      check.failures.slice(0, 5).forEach(f => {
        console.log(`     - ${f.id}${f.name ? `: ${f.name}` : ''}`);
      });
      if (check.failures.length > 5) {
        console.log(`     ... and ${check.failures.length - 5} more`);
      }
    }
    console.log('');
  }
  
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`SUMMARY: ${report.summary.passed}/${report.summary.total} checks passed`);
  console.log('───────────────────────────────────────────────────────────────');
  
  if (report.passed) {
    console.log('\n✅ ALL CHECKS PASSED - Ready for launch!\n');
  } else {
    console.log(`\n❌ ${report.summary.failed} CHECK(S) FAILED - Please fix before launch.\n`);
  }
}

// ============================================================
// EXECUTION
// ============================================================

async function main(): Promise<void> {
  try {
    const report = await validateDataQuality();
    printReport(report);
    
    // Exit with error code if validation failed
    if (!report.passed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { validateDataQuality, ValidationReport, ValidationCheck };
