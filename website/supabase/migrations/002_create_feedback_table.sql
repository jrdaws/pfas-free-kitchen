-- Migration: Create feedback table
-- Created: 2025-12-24
-- Purpose: Store user feedback for Phase 2 development prioritization

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  project_config JSONB,
  generation_tier VARCHAR(20) CHECK (generation_tier IN ('fast', 'balanced', 'quality')),
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limiting queries (IP + time)
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created 
ON feedback (ip_hash, created_at DESC);

-- Index for analytics (rating distribution)
CREATE INDEX IF NOT EXISTS idx_feedback_rating 
ON feedback (rating);

-- Index for tier analysis
CREATE INDEX IF NOT EXISTS idx_feedback_tier 
ON feedback (generation_tier) 
WHERE generation_tier IS NOT NULL;

-- Row Level Security (optional - for production)
-- ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow insert from API" ON feedback FOR INSERT WITH CHECK (true);

COMMENT ON TABLE feedback IS 'User feedback collected from the configurator';
COMMENT ON COLUMN feedback.ip_hash IS 'SHA256 hash of IP for rate limiting (privacy-preserving)';
COMMENT ON COLUMN feedback.project_config IS 'JSON snapshot of project configuration at feedback time';
COMMENT ON COLUMN feedback.generation_tier IS 'Model tier used: fast, balanced, or quality';

