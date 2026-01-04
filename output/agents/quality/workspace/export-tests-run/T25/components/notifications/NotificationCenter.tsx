"use client";

import { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ userId, isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-4 top-16 w-96 max-h-[70vh] bg-white rounded-lg shadow-xl border overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <button className="text-sm text-blue-600">Mark all as read</button>
        </div>
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No notifications yet</p>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className={`px-4 py-3 hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""}`}>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

