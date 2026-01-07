/**
 * Template Gallery
 * 
 * Pre-designed website templates users can start from.
 * Each template is a complete ProjectDefinition with branding, sections, and content.
 */

import type { ProjectDefinition } from "../types";
import { saasTemplate } from "./saas";
import { agencyTemplate } from "./agency";
import { ecommerceTemplate } from "./ecommerce";
import { portfolioTemplate } from "./portfolio";
import { startupTemplate } from "./startup";

// ============================================================================
// Types
// ============================================================================

export type TemplateCategory = "saas" | "agency" | "ecommerce" | "portfolio" | "startup";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  tags: string[];
  definition: ProjectDefinition;
  featured?: boolean;
}

// ============================================================================
// Template Registry
// ============================================================================

export const templates: Template[] = [
  saasTemplate,
  agencyTemplate,
  ecommerceTemplate,
  portfolioTemplate,
  startupTemplate,
];

// ============================================================================
// Utility Functions
// ============================================================================

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter((t) => t.category === category);
}

export function getFeaturedTemplates(): Template[] {
  return templates.filter((t) => t.featured);
}

export function getAllCategories(): { id: TemplateCategory; label: string; count: number }[] {
  const categories: TemplateCategory[] = ["saas", "agency", "ecommerce", "portfolio", "startup"];
  
  return categories.map((id) => ({
    id,
    label: getCategoryLabel(id),
    count: templates.filter((t) => t.category === id).length,
  }));
}

function getCategoryLabel(category: TemplateCategory): string {
  switch (category) {
    case "saas": return "SaaS";
    case "agency": return "Agency";
    case "ecommerce": return "E-commerce";
    case "portfolio": return "Portfolio";
    case "startup": return "Startup";
    default: return category;
  }
}

// Re-export individual templates for direct access
export { saasTemplate } from "./saas";
export { agencyTemplate } from "./agency";
export { ecommerceTemplate } from "./ecommerce";
export { portfolioTemplate } from "./portfolio";
export { startupTemplate } from "./startup";

