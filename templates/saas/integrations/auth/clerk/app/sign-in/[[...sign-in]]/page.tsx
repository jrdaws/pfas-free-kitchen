"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Check if Clerk is configured
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = 
  CLERK_KEY && 
  CLERK_KEY.startsWith("pk_") && 
  !CLERK_KEY.includes("placeholder");

export default function SignInPage() {
  const [SignIn, setSignIn] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (isClerkConfigured) {
      // Dynamically import Clerk SignIn only when configured
      import("@clerk/nextjs").then((clerk) => {
        setSignIn(() => clerk.SignIn);
      });
    }
  }, []);

  // Show placeholder if Clerk is not configured
  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In</h1>
          <p className="text-gray-600 text-center mb-6">
            Authentication is not configured yet.
            <br />
            <span className="text-sm">
              Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable sign-in.
            </span>
          </p>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled
            />
            <button 
              className="w-full p-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
              disabled
            >
              Sign In (Not Configured)
            </button>
          </div>
          <p className="text-gray-500 text-sm text-center mt-6">
            <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    );
  }

  // Show loading while Clerk component loads
  if (!SignIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
