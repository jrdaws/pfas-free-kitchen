/**
 * Analysis Loader
 * 
 * Converts website analysis data into generator files.
 * Bridges the gap between detected features/styles and export generation.
 */

import { GeneratedFile } from "./types";
import { getDetectedFeatureFiles, getFeatureTemplateSummary } from "./detected-feature-mapper";
import { generateStyleFiles, VisualAnalysis } from "./style-generator";
import { 
  generateStructureFiles, 
  generateSectionComponents,
  StructureAnalysis, 
  PageSection 
} from "./structure-generator";

/**
 * Full website analysis structure from the analyzer
 */
export interface WebsiteAnalysis {
  url: string;
  timestamp: string;
  
  features: {
    auth?: {
      hasLogin?: boolean;
      hasSignup?: boolean;
      hasSocialAuth?: {
        google?: boolean;
        github?: boolean;
        apple?: boolean;
      };
      hasPasswordReset?: boolean;
      hasMfa?: boolean;
    };
    ecommerce?: {
      hasProducts?: boolean;
      hasCart?: boolean;
      hasCheckout?: boolean;
      hasWishlist?: boolean;
      hasReviews?: boolean;
      hasInventory?: boolean;
      hasPricing?: boolean;
    };
    social?: {
      hasProfiles?: boolean;
      hasComments?: boolean;
      hasLikes?: boolean;
      hasFollowing?: boolean;
      hasSharing?: boolean;
      hasFeed?: boolean;
      hasMessaging?: boolean;
    };
    content?: {
      hasBlog?: boolean;
      hasSearch?: boolean;
      hasFaq?: boolean;
      hasDocs?: boolean;
      hasGallery?: boolean;
      hasMedia?: boolean;
    };
    communication?: {
      hasContactForm?: boolean;
      hasNewsletter?: boolean;
      hasChat?: boolean;
      hasNotifications?: boolean;
    };
    booking?: {
      hasAppointments?: boolean;
      hasCalendar?: boolean;
      hasReservations?: boolean;
    };
    subscription?: {
      hasPricing?: boolean;
      hasBilling?: boolean;
      hasTrials?: boolean;
    };
    dashboard?: {
      hasAnalytics?: boolean;
      hasReports?: boolean;
      hasStats?: boolean;
    };
    admin?: {
      hasUserManagement?: boolean;
      hasContentModeration?: boolean;
      hasSettings?: boolean;
    };
    location?: {
      hasMap?: boolean;
      hasStoreLocator?: boolean;
      hasGeoSearch?: boolean;
    };
    integrations?: {
      hasPayments?: boolean;
      hasOAuth?: boolean;
      hasWebhooks?: boolean;
    };
  };

  visual: VisualAnalysis;

  structure: StructureAnalysis;

  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };

  technical?: {
    framework?: string;
    styling?: string;
    stateManagement?: string;
    hasSSR?: boolean;
    hasSSG?: boolean;
    hasPWA?: boolean;
  };
}

/**
 * Result of processing website analysis
 */
export interface AnalysisExportResult {
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVars: string[];
  summary: {
    totalFiles: number;
    featureFiles: number;
    styleFiles: number;
    structureFiles: number;
    sectionComponents: number;
  };
}

/**
 * Process website analysis and generate all related files
 */
export function processAnalysisForExport(
  analysis: WebsiteAnalysis,
  projectName: string
): AnalysisExportResult {
  const allFiles: GeneratedFile[] = [];
  let dependencies: Record<string, string> = {};
  let devDependencies: Record<string, string> = {};
  let envVars: string[] = [];

  // 1. Process detected features into component files
  const featureResult = getDetectedFeatureFiles(analysis.features);
  dependencies = { ...dependencies, ...featureResult.dependencies };
  devDependencies = { ...devDependencies, ...featureResult.devDependencies };
  envVars = [...envVars, ...featureResult.envVars];

  // Generate feature component templates
  const featureFiles = generateFeatureComponentFiles(featureResult.files, projectName);
  allFiles.push(...featureFiles);

  // 2. Generate style files from visual analysis
  const styleFiles = generateStyleFiles(analysis.visual);
  allFiles.push(...styleFiles);

  // 3. Generate structure files (navigation, footer, pages)
  const structureFiles = generateStructureFiles(analysis.structure, projectName);
  allFiles.push(...structureFiles);

  // 4. Generate section components for detected page sections
  const allSections = analysis.structure.pages.flatMap(p => p.sections);
  const sectionFiles = generateSectionComponents(allSections, projectName);
  allFiles.push(...sectionFiles);

  return {
    files: allFiles,
    dependencies,
    devDependencies,
    envVars: [...new Set(envVars)],
    summary: {
      totalFiles: allFiles.length,
      featureFiles: featureFiles.length,
      styleFiles: styleFiles.length,
      structureFiles: structureFiles.length,
      sectionComponents: sectionFiles.length,
    },
  };
}

/**
 * Generate component files for detected features
 */
function generateFeatureComponentFiles(
  filePaths: string[],
  projectName: string
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const filePath of filePaths) {
    const content = generateFeatureFileContent(filePath, projectName);
    if (content) {
      files.push({
        path: filePath,
        content,
        overwrite: false, // Don't overwrite if already exists
      });
    }
  }

  return files;
}

/**
 * Generate content for a feature file based on its path
 */
function generateFeatureFileContent(filePath: string, projectName: string): string {
  const fileName = filePath.split('/').pop() || '';
  const isComponent = filePath.includes('components/') || fileName.endsWith('.tsx');
  const isPage = filePath.includes('app/') && filePath.endsWith('page.tsx');
  const isRoute = filePath.includes('app/api/') && filePath.endsWith('route.ts');
  const isHook = fileName.startsWith('use') || filePath.includes('hooks/');
  const isLib = filePath.includes('lib/');

  // Component template
  if (isComponent && !isPage) {
    const componentName = fileName.replace('.tsx', '');
    return `/**
 * ${componentName}
 * Generated for ${projectName}
 */

"use client";

import { useState } from "react";

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = "" }: ${componentName}Props) {
  return (
    <div className={\`\${className}\`}>
      {/* Implement ${componentName} UI here */}
    </div>
  );
}

export default ${componentName};
`;
  }

  // Page template
  if (isPage) {
    const pageName = extractPageName(filePath);
    return `/**
 * ${pageName} Page
 * Generated for ${projectName}
 */

export const metadata = {
  title: "${pageName} | ${projectName}",
};

export default function ${toPascalCase(pageName)}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">${pageName}</h1>
      {/* Implement page content here */}
    </div>
  );
}
`;
  }

  // API route template
  if (isRoute) {
    const routeName = extractRouteName(filePath);
    return `/**
 * ${routeName} API Route
 * Generated for ${projectName}
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Implement GET logic
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("[${routeName}] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Implement POST logic
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[${routeName}] POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
`;
  }

  // Hook template
  if (isHook) {
    const hookName = fileName.replace('.ts', '').replace('.tsx', '');
    return `/**
 * ${hookName}
 * Generated for ${projectName}
 */

"use client";

import { useState, useCallback, useEffect } from "react";

export function ${hookName}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implement hook logic

  return {
    loading,
    error,
  };
}
`;
  }

  // Library/utility template
  if (isLib) {
    const libName = fileName.replace('.ts', '').replace('.tsx', '');
    const typeName = toPascalCase(libName);
    return `/**
 * ${libName}
 * Generated for ${projectName}
 */

export interface ${typeName}Config {
  // Add configuration options
}

export interface ${typeName}Result {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function initialize${typeName}(
  config: ${typeName}Config
): Promise<${typeName}Result> {
  try {
    // Implement initialization logic
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
`;
  }

  // Default TypeScript file
  return `/**
 * ${fileName}
 * Generated for ${projectName}
 */

// Implement your logic here
export {};
`;
}

/**
 * Get a summary of what will be generated from analysis
 */
export function getAnalysisExportSummary(analysis: WebsiteAnalysis): {
  features: ReturnType<typeof getFeatureTemplateSummary>;
  sections: PageSection['type'][];
  pages: string[];
  colors: string[];
} {
  const features = getFeatureTemplateSummary(analysis.features);
  const sections = [...new Set(
    analysis.structure.pages.flatMap(p => p.sections.map(s => s.type))
  )];
  const pages = analysis.structure.pages.map(p => p.url);
  const colors = Object.values(analysis.visual.colors).filter(Boolean) as string[];

  return {
    features,
    sections,
    pages,
    colors,
  };
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function extractPageName(filePath: string): string {
  // app/settings/profile/page.tsx -> Settings Profile
  const parts = filePath
    .replace('app/', '')
    .replace('/page.tsx', '')
    .split('/')
    .filter(p => !p.startsWith('[') && !p.startsWith('('));
  
  return parts.map(p => capitalize(p.replace(/-/g, ' '))).join(' ') || 'Page';
}

function extractRouteName(filePath: string): string {
  // app/api/comments/[id]/route.ts -> Comments
  const parts = filePath
    .replace('app/api/', '')
    .replace('/route.ts', '')
    .split('/')
    .filter(p => !p.startsWith('['));
  
  return parts.map(capitalize).join(' ') || 'API';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

