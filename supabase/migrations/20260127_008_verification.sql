-- Migration: 008_verification.sql
-- Purpose: Verification status and history (append-only changelog)

-- ============================================================
-- VERIFICATION STATUS (Current state)
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  tier verification_tier NOT NULL DEFAULT '0',
  claim_type claim_type,
  scope_text VARCHAR(500), -- Human-readable scope description
  scope_component_ids UUID[], -- Which components this verification covers
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  unknowns TEXT[], -- What's still unknown
  
  decision_date TIMESTAMPTZ,
  reviewer_id UUID, -- Admin user ID
  rationale TEXT,
  evidence_ids UUID[], -- Evidence objects supporting this decision
  
  next_review_due TIMESTAMPTZ,
  
  -- For products under review
  review_started_at TIMESTAMPTZ,
  review_lane VARCHAR(50), -- standard, high_risk
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_product ON verification_status(product_id);
CREATE INDEX IF NOT EXISTS idx_verification_tier ON verification_status(tier);
CREATE INDEX IF NOT EXISTS idx_verification_next_review ON verification_status(next_review_due) 
  WHERE next_review_due IS NOT NULL;

-- ============================================================
-- VERIFICATION HISTORY (Append-only changelog)
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  
  from_tier verification_tier,
  to_tier verification_tier NOT NULL,
  from_claim_type claim_type,
  to_claim_type claim_type,
  
  reason TEXT NOT NULL,
  evidence_ids UUID[],
  reviewer_id UUID,
  
  -- Never delete, only append
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_history_product ON verification_history(product_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_created ON verification_history(created_at);
