-- Migration: User Projects Schema for My Projects Dashboard
-- Created: 2025-12-24
-- Purpose: Adds user-owned projects table with RLS for 5DaySprint clone

-- Create project status enum
CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_slug ON user_projects(slug);
CREATE INDEX idx_user_projects_npx_token ON user_projects(npx_token);
CREATE INDEX idx_user_projects_status ON user_projects(status);
CREATE INDEX idx_user_projects_created_at ON user_projects(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects

-- SELECT: Users can read their own projects
CREATE POLICY "Users can view own projects" ON user_projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create projects for themselves
CREATE POLICY "Users can create own projects" ON user_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own projects
CREATE POLICY "Users can update own projects" ON user_projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON user_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique slug from name
CREATE OR REPLACE FUNCTION generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug: lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(project_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug, 1, 50); -- Limit length
  
  final_slug := base_slug;
  
  -- Ensure uniqueness by appending counter if needed
  WHILE EXISTS (SELECT 1 FROM user_projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate npx token
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
    
    -- Check uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM user_projects WHERE npx_token = token);
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug and npx_token on insert
CREATE OR REPLACE FUNCTION auto_generate_project_identifiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_project_slug(NEW.name);
  END IF;
  
  -- Generate npx_token if not provided
  IF NEW.npx_token IS NULL OR NEW.npx_token = '' THEN
    NEW.npx_token := generate_npx_token();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_project_identifiers_trigger
  BEFORE INSERT ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_project_identifiers();

-- Comment on table for documentation
COMMENT ON TABLE user_projects IS 'User-owned projects for the My Projects dashboard. Each project belongs to exactly one user.';
COMMENT ON COLUMN user_projects.features IS 'Selected core features as JSON array, e.g. ["auth", "payments", "analytics"]';
COMMENT ON COLUMN user_projects.integrations IS 'Selected integrations as JSON object, e.g. {"auth": "supabase", "payments": "stripe"}';
COMMENT ON COLUMN user_projects.tool_status IS 'Connected tool status: cursor, github, claude, supabase, vercel';
COMMENT ON COLUMN user_projects.npx_token IS 'Unique token for CLI command: npx @5ds/framework {token}';

