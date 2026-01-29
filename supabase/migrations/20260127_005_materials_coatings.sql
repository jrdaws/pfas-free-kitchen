-- Migration: 005_materials_coatings.sql
-- Purpose: Materials and coatings reference tables

-- ============================================================
-- MATERIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  family VARCHAR(100), -- Metal, Glass, Ceramic, Silicone, Polymer, Composite
  pfas_risk_default BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);
CREATE INDEX IF NOT EXISTS idx_materials_family ON materials(family);

-- ============================================================
-- COATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS coatings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- none, ceramic_sol_gel, enamel, seasoning, unknown
  is_fluoropolymer BOOLEAN NOT NULL DEFAULT FALSE, -- PTFE, FEP, PFA
  pfas_risk_default BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_terms VARCHAR(255)[], -- Terms that indicate this coating
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coatings_slug ON coatings(slug);
CREATE INDEX IF NOT EXISTS idx_coatings_type ON coatings(type);
CREATE INDEX IF NOT EXISTS idx_coatings_fluoropolymer ON coatings(is_fluoropolymer);
