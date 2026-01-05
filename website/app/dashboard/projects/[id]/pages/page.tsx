"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import {
  PageTree,
  PageSettings,
  AddPageModal,
  type PageNode,
  type ComponentSlotType,
  type RouteType,
} from "@/app/components/page-editor";
import { cn } from "@/lib/utils";

// Mock data for initial development
const MOCK_PAGES: PageNode[] = [
  {
    id: "1",
    parentId: null,
    order: 0,
    path: "/",
    title: "Home",
    routeType: "static",
    authRequired: false,
    components: [
      {
        id: "c1",
        pageId: "1",
        slotType: "header",
        order: 0,
        source: "shared",
        label: "Header",
      },
      {
        id: "c2",
        pageId: "1",
        slotType: "hero",
        order: 1,
        source: "ai-generated",
        label: "Hero Section",
        generationPrompt: "Generate a SaaS hero section with headline, subtitle, and CTA",
      },
      {
        id: "c3",
        pageId: "1",
        slotType: "footer",
        order: 2,
        source: "shared",
        label: "Footer",
      },
    ],
    children: [],
  },
  {
    id: "2",
    parentId: null,
    order: 1,
    path: "/pricing",
    title: "Pricing",
    routeType: "static",
    authRequired: false,
    components: [],
    children: [],
  },
  {
    id: "3",
    parentId: null,
    order: 2,
    path: "/about",
    title: "About",
    routeType: "static",
    authRequired: false,
    components: [],
    children: [],
  },
  {
    id: "4",
    parentId: null,
    order: 3,
    path: "/dashboard",
    title: "Dashboard",
    routeType: "static",
    authRequired: true,
    components: [],
    children: [
      {
        id: "5",
        parentId: "4",
        order: 0,
        path: "/dashboard/settings",
        title: "Settings",
        routeType: "static",
        authRequired: true,
        components: [],
        children: [],
      },
      {
        id: "6",
        parentId: "4",
        order: 1,
        path: "/dashboard/billing",
        title: "Billing",
        routeType: "static",
        authRequired: true,
        components: [],
        children: [],
      },
    ],
  },
  {
    id: "7",
    parentId: null,
    order: 4,
    path: "/blog",
    title: "Blog",
    routeType: "static",
    authRequired: false,
    components: [],
    children: [
      {
        id: "8",
        parentId: "7",
        order: 0,
        path: "/blog/[slug]",
        title: "Blog Post",
        routeType: "dynamic",
        authRequired: false,
        components: [],
        children: [],
      },
    ],
  },
];

interface ProjectMeta {
  id: string;
  name: string;
  status: string;
}

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();

  const [projectMeta, setProjectMeta] = useState<ProjectMeta | null>(null);
  const [pages, setPages] = useState<PageNode[]>(MOCK_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addParentPage, setAddParentPage] = useState<PageNode | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch project metadata
  useEffect(() => {
    if (params.id) {
      if (session?.access_token) {
        fetchProject();
      } else {
        // Demo mode - use mock data without auth
        setProjectMeta({
          id: params.id as string,
          name: "Demo Project",
          status: "draft",
        });
        setPages(MOCK_PAGES);
        setLoading(false);
      }
    }
  }, [session, params.id]);

  async function fetchProject() {
    try {
      setLoading(true);
      const response = await fetch(`/api/user-projects/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        // Fall back to demo mode if project not found
        setProjectMeta({
          id: params.id as string,
          name: "Demo Project",
          status: "draft",
        });
        setPages(MOCK_PAGES);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProjectMeta({
        id: data.project.id,
        name: data.project.name,
        status: data.project.status,
      });

      // TODO: Fetch pages from API
      // For now, using mock data
      setPages(MOCK_PAGES);
    } catch (err) {
      // Fall back to demo mode on error
      setProjectMeta({
        id: params.id as string,
        name: "Demo Project",
        status: "draft",
      });
      setPages(MOCK_PAGES);
    } finally {
      setLoading(false);
    }
  }

  // Find page by ID (recursive)
  const findPage = useCallback(
    (id: string, nodes: PageNode[] = pages): PageNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findPage(id, node.children);
          if (found) return found;
        }
      }
      return null;
    },
    [pages]
  );

  // Get selected page
  const selectedPage = selectedPageId ? findPage(selectedPageId) : null;

  // Update page in tree
  const updatePageInTree = useCallback(
    (id: string, updates: Partial<PageNode>, nodes: PageNode[]): PageNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return {
            ...node,
            children: updatePageInTree(id, updates, node.children),
          };
        }
        return node;
      });
    },
    []
  );

  // Remove page from tree
  const removePageFromTree = useCallback(
    (id: string, nodes: PageNode[]): PageNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children
            ? removePageFromTree(id, node.children)
            : node.children,
        }));
    },
    []
  );

  // Handle page updates
  const handleUpdatePage = useCallback(
    (id: string, updates: Partial<PageNode>) => {
      setPages((prev) => updatePageInTree(id, updates, prev));
    },
    [updatePageInTree]
  );

  // Handle page rename
  const handleRenamePage = useCallback(
    (id: string, newTitle: string) => {
      handleUpdatePage(id, { title: newTitle });
    },
    [handleUpdatePage]
  );

  // Handle page delete
  const handleDeletePage = useCallback(
    (id: string) => {
      if (!confirm("Are you sure you want to delete this page?")) return;
      setPages((prev) => removePageFromTree(id, prev));
      if (selectedPageId === id) {
        setSelectedPageId(null);
      }
    },
    [selectedPageId, removePageFromTree]
  );

  // Handle add page
  const handleAddPage = useCallback(
    (parentId?: string) => {
      if (parentId) {
        const parent = findPage(parentId);
        setAddParentPage(parent);
      } else {
        setAddParentPage(null);
      }
      setAddModalOpen(true);
    },
    [findPage]
  );

  // Handle create page
  const handleCreatePage = useCallback(
    async (data: {
      title: string;
      path: string;
      routeType: RouteType;
      authRequired: boolean;
      parentId?: string;
    }) => {
      const newPage: PageNode = {
        id: `page-${Date.now()}`,
        parentId: data.parentId || null,
        order: pages.length,
        path: data.path,
        title: data.title,
        routeType: data.routeType,
        authRequired: data.authRequired,
        components: [],
        children: [],
      };

      if (data.parentId) {
        setPages((prev) =>
          prev.map((node) => {
            if (node.id === data.parentId) {
              return {
                ...node,
                children: [...(node.children || []), newPage],
              };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map((child) =>
                  child.id === data.parentId
                    ? { ...child, children: [...(child.children || []), newPage] }
                    : child
                ),
              };
            }
            return node;
          })
        );
      } else {
        setPages((prev) => [...prev, newPage]);
      }

      setSelectedPageId(newPage.id);
    },
    [pages]
  );

  // Handle reorder pages
  const handleReorderPages = useCallback((dragId: string, dropId: string) => {
    // TODO: Implement drag-and-drop reordering
    console.log("Reorder:", dragId, "->", dropId);
  }, []);

  // Handle update slot
  const handleUpdateSlot = useCallback(
    (pageId: string, slotId: string, updates: Partial<ComponentSlotType>) => {
      setPages((prev) =>
        updatePageInTree(
          pageId,
          {
            components: findPage(pageId)?.components.map((slot) =>
              slot.id === slotId ? { ...slot, ...updates } : slot
            ),
          },
          prev
        )
      );
    },
    [findPage, updatePageInTree]
  );

  // Handle add slot
  const handleAddSlot = useCallback(
    (pageId: string) => {
      const page = findPage(pageId);
      if (!page) return;

      const newSlot: ComponentSlotType = {
        id: `slot-${Date.now()}`,
        pageId,
        slotType: "content",
        order: page.components.length,
        source: "ai-generated",
        label: "New Component",
      };

      handleUpdatePage(pageId, {
        components: [...page.components, newSlot],
      });
    },
    [findPage, handleUpdatePage]
  );

  // Handle remove slot
  const handleRemoveSlot = useCallback(
    (pageId: string, slotId: string) => {
      const page = findPage(pageId);
      if (!page) return;

      handleUpdatePage(pageId, {
        components: page.components.filter((s) => s.id !== slotId),
      });
    },
    [findPage, handleUpdatePage]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    setSaving(true);
    // TODO: Save to API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !projectMeta) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center gap-3 p-8 justify-center border rounded-lg bg-destructive/5 border-destructive/20">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <p className="text-destructive">{error || "Project not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${projectMeta.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">{projectMeta.name}</h1>
            <p className="text-xs text-muted-foreground">Page Structure Editor</p>
          </div>
          <Badge
            variant="outline"
            className={
              projectMeta.status === "active"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }
          >
            {projectMeta.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Page Tree */}
        <div
          className={cn(
            "border-r border-border bg-muted/30 transition-all duration-200",
            sidebarCollapsed ? "w-0" : "w-64"
          )}
        >
          {!sidebarCollapsed && (
            <PageTree
              pages={pages}
              selectedPageId={selectedPageId}
              onSelectPage={setSelectedPageId}
              onAddPage={handleAddPage}
              onRenamePage={handleRenamePage}
              onDeletePage={handleDeletePage}
              onReorderPages={handleReorderPages}
              className="h-full"
            />
          )}
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 absolute left-64 top-1/2 -translate-y-1/2 z-10"
          style={{
            left: sidebarCollapsed ? "0" : "256px",
            transition: "left 0.2s",
          }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </Button>

        {/* Main Panel - Page Settings */}
        <div className="flex-1 overflow-hidden bg-background">
          <PageSettings
            page={selectedPage}
            onUpdate={handleUpdatePage}
            onUpdateSlot={handleUpdateSlot}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            className="h-full"
          />
        </div>
      </div>

      {/* Add Page Modal */}
      <AddPageModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        parentPage={
          addParentPage
            ? { id: addParentPage.id, path: addParentPage.path, title: addParentPage.title }
            : null
        }
        onCreate={handleCreatePage}
      />
    </div>
  );
}

