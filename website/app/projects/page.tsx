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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">My Projects</h1>
              <p className="text-muted-foreground mt-1">
                {user?.email ? `Signed in as ${user.email}` : "Your saved projects"}
              </p>
            </div>
            <Link href="/configure">
              <Button className="gap-2 bg-[#F97316] hover:bg-[#F97316]/90">
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
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to get started
              </p>
              <Link href="/configure">
                <Button className="gap-2 bg-[#F97316] hover:bg-[#F97316]/90">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template & Features */}
                  <div className="space-y-2">
                    {project.template && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Template:</span>
                        <Badge variant="outline" className="capitalize">
                          {project.template}
                        </Badge>
                      </div>
                    )}
                    {project.features && project.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {project.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* NPX Token */}
                  {project.npx_token && (
                    <div className="p-3 bg-stone-900 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-stone-300 truncate">
                          <Terminal className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{project.npx_token}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-stone-400 hover:text-white"
                          onClick={() => handleCopyToken(project.npx_token)}
                        >
                          {copiedToken === project.npx_token ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="text-xs text-muted-foreground">
                    Created {formatDate(project.created_at)}
                    {project.updated_at !== project.created_at && (
                      <> · Updated {formatDate(project.updated_at)}</>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      className="flex-1 bg-[#F97316] hover:bg-[#F97316]/90"
                      onClick={() => handleOpen(project.id)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deletingId === project.id}
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

