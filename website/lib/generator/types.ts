/**
 * Generator Types
 * 
 * Types for the project generation system.
 */

export type IntegrationCategory =
  | "auth"
  | "payments"
  | "email"
  | "analytics"
  | "database"
  | "ai"
  | "storage"
  | "search"
  | "monitoring"
  | "cms"
  | "notifications"
  | "backgroundJobs"
  | "featureFlags"
  | "imageOpt";

export type FeatureCategory =
  | "user-management"
  | "product-database"
  | "search-filter"
  | "ecommerce"
  | "marketplace"
  | "analytics"
  | "billing"
  | "enterprise";

export interface ProjectConfig {
  projectName: string;
  description: string;
  template: string;
  vision?: string;
  mission?: string;
  integrations: Partial<Record<IntegrationCategory, string>>;
  features: string[];
  branding: {
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  overwrite: boolean;
}

export interface GeneratedProject {
  files: GeneratedFile[];
  packageJson: {
    name: string;
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  };
  envTemplate: string;
  readme: string;
  setupInstructions: string[];
  warnings: string[];
}

export interface IntegrationManifest {
  id: string;
  name: string;
  category: IntegrationCategory;
  version: string;
  description: string;
  files: {
    path: string;
    template: string;
    transform?: "mustache" | "none";
    overwrite?: boolean;
  }[];
  dependencies: {
    npm: Record<string, string>;
    npmDev?: Record<string, string>;
    env: {
      name: string;
      description: string;
      required: boolean;
      example?: string;
      public?: boolean;
    }[];
    integrations?: string[];
  };
  postInstall?: string[];
  mergeInto?: {
    file: string;
    type: "import" | "provider" | "export" | "append";
    content: string;
    position?: "wrap-children" | "before" | "after";
  }[];
}

export interface FeatureManifest {
  id: string;
  name: string;
  category: FeatureCategory;
  version: string;
  description: string;
  files: {
    path: string;
    template: string;
    transform?: "mustache" | "none";
  }[];
  dependencies: {
    npm: Record<string, string>;
    npmDev?: Record<string, string>;
    env?: {
      name: string;
      description: string;
      required: boolean;
      example?: string;
    }[];
    features?: string[];
    integrations?: string[];
  };
  previewComponent?: string;
  postInstall?: string[];
}

