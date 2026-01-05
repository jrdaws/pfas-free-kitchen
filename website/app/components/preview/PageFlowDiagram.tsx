"use client";

import { cn } from "@/lib/utils";
import type { PreviewPage } from "./types";
import { PAGE_ICONS } from "./types";

interface PageFlowDiagramProps {
  pages: PreviewPage[];
  currentPath: string;
  onChange: (path: string) => void;
  className?: string;
}

interface PageNode {
  page: PreviewPage;
  level: number;
  parent?: string;
}

export function PageFlowDiagram({
  pages,
  currentPath,
  onChange,
  className,
}: PageFlowDiagramProps) {
  // Build a simple tree structure based on path segments
  const buildTree = (): PageNode[] => {
    const nodes: PageNode[] = [];
    const sortedPages = [...pages].sort((a, b) => 
      a.path.split("/").length - b.path.split("/").length
    );

    for (const page of sortedPages) {
      const segments = page.path.split("/").filter(Boolean);
      const level = segments.length;
      const parent = segments.length > 1 
        ? "/" + segments.slice(0, -1).join("/") 
        : "/";

      nodes.push({
        page,
        level: page.path === "/" ? 0 : level,
        parent: page.path === "/" ? undefined : parent,
      });
    }

    return nodes;
  };

  const nodes = buildTree();
  const homePage = nodes.find(n => n.page.path === "/");
  const childPages = nodes.filter(n => n.page.path !== "/");

  // Group child pages by their parent (first-level grouping)
  const groupedChildren = childPages.reduce<Record<string, PageNode[]>>((acc, node) => {
    const key = node.level === 1 ? "root" : node.parent || "root";
    if (!acc[key]) acc[key] = [];
    acc[key].push(node);
    return acc;
  }, {});

  return (
    <div className={cn("p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50", className)}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Site Structure
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Home node */}
        {homePage && (
          <FlowNode
            page={homePage.page}
            isActive={currentPath === homePage.page.path}
            onClick={() => onChange(homePage.page.path)}
            isRoot
          />
        )}

        {/* Connector line */}
        {childPages.length > 0 && (
          <div className="w-px h-4 bg-gradient-to-b from-indigo-500 to-slate-600" />
        )}

        {/* First level children */}
        {groupedChildren["root"] && (
          <div className="flex flex-wrap justify-center gap-3">
            {groupedChildren["root"].map((node) => (
              <div key={node.page.id} className="flex flex-col items-center gap-2">
                <FlowNode
                  page={node.page}
                  isActive={currentPath === node.page.path}
                  onClick={() => onChange(node.page.path)}
                />
                
                {/* Sub-children */}
                {groupedChildren[node.page.path] && (
                  <>
                    <div className="w-px h-2 bg-slate-600" />
                    <div className="flex gap-2">
                      {groupedChildren[node.page.path].map((child) => (
                        <FlowNode
                          key={child.page.id}
                          page={child.page}
                          isActive={currentPath === child.page.path}
                          onClick={() => onChange(child.page.path)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FlowNodeProps {
  page: PreviewPage;
  isActive: boolean;
  onClick: () => void;
  isRoot?: boolean;
  size?: "sm" | "md";
}

function FlowNode({ page, isActive, onClick, isRoot, size = "md" }: FlowNodeProps) {
  const icon = PAGE_ICONS[page.type] || PAGE_ICONS.custom;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg transition-all duration-200",
        size === "sm" ? "p-2" : "p-3",
        isActive
          ? "bg-indigo-600/20 ring-2 ring-indigo-500"
          : "hover:bg-slate-800",
        isRoot && "bg-gradient-to-br from-indigo-600/30 to-purple-600/30"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-md transition-all",
          size === "sm" ? "w-8 h-8 text-lg" : "w-10 h-10 text-xl",
          isActive ? "bg-indigo-600/40" : "bg-slate-800"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "font-medium truncate max-w-20",
          size === "sm" ? "text-[10px]" : "text-xs",
          isActive ? "text-indigo-300" : "text-slate-400"
        )}
      >
        {page.name}
      </span>
      <span
        className={cn(
          "text-slate-600 truncate max-w-20",
          size === "sm" ? "text-[8px]" : "text-[10px]"
        )}
      >
        {page.path}
      </span>
    </button>
  );
}

