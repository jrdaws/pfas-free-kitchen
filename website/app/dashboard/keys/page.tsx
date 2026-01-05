"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  CheckCircle2,
  Shield,
  AlertTriangle,
  ExternalLink,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface APIKey {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  addedAt: string;
  lastUsed: string | null;
  status: "active" | "expired" | "invalid";
}

const PROVIDERS = [
  { value: "supabase", label: "Supabase", docsUrl: "https://supabase.com/docs" },
  { value: "stripe", label: "Stripe", docsUrl: "https://stripe.com/docs" },
  { value: "clerk", label: "Clerk", docsUrl: "https://clerk.com/docs" },
  { value: "resend", label: "Resend", docsUrl: "https://resend.com/docs" },
  { value: "openai", label: "OpenAI", docsUrl: "https://platform.openai.com/docs" },
  { value: "anthropic", label: "Anthropic", docsUrl: "https://docs.anthropic.com" },
  { value: "posthog", label: "PostHog", docsUrl: "https://posthog.com/docs" },
  { value: "sentry", label: "Sentry", docsUrl: "https://docs.sentry.io" },
  { value: "vercel", label: "Vercel", docsUrl: "https://vercel.com/docs" },
  { value: "github", label: "GitHub", docsUrl: "https://docs.github.com" },
  { value: "algolia", label: "Algolia", docsUrl: "https://www.algolia.com/doc" },
  { value: "cloudinary", label: "Cloudinary", docsUrl: "https://cloudinary.com/documentation" },
  { value: "custom", label: "Custom", docsUrl: "" },
];

const MOCK_KEYS: APIKey[] = [
  {
    id: "key-001",
    name: "Supabase Production",
    provider: "supabase",
    keyPreview: "eyJhbGciOiJIUzI1NiIs...xyz",
    addedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
  },
  {
    id: "key-002",
    name: "Stripe Secret Key",
    provider: "stripe",
    keyPreview: "sk_live_...abc",
    addedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    status: "active",
  },
  {
    id: "key-003",
    name: "OpenAI API Key",
    provider: "openai",
    keyPreview: "sk-...def",
    addedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastUsed: null,
    status: "expired",
  },
];

export default function KeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>(MOCK_KEYS);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", provider: "", value: "" });

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyKey = (id: string, preview: string) => {
    navigator.clipboard.writeText(preview);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const addKey = () => {
    if (!newKey.name || !newKey.provider || !newKey.value) return;
    
    const key: APIKey = {
      id: `key-${Date.now()}`,
      name: newKey.name,
      provider: newKey.provider,
      keyPreview: `${newKey.value.slice(0, 10)}...${newKey.value.slice(-4)}`,
      addedAt: new Date().toISOString(),
      lastUsed: null,
      status: "active",
    };
    
    setKeys((prev) => [key, ...prev]);
    setNewKey({ name: "", provider: "", value: "" });
    setDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredKeys = keys.filter(
    (key) =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const STATUS_CONFIG = {
    active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500" },
    expired: { label: "Expired", color: "bg-yellow-500/10 text-yellow-500" },
    invalid: { label: "Invalid", color: "bg-destructive/10 text-destructive" },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Key className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to manage keys</h2>
          <p className="text-muted-foreground">Securely store your API keys.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Keys Vault</h1>
          <p className="text-muted-foreground mt-1">
            Securely store and manage your integration API keys.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>
                Store a new API key securely. Keys are encrypted at rest.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Stripe Production"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={newKey.provider}
                  onValueChange={(v) => setNewKey({ ...newKey, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">API Key</Label>
                <Input
                  id="value"
                  type="password"
                  placeholder="Enter your API key"
                  value={newKey.value}
                  onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addKey}>Save Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="flex items-start gap-3 py-4">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-500">Secure Storage</p>
            <p className="text-sm text-muted-foreground">
              All API keys are encrypted using AES-256 encryption. Keys are only decrypted when
              used for project exports and never logged.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search keys..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Keys List */}
      {filteredKeys.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API keys stored</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Add your first API key to use in project exports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredKeys.map((key) => {
            const provider = PROVIDERS.find((p) => p.value === key.provider);
            
            return (
              <Card key={key.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Key className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{key.name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {provider?.label || key.provider}
                          </Badge>
                          <Badge className={STATUS_CONFIG[key.status].color}>
                            {STATUS_CONFIG[key.status].label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-muted-foreground font-mono">
                            {visibleKeys.has(key.id) ? key.keyPreview : "••••••••••••"}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Added {formatDate(key.addedAt)}</span>
                          {key.lastUsed && (
                            <span>Last used {formatDate(key.lastUsed)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {provider?.docsUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyKey(key.id, key.keyPreview)}
                      >
                        {copiedId === key.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteKey(key.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {key.status === "expired" && (
                    <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">
                        This key may be expired. Update it to continue using this integration.
                      </span>
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

