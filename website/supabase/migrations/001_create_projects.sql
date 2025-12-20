-- Create projects table for storing configured projects
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

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_token ON projects(token);

-- Create index on created_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON projects(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access for projects (anyone with token can read)
CREATE POLICY "Allow public read access" ON projects
  FOR SELECT
  USING (true);

-- Allow public insert (anyone can save a project)
CREATE POLICY "Allow public insert" ON projects
  FOR INSERT
  WITH CHECK (true);

-- Function to clean up expired projects (run as cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_projects()
RETURNS void AS $$
BEGIN
  DELETE FROM projects
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Update last_accessed_at on read (optional, for analytics)
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_accessed_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_last_accessed();
