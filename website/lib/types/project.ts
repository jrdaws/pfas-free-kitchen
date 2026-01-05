/**
 * Project Management Types
 * 
 * Type definitions for the multi-project dashboard, page management,
 * component slots, and generation history.
 */

// =============================================================================
// Enums (matching database enums)
// =============================================================================

export type ProjectStatus = 'draft' | 'active' | 'archived';
export type PageType = 'page' | 'layout' | 'api' | 'component';
export type SlotStatus = 'empty' | 'generating' | 'generated' | 'error';
export type GenerationType = 'page' | 'component' | 'full_preview' | 'export';

// =============================================================================
// User Projects (Extended from existing)
// =============================================================================

export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  template: string | null;
  features: string[];
  integrations: Record<string, string>;
  tool_status: ToolStatus;
  supabase_project_id: string | null;
  npx_token: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  
  // Extended fields (from OAuth migration)
  connected_accounts?: ConnectedAccounts;
  project_config?: ProjectConfig;
  ai_config?: AIConfig;
  feedback_notes?: string;
}

export interface ToolStatus {
  cursor: boolean;
  github: boolean;
  supabase: boolean;
  vercel: boolean;
}

export interface ConnectedAccounts {
  github_username?: string;
  github_repo?: string;
  supabase_ref?: string;
  vercel_project?: string;
  vercel_team?: string;
}

export interface ProjectConfig {
  colorScheme?: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  vision?: string;
  domain?: string;
}

export interface AIConfig {
  provider?: string;
  model?: string;
  temperature?: number;
}

// =============================================================================
// Project Versions
// =============================================================================

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  name: string | null;
  snapshot: ProjectSnapshot;
  created_by: string | null;
  created_at: string;
}

export interface ProjectSnapshot {
  project: UserProject;
  pages: ProjectPage[];
  slots: ComponentSlot[];
}

export interface CreateVersionInput {
  name?: string;
}

// =============================================================================
// Project Pages
// =============================================================================

export interface ProjectPage {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  page_type: PageType;
  is_protected: boolean;
  is_dynamic: boolean;
  layout_id: string | null;
  meta: PageMeta;
  components: PageComponent[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface PageComponent {
  id: string;
  type: string; // Component type from registry
  props?: Record<string, unknown>;
  children?: PageComponent[];
}

export interface CreatePageInput {
  name: string;
  path: string;
  page_type?: PageType;
  parent_id?: string;
  is_protected?: boolean;
  is_dynamic?: boolean;
  layout_id?: string;
  meta?: PageMeta;
  components?: PageComponent[];
  sort_order?: number;
}

export interface UpdatePageInput {
  name?: string;
  path?: string;
  page_type?: PageType;
  parent_id?: string | null;
  is_protected?: boolean;
  is_dynamic?: boolean;
  layout_id?: string | null;
  meta?: PageMeta;
  components?: PageComponent[];
  sort_order?: number;
}

export interface ReorderPagesInput {
  pages: { id: string; sort_order: number }[];
}

// =============================================================================
// Component Slots
// =============================================================================

export interface ComponentSlot {
  id: string;
  page_id: string;
  name: string;
  slot_type: string;
  position: number;
  config: Record<string, unknown>;
  prompt: string | null;
  generated_props: Record<string, unknown> | null;
  generated_html: string | null;
  status: SlotStatus;
  generation_model: string | null;
  generation_tokens: number | null;
  generation_cost: number | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSlotInput {
  name: string;
  slot_type: string;
  position?: number;
  config?: Record<string, unknown>;
  prompt?: string;
}

export interface UpdateSlotInput {
  name?: string;
  slot_type?: string;
  position?: number;
  config?: Record<string, unknown>;
  prompt?: string;
  status?: SlotStatus;
}

// =============================================================================
// Generation History
// =============================================================================

export interface GenerationHistory {
  id: string;
  project_id: string;
  page_id: string | null;
  slot_id: string | null;
  generation_type: GenerationType;
  prompt: string | null;
  input_config: Record<string, unknown> | null;
  output_result: Record<string, unknown> | null;
  model: string;
  tokens_input: number | null;
  tokens_output: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface CreateGenerationInput {
  page_id?: string;
  slot_id?: string;
  generation_type: GenerationType;
  prompt?: string;
  input_config?: Record<string, unknown>;
  output_result?: Record<string, unknown>;
  model: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_usd?: number;
  duration_ms?: number;
  success?: boolean;
  error_message?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Project list with summary stats
export interface ProjectWithStats extends UserProject {
  page_count: number;
  generation_count: number;
  last_generated_at: string | null;
}

// Page with nested slots
export interface PageWithSlots extends ProjectPage {
  slots: ComponentSlot[];
}

// Full project data for dashboard
export interface FullProjectData {
  project: UserProject;
  pages: PageWithSlots[];
  versions: ProjectVersion[];
  recent_generations: GenerationHistory[];
}

// =============================================================================
// Input Types for API
// =============================================================================

export interface CreateProjectInput {
  name: string;
  description?: string;
  template?: string;
  features?: string[];
  integrations?: Record<string, string>;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  template?: string;
  features?: string[];
  integrations?: Record<string, string>;
  tool_status?: Partial<ToolStatus>;
  status?: ProjectStatus;
  project_config?: ProjectConfig;
  ai_config?: AIConfig;
}

// =============================================================================
// Export Types
// =============================================================================

export interface ExportOptions {
  format: 'zip' | 'git';
  includeEnvExample: boolean;
  includeDocs: boolean;
  branch?: string;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  files?: string[];
}

