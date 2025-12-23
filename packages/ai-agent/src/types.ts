// Model tier selection for cost/quality tradeoff
export type ModelTier = 'fast' | 'balanced' | 'quality';

// Core Input Types
export interface ProjectInput {
  description: string;
  template?: string; // Optional: user can suggest template
  projectName?: string;
  vision?: string;
  mission?: string;
  inspirations?: Inspiration[];
}

export interface Inspiration {
  type: 'url' | 'image' | 'figma';
  value: string;
  preview?: string;
}

// Intent Analysis Output
export interface ProjectIntent {
  category: 'saas' | 'landing-page' | 'dashboard' | 'blog' | 'directory' | 'ecommerce';
  confidence: number; // 0-1
  reasoning: string;
  suggestedTemplate: string;
  features: string[]; // Extracted feature requests
  integrations: IntegrationRequirements;
  complexity: 'simple' | 'moderate' | 'complex';
  keyEntities: string[]; // e.g., ["User", "Product", "Order"]
}

export interface IntegrationRequirements {
  auth?: 'supabase' | 'clerk' | null;
  payments?: 'stripe' | 'paddle' | null;
  email?: 'resend' | 'sendgrid' | null;
  db?: 'supabase' | 'planetscale' | null;
  ai?: 'openai' | 'anthropic' | null;
  analytics?: 'posthog' | 'plausible' | null;
}

// Architecture Output
export interface ProjectArchitecture {
  template: string;
  pages: PageDefinition[];
  components: ComponentDefinition[];
  integrations: IntegrationRequirements;
  routes: RouteDefinition[];
}

export interface PageDefinition {
  path: string; // e.g., "/dashboard"
  name: string; // e.g., "Dashboard"
  description: string;
  components: string[]; // References to component names
  layout?: 'default' | 'auth' | 'dashboard';
}

export interface ComponentDefinition {
  name: string; // e.g., "PricingCard"
  type: 'ui' | 'feature' | 'layout';
  description: string;
  props?: Record<string, string>; // prop name -> type
  template: 'create-new' | 'use-existing'; // Whether to generate or use template default
}

export interface RouteDefinition {
  path: string;
  type: 'page' | 'api';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
}

// Code Generation Output
export interface GeneratedCode {
  files: FileDefinition[];
  integrationCode: IntegrationCode[];
}

export interface FileDefinition {
  path: string; // Relative to project root
  content: string;
  overwrite: boolean; // If false, only create if doesn't exist
}

export interface IntegrationCode {
  integration: string; // e.g., "auth.supabase"
  files: FileDefinition[];
}

// Cursor Context Output
export interface CursorContext {
  cursorrules: string; // .cursorrules file content
  startPrompt: string; // START_PROMPT.md content
}

// LLM Types
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export interface LLMResponse {
  id: string;
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Error Types
export interface AIAgentError {
  code: string;
  message: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

// Template Types
export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  minFrameworkVersion: string;
  capabilities: string[];
  dependencies: Record<string, string>;
  features: string[];
  supportedIntegrations: Record<string, string[]>;
  defaultIntegrations: Record<string, string>;
  requiredIntegrations: string[];
  license: string;
}
