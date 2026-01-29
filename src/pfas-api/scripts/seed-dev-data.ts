/**
 * Development Seed Data Script
 * Creates test products for frontend development
 * 
 * Usage: npx ts-node scripts/seed-dev-data.ts
 */

import pg from 'pg';

const { Pool } = pg;

// ============================================================
// CONFIGURATION
// ============================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pfas_kitchen',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// ============================================================
// TEST DATA
// ============================================================

const TEST_BRANDS = [
  { id: 'brand-lodge', name: 'Lodge', slug: 'lodge' },
  { id: 'brand-allclad', name: 'All-Clad', slug: 'all-clad' },
  { id: 'brand-lecreuset', name: 'Le Creuset', slug: 'le-creuset' },
  { id: 'brand-staub', name: 'Staub', slug: 'staub' },
  { id: 'brand-demeyere', name: 'Demeyere', slug: 'demeyere' },
  { id: 'brand-finex', name: 'Finex', slug: 'finex' },
  { id: 'brand-madeincookware', name: 'Made In', slug: 'made-in' },
  { id: 'brand-pyrex', name: 'Pyrex', slug: 'pyrex' },
  { id: 'brand-oxo', name: 'OXO', slug: 'oxo' },
  { id: 'brand-rubbermaid', name: 'Rubbermaid', slug: 'rubbermaid' },
];

const TEST_CATEGORIES = [
  { id: 'cat-cookware', name: 'Cookware', slug: 'cookware', parent_id: null },
  { id: 'cat-skillets', name: 'Skillets', slug: 'skillets', parent_id: 'cat-cookware' },
  { id: 'cat-dutchovens', name: 'Dutch Ovens', slug: 'dutch-ovens', parent_id: 'cat-cookware' },
  { id: 'cat-saucepans', name: 'Saucepans', slug: 'saucepans', parent_id: 'cat-cookware' },
  { id: 'cat-stockpots', name: 'Stockpots', slug: 'stockpots', parent_id: 'cat-cookware' },
  { id: 'cat-bakeware', name: 'Bakeware', slug: 'bakeware', parent_id: null },
  { id: 'cat-bakingsheets', name: 'Baking Sheets', slug: 'baking-sheets', parent_id: 'cat-bakeware' },
  { id: 'cat-storage', name: 'Food Storage', slug: 'food-storage', parent_id: null },
  { id: 'cat-containers', name: 'Containers', slug: 'containers', parent_id: 'cat-storage' },
];

const TEST_MATERIALS = [
  { id: 'mat-castiron', name: 'Cast Iron', slug: 'cast-iron', inherently_pfas_free: true },
  { id: 'mat-stainless', name: 'Stainless Steel', slug: 'stainless-steel', inherently_pfas_free: true },
  { id: 'mat-carbonsteel', name: 'Carbon Steel', slug: 'carbon-steel', inherently_pfas_free: true },
  { id: 'mat-enamel', name: 'Enamel', slug: 'enamel', inherently_pfas_free: true },
  { id: 'mat-aluminum', name: 'Aluminum', slug: 'aluminum', inherently_pfas_free: true },
  { id: 'mat-glass', name: 'Glass', slug: 'glass', inherently_pfas_free: true },
  { id: 'mat-silicone', name: 'Silicone', slug: 'silicone', inherently_pfas_free: false },
  { id: 'mat-plastic', name: 'Plastic', slug: 'plastic', inherently_pfas_free: false },
];

const TEST_COATINGS = [
  { id: 'coat-seasoning', name: 'Vegetable Oil Seasoning', slug: 'vegetable-oil-seasoning' },
  { id: 'coat-enamel', name: 'Porcelain Enamel', slug: 'porcelain-enamel' },
  { id: 'coat-ceramic', name: 'Ceramic', slug: 'ceramic' },
  { id: 'coat-none', name: 'None (Uncoated)', slug: 'uncoated' },
];

interface TestProduct {
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  materialSummary: string;
  coatingSummary: string | null;
  tier: 0 | 1 | 2 | 3 | 4;
  claimType: string;
  scopeText: string;
  rationale: string;
  unknowns: string[];
  components: Array<{
    role: string;
    roleLabel: string;
    materialId: string;
    coatingId?: string;
    pfasStatus: string;
  }>;
  features: {
    inductionCompatible?: boolean;
    ovenSafeTempF?: number;
    dishwasherSafe?: boolean;
  };
}

const TEST_PRODUCTS: TestProduct[] = [
  {
    name: 'Lodge Cast Iron Skillet 10.25"',
    slug: 'lodge-cast-iron-skillet-10',
    description: 'This pre-seasoned cast iron skillet is ready to use right out of the box. Perfect for searing, sautéing, baking, broiling, braising, and frying.',
    brandId: 'brand-lodge',
    categoryId: 'cat-skillets',
    materialSummary: 'Cast iron with vegetable oil seasoning',
    coatingSummary: 'Pre-seasoned with vegetable oil',
    tier: 3,
    claimType: 'inherently_pfas_free',
    scopeText: 'All cooking surfaces verified PFAS-free',
    rationale: 'Cast iron is an inherently PFAS-free material. Lodge uses vegetable oil for seasoning which contains no fluorinated compounds.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-castiron', coatingId: 'coat-seasoning', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-castiron', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: false },
  },
  {
    name: 'All-Clad D3 Stainless Steel Fry Pan 10"',
    slug: 'all-clad-d3-stainless-fry-pan-10',
    description: 'Tri-ply bonded construction with a responsive aluminum core between stainless steel interior and exterior layers for even heat distribution.',
    brandId: 'brand-allclad',
    categoryId: 'cat-skillets',
    materialSummary: 'Stainless steel with aluminum core',
    coatingSummary: null,
    tier: 4,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Stainless steel 18/10 is inherently PFAS-free. All-Clad confirms no PFAS in their bonding or manufacturing process.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-aluminum', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },
  {
    name: 'Le Creuset Signature Dutch Oven 5.5 Qt',
    slug: 'le-creuset-signature-dutch-oven-5-5qt',
    description: 'The iconic enameled cast iron Dutch oven with superior heat retention and distribution. Perfect for slow cooking, braising, baking, roasting, and more.',
    brandId: 'brand-lecreuset',
    categoryId: 'cat-dutchovens',
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Porcelain enamel (sand-colored interior)',
    tier: 4,
    claimType: 'intentionally_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free via lab testing',
    rationale: 'Le Creuset has confirmed their enamel is PFAS-free and provided lab testing documentation.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-enamel', coatingId: 'coat-enamel', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-castiron', pfasStatus: 'verified_free' },
      { role: 'lid', roleLabel: 'Lid', materialId: 'mat-castiron', coatingId: 'coat-enamel', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },
  {
    name: 'Staub Cast Iron Cocotte 4 Qt',
    slug: 'staub-cast-iron-cocotte-4qt',
    description: 'French-made enameled cast iron cocotte with a self-basting lid for moist, flavorful results. Black matte enamel interior.',
    brandId: 'brand-staub',
    categoryId: 'cat-dutchovens',
    materialSummary: 'Enameled cast iron',
    coatingSummary: 'Black matte enamel',
    tier: 3,
    claimType: 'intentionally_pfas_free',
    scopeText: 'Cooking surfaces verified PFAS-free',
    rationale: 'Staub has confirmed their enamel formulation is PFAS-free. Black matte enamel is a traditional formulation predating PFAS usage.',
    unknowns: ['Manufacturing facility audit pending'],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-enamel', coatingId: 'coat-enamel', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-castiron', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },
  {
    name: 'Made In Carbon Steel Frying Pan 10"',
    slug: 'made-in-carbon-steel-frying-pan-10',
    description: 'Professional-grade carbon steel pan made in France. Develops a natural non-stick patina over time. Lightweight and responsive to heat.',
    brandId: 'brand-madeincookware',
    categoryId: 'cat-skillets',
    materialSummary: 'Carbon steel',
    coatingSummary: 'Beeswax coating (initial only)',
    tier: 3,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Carbon steel is inherently PFAS-free. Made In uses only beeswax for initial rust prevention which is washed off before first use.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-carbonsteel', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-carbonsteel', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 1200, dishwasherSafe: false },
  },
  {
    name: 'Demeyere Industry5 Stainless Steel Saucepan 2 Qt',
    slug: 'demeyere-industry5-saucepan-2qt',
    description: 'Belgian-made 5-ply stainless steel saucepan with Silvinox surface treatment for easy cleaning. Perfect for sauces and reductions.',
    brandId: 'brand-demeyere',
    categoryId: 'cat-saucepans',
    materialSummary: 'Stainless steel, 5-ply construction',
    coatingSummary: null,
    tier: 4,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Demeyere uses 18/10 stainless steel with Silvinox electrochemical surface treatment, both verified PFAS-free processes.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: true },
  },
  {
    name: 'Finex Cast Iron Skillet 10"',
    slug: 'finex-cast-iron-skillet-10',
    description: 'Handcrafted in Portland, Oregon. Octagonal design with stainless steel springs on the handle for heat management.',
    brandId: 'brand-finex',
    categoryId: 'cat-skillets',
    materialSummary: 'Cast iron with stainless steel handle',
    coatingSummary: 'Pre-seasoned with flaxseed oil',
    tier: 2,
    claimType: 'inherently_pfas_free',
    scopeText: 'Cooking surfaces verified PFAS-free',
    rationale: 'Cast iron is inherently PFAS-free. Finex confirms flaxseed oil seasoning contains no PFAS.',
    unknowns: ['Handle spring coating not yet verified'],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-castiron', coatingId: 'coat-seasoning', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-stainless', pfasStatus: 'claimed_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: false },
  },
  {
    name: 'Pyrex Glass Storage Container 4-Cup',
    slug: 'pyrex-glass-storage-container-4cup',
    description: 'Durable tempered glass container for food storage, meal prep, and reheating. Microwave, dishwasher, and freezer safe.',
    brandId: 'brand-pyrex',
    categoryId: 'cat-containers',
    materialSummary: 'Tempered glass',
    coatingSummary: null,
    tier: 3,
    claimType: 'inherently_pfas_free',
    scopeText: 'Glass body verified PFAS-free',
    rationale: 'Tempered glass is inherently PFAS-free. Note: lid may be polypropylene and tested separately.',
    unknowns: ['Plastic lid PFAS status requires separate verification'],
    components: [
      { role: 'body', roleLabel: 'Container Body', materialId: 'mat-glass', pfasStatus: 'verified_free' },
      { role: 'lid', roleLabel: 'Lid', materialId: 'mat-plastic', pfasStatus: 'unknown' },
    ],
    features: { ovenSafeTempF: 425, dishwasherSafe: true },
  },
  {
    name: 'OXO Good Grips Glass Round Container 4 Cup',
    slug: 'oxo-good-grips-glass-container-4cup',
    description: 'Borosilicate glass container with leakproof, SNAP lid. Safe for oven, microwave, fridge, and freezer.',
    brandId: 'brand-oxo',
    categoryId: 'cat-containers',
    materialSummary: 'Borosilicate glass',
    coatingSummary: null,
    tier: 2,
    claimType: 'intentionally_pfas_free',
    scopeText: 'Glass body and silicone gasket verified PFAS-free',
    rationale: 'OXO has stated the glass and silicone components are PFAS-free. Plastic lid parts under review.',
    unknowns: ['Plastic lid components require further verification'],
    components: [
      { role: 'body', roleLabel: 'Container Body', materialId: 'mat-glass', pfasStatus: 'verified_free' },
      { role: 'lid', roleLabel: 'Lid Gasket', materialId: 'mat-silicone', pfasStatus: 'claimed_free' },
      { role: 'lid', roleLabel: 'Lid Shell', materialId: 'mat-plastic', pfasStatus: 'unknown' },
    ],
    features: { ovenSafeTempF: 450, dishwasherSafe: true },
  },
  {
    name: 'Lodge Cast Iron Dutch Oven 6 Qt',
    slug: 'lodge-cast-iron-dutch-oven-6qt',
    description: 'Pre-seasoned cast iron Dutch oven with cast iron lid. Perfect for slow cooking, baking bread, and campfire cooking.',
    brandId: 'brand-lodge',
    categoryId: 'cat-dutchovens',
    materialSummary: 'Cast iron with vegetable oil seasoning',
    coatingSummary: 'Pre-seasoned with vegetable oil',
    tier: 3,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Cast iron is inherently PFAS-free. Lodge uses only vegetable oil for seasoning, confirmed PFAS-free.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-castiron', coatingId: 'coat-seasoning', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-castiron', pfasStatus: 'verified_free' },
      { role: 'lid', roleLabel: 'Lid', materialId: 'mat-castiron', coatingId: 'coat-seasoning', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 500, dishwasherSafe: false },
  },
  {
    name: 'All-Clad D3 Stainless Steel Stockpot 8 Qt',
    slug: 'all-clad-d3-stockpot-8qt',
    description: 'Tri-ply bonded stockpot ideal for making stocks, soups, and large batches. Includes fitted lid.',
    brandId: 'brand-allclad',
    categoryId: 'cat-stockpots',
    materialSummary: 'Stainless steel with aluminum core',
    coatingSummary: null,
    tier: 4,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Stainless steel 18/10 is inherently PFAS-free. All-Clad confirms no PFAS used in manufacturing.',
    unknowns: [],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-aluminum', pfasStatus: 'verified_free' },
      { role: 'lid', roleLabel: 'Lid', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 600, dishwasherSafe: true },
  },
  {
    name: 'Made In Stainless Steel Saucier 3 Qt',
    slug: 'made-in-stainless-saucier-3qt',
    description: 'Professional-grade 5-ply stainless steel saucier with rounded sides for easy stirring. Made in Italy.',
    brandId: 'brand-madeincookware',
    categoryId: 'cat-saucepans',
    materialSummary: 'Stainless steel, 5-ply construction',
    coatingSummary: null,
    tier: 3,
    claimType: 'inherently_pfas_free',
    scopeText: 'All food-contact surfaces verified PFAS-free',
    rationale: 'Made In uses 18/10 stainless steel which is inherently PFAS-free.',
    unknowns: ['Manufacturing facility audit pending'],
    components: [
      { role: 'cooking_surface', roleLabel: 'Cooking Surface', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'body', roleLabel: 'Body', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
      { role: 'handle', roleLabel: 'Handle', materialId: 'mat-stainless', pfasStatus: 'verified_free' },
    ],
    features: { inductionCompatible: true, ovenSafeTempF: 650, dishwasherSafe: true },
  },
];

const TEST_RETAILERS = [
  { id: 'ret-amazon', name: 'Amazon', slug: 'amazon' },
  { id: 'ret-williamssonoma', name: 'Williams Sonoma', slug: 'williams-sonoma' },
  { id: 'ret-surlatable', name: 'Sur La Table', slug: 'sur-la-table' },
  { id: 'ret-target', name: 'Target', slug: 'target' },
  { id: 'ret-direct', name: 'Brand Direct', slug: 'brand-direct' },
];

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedBrands(client: pg.PoolClient): Promise<void> {
  console.log('Seeding brands...');
  
  for (const brand of TEST_BRANDS) {
    await client.query(
      `INSERT INTO brands (id, name, slug, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, updated_at = NOW()`,
      [brand.id, brand.name, brand.slug]
    );
  }
  
  console.log(`✓ Seeded ${TEST_BRANDS.length} brands`);
}

async function seedCategories(client: pg.PoolClient): Promise<void> {
  console.log('Seeding categories...');
  
  for (const category of TEST_CATEGORIES) {
    await client.query(
      `INSERT INTO categories (id, name, slug, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, parent_id = $4, updated_at = NOW()`,
      [category.id, category.name, category.slug, category.parent_id]
    );
  }
  
  console.log(`✓ Seeded ${TEST_CATEGORIES.length} categories`);
}

async function seedMaterials(client: pg.PoolClient): Promise<void> {
  console.log('Seeding materials...');
  
  for (const material of TEST_MATERIALS) {
    await client.query(
      `INSERT INTO materials (id, name, slug, inherently_pfas_free, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, inherently_pfas_free = $4, updated_at = NOW()`,
      [material.id, material.name, material.slug, material.inherently_pfas_free]
    );
  }
  
  console.log(`✓ Seeded ${TEST_MATERIALS.length} materials`);
}

async function seedCoatings(client: pg.PoolClient): Promise<void> {
  console.log('Seeding coatings...');
  
  for (const coating of TEST_COATINGS) {
    await client.query(
      `INSERT INTO coating_types (id, name, slug, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, updated_at = NOW()`,
      [coating.id, coating.name, coating.slug]
    );
  }
  
  console.log(`✓ Seeded ${TEST_COATINGS.length} coatings`);
}

async function seedRetailers(client: pg.PoolClient): Promise<void> {
  console.log('Seeding retailers...');
  
  for (const retailer of TEST_RETAILERS) {
    await client.query(
      `INSERT INTO retailers (id, name, slug, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, updated_at = NOW()`,
      [retailer.id, retailer.name, retailer.slug]
    );
  }
  
  console.log(`✓ Seeded ${TEST_RETAILERS.length} retailers`);
}

async function seedProducts(client: pg.PoolClient): Promise<void> {
  console.log('Seeding products...');
  
  for (const product of TEST_PRODUCTS) {
    const productId = `prod-${product.slug}`;
    
    // Insert product
    await client.query(
      `INSERT INTO products (
         id, name, slug, description, brand_id, category_id, 
         material_summary, coating_summary, published_at, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET 
         name = $2, slug = $3, description = $4, brand_id = $5, category_id = $6,
         material_summary = $7, coating_summary = $8, updated_at = NOW()`,
      [
        productId, product.name, product.slug, product.description,
        product.brandId, product.categoryId, product.materialSummary, product.coatingSummary
      ]
    );
    
    // Insert verification record
    const verificationId = `ver-${product.slug}`;
    await client.query(
      `INSERT INTO verification_decisions (
         id, product_id, tier, claim_type, scope_text, rationale, 
         unknowns, confidence_score, decided_at, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET 
         tier = $3, claim_type = $4, scope_text = $5, rationale = $6,
         unknowns = $7, confidence_score = $8`,
      [
        verificationId, productId, product.tier, product.claimType,
        product.scopeText, product.rationale, JSON.stringify(product.unknowns),
        product.tier >= 3 ? 0.85 : product.tier >= 2 ? 0.7 : 0.5
      ]
    );
    
    // Insert components
    for (let i = 0; i < product.components.length; i++) {
      const comp = product.components[i];
      const componentId = `comp-${product.slug}-${i}`;
      
      await client.query(
        `INSERT INTO product_components (
           id, product_id, role, role_label, material_id, coating_type_id,
           pfas_status, sort_order, created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET 
           role = $3, role_label = $4, material_id = $5, coating_type_id = $6,
           pfas_status = $7, sort_order = $8`,
        [
          componentId, productId, comp.role, comp.roleLabel,
          comp.materialId, comp.coatingId || null, comp.pfasStatus, i
        ]
      );
    }
    
    // Insert product features
    if (product.features) {
      await client.query(
        `INSERT INTO product_features (
           product_id, induction_compatible, oven_safe_temp_f, dishwasher_safe, created_at
         )
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (product_id) DO UPDATE SET 
           induction_compatible = $2, oven_safe_temp_f = $3, dishwasher_safe = $4`,
        [
          productId,
          product.features.inductionCompatible ?? null,
          product.features.ovenSafeTempF ?? null,
          product.features.dishwasherSafe ?? null
        ]
      );
    }
    
    // Add some retailer links
    const retailerPool = TEST_RETAILERS.slice(0, Math.floor(Math.random() * 3) + 1);
    for (const retailer of retailerPool) {
      const linkId = `link-${product.slug}-${retailer.id}`;
      const price = Math.floor(Math.random() * 200) + 30;
      
      await client.query(
        `INSERT INTO retailer_links (
           id, product_id, retailer_id, url, price_cents, currency, in_stock, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, 'USD', true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET price_cents = $5, updated_at = NOW()`,
        [linkId, productId, retailer.id, `https://${retailer.slug}.com/product/${product.slug}`, price * 100]
      );
    }
  }
  
  console.log(`✓ Seeded ${TEST_PRODUCTS.length} products with components and retailer links`);
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  const command = process.argv[2] || 'seed';
  
  console.log('\n=== PFAS-Free Kitchen Dev Data Seeder ===\n');
  
  const client = await pool.connect();
  
  try {
    switch (command) {
      case 'seed':
        await client.query('BEGIN');
        await seedBrands(client);
        await seedCategories(client);
        await seedMaterials(client);
        await seedCoatings(client);
        await seedRetailers(client);
        await seedProducts(client);
        await client.query('COMMIT');
        console.log('\n✓ All seed data inserted successfully!\n');
        break;
        
      case 'clean':
        console.log('Cleaning test data...');
        await client.query('BEGIN');
        await client.query('DELETE FROM retailer_links WHERE id LIKE $1', ['link-%']);
        await client.query('DELETE FROM product_features WHERE product_id LIKE $1', ['prod-%']);
        await client.query('DELETE FROM product_components WHERE id LIKE $1', ['comp-%']);
        await client.query('DELETE FROM verification_decisions WHERE id LIKE $1', ['ver-%']);
        await client.query('DELETE FROM products WHERE id LIKE $1', ['prod-%']);
        await client.query('DELETE FROM retailers WHERE id LIKE $1', ['ret-%']);
        await client.query('DELETE FROM coating_types WHERE id LIKE $1', ['coat-%']);
        await client.query('DELETE FROM materials WHERE id LIKE $1', ['mat-%']);
        await client.query('DELETE FROM categories WHERE id LIKE $1', ['cat-%']);
        await client.query('DELETE FROM brands WHERE id LIKE $1', ['brand-%']);
        await client.query('COMMIT');
        console.log('✓ Test data cleaned\n');
        break;
        
      case 'reset':
        console.log('Resetting test data (clean + seed)...\n');
        // Clean first
        await client.query('BEGIN');
        await client.query('DELETE FROM retailer_links WHERE id LIKE $1', ['link-%']);
        await client.query('DELETE FROM product_features WHERE product_id LIKE $1', ['prod-%']);
        await client.query('DELETE FROM product_components WHERE id LIKE $1', ['comp-%']);
        await client.query('DELETE FROM verification_decisions WHERE id LIKE $1', ['ver-%']);
        await client.query('DELETE FROM products WHERE id LIKE $1', ['prod-%']);
        await client.query('DELETE FROM retailers WHERE id LIKE $1', ['ret-%']);
        await client.query('DELETE FROM coating_types WHERE id LIKE $1', ['coat-%']);
        await client.query('DELETE FROM materials WHERE id LIKE $1', ['mat-%']);
        await client.query('DELETE FROM categories WHERE id LIKE $1', ['cat-%']);
        await client.query('DELETE FROM brands WHERE id LIKE $1', ['brand-%']);
        await client.query('COMMIT');
        // Then seed
        await client.query('BEGIN');
        await seedBrands(client);
        await seedCategories(client);
        await seedMaterials(client);
        await seedCoatings(client);
        await seedRetailers(client);
        await seedProducts(client);
        await client.query('COMMIT');
        console.log('\n✓ Test data reset successfully!\n');
        break;
        
      default:
        console.log('Usage: npx ts-node scripts/seed-dev-data.ts [command]');
        console.log('Commands:');
        console.log('  seed  - Insert test data (default)');
        console.log('  clean - Remove test data');
        console.log('  reset - Clean and re-seed\n');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
