/**
 * Preview Fidelity Scoring
 * 
 * Measures how well the configurator preview matches the exported project.
 * Uses structural and visual comparison techniques.
 */

import * as fs from "fs";
import * as path from "path";

// Types
export interface FidelityScore {
  colorMatch: number;      // CSS variables match (0-100)
  componentMatch: number;  // Same components used (0-100)
  layoutMatch: number;     // Grid/flex structure (0-100)
  contentMatch: number;    // Text/images match (0-100)
  overall: number;         // Weighted average
  details: FidelityDetails;
}

export interface FidelityDetails {
  cssVariables: {
    expected: string[];
    found: string[];
    missing: string[];
    extra: string[];
  };
  components: {
    expected: string[];
    found: string[];
    missing: string[];
  };
  routes: {
    expected: string[];
    found: string[];
    missing: string[];
  };
  envVars: {
    expected: string[];
    documented: string[];
    missing: string[];
  };
}

// CSS variables that should match between preview and export
const CORE_CSS_VARIABLES = [
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--border",
  "--ring",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--muted",
  "--muted-foreground",
  "--radius",
];

// Core components that should exist in exported projects
const CORE_COMPONENTS = [
  "Nav",
  "Hero",
  "Footer",
  "FeatureCards",
  "CTA",
];

/**
 * Calculate fidelity score between preview config and exported project
 */
export function calculateFidelityScore(
  previewConfig: PreviewConfig,
  exportPath: string
): FidelityScore {
  const details: FidelityDetails = {
    cssVariables: { expected: [], found: [], missing: [], extra: [] },
    components: { expected: [], found: [], missing: [] },
    routes: { expected: [], found: [], missing: [] },
    envVars: { expected: [], documented: [], missing: [] },
  };

  // 1. Check CSS Variables
  const colorMatch = scoreCssVariables(previewConfig, exportPath, details);

  // 2. Check Components
  const componentMatch = scoreComponents(previewConfig, exportPath, details);

  // 3. Check Routes/Layout
  const layoutMatch = scoreRoutes(previewConfig, exportPath, details);

  // 4. Check Content (env vars documentation)
  const contentMatch = scoreEnvVars(previewConfig, exportPath, details);

  // Weighted average (components and layout most important)
  const overall = Math.round(
    colorMatch * 0.15 +
    componentMatch * 0.35 +
    layoutMatch * 0.35 +
    contentMatch * 0.15
  );

  return {
    colorMatch,
    componentMatch,
    layoutMatch,
    contentMatch,
    overall,
    details,
  };
}

interface PreviewConfig {
  template: string;
  integrations: Record<string, string>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

/**
 * Score CSS variable consistency
 */
function scoreCssVariables(
  config: PreviewConfig,
  exportPath: string,
  details: FidelityDetails
): number {
  const globalsPath = path.join(exportPath, "app", "globals.css");
  
  if (!fs.existsSync(globalsPath)) {
    details.cssVariables.expected = CORE_CSS_VARIABLES;
    details.cssVariables.missing = CORE_CSS_VARIABLES;
    return 0;
  }

  const content = fs.readFileSync(globalsPath, "utf-8");
  
  const found: string[] = [];
  const missing: string[] = [];

  for (const variable of CORE_CSS_VARIABLES) {
    if (content.includes(variable)) {
      found.push(variable);
    } else {
      missing.push(variable);
    }
  }

  // Check for branding color application
  if (config.branding?.primaryColor) {
    const expectedHsl = hexToHsl(config.branding.primaryColor);
    if (expectedHsl && content.includes(expectedHsl)) {
      found.push("--primary (branded)");
    }
  }

  details.cssVariables.expected = CORE_CSS_VARIABLES;
  details.cssVariables.found = found;
  details.cssVariables.missing = missing;

  return Math.round((found.length / CORE_CSS_VARIABLES.length) * 100);
}

/**
 * Score component presence
 */
function scoreComponents(
  config: PreviewConfig,
  exportPath: string,
  details: FidelityDetails
): number {
  const componentsDir = path.join(exportPath, "components");
  
  // Build expected components list based on template
  const expected = [...CORE_COMPONENTS];
  
  // Add integration-specific components
  if (config.integrations.auth) {
    expected.push("LoginForm", "SignupForm", "UserMenu");
  }
  if (config.integrations.payments) {
    expected.push("PricingTable", "CheckoutButton");
  }
  if (config.integrations.analytics) {
    expected.push("AnalyticsProvider");
  }

  const found: string[] = [];
  const missing: string[] = [];

  for (const component of expected) {
    const exists = findComponent(componentsDir, component);
    if (exists) {
      found.push(component);
    } else {
      missing.push(component);
    }
  }

  details.components.expected = expected;
  details.components.found = found;
  details.components.missing = missing;

  return expected.length > 0 
    ? Math.round((found.length / expected.length) * 100)
    : 100;
}

/**
 * Score route structure
 */
function scoreRoutes(
  config: PreviewConfig,
  exportPath: string,
  details: FidelityDetails
): number {
  const appDir = path.join(exportPath, "app");
  
  // Build expected routes based on template and integrations
  const expected: string[] = [
    "page.tsx",          // Home page
    "layout.tsx",        // Root layout
    "globals.css",       // Global styles
  ];

  // Template-specific routes
  if (config.template === "saas") {
    expected.push("pricing/page.tsx", "dashboard/page.tsx");
  }

  // Integration-specific routes
  if (config.integrations.auth === "supabase") {
    expected.push(
      "(auth)/login/page.tsx",
      "auth/callback/route.ts"
    );
  } else if (config.integrations.auth === "clerk") {
    expected.push(
      "sign-in/[[...sign-in]]/page.tsx",
      "sign-up/[[...sign-up]]/page.tsx"
    );
  }

  if (config.integrations.payments === "stripe") {
    expected.push(
      "api/stripe/checkout/route.ts",
      "api/webhooks/stripe/route.ts"
    );
  }

  const found: string[] = [];
  const missing: string[] = [];

  for (const route of expected) {
    const routePath = path.join(appDir, route);
    if (fs.existsSync(routePath)) {
      found.push(route);
    } else {
      missing.push(route);
    }
  }

  details.routes.expected = expected;
  details.routes.found = found;
  details.routes.missing = missing;

  return expected.length > 0
    ? Math.round((found.length / expected.length) * 100)
    : 100;
}

/**
 * Score environment variable documentation
 */
function scoreEnvVars(
  config: PreviewConfig,
  exportPath: string,
  details: FidelityDetails
): number {
  const envExamplePath = path.join(exportPath, ".env.local.example");
  
  // Build expected env vars based on integrations
  const expected: string[] = [];

  if (config.integrations.auth === "supabase") {
    expected.push("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  } else if (config.integrations.auth === "clerk") {
    expected.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
  }

  if (config.integrations.payments === "stripe") {
    expected.push(
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET"
    );
  }

  if (config.integrations.email === "resend") {
    expected.push("RESEND_API_KEY");
  }

  if (config.integrations.analytics === "posthog") {
    expected.push("NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST");
  }

  if (expected.length === 0) {
    details.envVars.expected = [];
    details.envVars.documented = [];
    details.envVars.missing = [];
    return 100;
  }

  if (!fs.existsSync(envExamplePath)) {
    details.envVars.expected = expected;
    details.envVars.missing = expected;
    return 0;
  }

  const content = fs.readFileSync(envExamplePath, "utf-8");
  
  const documented: string[] = [];
  const missing: string[] = [];

  for (const envVar of expected) {
    if (content.includes(envVar)) {
      documented.push(envVar);
    } else {
      missing.push(envVar);
    }
  }

  details.envVars.expected = expected;
  details.envVars.documented = documented;
  details.envVars.missing = missing;

  return Math.round((documented.length / expected.length) * 100);
}

/**
 * Find a component by name in directory tree
 */
function findComponent(dir: string, componentName: string): boolean {
  if (!fs.existsSync(dir)) return false;

  const searchPatterns = [
    `${componentName}.tsx`,
    `${componentName}.ts`,
    `${componentName}/index.tsx`,
    `${componentName.toLowerCase()}.tsx`,
  ];

  for (const pattern of searchPatterns) {
    if (findFileRecursive(dir, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively search for a file pattern
 */
function findFileRecursive(dir: string, filename: string): boolean {
  if (!fs.existsSync(dir)) return false;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        if (findFileRecursive(fullPath, filename)) {
          return true;
        }
      }
    } else if (entry.name.toLowerCase() === filename.toLowerCase()) {
      return true;
    }
  }

  return false;
}

/**
 * Convert hex color to HSL string (for CSS variable matching)
 */
function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Generate fidelity report as markdown
 */
export function generateFidelityReport(
  testId: string,
  score: FidelityScore
): string {
  const lines = [
    `# Fidelity Report: ${testId}`,
    "",
    `## Overall Score: ${score.overall}/100`,
    "",
    "| Category | Score |",
    "|----------|-------|",
    `| Color Match | ${score.colorMatch}% |`,
    `| Component Match | ${score.componentMatch}% |`,
    `| Layout Match | ${score.layoutMatch}% |`,
    `| Content Match | ${score.contentMatch}% |`,
    "",
  ];

  if (score.details.components.missing.length > 0) {
    lines.push("## Missing Components");
    lines.push("");
    for (const c of score.details.components.missing) {
      lines.push(`- ${c}`);
    }
    lines.push("");
  }

  if (score.details.routes.missing.length > 0) {
    lines.push("## Missing Routes");
    lines.push("");
    for (const r of score.details.routes.missing) {
      lines.push(`- ${r}`);
    }
    lines.push("");
  }

  if (score.details.envVars.missing.length > 0) {
    lines.push("## Missing Env Vars");
    lines.push("");
    for (const e of score.details.envVars.missing) {
      lines.push(`- ${e}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

