"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Key,
  LogOut,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");

  const handleSave = async () => {
    setLoading(true);
    // In a real app, you'd update the user profile via Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not signed in</h2>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {(user.email?.charAt(0) || "U").toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-xl">
                {user.user_metadata?.full_name || "User"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address.
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">User ID</Label>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded-lg truncate">
                {user.id}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Account Created</Label>
              <p className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-sm">Authentication Provider</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {user.app_metadata?.provider || "email"}
              </Badge>
              {user.email_confirmed_at && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full sm:w-auto">
            Change Password
          </Button>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Sign out of your account or delete it permanently.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
              <Button variant="destructive" className="gap-2">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

