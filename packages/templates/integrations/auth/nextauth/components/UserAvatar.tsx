"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function UserAvatar({ size = "md", className = "", showName = false }: UserAvatarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const pixels = sizeMap[size];

  if (!user) {
    return (
      <div
        className={`rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ width: pixels, height: pixels }}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || "User avatar"}
          width={pixels}
          height={pixels}
          className="rounded-full"
        />
      ) : (
        <div
          className="rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium"
          style={{ width: pixels, height: pixels }}
        >
          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
      {showName && user.name && (
        <span className="text-sm font-medium">{user.name}</span>
      )}
    </div>
  );
}

