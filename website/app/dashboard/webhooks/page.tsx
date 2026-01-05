"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Play,
  Copy,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered: string | null;
  lastStatus: "success" | "failed" | null;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: "success" | "failed";
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

const EVENT_TYPES = [
  { value: "project.created", label: "Project Created" },
  { value: "project.updated", label: "Project Updated" },
  { value: "project.deleted", label: "Project Deleted" },
  { value: "export.started", label: "Export Started" },
  { value: "export.completed", label: "Export Completed" },
  { value: "export.failed", label: "Export Failed" },
  { value: "connection.added", label: "Connection Added" },
  { value: "connection.removed", label: "Connection Removed" },
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: "wh-001",
    name: "Slack Notifications",
    url: "https://hooks.slack.com/services/xxx/yyy/zzz",
    events: ["export.completed", "export.failed"],
    secret: "whsec_abc123",
    isActive: true,
    lastTriggered: new Date(Date.now() - 3600000).toISOString(),
    lastStatus: "success",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "wh-002",
    name: "Discord Bot",
    url: "https://discord.com/api/webhooks/xxx/yyy",
    events: ["project.created", "project.deleted"],
    secret: "whsec_def456",
    isActive: true,
    lastTriggered: new Date(Date.now() - 86400000).toISOString(),
    lastStatus: "success",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "wh-003",
    name: "Custom API",
    url: "https://api.example.com/webhooks/framework",
    events: ["export.completed"],
    secret: "whsec_ghi789",
    isActive: false,
    lastTriggered: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastStatus: "failed",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const MOCK_LOGS: WebhookLog[] = [
  {
    id: "log-001",
    webhookId: "wh-001",
    event: "export.completed",
    status: "success",
    statusCode: 200,
    responseTime: 245,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "log-002",
    webhookId: "wh-002",
    event: "project.created",
    status: "success",
    statusCode: 200,
    responseTime: 189,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "log-003",
    webhookId: "wh-003",
    event: "export.completed",
    status: "failed",
    statusCode: 500,
    responseTime: 5000,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export default function WebhooksPage() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS);
  const [logs] = useState<WebhookLog[]>(MOCK_LOGS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "" });

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, isActive: !wh.isActive } : wh))
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || selectedEvents.length === 0) return;

    const webhook: WebhookConfig = {
      id: `wh-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      events: selectedEvents,
      secret: `whsec_${Math.random().toString(36).slice(2)}`,
      isActive: true,
      lastTriggered: null,
      lastStatus: null,
      createdAt: new Date().toISOString(),
    };

    setWebhooks((prev) => [webhook, ...prev]);
    setNewWebhook({ name: "", url: "" });
    setSelectedEvents([]);
    setDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Webhook className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to manage webhooks</h2>
          <p className="text-muted-foreground">Set up notifications for your account events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when events happen in your account.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>
                Configure a new webhook endpoint to receive event notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Slack Notifications"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((event) => (
                    <label
                      key={event.value}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvents.includes(event.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, event.value]);
                          } else {
                            setSelectedEvents(selectedEvents.filter((v) => v !== event.value));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Webhook className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Add a webhook to receive notifications when events happen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      webhook.isActive ? "bg-emerald-500/10" : "bg-muted"
                    }`}>
                      <Webhook className={`w-5 h-5 ${
                        webhook.isActive ? "text-emerald-500" : "text-muted-foreground"
                      }`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                          {webhook.isActive ? "Active" : "Disabled"}
                        </Badge>
                        {webhook.lastStatus && (
                          <Badge
                            variant="outline"
                            className={
                              webhook.lastStatus === "success"
                                ? "text-emerald-500 border-emerald-500/30"
                                : "text-destructive border-destructive/30"
                            }
                          >
                            {webhook.lastStatus === "success" ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            Last: {webhook.lastStatus}
                          </Badge>
                        )}
                      </div>

                      <code className="text-sm text-muted-foreground font-mono block mt-1">
                        {webhook.url}
                      </code>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>
                          Created {formatDate(webhook.createdAt)}
                        </span>
                        {webhook.lastTriggered && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last triggered {formatDate(webhook.lastTriggered)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={() => toggleWebhook(webhook.id)}
                    />
                    <Button variant="ghost" size="icon">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWebhook(webhook.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Deliveries
          </CardTitle>
          <CardDescription>
            Last 10 webhook delivery attempts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No deliveries yet.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const webhook = webhooks.find((w) => w.id === log.webhookId);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {webhook?.name || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.event}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge
                        variant={log.statusCode < 400 ? "secondary" : "destructive"}
                      >
                        {log.statusCode}
                      </Badge>
                      <span className="text-muted-foreground">
                        {log.responseTime}ms
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

