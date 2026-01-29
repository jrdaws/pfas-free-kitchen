-- Migration: 007_evidence.sql
-- Purpose: Evidence objects and product-evidence relationships (immutable storage)

-- ============================================================
-- EVIDENCE OBJECTS (Immutable)
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type evidence_type NOT NULL,
  source evidence_source NOT NULL,
  
  -- Storage
  storage_uri VARCHAR(500) NOT NULL, -- S3 URI
  sha256_hash CHAR(64) NOT NULL, -- Immutability verification
  file_size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  original_filename VARCHAR(255),
  
  -- Common metadata
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- When evidence becomes stale
  
  -- Type-specific metadata (JSONB for flexibility)
  metadata JSONB NOT NULL DEFAULT '{}',
  /*
  Lab report metadata:
  {
    "lab_name": "...",
    "accreditation": "ISO 17025",
    "method": "LC-MS/MS",
    "method_reference": "EPA 533",
    "analyte_list_ref": "panel_v1_40pfas",
    "analyte_count": 40,
    "lod_ng_g": 1.0,
    "loq_ng_g": 3.0,
    "sample_scope": {"units": 1, "lots": 1, "component_ids": [...]},
    "collection_date": "2025-11-01",
    "report_date": "2025-11-08",
    "result_summary": "All below LOD"
  }
  
  Brand statement metadata:
  {
    "statement_text": "...",
    "statement_date": "...",
    "signatory": "..."
  }
  */
  
  -- Soft delete (never hard delete evidence)
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_objects(type);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON evidence_objects(source);
CREATE INDEX IF NOT EXISTS idx_evidence_expires ON evidence_objects(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON evidence_objects(sha256_hash);

-- ============================================================
-- PRODUCT-EVIDENCE JUNCTION
-- ============================================================

CREATE TABLE IF NOT EXISTS product_evidence (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_objects(id),
  component_id UUID REFERENCES product_components(id), -- NULL = applies to whole product
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID, -- Admin user ID
  notes TEXT,
  
  PRIMARY KEY (product_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_product_evidence_product ON product_evidence(product_id);
CREATE INDEX IF NOT EXISTS idx_product_evidence_evidence ON product_evidence(evidence_id);

-- ============================================================
-- CLAIMS (Brand/marketing claims to track)
-- ============================================================

CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_id UUID REFERENCES product_components(id),
  claim_type claim_type NOT NULL,
  claim_text TEXT NOT NULL, -- The actual claim statement
  source_url VARCHAR(500),
  source_type VARCHAR(50), -- website, packaging, email, press_release
  captured_at TIMESTAMPTZ NOT NULL,
  captured_by UUID, -- Admin user ID
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_id UUID REFERENCES evidence_objects(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_product ON claims(product_id);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(claim_type);

-- ============================================================
-- ANALYTE PANELS (Reference data for lab reports)
-- ============================================================

CREATE TABLE IF NOT EXISTS analyte_panels (
  id VARCHAR(50) PRIMARY KEY, -- panel_v1_40pfas
  name VARCHAR(255) NOT NULL,
  description TEXT,
  analyte_count INTEGER NOT NULL,
  analytes JSONB NOT NULL, -- Array of {cas_number, name, abbreviation}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
