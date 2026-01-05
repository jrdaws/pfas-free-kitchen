"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Save,
  Download,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  Trash2,
  Archive,
  Settings2,
  Code2,
  Palette,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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
  project_config: Record<string, unknown>;
  ai_config: Record<string, unknown>;
  feedback_notes: string | null;
  created_at: string;
  updated_at: string;
}

const INTEGRATION_LABELS: Record<string, string> = {
  auth: "Authentication",
  payments: "Payments",
  email: "Email",
  analytics: "Analytics",
  storage: "Storage",
  search: "Search",
  cms: "CMS",
  monitoring: "Error Monitoring",
  ai: "AI Provider",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  useEffect(() => {
    if (session?.access_token && params.id) {
      fetchProject();
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
        throw new Error("Failed to fetch project");
      }

      const data = await response.json();
      const proj = data.project;
      setProject(proj);
      setName(proj.name);
      setDescription(proj.description || "");
      setFeedbackNotes(proj.feedback_notes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!project) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/user-projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name,
          description,
          feedback_notes: feedbackNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const copyNpxCommand = () => {
    if (project?.npx_token) {
      navigator.clipboard.writeText(`npx @dawson-does/framework ${project.npx_token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-8 justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-destructive">{error || "Project not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(project.created_at)}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              project.status === "active"
                ? "bg-emerald-500/10 text-emerald-500"
                : project.status === "draft"
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-muted text-muted-foreground"
            }
          >
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
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

      {/* NPX Command */}
      {project.npx_token && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Quick Start Command</p>
                <code className="text-sm text-muted-foreground">
                  npx @dawson-does/framework {project.npx_token}
                </code>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyNpxCommand} className="gap-2">
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Palette className="w-4 h-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Edit your project's basic information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Input value={project.template || "Not set"} disabled className="bg-muted capitalize" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Any additional notes or feedback..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Slug</Label>
                  <Input value={project.slug || ""} disabled className="bg-muted font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <Input value={formatDate(project.updated_at)} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Tools</CardTitle>
              <CardDescription>
                Services connected to this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {Object.entries(project.tool_status || {}).map(([tool, connected]) => (
                  <div
                    key={tool}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      connected ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/50"
                    }`}
                  >
                    <span className="capitalize font-medium">{tool}</span>
                    <Switch checked={connected} disabled />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Archive className="w-4 h-4" />
                Archive Project
              </Button>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured Integrations</CardTitle>
              <CardDescription>
                Services and providers selected for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(project.integrations || {}).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No integrations configured.</p>
                  <Link href="/configure">
                    <Button variant="outline" className="mt-4 gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Configure Integrations
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(project.integrations || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <span className="font-medium">
                        {INTEGRATION_LABELS[key] || key}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selected Features</CardTitle>
              <CardDescription>
                Features included in this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(project.features || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No features selected.</p>
                  <Link href="/configure">
                    <Button variant="outline" className="mt-4 gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Select Features
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(project.features || []).map((feature) => (
                    <Badge key={feature} variant="outline" className="capitalize">
                      {feature.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

