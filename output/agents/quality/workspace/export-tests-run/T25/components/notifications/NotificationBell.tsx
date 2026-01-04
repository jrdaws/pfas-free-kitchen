"use client";

import { useState, useEffect } from "react";

interface NotificationBellProps {
  userId: string;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ userId, onClick, className = "" }: NotificationBellProps) {
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch(`/api/notifications/unseen?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUnseenCount(data.count || 0);
        }
      } catch {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <button onClick={onClick} className={`relative p-2 rounded-full hover:bg-gray-100 ${className}`}>
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unseenCount > 0 && (
        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full translate-x-1/2 -translate-y-1/2">
          {unseenCount > 99 ? "99+" : unseenCount}
        </span>
      )}
    </button>
  );
}

