"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User } from "lucide-react";

interface NavProps {
  projectName: string;
  links: string[];
  showAuth?: boolean;
  variant?: "solid" | "transparent";
  /** When true, shows static auth buttons (for preview mode) */
  previewMode?: boolean;
}

export function Nav({
  projectName,
  links,
  showAuth = true,
  variant = "solid",
  previewMode = false,
}: NavProps) {
  // Only use auth hook when not in preview mode
  const auth = previewMode ? null : useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;

  return (
    <nav
      className={cn(
        "w-full px-6 py-4 flex items-center justify-between",
        variant === "solid" && "bg-[#0A0A0A] border-b border-white/10",
        variant === "transparent" && "bg-transparent absolute top-0 left-0 right-0 z-50"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-orange-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {projectName?.charAt(0)?.toUpperCase() || "P"}
          </span>
        </div>
        <span className="text-white font-semibold text-lg">{projectName || "Project"}</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {(links || []).map((link, i) => (
          <span
            key={i}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            {link}
          </span>
        ))}
      </div>

      {/* Auth Section */}
      {showAuth && (
        <div className="flex items-center gap-3">
          {previewMode ? (
            // Static preview buttons
            <>
          <button className="text-gray-400 hover:text-white transition-colors text-sm">
            Log in
          </button>
              <button className="px-4 py-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-lg text-sm font-medium transition-colors">
            Sign up
          </button>
            </>
          ) : user ? (
            // Logged in state
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.email || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#F97316]" />
                  </div>
                )}
                <span className="text-sm text-gray-300 hidden sm:block">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={() => signOut?.()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Logged out state
            <>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Mobile menu button */}
      <button className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
}

