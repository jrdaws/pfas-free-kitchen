-- Migration: OAuth Connections for User Projects
-- Created: 2025-12-24
-- Purpose: Adds connected_accounts storage for GitHub, Supabase, Vercel OAuth tokens
-- Dependency: 20251224_user_projects.sql

-- Add connected_accounts column for OAuth tokens
ALTER TABLE user_projects 
ADD COLUMN IF NOT EXISTS connected_accounts JSONB DEFAULT '{}'::jsonb;

-- Add project_config column for full configurator state
ALTER TABLE user_projects 
ADD COLUMN IF NOT EXISTS project_config JSONB DEFAULT '{}'::jsonb;

-- Add ai_config column for AI provider selections
ALTER TABLE user_projects 
ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{}'::jsonb;

-- Add feedback_notes column for user feedback/custom requests
ALTER TABLE user_projects 
ADD COLUMN IF NOT EXISTS feedback_notes TEXT;

-- Create separate table for connected service accounts (OAuth tokens)
-- This is separate from user_projects to allow reuse across projects
CREATE TABLE IF NOT EXISTS connected_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'github', 'supabase', 'vercel'
  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}'::jsonb, -- Service-specific data (username, orgs, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One connection per service type per user
  UNIQUE(user_id, service_type)
);

-- Enable RLS on connected_services
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_services
CREATE POLICY "Users can view own connected services" ON connected_services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connected services" ON connected_services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected services" ON connected_services
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected services" ON connected_services
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_connected_services_updated_at
  BEFORE UPDATE ON connected_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for connected_services
CREATE INDEX idx_connected_services_user_id ON connected_services(user_id);
CREATE INDEX idx_connected_services_service_type ON connected_services(service_type);

-- Comments
COMMENT ON TABLE connected_services IS 'OAuth tokens for connected services (GitHub, Supabase, Vercel). Tokens should be encrypted in production.';
COMMENT ON COLUMN user_projects.connected_accounts IS 'Quick reference to connected services for this project (e.g., {"github_repo": "user/repo", "supabase_project": "abc123"})';
COMMENT ON COLUMN user_projects.project_config IS 'Full configurator state snapshot for persistence';
COMMENT ON COLUMN user_projects.ai_config IS 'AI provider configuration (e.g., {"language": "anthropic", "image": "openai"})';
COMMENT ON COLUMN user_projects.feedback_notes IS 'User feedback/custom feature requests';

