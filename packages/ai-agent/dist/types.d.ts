export interface ProjectInput {
    description: string;
    template?: string;
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
export interface ProjectIntent {
    category: 'saas' | 'landing-page' | 'dashboard' | 'blog' | 'directory' | 'ecommerce';
    confidence: number;
    reasoning: string;
    suggestedTemplate: string;
    features: string[];
    integrations: IntegrationRequirements;
    complexity: 'simple' | 'moderate' | 'complex';
    keyEntities: string[];
}
export interface IntegrationRequirements {
    auth?: 'supabase' | 'clerk' | null;
    payments?: 'stripe' | 'paddle' | null;
    email?: 'resend' | 'sendgrid' | null;
    db?: 'supabase' | 'planetscale' | null;
    ai?: 'openai' | 'anthropic' | null;
    analytics?: 'posthog' | 'plausible' | null;
}
export interface ProjectArchitecture {
    template: string;
    pages: PageDefinition[];
    components: ComponentDefinition[];
    integrations: IntegrationRequirements;
    routes: RouteDefinition[];
}
export interface PageDefinition {
    path: string;
    name: string;
    description: string;
    components: string[];
    layout?: 'default' | 'auth' | 'dashboard';
}
export interface ComponentDefinition {
    name: string;
    type: 'ui' | 'feature' | 'layout';
    description: string;
    props?: Record<string, string>;
    template: 'create-new' | 'use-existing';
}
export interface RouteDefinition {
    path: string;
    type: 'page' | 'api';
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    description: string;
}
export interface GeneratedCode {
    files: FileDefinition[];
    integrationCode: IntegrationCode[];
}
export interface FileDefinition {
    path: string;
    content: string;
    overwrite: boolean;
}
export interface IntegrationCode {
    integration: string;
    files: FileDefinition[];
}
export interface CursorContext {
    cursorrules: string;
    startPrompt: string;
}
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
export interface AIAgentError {
    code: string;
    message: string;
    retryable: boolean;
    context?: Record<string, unknown>;
}
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
//# sourceMappingURL=types.d.ts.map