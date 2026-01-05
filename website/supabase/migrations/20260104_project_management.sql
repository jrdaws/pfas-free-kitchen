-- Migration: Project Management Enhancement
-- Created: 2026-01-04
-- Purpose: Adds project versions, pages, component slots, and generation history
--          for the admin dashboard multi-page preview system

-- =============================================================================
-- TABLE: project_versions
-- Stores version snapshots for project rollback
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT, -- Optional version name like "v1.0 Launch Ready"
  snapshot JSONB NOT NULL, -- Full project state snapshot
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure version numbers are unique per project
  UNIQUE(project_id, version_number)
);

-- Indexes for project_versions
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_project_versions_created_at ON project_versions(created_at DESC);

-- Enable RLS
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can access versions of projects they own
CREATE POLICY "Users can view own project versions" ON project_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_versions.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for own projects" ON project_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_versions.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete versions of own projects" ON project_versions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_versions.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TABLE: project_pages
-- Stores page hierarchy within projects
-- =============================================================================

CREATE TYPE page_type AS ENUM ('page', 'layout', 'api', 'component');

CREATE TABLE IF NOT EXISTS project_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_pages(id) ON DELETE SET NULL, -- For nested layouts
  
  -- Page identity
  name TEXT NOT NULL,
  path TEXT NOT NULL, -- e.g., "/dashboard", "/products/[id]"
  page_type page_type DEFAULT 'page',
  
  -- Page configuration
  is_protected BOOLEAN DEFAULT FALSE, -- Requires authentication
  is_dynamic BOOLEAN DEFAULT FALSE, -- Has dynamic segments like [id]
  layout_id UUID REFERENCES project_pages(id), -- Which layout this page uses
  
  -- Page content/structure
  meta JSONB DEFAULT '{}'::jsonb, -- title, description, og tags
  components JSONB DEFAULT '[]'::jsonb, -- Component structure
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_pages
CREATE INDEX idx_project_pages_project_id ON project_pages(project_id);
CREATE INDEX idx_project_pages_parent_id ON project_pages(parent_id);
CREATE INDEX idx_project_pages_path ON project_pages(project_id, path);
CREATE INDEX idx_project_pages_sort ON project_pages(project_id, sort_order);

-- Unique path per project
CREATE UNIQUE INDEX idx_project_pages_unique_path ON project_pages(project_id, path);

-- Enable RLS
ALTER TABLE project_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for pages
CREATE POLICY "Users can view own project pages" ON project_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_pages.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pages in own projects" ON project_pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_pages.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project pages" ON project_pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_pages.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project pages" ON project_pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = project_pages.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_project_pages_updated_at
  BEFORE UPDATE ON project_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: component_slots
-- AI generation slots per page - defines what AI should generate
-- =============================================================================

CREATE TYPE slot_status AS ENUM ('empty', 'generating', 'generated', 'error');

CREATE TABLE IF NOT EXISTS component_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES project_pages(id) ON DELETE CASCADE,
  
  -- Slot identity
  name TEXT NOT NULL, -- e.g., "hero", "features", "pricing"
  slot_type TEXT NOT NULL, -- Component type: "Hero", "FeatureGrid", "PricingTable"
  
  -- Slot configuration
  position INTEGER DEFAULT 0, -- Order in the page
  config JSONB DEFAULT '{}'::jsonb, -- Component-specific config
  
  -- AI generation
  prompt TEXT, -- Custom generation prompt
  generated_props JSONB, -- AI-generated component props
  generated_html TEXT, -- Cached HTML output
  status slot_status DEFAULT 'empty',
  
  -- Generation metadata
  generation_model TEXT, -- e.g., "claude-3-opus"
  generation_tokens INTEGER,
  generation_cost DECIMAL(10, 6),
  generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for component_slots
CREATE INDEX idx_component_slots_page_id ON component_slots(page_id);
CREATE INDEX idx_component_slots_position ON component_slots(page_id, position);
CREATE INDEX idx_component_slots_status ON component_slots(status);

-- Enable RLS
ALTER TABLE component_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for slots (through page → project chain)
CREATE POLICY "Users can view own component slots" ON component_slots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_pages pp
      JOIN user_projects up ON up.id = pp.project_id
      WHERE pp.id = component_slots.page_id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create slots in own pages" ON component_slots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_pages pp
      JOIN user_projects up ON up.id = pp.project_id
      WHERE pp.id = component_slots.page_id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own component slots" ON component_slots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_pages pp
      JOIN user_projects up ON up.id = pp.project_id
      WHERE pp.id = component_slots.page_id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own component slots" ON component_slots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_pages pp
      JOIN user_projects up ON up.id = pp.project_id
      WHERE pp.id = component_slots.page_id 
      AND up.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_component_slots_updated_at
  BEFORE UPDATE ON component_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: generation_history
-- Track all AI generations for audit and rollback
-- =============================================================================

CREATE TYPE generation_type AS ENUM ('page', 'component', 'full_preview', 'export');

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  page_id UUID REFERENCES project_pages(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES component_slots(id) ON DELETE SET NULL,
  
  -- Generation details
  generation_type generation_type NOT NULL,
  prompt TEXT,
  input_config JSONB, -- What was sent to AI
  output_result JSONB, -- What AI returned
  
  -- Metadata
  model TEXT NOT NULL, -- e.g., "claude-3-opus-20240229"
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10, 6),
  duration_ms INTEGER,
  
  -- Status
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for generation_history
CREATE INDEX idx_generation_history_project_id ON generation_history(project_id);
CREATE INDEX idx_generation_history_page_id ON generation_history(page_id);
CREATE INDEX idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX idx_generation_history_type ON generation_history(generation_type);

-- Enable RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for generation history
CREATE POLICY "Users can view own generation history" ON generation_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = generation_history.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create generation history for own projects" ON generation_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_projects 
      WHERE user_projects.id = generation_history.project_id 
      AND user_projects.user_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS: Auto-versioning helper
-- =============================================================================

-- Get next version number for a project
CREATE OR REPLACE FUNCTION get_next_version_number(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM project_versions
  WHERE project_id = p_project_id;
  
  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- Create a project snapshot
CREATE OR REPLACE FUNCTION create_project_snapshot(p_project_id UUID, p_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_version_id UUID;
  snapshot_data JSONB;
BEGIN
  -- Build snapshot with project config and all pages
  SELECT jsonb_build_object(
    'project', (SELECT to_jsonb(up.*) FROM user_projects up WHERE up.id = p_project_id),
    'pages', (
      SELECT COALESCE(jsonb_agg(to_jsonb(pp.*)), '[]'::jsonb)
      FROM project_pages pp WHERE pp.project_id = p_project_id
    ),
    'slots', (
      SELECT COALESCE(jsonb_agg(to_jsonb(cs.*)), '[]'::jsonb)
      FROM component_slots cs
      JOIN project_pages pp ON pp.id = cs.page_id
      WHERE pp.project_id = p_project_id
    )
  ) INTO snapshot_data;
  
  -- Insert version
  INSERT INTO project_versions (project_id, version_number, name, snapshot, created_by)
  VALUES (
    p_project_id,
    get_next_version_number(p_project_id),
    p_name,
    snapshot_data,
    auth.uid()
  )
  RETURNING id INTO new_version_id;
  
  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS: Documentation
-- =============================================================================

COMMENT ON TABLE project_versions IS 'Version snapshots for project rollback. Each version captures the full project state.';
COMMENT ON TABLE project_pages IS 'Page hierarchy within projects. Supports nesting via parent_id and layouts.';
COMMENT ON TABLE component_slots IS 'AI generation slots per page. Each slot represents a component that AI can generate.';
COMMENT ON TABLE generation_history IS 'Audit log of all AI generations with costs and tokens.';

COMMENT ON COLUMN project_pages.path IS 'URL path for the page, e.g., "/dashboard" or "/products/[id]"';
COMMENT ON COLUMN project_pages.is_protected IS 'If true, page requires authentication';
COMMENT ON COLUMN project_pages.is_dynamic IS 'If true, page has dynamic segments like [id] or [...slug]';
COMMENT ON COLUMN component_slots.slot_type IS 'Component type from the registry, e.g., "Hero", "FeatureGrid"';
COMMENT ON COLUMN component_slots.generated_props IS 'AI-generated props that can be passed to the component';

