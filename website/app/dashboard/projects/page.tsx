"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  ArrowUpRight, 
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  template: string | null;
  status: "draft" | "active" | "archived";
  npx_token: string | null;
  features: string[];
  integrations: Record<string, string>;
  tool_status: {
    cursor: boolean;
    github: boolean;
    claude: boolean;
    supabase: boolean;
    vercel: boolean;
  };
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground border-muted" },
};

const TEMPLATE_COLORS: Record<string, string> = {
  saas: "from-violet-500 to-purple-500",
  ecommerce: "from-emerald-500 to-teal-500",
  blog: "from-blue-500 to-cyan-500",
  dashboard: "from-orange-500 to-amber-500",
  default: "from-primary to-primary/80",
};

export default function ProjectsPage() {
  const { user, session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "active" | "archived">("all");

  useEffect(() => {
    if (session?.access_token) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [session]);

  async function fetchProjects() {
    try {
      setLoading(true);
      const statusParam = filter !== "all" ? `?status=${filter}` : "";
      const response = await fetch(`/api/user-projects/list${statusParam}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getIntegrationsCount = (integrations: Record<string, string>) => {
    return Object.values(integrations).filter(Boolean).length;
  };

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Sign in to view your projects</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to save and manage your projects.
          </p>
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and configure your generated projects.
          </p>
        </div>
        <Link href="/configure">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "draft", "active", "archived"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(status);
              setTimeout(fetchProjects, 0);
            }}
          >
            {status === "all" ? "All" : STATUS_CONFIG[status].label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProjects} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {filter === "all"
                ? "Create your first project to get started with the Dawson Does Framework."
                : `No ${filter} projects found.`}
            </p>
            {filter === "all" && (
              <Link href="/configure">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      TEMPLATE_COLORS[project.template || "default"] || TEMPLATE_COLORS.default
                    } flex items-center justify-center shadow-sm`}>
                      <span className="text-white font-bold text-sm">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${STATUS_CONFIG[project.status].color}`}
                      >
                        {STATUS_CONFIG[project.status].label}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2">
                        <Archive className="w-4 h-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {project.description && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {project.template && (
                    <span className="capitalize">{project.template}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </span>
                </div>

                {/* Tool Status */}
                <div className="flex items-center gap-2 mb-4">
                  {Object.entries(project.tool_status || {}).map(([tool, connected]) => (
                    <div
                      key={tool}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        connected 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-muted text-muted-foreground"
                      }`}
                      title={`${tool}: ${connected ? "Connected" : "Not connected"}`}
                    >
                      {connected ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        tool.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                </div>

                {/* NPX Token */}
                {project.npx_token && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <code className="text-xs text-muted-foreground">
                      npx @dawson-does/framework {project.npx_token}
                    </code>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {project.features?.length || 0} features
                  </span>
                  <span className="text-muted-foreground">
                    {getIntegrationsCount(project.integrations || {})} integrations
                  </span>
                </div>

                {/* Action */}
                <Link 
                  href={`/dashboard/projects/${project.id}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-sm font-medium transition-colors group/link"
                >
                  Open Project
                  <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

