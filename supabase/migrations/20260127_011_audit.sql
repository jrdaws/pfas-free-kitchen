-- Migration: 011_audit.sql
-- Purpose: Audit log with immutability triggers and admin users

-- ============================================================
-- ADMIN USERS (Minimal - integrate with auth provider)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- super_admin, reviewer, editor, viewer
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (Append-only, immutable)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY, -- Sequential for ordering guarantee
  
  -- Actor
  actor_type VARCHAR(20) NOT NULL, -- system, admin, api, scheduler
  actor_id UUID, -- NULL for system actions
  actor_ip_hash VARCHAR(64),
  
  -- Action
  action VARCHAR(100) NOT NULL,
  -- Examples: product.created, product.published, verification.decided,
  --           evidence.uploaded, report.resolved, admin.login
  
  -- Target
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Change details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Additional context
  
  -- Tamper evidence
  request_id VARCHAR(64),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ============================================================
-- IMMUTABILITY FUNCTIONS AND TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prevent evidence deletion (soft delete only)
CREATE OR REPLACE FUNCTION prevent_evidence_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Evidence objects cannot be deleted. Use soft delete (deleted_at) instead.';
END;
$$ LANGUAGE plpgsql;

-- Prevent audit log modifications
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log is immutable. No updates or deletes allowed.';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY TRIGGERS
-- ============================================================

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_brands_updated ON brands;
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_verification_updated ON verification_status;
CREATE TRIGGER trg_verification_updated BEFORE UPDATE ON verification_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated ON user_reports;
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_retailers_updated ON retailers;
CREATE TRIGGER trg_retailers_updated BEFORE UPDATE ON retailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_affiliate_programs_updated ON affiliate_programs;
CREATE TRIGGER trg_affiliate_programs_updated BEFORE UPDATE ON affiliate_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_link_templates_updated ON affiliate_link_templates;
CREATE TRIGGER trg_link_templates_updated BEFORE UPDATE ON affiliate_link_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated ON categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_components_updated ON product_components;
CREATE TRIGGER trg_components_updated BEFORE UPDATE ON product_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_variants_updated ON product_variants;
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_retailer_links_updated ON product_retailer_links;
CREATE TRIGGER trg_retailer_links_updated BEFORE UPDATE ON product_retailer_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_admin_users_updated ON admin_users;
CREATE TRIGGER trg_admin_users_updated BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Evidence immutability trigger (prevent hard delete)
DROP TRIGGER IF EXISTS trg_evidence_no_delete ON evidence_objects;
CREATE TRIGGER trg_evidence_no_delete BEFORE DELETE ON evidence_objects
  FOR EACH ROW EXECUTE FUNCTION prevent_evidence_hard_delete();

-- Audit log immutability triggers (prevent update and delete)
DROP TRIGGER IF EXISTS trg_audit_no_update ON audit_log;
CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS trg_audit_no_delete ON audit_log;
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
