"use client";

import React, { useEffect, useCallback, useState } from "react";
import {
  CollaborativeEditorProvider,
  useCollaborativeEditor,
} from "./CollaborativeEditorContext";
import { EditorProvider, useEditor } from "./EditorContext";
import { SelectionOverlay } from "./SelectionOverlay";
import { PropertiesPanel } from "./PropertiesPanel";
import { ComponentTree } from "./ComponentTree";
import { RemoteCursor } from "./RemoteCursor";
import { PresenceIndicator } from "./PresenceIndicator";
import { ElementEditingIndicator } from "./ElementEditingIndicator";
import { useCollaborativeHTML } from "./useCollaborativeHTML";
import { getInjectionScript } from "./iframe-injector";
import { EditorMessage, SelectedElement } from "./types";

interface CollaborativeVisualEditorProps {
  html: string;
  onHtmlChange?: (html: string) => void;
  className?: string;
  projectId?: string;
  userId?: string;
  userName?: string;
  enableCollaboration?: boolean;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

function CollaborativeVisualEditorContent({
  html: initialHtml,
  onHtmlChange,
  className,
  projectId = "default-project",
  userId = "default-user",
  userName = "Default User",
  viewport = 'desktop',
}: Omit<CollaborativeVisualEditorProps, "enableCollaboration">) {
  const {
    iframeRef,
    registerIframe,
    selectElement,
    hoverElement,
    selectedElement,
  } = useEditor();

  const {
    users,
    cursors,
    isConnected,
    currentUserId,
    updateSelectedElement,
    getUserEditingElement,
  } = useCollaborativeEditor();

  // Use collaborative HTML hook for real-time synchronization
  const {
    html: syncedHtml,
    updateHtml,
    isLoading: htmlLoading,
  } = useCollaborativeHTML({
    projectId,
    userId,
    userName,
    filePath: "preview.html",
    initialHtml,
    onHtmlChange,
  });

  // Track if we're in the middle of an update to prevent loops
  const [isUpdating, setIsUpdating] = useState(false);

  // Track elements being edited by other users
  const [editingIndicators, setEditingIndicators] = useState<
    Map<string, { user: any; position: any }>
  >(new Map());

  // Inject the selection script into the HTML
  const enhancedHtml = React.useMemo(() => {
    const script = getInjectionScript();
    // Inject script before closing body tag
    if (syncedHtml.includes("</body>")) {
      return syncedHtml.replace("</body>", `<script>${script}</script></body>`);
    }
    // If no body tag, append script at the end
    return syncedHtml + `<script>${script}</script>`;
  }, [syncedHtml]);

  // Handle messages from iframe
  const handleMessage = useCallback(
    (event: MessageEvent<EditorMessage>) => {
      const message = event.data;

      if (!message.type) return;

      switch (message.type) {
        case "selection":
          {
            const element = message.payload as SelectedElement;
            selectElement(element);
            // Broadcast selection to other users
            if (element) {
              updateSelectedElement(element.id, element.path);
            } else {
              updateSelectedElement(null);
            }
          }
          break;
        case "hover":
          hoverElement(message.payload as SelectedElement);
          break;
        case "unhover":
          hoverElement(null);
          break;
        case "tree":
          // Tree updates are handled internally by context
          break;
        case "ready":
          // Request initial tree
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              { type: "getTree" },
              "*"
            );
          }
          break;
        case "html":
          // Handle HTML updates from the iframe (after any DOM modification)
          if (message.payload && typeof message.payload === "object" && "html" in message.payload) {
            const newHtml = (message.payload as any).html;
            if (newHtml && !isUpdating) {
              console.log("📝 [CollaborativeEditor] Received HTML update from iframe");
              setIsUpdating(true);
              updateHtml(newHtml);
              setTimeout(() => setIsUpdating(false), 100);
            }
          }
          break;
        case "error":
          console.error("Editor error:", message.payload);
          break;
      }
    },
    [selectElement, hoverElement, iframeRef, updateHtml, isUpdating, updateSelectedElement]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Handle escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        selectElement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectElement]);

  // Listen for HTML changes from the editor context (property panel updates)
  useEffect(() => {
    const handleEditorUpdate = (event: CustomEvent) => {
      if (event.detail?.html && !isUpdating) {
        console.log("📝 [CollaborativeEditor] Received HTML update from editor");
        setIsUpdating(true);
        updateHtml(event.detail.html);
        setTimeout(() => setIsUpdating(false), 100);
      }
    };

    window.addEventListener("editor:htmlUpdate" as any, handleEditorUpdate);
    return () => {
      window.removeEventListener("editor:htmlUpdate" as any, handleEditorUpdate);
    };
  }, [updateHtml, isUpdating]);

  // Update editing indicators when users' selections change
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const newIndicators = new Map();

    // Check each user for selected elements
    users.forEach((user) => {
      if (user.id === currentUserId) return; // Skip current user

      // Get awareness state for this user
      const awarenessStates = users.map((u) => {
        const states = Array.from(
          (iframeRef.current as any)?.__yjs_awareness?.getStates() || []
        ) as Array<[any, any]>;
        return states.find(([clientId, state]) => state.user?.id === u.id);
      });

      // Find selected element for this user
      const userState = awarenessStates.find((state) => {
        if (!state) return false;
        const [, stateData] = state;
        return stateData.user?.id === user.id;
      });

      if (userState) {
        const [, stateData] = userState;
        const selectedEl = stateData.selectedElement;

        if (selectedEl?.elementId && iframeRef.current?.contentWindow) {
          // Query iframe for element position
          iframeRef.current.contentWindow.postMessage(
            {
              type: "getElementPosition",
              payload: { elementId: selectedEl.elementId },
            },
            "*"
          );

          // Store temporarily (will be updated when position response arrives)
          newIndicators.set(selectedEl.elementId, {
            user,
            position: null, // Will be filled by message response
          });
        }
      }
    });

    if (newIndicators.size !== editingIndicators.size) {
      setEditingIndicators(newIndicators);
    }
  }, [users, currentUserId, iframeRef]);

  // Handle element position responses from iframe
  useEffect(() => {
    const handlePositionMessage = (event: MessageEvent) => {
      if (event.data.type === "elementPosition") {
        const { elementId, position } = event.data.payload;
        if (position) {
          setEditingIndicators((prev) => {
            const indicator = prev.get(elementId);
            if (indicator) {
              const newMap = new Map(prev);
              newMap.set(elementId, { ...indicator, position });
              return newMap;
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener("message", handlePositionMessage);
    return () => window.removeEventListener("message", handlePositionMessage);
  }, []);

  // Viewport width mapping
  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {/* Presence Indicator */}
      <PresenceIndicator
        users={users}
        currentUserId={currentUserId}
        isConnected={isConnected}
      />

      {/* Loading State */}
      {htmlLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-terminal-bg border border-terminal-accent rounded-lg p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-terminal-accent border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-terminal-text">Syncing document...</p>
          </div>
        </div>
      )}

      {/* Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Component Tree */}
        <div className="w-64 border-r border-terminal-text/20 bg-terminal-bg/50 overflow-auto">
          <ComponentTree />
        </div>

        {/* Center - Preview with Overlay */}
        <div className="flex-1 relative overflow-auto bg-stone-100">
          <div className="flex justify-center min-h-full p-4">
            <div
              className="relative transition-all duration-300"
              style={{
                width: viewportWidths[viewport],
                maxWidth: '100%'
              }}
            >
              <iframe
                ref={(iframe) => {
                  if (iframe) registerIframe(iframe);
                }}
                srcDoc={enhancedHtml}
                className="w-full border-0 bg-stone-50 shadow-lg"
                style={{ minHeight: "600px", height: "100%" }}
                sandbox="allow-scripts allow-same-origin"
                title="Collaborative Visual Editor"
              />
              {selectedElement && <SelectionOverlay />}

            {/* Render remote cursors */}
            {Array.from(cursors.entries()).map(([userId, cursor]) => {
              const user = users.find((u) => u.id === userId);
              return user && user.id !== currentUserId ? (
                <RemoteCursor key={userId} user={user} cursor={cursor} />
              ) : null;
            })}

              {/* Render editing indicators for elements being edited by others */}
              {Array.from(editingIndicators.entries()).map(([elementId, indicator]) => {
                if (!indicator.position) return null;
                return (
                  <ElementEditingIndicator
                    key={elementId}
                    user={indicator.user}
                    elementPosition={indicator.position}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 border-l border-terminal-text/20 bg-terminal-bg/50 overflow-auto">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}

export function CollaborativeVisualEditor({
  projectId,
  userId,
  userName,
  enableCollaboration = true,
  viewport,
  ...props
}: CollaborativeVisualEditorProps) {
  return (
    <EditorProvider>
      <CollaborativeEditorProvider
        projectId={projectId}
        userId={userId}
        userName={userName}
        enabled={enableCollaboration}
      >
        <CollaborativeVisualEditorContent
          {...props}
          projectId={projectId}
          userId={userId}
          userName={userName}
          viewport={viewport}
        />
      </CollaborativeEditorProvider>
    </EditorProvider>
  );
}
