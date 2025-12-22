"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function ClerkUserButton() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
          Sign in
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{user.primaryEmailAddress?.emailAddress}</span>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}
