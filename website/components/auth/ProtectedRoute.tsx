"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * Wrapper component that requires authentication.
 * Redirects to login page if user is not authenticated.
 * 
 * @example
 * <ProtectedRoute>
 *   <MyDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  fallbackUrl = "/login" 
}: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && isConfigured) {
      router.push(fallbackUrl);
    }
  }, [user, loading, isConfigured, router, fallbackUrl]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316] mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not configured, show message instead of redirecting
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Authentication Not Available
          </h2>
          <p className="text-sm text-muted-foreground">
            This feature requires Supabase authentication to be configured.
            Please set up your environment variables to enable user accounts.
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

