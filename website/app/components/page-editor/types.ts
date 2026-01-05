export type RouteType = "static" | "dynamic" | "catch-all" | "api" | "layout";
export type SlotSource = "shared" | "ai-generated" | "static" | "custom";

export interface PageNode {
  id: string;
  parentId: string | null;
  order: number;
  path: string;
  title: string;
  description?: string;
  routeType: RouteType;
  authRequired: boolean;
  allowedRoles?: string[];
  layoutId?: string;
  components: ComponentSlot[];
  generationPrompt?: string;
  generatedContent?: string;
  generatedAt?: string;
  children?: PageNode[];
}

export interface ComponentSlot {
  id: string;
  pageId: string;
  slotType: "header" | "hero" | "content" | "sidebar" | "footer" | "custom";
  order: number;
  source: SlotSource;
  sharedComponentId?: string;
  generationPrompt?: string;
  generationContext?: Record<string, unknown>;
  content?: string;
  lastGeneratedAt?: string;
  label?: string;
}

export interface PageEditorState {
  pages: PageNode[];
  selectedPageId: string | null;
  expandedIds: Set<string>;
  draggedId: string | null;
  dropTargetId: string | null;
}

export interface PageSettings {
  title: string;
  path: string;
  description: string;
  routeType: RouteType;
  authRequired: boolean;
  seoTitle: string;
  seoDescription: string;
}

