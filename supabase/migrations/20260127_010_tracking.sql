-- Migration: 010_tracking.sql
-- Purpose: Affiliate click tracking

-- ============================================================
-- AFFILIATE CLICK TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  
  -- Anonymous tracking
  session_id VARCHAR(64),
  referrer_page VARCHAR(500),
  user_agent_hash VARCHAR(64),
  
  -- Bot detection
  is_bot BOOLEAN DEFAULT FALSE,
  bot_detection_reason VARCHAR(100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics and reporting
CREATE INDEX IF NOT EXISTS idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_clicks_retailer ON affiliate_clicks(retailer_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON affiliate_clicks(session_id);

-- Note: For large-scale deployment, consider partitioning by month:
-- CREATE TABLE affiliate_clicks_2026_01 PARTITION OF affiliate_clicks
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
