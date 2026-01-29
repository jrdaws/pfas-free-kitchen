-- Migration: 003_brands_retailers.sql
-- Purpose: Brands, retailers, affiliate programs, and link templates

-- ============================================================
-- BRANDS
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(500),
  country CHAR(2), -- ISO 3166-1 alpha-2
  logo_url VARCHAR(500),
  pfas_policy_url VARCHAR(500),
  pfas_policy_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- ============================================================
-- AFFILIATE PROGRAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  network VARCHAR(100), -- Amazon Associates, Impact, CJ, etc.
  terms_url VARCHAR(500),
  price_display_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  price_cache_max_hours INTEGER, -- NULL if price not allowed
  requires_api BOOLEAN NOT NULL DEFAULT FALSE,
  api_name VARCHAR(100), -- PA-API, etc.
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RETAILERS
-- ============================================================

CREATE TABLE IF NOT EXISTS retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) NOT NULL,
  affiliate_program_id UUID REFERENCES affiliate_programs(id),
  icon_name VARCHAR(50),
  priority INTEGER NOT NULL DEFAULT 100, -- lower = higher priority in lists
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retailers_slug ON retailers(slug);
CREATE INDEX IF NOT EXISTS idx_retailers_affiliate_program ON retailers(affiliate_program_id);

-- ============================================================
-- AFFILIATE LINK TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_link_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  template VARCHAR(1000) NOT NULL, -- URL template with placeholders
  -- Placeholders: {product_id}, {asin}, {sku}, {affiliate_id}, {tracking_id}
  param_rules JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_templates_retailer ON affiliate_link_templates(retailer_id);
