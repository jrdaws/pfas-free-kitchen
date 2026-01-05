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
  /** Website analysis data from inspiration site */
  websiteAnalysis?: {
    url: string;
    timestamp: string;
    features: Record<string, Record<string, boolean | Record<string, boolean>>>;
    visual: {
      colors: {
        primary: string;
        secondary?: string;
        accent?: string;
        background: string;
        foreground: string;
        muted?: string;
        border?: string;
      };
      typography: {
        headingFont: string;
        bodyFont: string;
        baseFontSize?: string;
      };
      components: {
        buttons: { shape: 'rounded' | 'pill' | 'square'; style: 'filled' | 'outline' | 'ghost' };
        cards: { shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'; rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' };
        inputs: { style: 'filled' | 'outline' | 'underline'; rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' };
      };
      darkMode?: boolean;
    };
    structure: {
      pages: Array<{
        url: string;
        title: string;
        sections: Array<{
          type: string;
          variant?: string;
          order: number;
        }>;
      }>;
      navigation: Array<{
        label: string;
        href: string;
        children?: Array<{ label: string; href: string }>;
      }>;
      footer?: {
        columns: Array<{
          title: string;
          links: Array<{ label: string; href: string }>;
        }>;
      };
    };
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

