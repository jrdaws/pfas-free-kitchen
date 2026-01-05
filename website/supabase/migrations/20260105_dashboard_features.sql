-- Dashboard Features Schema
-- Migration: 20260105_dashboard_features
-- Tables: exports, templates, webhooks, activity_log, api_keys

-- ============================================
-- EXPORTS TABLE
-- Track all project export history
-- ============================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  format TEXT NOT NULL DEFAULT 'zip' CHECK (format IN ('zip', 'github', 'vercel')),
  file_size BIGINT DEFAULT 0,
  integrations TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  download_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RLS for exports
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports"
  ON exports FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_created_at ON exports(created_at DESC);

-- ============================================
-- TEMPLATES TABLE
-- User-saved project templates
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_template TEXT NOT NULL,
  integrations TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  uses INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = true;

-- ============================================
-- WEBHOOKS TABLE
-- User-configured webhook endpoints
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  last_status TEXT CHECK (last_status IN ('success', 'failed') OR last_status IS NULL),
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhooks"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);

-- ============================================
-- WEBHOOK DELIVERIES TABLE
-- Track webhook delivery attempts
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for webhook_deliveries
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_deliveries.webhook_id 
      AND webhooks.user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);

-- ============================================
-- ACTIVITY LOG TABLE
-- Audit trail of all user actions
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log(type);

-- ============================================
-- API KEYS TABLE
-- Encrypted storage for user API keys
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  -- Key is encrypted at rest using Supabase's pgsodium extension
  encrypted_key TEXT NOT NULL,
  key_preview TEXT NOT NULL, -- First/last few chars for display
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'invalid')),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_provider ON api_keys(provider);

-- ============================================
-- USAGE TRACKING TABLE
-- Track user usage for billing
-- ============================================
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  exports_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- RLS for usage
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_usage_period ON usage(period_start, period_end);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_type TEXT,
  p_action TEXT,
  p_details TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, type, action, details, metadata)
  VALUES (auth.uid(), p_type, p_action, p_details, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment template uses
CREATE OR REPLACE FUNCTION increment_template_uses(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates 
  SET uses = uses + 1, updated_at = now()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update usage counts
CREATE OR REPLACE FUNCTION update_usage(
  p_exports INTEGER DEFAULT 0,
  p_projects INTEGER DEFAULT 0,
  p_api_calls INTEGER DEFAULT 0,
  p_storage BIGINT DEFAULT 0
)
RETURNS void AS $$
DECLARE
  v_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end DATE := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
  INSERT INTO usage (user_id, period_start, period_end, exports_count, projects_count, api_calls_count, storage_bytes)
  VALUES (auth.uid(), v_period_start, v_period_end, p_exports, p_projects, p_api_calls, p_storage)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    exports_count = usage.exports_count + p_exports,
    projects_count = usage.projects_count + p_projects,
    api_calls_count = usage.api_calls_count + p_api_calls,
    storage_bytes = usage.storage_bytes + p_storage,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

