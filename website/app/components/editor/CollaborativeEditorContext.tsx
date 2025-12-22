"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { EditorProvider, useEditor } from "./EditorContext";
import {
  useCollaboration,
  useCollaborativeDocument,
  UserPresence,
  CursorPosition,
} from "@dawson-framework/collaboration";

interface CollaborativeEditorContextType {
  users: UserPresence[];
  cursors: Map<string, CursorPosition>;
  isConnected: boolean;
  collaborationEnabled: boolean;
  currentUserId: string | null;
  updateSelectedElement: (elementId: string | null, elementPath?: string) => void;
  getUserEditingElement: (elementId: string) => UserPresence | null;
}

const CollaborativeEditorContext = createContext<
  CollaborativeEditorContextType | undefined
>(undefined);

interface CollaborativeEditorProviderProps {
  children: ReactNode;
  projectId?: string;
  userId?: string;
  userName?: string;
  enabled?: boolean;
}

export function CollaborativeEditorProvider({
  children,
  projectId,
  userId,
  userName,
  enabled = true,
}: CollaborativeEditorProviderProps) {
  const [collaborationEnabled, setCollaborationEnabled] = useState(enabled);

  // Generate a session ID if not provided
  const sessionUserId = userId || `user-${Math.random().toString(36).substr(2, 9)}`;
  const sessionUserName = userName || `User ${sessionUserId.slice(0, 6)}`;
  const sessionProjectId = projectId || "default-project";

  const wsUrl = process.env.NEXT_PUBLIC_COLLABORATION_WS || "ws://localhost:1234/collaborate";

  // Set up collaboration
  const {
    session,
    users,
    cursors,
    isConnected,
    updateCursor,
    updateSelection,
    clearSelection,
  } = useCollaboration({
    projectId: sessionProjectId,
    userId: sessionUserId,
    userName: sessionUserName,
    wsUrl,
    onConnected: () => {
      console.log("✅ Connected to collaboration server");
    },
    onDisconnected: () => {
      console.log("⚠️ Disconnected from collaboration server");
    },
    onError: (error) => {
      console.error("❌ Collaboration error:", error);
      setCollaborationEnabled(false);
    },
  });

  // Track mouse movement for cursor position
  useEffect(() => {
    if (!collaborationEnabled || !isConnected) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor({
        x: e.clientX,
        y: e.clientY,
        element: "editor",
      });
    };

    // Throttle cursor updates
    let timeoutId: NodeJS.Timeout;
    const throttledMouseMove = (e: MouseEvent) => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleMouseMove(e);
        timeoutId = null as any;
      }, 50); // 50ms throttle
    };

    window.addEventListener("mousemove", throttledMouseMove);
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [collaborationEnabled, isConnected, updateCursor]);

  // Update selected element in presence
  const updateSelectedElement = useCallback(
    (elementId: string | null, elementPath?: string) => {
      if (!session || !isConnected) return;

      if (elementId) {
        console.log(`🎯 [CollaborativeEditor] User selected element: ${elementId}`);
        // Update presence with selected element info
        session.provider.awareness.setLocalStateField("selectedElement", {
          elementId,
          elementPath: elementPath || elementId,
          timestamp: Date.now(),
        });
      } else {
        console.log("🎯 [CollaborativeEditor] User deselected element");
        // Clear selected element
        session.provider.awareness.setLocalStateField("selectedElement", null);
      }
    },
    [session, isConnected]
  );

  // Get user who is editing a specific element
  const getUserEditingElement = useCallback(
    (elementId: string): UserPresence | null => {
      if (!elementId) return null;

      // Find user whose selectedElement matches this elementId
      for (const user of users) {
        const awarenessState = session?.provider.awareness.getStates();
        if (!awarenessState) continue;

        // Find this user's awareness state
        for (const [clientId, state] of awarenessState.entries()) {
          if (state.user?.id === user.id && state.selectedElement?.elementId === elementId) {
            return user;
          }
        }
      }

      return null;
    },
    [users, session]
  );

  const value: CollaborativeEditorContextType = {
    users,
    cursors,
    isConnected,
    collaborationEnabled,
    currentUserId: sessionUserId,
    updateSelectedElement,
    getUserEditingElement,
  };

  return (
    <CollaborativeEditorContext.Provider value={value}>
      <EditorProvider>{children}</EditorProvider>
    </CollaborativeEditorContext.Provider>
  );
}

export function useCollaborativeEditor() {
  const context = useContext(CollaborativeEditorContext);
  if (!context) {
    throw new Error(
      "useCollaborativeEditor must be used within CollaborativeEditorProvider"
    );
  }
  return context;
}
