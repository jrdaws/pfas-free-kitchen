"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Layers,
  Route,
  Component,
  Settings,
  Database,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  Package,
  Palette,
  Terminal,
  Info,
} from "lucide-react";

// File types and their configurations
export type FileType = 
  | "folder"
  | "page"
  | "component"
  | "api"
  | "config"
  | "style"
  | "lib"
  | "type"
  | "env"
  | "json"
  | "markdown"
  | "other";

export type FileHighlight = "route" | "component" | "config" | "generated" | "integration" | null;

export interface TreeNode {
  name: string;
  path: string;
  type: FileType;
  highlight?: FileHighlight;
  description?: string;
  children?: TreeNode[];
  isGenerated?: boolean;
  isNew?: boolean;
}

// Icons for file types
const FILE_ICONS: Record<FileType, React.ReactNode> = {
  folder: <Folder className="h-4 w-4" />,
  page: <Route className="h-4 w-4" />,
  component: <Component className="h-4 w-4" />,
  api: <Database className="h-4 w-4" />,
  config: <Settings className="h-4 w-4" />,
  style: <Palette className="h-4 w-4" />,
  lib: <Package className="h-4 w-4" />,
  type: <FileCode className="h-4 w-4" />,
  env: <Lock className="h-4 w-4" />,
  json: <FileJson className="h-4 w-4" />,
  markdown: <FileText className="h-4 w-4" />,
  other: <File className="h-4 w-4" />,
};

// Highlight colors
const HIGHLIGHT_COLORS: Record<NonNullable<FileHighlight>, string> = {
  route: "text-blue-600 bg-blue-50",
  component: "text-purple-600 bg-purple-50",
  config: "text-amber-600 bg-amber-50",
  generated: "text-emerald-600 bg-emerald-50",
  integration: "text-pink-600 bg-pink-50",
};

const HIGHLIGHT_BADGES: Record<NonNullable<FileHighlight>, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" }> = {
  route: { label: "Route", variant: "info" },
  component: { label: "Component", variant: "default" },
  config: { label: "Config", variant: "warning" },
  generated: { label: "Generated", variant: "success" },
  integration: { label: "Integration", variant: "secondary" },
};

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  searchQuery: string;
  showDescriptions: boolean;
}

function TreeNodeItem({
  node,
  depth,
  expandedPaths,
  onToggle,
  searchQuery,
  showDescriptions,
}: TreeNodeItemProps) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedPaths.has(node.path);
  const hasChildren = node.children && node.children.length > 0;

  // Check if this node or any children match search
  const matchesSearch = (n: TreeNode): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (n.name.toLowerCase().includes(query)) return true;
    if (n.description?.toLowerCase().includes(query)) return true;
    if (n.children?.some(matchesSearch)) return true;
    return false;
  };

  if (!matchesSearch(node)) return null;

  const icon = isFolder 
    ? (isExpanded ? <FolderOpen className="h-4 w-4" /> : FILE_ICONS.folder)
    : FILE_ICONS[node.type];

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer hover:bg-stone-100 transition-colors group",
          node.highlight && HIGHLIGHT_COLORS[node.highlight]
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isFolder && hasChildren && onToggle(node.path)}
      >
        {/* Expand/Collapse Arrow */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {isFolder && hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-stone-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-stone-400" />
            )
          ) : null}
        </div>

        {/* File Icon */}
        <div className={cn(
          "shrink-0",
          isFolder ? "text-amber-500" : "text-stone-500"
        )}>
          {icon}
        </div>

        {/* File Name */}
        <span className={cn(
          "text-sm truncate flex-1",
          isFolder ? "font-medium" : "",
          node.isNew && "text-emerald-600"
        )}>
          {node.name}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.isNew && (
            <Badge variant="success" className="text-[10px] h-4 px-1">NEW</Badge>
          )}
          {node.isGenerated && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              <Sparkles className="h-2 w-2 mr-0.5" />
              AI
            </Badge>
          )}
          {node.highlight && (
            <Badge 
              variant={HIGHLIGHT_BADGES[node.highlight].variant} 
              className="text-[10px] h-4 px-1"
            >
              {HIGHLIGHT_BADGES[node.highlight].label}
            </Badge>
          )}
        </div>

        {/* Description Tooltip */}
        {node.description && showDescriptions && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-stone-400 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{node.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Children */}
      {isFolder && hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              searchQuery={searchQuery}
              showDescriptions={showDescriptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreeViewProps {
  /** Tree structure to display */
  tree: TreeNode[];
  /** Title for the card */
  title?: string;
  /** Description for the card */
  description?: string;
  /** Initially expanded paths */
  defaultExpanded?: string[];
  /** Maximum height for scroll area */
  maxHeight?: string;
  /** Show file descriptions */
  showDescriptions?: boolean;
  /** Class name */
  className?: string;
}

export function FileTreeView({
  tree,
  title = "Project Structure",
  description = "Files that will be generated for your project",
  defaultExpanded = [],
  maxHeight = "500px",
  showDescriptions = true,
  className,
}: FileTreeViewProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(defaultExpanded)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showDesc, setShowDesc] = useState(showDescriptions);

  // Calculate stats
  const stats = useMemo(() => {
    const countNodes = (nodes: TreeNode[]): { files: number; folders: number; routes: number; components: number } => {
      let files = 0;
      let folders = 0;
      let routes = 0;
      let components = 0;

      nodes.forEach((node) => {
        if (node.type === "folder") {
          folders++;
          if (node.children) {
            const childStats = countNodes(node.children);
            files += childStats.files;
            folders += childStats.folders;
            routes += childStats.routes;
            components += childStats.components;
          }
        } else {
          files++;
          if (node.highlight === "route" || node.type === "page") routes++;
          if (node.highlight === "component" || node.type === "component") components++;
        }
      });

      return { files, folders, routes, components };
    };

    return countNodes(tree);
  }, [tree]);

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allPaths = new Set<string>();
    const collectPaths = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === "folder") {
          allPaths.add(node.path);
          if (node.children) collectPaths(node.children);
        }
      });
    };
    collectPaths(tree);
    setExpandedPaths(allPaths);
  };

  const collapseAll = () => {
    setExpandedPaths(new Set());
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="font-bold text-lg">{stats.files}</p>
              <p className="text-xs text-stone-500">Files</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{stats.folders}</p>
              <p className="text-xs text-stone-500">Folders</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-blue-600">{stats.routes}</p>
              <p className="text-xs text-stone-500">Routes</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-purple-600">{stats.components}</p>
              <p className="text-xs text-stone-500">Components</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDesc(!showDesc)}
          >
            {showDesc ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 flex-wrap">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100" />
            Routes
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-100" />
            Components
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-100" />
            Config
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-100" />
            Generated
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-pink-100" />
            Integration
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="font-mono text-sm">
            {tree.map((node) => (
              <TreeNodeItem
                key={node.path}
                node={node}
                depth={0}
                expandedPaths={expandedPaths}
                onToggle={handleToggle}
                searchQuery={searchQuery}
                showDescriptions={showDesc}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper to generate tree from template + features
export function generateProjectTree(config: {
  projectName: string;
  template: string;
  selectedFeatures?: string[];
  integrations?: Record<string, string>;
}): TreeNode[] {
  const { projectName, template, selectedFeatures = [], integrations = {} } = config;

  const tree: TreeNode[] = [
    {
      name: projectName,
      path: projectName,
      type: "folder",
      children: [
        // App directory
        {
          name: "app",
          path: `${projectName}/app`,
          type: "folder",
          description: "Next.js App Router pages and layouts",
          children: [
            {
              name: "layout.tsx",
              path: `${projectName}/app/layout.tsx`,
              type: "page",
              highlight: "config",
              description: "Root layout with providers and global styles",
            },
            {
              name: "page.tsx",
              path: `${projectName}/app/page.tsx`,
              type: "page",
              highlight: "route",
              description: "Homepage / landing page",
            },
            {
              name: "globals.css",
              path: `${projectName}/app/globals.css`,
              type: "style",
              description: "Global CSS with Tailwind directives",
            },
            // Auth routes if auth integration
            ...(integrations.auth ? [
              {
                name: "(auth)",
                path: `${projectName}/app/(auth)`,
                type: "folder" as FileType,
                description: "Authentication route group",
                children: [
                  {
                    name: "login",
                    path: `${projectName}/app/(auth)/login`,
                    type: "folder" as FileType,
                    children: [
                      {
                        name: "page.tsx",
                        path: `${projectName}/app/(auth)/login/page.tsx`,
                        type: "page" as FileType,
                        highlight: "route" as FileHighlight,
                        isNew: true,
                        description: "User login page",
                      },
                    ],
                  },
                  {
                    name: "signup",
                    path: `${projectName}/app/(auth)/signup`,
                    type: "folder" as FileType,
                    children: [
                      {
                        name: "page.tsx",
                        path: `${projectName}/app/(auth)/signup/page.tsx`,
                        type: "page" as FileType,
                        highlight: "route" as FileHighlight,
                        isNew: true,
                        description: "User registration page",
                      },
                    ],
                  },
                ],
              },
            ] : []),
            // API routes
            {
              name: "api",
              path: `${projectName}/app/api`,
              type: "folder",
              description: "API route handlers",
              children: [
                {
                  name: "health",
                  path: `${projectName}/app/api/health`,
                  type: "folder",
                  children: [
                    {
                      name: "route.ts",
                      path: `${projectName}/app/api/health/route.ts`,
                      type: "api",
                      highlight: "route",
                      description: "Health check endpoint",
                    },
                  ],
                },
                ...(integrations.auth ? [
                  {
                    name: "auth",
                    path: `${projectName}/app/api/auth`,
                    type: "folder" as FileType,
                    children: [
                      {
                        name: "callback",
                        path: `${projectName}/app/api/auth/callback`,
                        type: "folder" as FileType,
                        children: [
                          {
                            name: "route.ts",
                            path: `${projectName}/app/api/auth/callback/route.ts`,
                            type: "api" as FileType,
                            highlight: "integration" as FileHighlight,
                            isNew: true,
                            description: "OAuth callback handler",
                          },
                        ],
                      },
                    ],
                  },
                ] : []),
              ],
            },
          ],
        },
        // Components directory
        {
          name: "components",
          path: `${projectName}/components`,
          type: "folder",
          description: "Reusable UI components",
          children: [
            {
              name: "ui",
              path: `${projectName}/components/ui`,
              type: "folder",
              description: "shadcn/ui components",
              children: [
                { name: "button.tsx", path: `${projectName}/components/ui/button.tsx`, type: "component", highlight: "component" },
                { name: "card.tsx", path: `${projectName}/components/ui/card.tsx`, type: "component", highlight: "component" },
                { name: "input.tsx", path: `${projectName}/components/ui/input.tsx`, type: "component", highlight: "component" },
              ],
            },
            ...(integrations.auth ? [
              {
                name: "auth",
                path: `${projectName}/components/auth`,
                type: "folder" as FileType,
                children: [
                  {
                    name: "AuthProvider.tsx",
                    path: `${projectName}/components/auth/AuthProvider.tsx`,
                    type: "component" as FileType,
                    highlight: "integration" as FileHighlight,
                    isNew: true,
                    description: "Authentication context provider",
                  },
                ],
              },
            ] : []),
          ],
        },
        // Lib directory
        {
          name: "lib",
          path: `${projectName}/lib`,
          type: "folder",
          description: "Utility functions and shared logic",
          children: [
            {
              name: "utils.ts",
              path: `${projectName}/lib/utils.ts`,
              type: "lib",
              description: "Common utility functions (cn, etc.)",
            },
            ...(integrations.database === "supabase" ? [
              {
                name: "supabase.ts",
                path: `${projectName}/lib/supabase.ts`,
                type: "lib" as FileType,
                highlight: "integration" as FileHighlight,
                isNew: true,
                description: "Supabase client configuration",
              },
            ] : []),
            ...(integrations.ai ? [
              {
                name: "ai.ts",
                path: `${projectName}/lib/ai.ts`,
                type: "lib" as FileType,
                highlight: "integration" as FileHighlight,
                isNew: true,
                description: "AI provider client setup",
              },
            ] : []),
          ],
        },
        // .dd directory (framework context)
        {
          name: ".dd",
          path: `${projectName}/.dd`,
          type: "folder",
          description: "Dawson Does framework context files",
          children: [
            {
              name: "context.md",
              path: `${projectName}/.dd/context.md`,
              type: "markdown",
              highlight: "generated",
              isGenerated: true,
              description: "AI context for Cursor/Claude Code",
            },
            {
              name: "project.json",
              path: `${projectName}/.dd/project.json`,
              type: "json",
              highlight: "generated",
              isGenerated: true,
              description: "Project configuration manifest",
            },
          ],
        },
        // Config files
        {
          name: "package.json",
          path: `${projectName}/package.json`,
          type: "json",
          highlight: "config",
          description: "Dependencies and scripts",
        },
        {
          name: "tsconfig.json",
          path: `${projectName}/tsconfig.json`,
          type: "json",
          highlight: "config",
          description: "TypeScript configuration",
        },
        {
          name: "tailwind.config.ts",
          path: `${projectName}/tailwind.config.ts`,
          type: "config",
          highlight: "config",
          description: "Tailwind CSS configuration",
        },
        {
          name: "next.config.js",
          path: `${projectName}/next.config.js`,
          type: "config",
          highlight: "config",
          description: "Next.js configuration",
        },
        {
          name: ".env.local.example",
          path: `${projectName}/.env.local.example`,
          type: "env",
          highlight: "config",
          description: "Environment variables template",
        },
        {
          name: ".gitignore",
          path: `${projectName}/.gitignore`,
          type: "other",
          description: "Git ignore rules",
        },
        {
          name: "README.md",
          path: `${projectName}/README.md`,
          type: "markdown",
          highlight: "generated",
          isGenerated: true,
          description: "Project documentation",
        },
      ],
    },
  ];

  return tree;
}


