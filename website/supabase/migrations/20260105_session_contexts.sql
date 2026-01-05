-- Session Contexts Table
-- Stores AI context memory for persistent sessions

CREATE TABLE IF NOT EXISTS session_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Context data stored as JSONB for flexibility
  context JSONB NOT NULL DEFAULT '{}',
  
  -- Extracted understanding for quick queries
  project_name TEXT,
  project_type TEXT,
  target_audience TEXT,
  business_model TEXT,
  
  -- Confidence scores
  confidence_overall INTEGER DEFAULT 0,
  
  -- Tracking
  interaction_count INTEGER DEFAULT 0,
  correction_count INTEGER DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_session_contexts_project 
  ON session_contexts(project_id);

CREATE INDEX IF NOT EXISTS idx_session_contexts_user 
  ON session_contexts(user_id);

CREATE INDEX IF NOT EXISTS idx_session_contexts_last_active 
  ON session_contexts(last_active_at DESC);

-- Enable RLS
ALTER TABLE session_contexts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own contexts
CREATE POLICY "Users can view own contexts" ON session_contexts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contexts" ON session_contexts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contexts" ON session_contexts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contexts" ON session_contexts
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update timestamps and extracted fields
CREATE OR REPLACE FUNCTION update_session_context_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_active_at = now();
  
  -- Extract commonly queried fields from JSONB
  NEW.project_name = NEW.context->'understanding'->>'projectName';
  NEW.project_type = NEW.context->'understanding'->>'projectType';
  NEW.target_audience = NEW.context->'understanding'->>'targetAudience';
  NEW.business_model = NEW.context->'understanding'->>'businessModel';
  
  -- Update counts
  NEW.interaction_count = jsonb_array_length(COALESCE(NEW.context->'interactions', '[]'::jsonb));
  NEW.correction_count = jsonb_array_length(COALESCE(NEW.context->'corrections', '[]'::jsonb));
  
  -- Update confidence
  NEW.confidence_overall = COALESCE((NEW.context->'confidence'->>'overall')::integer, 0);
  
  -- Update completed steps
  NEW.completed_steps = ARRAY(
    SELECT jsonb_array_elements_text(COALESCE(NEW.context->'completedSteps', '[]'::jsonb))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update metadata
DROP TRIGGER IF EXISTS trigger_update_session_context_metadata ON session_contexts;
CREATE TRIGGER trigger_update_session_context_metadata
  BEFORE INSERT OR UPDATE ON session_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_session_context_metadata();

-- Function to get or create context for a project
CREATE OR REPLACE FUNCTION get_or_create_context(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_context_id UUID;
BEGIN
  -- Try to find existing context
  SELECT id INTO v_context_id
  FROM session_contexts
  WHERE project_id = p_project_id AND user_id = p_user_id
  LIMIT 1;
  
  -- Create if not found
  IF v_context_id IS NULL THEN
    INSERT INTO session_contexts (project_id, user_id, context)
    VALUES (
      p_project_id,
      p_user_id,
      jsonb_build_object(
        'understanding', jsonb_build_object(
          'projectType', 'saas',
          'keyFeatures', '[]'::jsonb,
          'designPreferences', jsonb_build_object('style', 'minimal', 'colors', '[]'::jsonb),
          'technicalRequirements', '[]'::jsonb
        ),
        'interactions', '[]'::jsonb,
        'corrections', '[]'::jsonb,
        'confidence', jsonb_build_object('overall', 0),
        'completedSteps', '[]'::jsonb
      )
    )
    RETURNING id INTO v_context_id;
  END IF;
  
  RETURN v_context_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record an interaction
CREATE OR REPLACE FUNCTION record_context_interaction(
  p_context_id UUID,
  p_type TEXT,
  p_input JSONB,
  p_output JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_interaction JSONB;
  v_context JSONB;
BEGIN
  -- Build interaction object
  v_interaction = jsonb_build_object(
    'id', gen_random_uuid()::text,
    'timestamp', now()::text,
    'type', p_type,
    'input', p_input,
    'output', p_output
  );
  
  -- Append to interactions array
  UPDATE session_contexts
  SET context = jsonb_set(
    context,
    '{interactions}',
    (COALESCE(context->'interactions', '[]'::jsonb) || v_interaction)
  )
  WHERE id = p_context_id
  RETURNING context INTO v_context;
  
  RETURN v_interaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to learn from a correction
CREATE OR REPLACE FUNCTION learn_correction(
  p_context_id UUID,
  p_field TEXT,
  p_original TEXT,
  p_corrected TEXT,
  p_correction_context TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_correction JSONB;
  v_context JSONB;
BEGIN
  -- Build correction object
  v_correction = jsonb_build_object(
    'id', gen_random_uuid()::text,
    'timestamp', now()::text,
    'field', p_field,
    'original', p_original,
    'corrected', p_corrected,
    'context', p_correction_context,
    'applied', true
  );
  
  -- Append to corrections array and update understanding
  UPDATE session_contexts
  SET context = jsonb_set(
    jsonb_set(
      context,
      '{corrections}',
      (COALESCE(context->'corrections', '[]'::jsonb) || v_correction)
    ),
    -- Also update the understanding field if it matches a known field
    CASE p_field
      WHEN 'projectName' THEN '{understanding,projectName}'
      WHEN 'projectType' THEN '{understanding,projectType}'
      WHEN 'targetAudience' THEN '{understanding,targetAudience}'
      WHEN 'problem' THEN '{understanding,problem}'
      WHEN 'businessModel' THEN '{understanding,businessModel}'
      ELSE '{understanding,projectName}' -- fallback, won't change if field doesn't match
    END,
    to_jsonb(p_corrected)
  )
  WHERE id = p_context_id
  RETURNING context INTO v_context;
  
  RETURN v_correction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old contexts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_contexts(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM session_contexts
  WHERE last_active_at < now() - (p_days || ' days')::interval;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE session_contexts IS 'Stores AI context memory for persistent configurator sessions';

