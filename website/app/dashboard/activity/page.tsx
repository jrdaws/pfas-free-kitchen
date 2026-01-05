"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  Download,
  Upload,
  Settings,
  User,
  Key,
  Link2,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Filter,
  Calendar,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActivityType = 
  | "export" 
  | "import" 
  | "settings" 
  | "profile" 
  | "api_key" 
  | "connection" 
  | "delete" 
  | "edit" 
  | "create" 
  | "login" 
  | "logout";

interface ActivityItem {
  id: string;
  type: ActivityType;
  action: string;
  details: string;
  metadata?: Record<string, string>;
  timestamp: string;
  ip?: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof Activity; color: string; bg: string }> = {
  export: { icon: Download, color: "text-blue-500", bg: "bg-blue-500/10" },
  import: { icon: Upload, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  settings: { icon: Settings, color: "text-gray-500", bg: "bg-gray-500/10" },
  profile: { icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
  api_key: { icon: Key, color: "text-amber-500", bg: "bg-amber-500/10" },
  connection: { icon: Link2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  delete: { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10" },
  edit: { icon: Edit, color: "text-orange-500", bg: "bg-orange-500/10" },
  create: { icon: Plus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  login: { icon: LogIn, color: "text-green-500", bg: "bg-green-500/10" },
  logout: { icon: LogOut, color: "text-gray-500", bg: "bg-gray-500/10" },
};

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act-001",
    type: "export",
    action: "Project Exported",
    details: "My SaaS App exported as ZIP",
    metadata: { format: "zip", size: "2.4 MB" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-002",
    type: "api_key",
    action: "API Key Added",
    details: "Added Stripe API key",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-003",
    type: "connection",
    action: "Service Connected",
    details: "Connected Supabase account",
    metadata: { provider: "supabase" },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-004",
    type: "create",
    action: "Project Created",
    details: "Created new project: E-commerce Store",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-005",
    type: "settings",
    action: "Settings Updated",
    details: "Changed default template to SaaS",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-006",
    type: "login",
    action: "Signed In",
    details: "Signed in with Google",
    metadata: { method: "google" },
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    ip: "192.168.1.100",
  },
  {
    id: "act-007",
    type: "delete",
    action: "Project Deleted",
    details: "Deleted project: Old Test Project",
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    ip: "192.168.1.1",
  },
  {
    id: "act-008",
    type: "profile",
    action: "Profile Updated",
    details: "Updated display name",
    timestamp: new Date(Date.now() - 518400000).toISOString(),
    ip: "192.168.1.1",
  },
];

export default function ActivityPage() {
  const { user } = useAuth();
  const [activity] = useState<ActivityItem[]>(MOCK_ACTIVITY);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredActivity = activity
    .filter((a) => filter === "all" || a.type === filter)
    .filter(
      (a) =>
        a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Group by date
  const groupedActivity = filteredActivity.reduce((acc, item) => {
    const date = new Date(item.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view activity</h2>
          <p className="text-muted-foreground">Your activity log will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Track all actions and changes in your account.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="export">Exports</SelectItem>
            <SelectItem value="create">Created</SelectItem>
            <SelectItem value="edit">Edited</SelectItem>
            <SelectItem value="delete">Deleted</SelectItem>
            <SelectItem value="api_key">API Keys</SelectItem>
            <SelectItem value="connection">Connections</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="login">Logins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedActivity).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Try a different search term or filter."
                : "Your activity will appear here as you use the platform."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivity).map(([date, items]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Activity Items */}
              <div className="space-y-3 ml-6 border-l-2 border-border pl-6">
                {items.map((item) => {
                  const config = ACTIVITY_CONFIG[item.type];
                  const Icon = config.icon;

                  return (
                    <div key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full ${config.bg} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-current" style={{ color: config.color.replace("text-", "") }} />
                      </div>

                      <Card>
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-4 h-4 ${config.color}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{item.action}</h4>
                                <p className="text-sm text-muted-foreground">{item.details}</p>
                                
                                {item.metadata && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Object.entries(item.metadata).map(([key, value]) => (
                                      <Badge key={key} variant="secondary" className="text-xs">
                                        {key}: {value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                              <div>{formatTimestamp(item.timestamp)}</div>
                              {item.ip && (
                                <div className="mt-1 font-mono">{item.ip}</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="gap-2">
          Load More Activity
        </Button>
      </div>
    </div>
  );
}

