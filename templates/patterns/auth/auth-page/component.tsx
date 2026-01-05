/**
 * Auth Pattern - Full Page
 * 
 * Full page login/signup form.
 * Best for: Enterprise, B2B, security-focused
 */

"use client";

import { useState } from "react";
import Link from "next/link";

interface AuthPageProps {
  mode?: "login" | "signup";
  logoText?: string;
  headline?: string;
  subtext?: string;
  providers?: ("google" | "github" | "microsoft")[];
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
  backgroundImage?: string;
}

export function AuthPage({
  mode = "login",
  logoText = "Company",
  headline,
  subtext,
  providers = [],
  onSubmit,
  backgroundImage,
}: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const defaultHeadline = mode === "login" ? "Welcome back" : "Create your account";
  const defaultSubtext = mode === "login"
    ? "Sign in to continue to your dashboard"
    : "Get started with your free account today";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit?.({ email, password, name: mode === "signup" ? name : undefined });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white block mb-8">
            {logoText}
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {headline || defaultHeadline}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {subtext || defaultSubtext}
          </p>

          {/* Social providers */}
          {providers.length > 0 && (
            <>
              <div className="space-y-3 mb-6">
                {providers.map((provider) => (
                  <button
                    key={provider}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">
                    or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Background */}
      {backgroundImage && (
        <div
          className="hidden lg:block flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
    </div>
  );
}

export default AuthPage;

