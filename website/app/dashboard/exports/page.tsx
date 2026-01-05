"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Download,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportRecord {
  id: string;
  projectId: string;
  projectName: string;
  template: string;
  status: "completed" | "failed" | "processing";
  format: "zip" | "github" | "vercel";
  fileSize: number;
  integrations: string[];
  features: string[];
  createdAt: string;
  downloadUrl?: string;
  errorMessage?: string;
}

// Mock data - replace with API call
const MOCK_EXPORTS: ExportRecord[] = [
  {
    id: "exp-001",
    projectId: "proj-001",
    projectName: "My SaaS App",
    template: "saas",
    status: "completed",
    format: "zip",
    fileSize: 2457600,
    integrations: ["supabase", "stripe", "resend"],
    features: ["auth", "payments", "email"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    downloadUrl: "/api/export/download/exp-001",
  },
  {
    id: "exp-002",
    projectId: "proj-002",
    projectName: "E-commerce Store",
    template: "ecommerce",
    status: "completed",
    format: "github",
    fileSize: 3145728,
    integrations: ["supabase", "stripe"],
    features: ["cart", "checkout", "products"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "exp-003",
    projectId: "proj-001",
    projectName: "My SaaS App",
    template: "saas",
    status: "failed",
    format: "vercel",
    fileSize: 0,
    integrations: ["clerk"],
    features: ["auth"],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    errorMessage: "Vercel token expired",
  },
];

const STATUS_CONFIG = {
  completed: { 
    icon: CheckCircle2, 
    label: "Completed", 
    color: "text-emerald-500",
    bg: "bg-emerald-500/10" 
  },
  failed: { 
    icon: XCircle, 
    label: "Failed", 
    color: "text-destructive",
    bg: "bg-destructive/10" 
  },
  processing: { 
    icon: Clock, 
    label: "Processing", 
    color: "text-yellow-500",
    bg: "bg-yellow-500/10" 
  },
};

const FORMAT_CONFIG = {
  zip: { label: "ZIP Download", icon: Package },
  github: { label: "GitHub Repo", icon: ExternalLink },
  vercel: { label: "Vercel Deploy", icon: ExternalLink },
};

export default function ExportsPage() {
  const { user } = useAuth();
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setExports(MOCK_EXPORTS);
      setLoading(false);
    }, 500);
  }, []);

  const filteredExports = exports.filter((exp) => 
    filter === "all" ? true : exp.status === filter
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const stats = {
    total: exports.length,
    completed: exports.filter((e) => e.status === "completed").length,
    failed: exports.filter((e) => e.status === "failed").length,
    totalSize: exports.reduce((acc, e) => acc + e.fileSize, 0),
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Download className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view exports</h2>
          <p className="text-muted-foreground">Your export history will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export History</h1>
          <p className="text-muted-foreground mt-1">
            Track all your project exports and downloads.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Exports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <p className="text-sm text-muted-foreground">Total Size</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exports</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExports.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Download className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exports yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Export a project to see your history here.
            </p>
            <Link href="/configure">
              <Button className="mt-6">Create & Export Project</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Export List */}
      {!loading && filteredExports.length > 0 && (
        <div className="space-y-4">
          {filteredExports.map((exp) => {
            const StatusIcon = STATUS_CONFIG[exp.status].icon;
            const FormatIcon = FORMAT_CONFIG[exp.format].icon;
            
            return (
              <Card key={exp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${STATUS_CONFIG[exp.status].bg} flex items-center justify-center`}>
                        <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[exp.status].color}`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{exp.projectName}</h3>
                          <Badge variant="outline" className="capitalize text-xs">
                            {exp.template}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FormatIcon className="w-3 h-3" />
                            {FORMAT_CONFIG[exp.format].label}
                          </span>
                          <span>{formatFileSize(exp.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {exp.integrations.map((int) => (
                        <Badge key={int} variant="secondary" className="text-xs capitalize">
                          {int}
                        </Badge>
                      ))}
                      
                      {exp.status === "completed" && exp.downloadUrl && (
                        <Button size="sm" variant="outline" className="gap-2 ml-4">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                      
                      {exp.status === "failed" && (
                        <Button size="sm" variant="outline" className="gap-2 ml-4">
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {exp.errorMessage && (
                    <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm text-destructive">
                      Error: {exp.errorMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

