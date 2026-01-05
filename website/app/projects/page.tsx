"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProject } from "@/lib/use-project";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProject } from "@/lib/supabase";
import {
  Plus,
  Search,
  Command,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import {
  ProjectGrid,
  ProjectSearch,
  CreateProjectModal,
} from "@/app/components/dashboard";

type ViewMode = "grid" | "list";
type SortBy = "updated" | "name" | "created";

function ProjectsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { listProjects, deleteProject, loadProject, createProject } = useProject();

  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [filterQuery, setFilterQuery] = useState("");

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const projectList = await listProjects();
        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [listProjects]);

  // ⌘K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    const success = await deleteProject(id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }, [deleteProject]);

  // Handle open project
  const handleOpen = useCallback(async (id: string) => {
    await loadProject(id);
    router.push("/configure");
  }, [loadProject, router]);

  // Handle clone project (stub)
  const handleClone = useCallback(async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    
    // Create a cloned project
    const clonedName = `${project.name} (Copy)`;
    alert(`Clone functionality coming soon. Would create: ${clonedName}`);
  }, [projects]);

  // Handle archive project (stub)
  const handleArchive = useCallback(async (id: string) => {
    alert("Archive functionality coming soon.");
  }, []);

  // Handle create project
  const handleCreate = useCallback(async (data: {
    name: string;
    description?: string;
    template: string;
  }) => {
    // Navigate to configure page with pre-filled data
    // For now, just navigate - the actual creation will happen in configure
    router.push(`/configure?name=${encodeURIComponent(data.name)}&template=${data.template}`);
  }, [router]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter((p) =>
      p.name.toLowerCase().includes(filterQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "updated":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Transform projects for grid
  const gridProjects = filteredProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    template: p.template || undefined,
    features: p.features || [],
    status: (p.status || "draft") as "draft" | "active" | "archived",
    npxToken: p.npx_token || undefined,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  // Search modal projects format
  const searchProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    template: p.template || undefined,
    status: (p.status || "draft") as "draft" | "active" | "archived",
    updatedAt: p.updated_at,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div>
              <h1 className="text-xl font-bold text-foreground">Projects</h1>
              {user?.email && (
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Search button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 text-muted-foreground"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
                <kbd className="ml-2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-muted rounded">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              </Button>

              {/* New Project */}
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 pb-4">
            {/* Left: Filter Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter projects..."
                className="pl-9"
              />
            </div>

            {/* Right: View/Sort Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const options: SortBy[] = ["updated", "name", "created"];
                  const current = options.indexOf(sortBy);
                  setSortBy(options[(current + 1) % options.length]);
                }}
                className="hidden sm:flex items-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="capitalize">{sortBy}</span>
              </Button>

              {/* View Toggle */}
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <ProjectGrid
          projects={gridProjects}
          onOpen={handleOpen}
          onClone={handleClone}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onCreate={() => setCreateOpen(true)}
          showCreateCard={!loading && projects.length > 0}
          isLoading={loading}
          loadingCount={6}
        />

        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            {/* Empty state is handled by ProjectGrid when showCreateCard is false */}
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        projects={searchProjects}
        onSelect={handleOpen}
      />

      <CreateProjectModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}
