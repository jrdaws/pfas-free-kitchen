/**
 * Seed Verification Script
 * Verifies that seed data meets minimum requirements
 * 
 * Usage:
 *   npx tsx scripts/verify-seed.ts
 *   npm run db:verify
 */

import { stores } from './seed-database.js';

// ============================================================
// VERIFICATION CHECKS
// ============================================================

interface VerificationCheck {
  name: string;
  query: () => number;
  min: number;
  description?: string;
}

const CHECKS: VerificationCheck[] = [
  {
    name: 'Brands',
    query: () => stores.brands.size,
    min: 5,
    description: 'Kitchen brands loaded',
  },
  {
    name: 'Retailers',
    query: () => stores.retailers.size,
    min: 3,
    description: 'Affiliate retailers configured',
  },
  {
    name: 'Categories',
    query: () => stores.categories.size,
    min: 5,
    description: 'Product categories defined',
  },
  {
    name: 'Materials',
    query: () => stores.materials.size,
    min: 5,
    description: 'Material types defined',
  },
  {
    name: 'Published Products',
    query: () => {
      let count = 0;
      for (const [, p] of stores.products) {
        if (p.status === 'published') count++;
      }
      return count;
    },
    min: 50,
    description: 'Products ready for public display',
  },
  {
    name: 'Product Components',
    query: () => stores.components.size,
    min: 80,
    description: 'Component definitions (pan body, lid, handle, etc.)',
  },
  {
    name: 'Evidence Objects',
    query: () => stores.evidence.size,
    min: 40,
    description: 'Brand statements and lab reports',
  },
  {
    name: 'Verification Statuses',
    query: () => stores.verification.size,
    min: 40,
    description: 'Products with assigned verification tier',
  },
  {
    name: 'Products at Tier 1+',
    query: () => {
      let count = 0;
      for (const [, v] of stores.verification) {
        if ((v.tier as number) >= 1) count++;
      }
      return count;
    },
    min: 40,
    description: 'Products with at least brand statement',
  },
  {
    name: 'Products at Tier 3+',
    query: () => {
      let count = 0;
      for (const [, v] of stores.verification) {
        if ((v.tier as number) >= 3) count++;
      }
      return count;
    },
    min: 15,
    description: 'Products with lab report evidence',
  },
  {
    name: 'Products at Tier 4',
    query: () => {
      let count = 0;
      for (const [, v] of stores.verification) {
        if ((v.tier as number) === 4) count++;
      }
      return count;
    },
    min: 3,
    description: 'Highest verification (monitored)',
  },
  {
    name: 'Retailer Links',
    query: () => stores.retailerLinks.size,
    min: 80,
    description: 'Product-retailer associations',
  },
];

// ============================================================
// ADVANCED CHECKS
// ============================================================

interface AdvancedCheck {
  name: string;
  check: () => { passed: boolean; detail: string };
}

const ADVANCED_CHECKS: AdvancedCheck[] = [
  {
    name: 'All products have verification tier',
    check: () => {
      const productIds = new Set<string>();
      for (const [id] of stores.products) {
        productIds.add(id);
      }
      const verifiedIds = new Set<string>();
      for (const [, v] of stores.verification) {
        verifiedIds.add(v.productId as string);
      }
      
      const missing: string[] = [];
      for (const id of productIds) {
        if (!verifiedIds.has(id)) missing.push(id);
      }
      
      return {
        passed: missing.length === 0,
        detail: missing.length === 0 
          ? 'All products verified' 
          : `${missing.length} products missing verification`,
      };
    },
  },
  {
    name: 'All products have evidence',
    check: () => {
      const productIds = new Set<string>();
      for (const [id] of stores.products) {
        productIds.add(id);
      }
      const linkedIds = new Set<string>();
      for (const [, pe] of stores.productEvidence) {
        linkedIds.add(pe.productId as string);
      }
      
      const missing: string[] = [];
      for (const id of productIds) {
        if (!linkedIds.has(id)) missing.push(id);
      }
      
      return {
        passed: missing.length === 0,
        detail: missing.length === 0 
          ? 'All products have evidence' 
          : `${missing.length} products missing evidence`,
      };
    },
  },
  {
    name: 'Tier 3+ products have lab reports',
    check: () => {
      let totalTier3Plus = 0;
      let withLabReport = 0;
      
      for (const [productId, v] of stores.verification) {
        if ((v.tier as number) >= 3) {
          totalTier3Plus++;
          
          // Check if this product has a lab report
          for (const [, pe] of stores.productEvidence) {
            if (pe.productId === productId) {
              const evidence = stores.evidence.get(pe.evidenceId as string);
              if (evidence && evidence.type === 'lab_report') {
                withLabReport++;
                break;
              }
            }
          }
        }
      }
      
      return {
        passed: withLabReport >= totalTier3Plus * 0.9, // 90% threshold
        detail: `${withLabReport}/${totalTier3Plus} Tier 3+ products have lab reports`,
      };
    },
  },
  {
    name: 'All products have at least one component',
    check: () => {
      const productIds = new Set<string>();
      for (const [id] of stores.products) {
        productIds.add(id);
      }
      
      const withComponents = new Set<string>();
      for (const [, c] of stores.components) {
        withComponents.add(c.productId as string);
      }
      
      const missing = [...productIds].filter(id => !withComponents.has(id));
      
      return {
        passed: missing.length === 0,
        detail: missing.length === 0 
          ? 'All products have components' 
          : `${missing.length} products missing components`,
      };
    },
  },
  {
    name: 'All products have retailer links',
    check: () => {
      const productIds = new Set<string>();
      for (const [id] of stores.products) {
        productIds.add(id);
      }
      
      const withLinks = new Set<string>();
      for (const [, rl] of stores.retailerLinks) {
        withLinks.add(rl.productId as string);
      }
      
      const missing = [...productIds].filter(id => !withLinks.has(id));
      
      return {
        passed: missing.length === 0,
        detail: missing.length === 0 
          ? 'All products have retailer links' 
          : `${missing.length} products missing retailer links`,
      };
    },
  },
  {
    name: 'Brand coverage (at least 2 products per brand)',
    check: () => {
      const brandCounts = new Map<string, number>();
      for (const [, p] of stores.products) {
        const brandId = p.brandId as string;
        brandCounts.set(brandId, (brandCounts.get(brandId) || 0) + 1);
      }
      
      const underrepresented = [...brandCounts.entries()]
        .filter(([, count]) => count < 2);
      
      return {
        passed: underrepresented.length === 0,
        detail: underrepresented.length === 0 
          ? 'All brands have 2+ products' 
          : `${underrepresented.length} brands have fewer than 2 products`,
      };
    },
  },
];

// ============================================================
// MAIN VERIFICATION
// ============================================================

async function verifySeedData(): Promise<boolean> {
  console.log('\n🔍 Verifying seed data...\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    BASIC CHECKS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let allPassed = true;
  const results: Array<{ name: string; passed: boolean; count: number; min: number }> = [];

  for (const check of CHECKS) {
    const count = check.query();
    const passed = count >= check.min;
    
    if (!passed) allPassed = false;
    
    results.push({ name: check.name, passed, count, min: check.min });
    
    const icon = passed ? '✅' : '❌';
    const status = passed ? '' : ' ⚠️ BELOW MINIMUM';
    console.log(`${icon} ${check.name}: ${count} (min: ${check.min})${status}`);
    if (check.description) {
      console.log(`   └─ ${check.description}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    RELATIONSHIP CHECKS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const check of ADVANCED_CHECKS) {
    const result = check.check();
    
    if (!result.passed) allPassed = false;
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    console.log(`   └─ ${result.detail}`);
  }

  // Tier distribution analysis
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    TIER DISTRIBUTION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const tierCounts = new Map<number, number>();
  for (const [, v] of stores.verification) {
    const tier = v.tier as number;
    tierCounts.set(tier, (tierCounts.get(tier) || 0) + 1);
  }

  const totalProducts = stores.verification.size;
  
  const tierLabels: Record<number, string> = {
    0: 'Unknown',
    1: 'Brand Statement',
    2: 'Policy Reviewed',
    3: 'Lab Tested',
    4: 'Monitored',
  };

  for (let tier = 4; tier >= 0; tier--) {
    const count = tierCounts.get(tier) || 0;
    const pct = totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(parseFloat(pct) / 5));
    console.log(`   Tier ${tier} (${tierLabels[tier]}): ${count} (${pct}%) ${bar}`);
  }

  // Category distribution
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    CATEGORY DISTRIBUTION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const categoryCounts = new Map<string, number>();
  for (const [, p] of stores.products) {
    const categoryId = p.categoryId as string;
    // Find category name
    for (const [, cat] of stores.categories) {
      if (cat.id === categoryId) {
        const name = cat.name as string;
        categoryCounts.set(name, (categoryCounts.get(name) || 0) + 1);
        break;
      }
    }
  }

  const sortedCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sortedCategories) {
    if (count > 0) {
      console.log(`   ${name}: ${count} products`);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - Seed data is valid!\n');
  } else {
    console.log('❌ SOME CHECKS FAILED - Please review and reseed if necessary.\n');
  }

  return allPassed;
}

// Run if called directly
verifySeedData()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });

export { verifySeedData };
