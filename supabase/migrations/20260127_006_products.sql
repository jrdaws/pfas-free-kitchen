-- Migration: 006_products.sql
-- Purpose: Products, components, variants, and retailer links

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  description TEXT,
  primary_image_url VARCHAR(500),
  status product_status NOT NULL DEFAULT 'draft',
  
  -- Denormalized summaries for fast reads
  material_summary VARCHAR(255),
  coating_summary VARCHAR(255),
  
  -- Category-specific features (JSONB for flexibility)
  features JSONB NOT NULL DEFAULT '{}',
  -- Example: {"induction_compatible": true, "oven_safe_temp_f": 500, "dishwasher_safe": true}
  
  -- Identifiers
  gtin VARCHAR(14), -- UPC/EAN
  mpn VARCHAR(100), -- Manufacturer part number
  
  -- Flags
  pfas_risk_flagged BOOLEAN NOT NULL DEFAULT FALSE, -- Triggered by risk terms
  requires_elevated_review BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_mpn ON products(brand_id, mpn) WHERE mpn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_risk_flagged ON products(pfas_risk_flagged) WHERE pfas_risk_flagged = TRUE;

-- Full-text search on product name and description
CREATE INDEX IF NOT EXISTS idx_products_search ON products 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- PRODUCT COMPONENTS (Food-contact critical)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Pan body", "Handle", "Lid", "Gasket"
  food_contact BOOLEAN NOT NULL DEFAULT FALSE,
  material_id UUID REFERENCES materials(id),
  coating_id UUID REFERENCES coatings(id),
  pfas_risk_flag BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_components_product ON product_components(product_id);
CREATE INDEX IF NOT EXISTS idx_components_food_contact ON product_components(food_contact) WHERE food_contact = TRUE;
CREATE INDEX IF NOT EXISTS idx_components_material ON product_components(material_id);
CREATE INDEX IF NOT EXISTS idx_components_coating ON product_components(coating_id);

-- ============================================================
-- PRODUCT VARIANTS (Size, color, pack count)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "12-inch", "Blue", "Set of 3"
  sku VARCHAR(100),
  gtin VARCHAR(14),
  asin VARCHAR(10), -- Amazon ASIN
  size_value DECIMAL(10,2),
  size_unit VARCHAR(20), -- inches, quarts, liters
  pack_count INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_asin ON product_variants(asin) WHERE asin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variants_gtin ON product_variants(gtin) WHERE gtin IS NOT NULL;

-- ============================================================
-- PRODUCT-RETAILER AVAILABILITY
-- ============================================================

CREATE TABLE IF NOT EXISTS product_retailer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  external_id VARCHAR(255), -- Retailer's product ID / ASIN
  external_url VARCHAR(1000), -- Direct URL (for link generation)
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, variant_id, retailer_id)
);

CREATE INDEX IF NOT EXISTS idx_retailer_links_product ON product_retailer_links(product_id);
CREATE INDEX IF NOT EXISTS idx_retailer_links_retailer ON product_retailer_links(retailer_id);
