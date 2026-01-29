-- Migration: 009_reports.sql
-- Purpose: User reports and moderation actions

-- ============================================================
-- USER REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  
  issue_type report_issue_type NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  contact_email VARCHAR(255),
  
  status report_status NOT NULL DEFAULT 'submitted',
  priority report_priority NOT NULL DEFAULT 'normal',
  
  -- Anonymous tracking
  session_id VARCHAR(64),
  ip_hash VARCHAR(64), -- Hashed for abuse detection, not identification
  user_agent_hash VARCHAR(64),
  
  sla_deadline TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_product ON user_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON user_reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_sla ON user_reports(sla_deadline) WHERE status = 'submitted';

-- ============================================================
-- MODERATION ACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES user_reports(id),
  product_id UUID REFERENCES products(id),
  
  action VARCHAR(50) NOT NULL, -- review_started, resolved, dismissed, escalated, tier_changed
  actor_id UUID NOT NULL, -- Admin user ID
  notes TEXT,
  
  -- State changes
  old_status report_status,
  new_status report_status,
  old_tier verification_tier,
  new_tier verification_tier,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_report ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_product ON moderation_actions(product_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actor ON moderation_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_moderation_created ON moderation_actions(created_at);
