-- Export Feedback Table
-- Stores detailed feedback about exported projects for quality measurement

CREATE TABLE IF NOT EXISTS export_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project identification
  export_id TEXT,
  project_name TEXT NOT NULL,
  template TEXT NOT NULL,
  integrations JSONB DEFAULT '{}',
  
  -- Export outcome
  build_successful BOOLEAN NOT NULL,
  
  -- Quality ratings (1-5)
  preview_accuracy INTEGER NOT NULL CHECK (preview_accuracy >= 1 AND preview_accuracy <= 5),
  overall_satisfaction INTEGER NOT NULL CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  
  -- Issues encountered
  missing_files TEXT[] DEFAULT '{}',
  build_errors TEXT[] DEFAULT '{}',
  
  -- Free-form feedback
  what_was_missing TEXT,
  would_use_again BOOLEAN NOT NULL,
  
  -- Rate limiting
  ip_hash TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_export_feedback_created_at ON export_feedback(created_at);
CREATE INDEX idx_export_feedback_template ON export_feedback(template);
CREATE INDEX idx_export_feedback_build_successful ON export_feedback(build_successful);
CREATE INDEX idx_export_feedback_ip_hash ON export_feedback(ip_hash);

-- Row Level Security
ALTER TABLE export_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert feedback (rate limited by API)
CREATE POLICY "Allow insert export feedback"
  ON export_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only service role can read feedback (admin dashboard)
CREATE POLICY "Allow service role to read export feedback"
  ON export_feedback
  FOR SELECT
  TO service_role
  USING (true);

-- Comment
COMMENT ON TABLE export_feedback IS 'Stores user feedback about exported projects for quality measurement and improvement tracking';

