"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProject } from "@/lib/use-project";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserProject } from "@/lib/supabase";
import {
  Plus,
  Loader2,
  FolderOpen,
  Trash2,
  Clock,
  CheckCircle2,
  Archive,
  AlertCircle,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { TerminalProjectCard } from "@/components/ui/terminal-project-card";

function ProjectsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { listProjects, deleteProject, loadProject } = useProject();
  
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

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

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    
    setDeletingId(id);
    const success = await deleteProject(id);
    if (success) {
      setProjects(projects.filter(p => p.id !== id));
    }
    setDeletingId(null);
  };

  // Handle open project
  const handleOpen = async (id: string) => {
    await loadProject(id);
    router.push("/configure");
  };

  // Copy NPX token
  const handleCopyToken = async (token: string) => {
    await navigator.clipboard.writeText(`npx @jrdaws/framework pull ${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="secondary" className="gap-1">
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground-muted">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-alt border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-foreground-muted mt-1">
                {user?.email ? `Signed in as ${user.email}` : "Your saved projects"}
              </p>
            </div>
            <Link href="/configure">
              <Button className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="text-center py-16 bg-card border-border">
            <CardContent>
              <FolderOpen className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No projects yet</h2>
              <p className="text-foreground-muted mb-6">
                Create your first project to get started
              </p>
              <Link href="/configure">
                <Button className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <TerminalProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description || undefined}
                template={project.template || undefined}
                features={project.features || []}
                status={project.status as "draft" | "active" | "archived"}
                npxToken={project.npx_token || undefined}
                createdAt={project.created_at}
                updatedAt={project.updated_at}
                onOpen={handleOpen}
                onDelete={handleDelete}
                isDeleting={deletingId === project.id}
              />
            ))}
          </div>
        )}
      </main>
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

