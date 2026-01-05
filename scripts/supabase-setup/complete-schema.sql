-- ============================================================
-- Dawson-Does Framework - Complete Database Schema
-- ============================================================
-- 
-- Run this entire file in Supabase SQL Editor to set up your database.
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
--
-- This creates:
-- 1. projects table (anonymous project storage with tokens)
-- 2. user_projects table (authenticated user projects)
-- 3. connected_services table (OAuth tokens for GitHub, Supabase, Vercel)
-- 4. feedback table (user feedback collection)
-- 5. All necessary indexes, RLS policies, and triggers
--
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PART 1: Anonymous Projects (token-based access)
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  template TEXT NOT NULL,
  project_name TEXT NOT NULL,
  output_dir TEXT NOT NULL DEFAULT './my-app',
  integrations JSONB NOT NULL DEFAULT '{}',
  env_keys JSONB DEFAULT '{}',
  vision TEXT,
  mission TEXT,
  success_criteria TEXT,
  inspirations JSONB DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_token ON projects(token);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON projects(expires_at);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies (public access for anonymous projects)
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON projects FOR INSERT WITH CHECK (true);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_projects()
RETURNS void AS $$
BEGIN
  DELETE FROM projects WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 2: User Projects (authenticated access)
-- ============================================================

-- Create project status enum
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_projects table
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  template TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  integrations JSONB DEFAULT '{}'::jsonb,
  tool_status JSONB DEFAULT '{
    "cursor": false,
    "github": false,
    "claude": false,
    "supabase": false,
    "vercel": false
  }'::jsonb,
  supabase_project_id TEXT,
  npx_token TEXT UNIQUE,
  status project_status DEFAULT 'draft',
  connected_accounts JSONB DEFAULT '{}'::jsonb,
  project_config JSONB DEFAULT '{}'::jsonb,
  ai_config JSONB DEFAULT '{}'::jsonb,
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_slug ON user_projects(slug);
CREATE INDEX IF NOT EXISTS idx_user_projects_npx_token ON user_projects(npx_token);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);
CREATE INDEX IF NOT EXISTS idx_user_projects_created_at ON user_projects(created_at DESC);

-- Enable RLS
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects" ON user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON user_projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON user_projects FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_projects_updated_at ON user_projects;
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Slug generator function
CREATE OR REPLACE FUNCTION generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(project_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug, 1, 50);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM user_projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- NPX token generator
CREATE OR REPLACE FUNCTION generate_npx_token()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY['fast', 'bright', 'smart', 'cool', 'bold', 'swift', 'keen', 'wise', 'true', 'pure'];
  nouns TEXT[] := ARRAY['lion', 'eagle', 'wolf', 'bear', 'hawk', 'fox', 'tiger', 'shark', 'raven', 'dragon'];
  token TEXT;
BEGIN
  LOOP
    token := adjectives[1 + floor(random() * array_length(adjectives, 1))] || '-' ||
             nouns[1 + floor(random() * array_length(nouns, 1))] || '-' ||
             lpad(floor(random() * 10000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM user_projects WHERE npx_token = token);
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slug and token trigger
CREATE OR REPLACE FUNCTION auto_generate_project_identifiers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_project_slug(NEW.name);
  END IF;
  IF NEW.npx_token IS NULL OR NEW.npx_token = '' THEN
    NEW.npx_token := generate_npx_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_project_identifiers_trigger ON user_projects;
CREATE TRIGGER auto_generate_project_identifiers_trigger
  BEFORE INSERT ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_project_identifiers();

-- ============================================================
-- PART 3: Connected Services (OAuth tokens)
-- ============================================================

CREATE TABLE IF NOT EXISTS connected_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'github', 'supabase', 'vercel'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

-- Enable RLS
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own connected services" ON connected_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own connected services" ON connected_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connected services" ON connected_services FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own connected services" ON connected_services FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_connected_services_updated_at ON connected_services;
CREATE TRIGGER update_connected_services_updated_at
  BEFORE UPDATE ON connected_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connected_services_user_id ON connected_services(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_services_service_type ON connected_services(service_type);

-- ============================================================
-- PART 4: Feedback Table
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  project_config JSONB,
  generation_tier VARCHAR(20) CHECK (generation_tier IN ('fast', 'balanced', 'quality')),
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created ON feedback (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback (rating);
CREATE INDEX IF NOT EXISTS idx_feedback_tier ON feedback (generation_tier) WHERE generation_tier IS NOT NULL;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Run this to verify all tables were created:
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('projects', 'user_projects', 'connected_services', 'feedback')
ORDER BY table_name;

-- Expected output:
-- projects           | 14
-- user_projects      | 17
-- connected_services | 9
-- feedback           | 6


