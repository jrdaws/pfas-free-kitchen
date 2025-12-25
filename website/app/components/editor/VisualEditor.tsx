"use client";

import React, { useEffect, useCallback } from "react";
import { EditorProvider, useEditor } from "./EditorContext";
import { SelectionOverlay } from "./SelectionOverlay";
import { PropertiesPanel } from "./PropertiesPanel";
import { ComponentTree } from "./ComponentTree";
import { getInjectionScript } from "./iframe-injector";
import { EditorMessage, SelectedElement, ElementTreeNode } from "./types";
import { Undo2, Redo2 } from "lucide-react";

interface VisualEditorProps {
  html: string;
  onHtmlChange?: (html: string) => void;
  className?: string;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

function VisualEditorContent({ html, onHtmlChange, className, viewport = 'desktop' }: VisualEditorProps) {
  const {
    iframeRef,
    registerIframe,
    selectElement,
    hoverElement,
    selectedElement,
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistory,
  } = useEditor();

  // Inject the selection script into the HTML
  const enhancedHtml = React.useMemo(() => {
    const script = getInjectionScript();
    // Inject script before closing body tag
    if (html.includes("</body>")) {
      return html.replace(
        "</body>",
        `<script>${script}</script></body>`
      );
    }
    // If no body tag, append script at the end
    return html + `<script>${script}</script>`;
  }, [html]);

  // Handle messages from iframe
  const handleMessage = useCallback(
    (event: MessageEvent<EditorMessage>) => {
      const message = event.data;

      if (!message.type) return;

      switch (message.type) {
        case "selection":
          selectElement(message.payload as SelectedElement);
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
          // Request initial tree and HTML
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              { type: "getTree" },
              "*"
            );
            // Request initial HTML for history
            iframeRef.current.contentWindow.postMessage(
              { type: "getHtml" },
              "*"
            );
          }
          break;
        case "html":
          // Received HTML from iframe - push to history
          if (message.payload?.html && onHtmlChange) {
            onHtmlChange(message.payload.html);
          }
          pushHistory(message.payload?.html || "");
          break;
        case "error":
          console.error("Editor error:", message.payload);
          break;
      }
    },
    [selectElement, hoverElement, iframeRef, onHtmlChange, pushHistory]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to deselect
      if (e.key === "Escape") {
        selectElement(null);
        return;
      }

      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((e.ctrlKey && e.key === "y") || (e.metaKey && e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectElement, undo, redo]);

  // Viewport width mapping
  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className={`flex h-full ${className || ""}`}>
      {/* Left Sidebar - Component Tree */}
      <div className="w-64 border-r border-terminal-text/20 bg-terminal-bg/50">
        <ComponentTree />
      </div>

      {/* Center - Preview with Toolbar and Overlay */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-stone-50">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-terminal-text/20 bg-terminal-bg/30">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-terminal-text/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 className="h-4 w-4 text-terminal-text" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-terminal-text/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y / Cmd+Shift+Z)"
          >
            <Redo2 className="h-4 w-4 text-terminal-text" />
          </button>
          <div className="ml-2 text-xs text-terminal-dim">
            Press Escape to deselect
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 relative overflow-auto bg-gray-100">
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
                title="Visual Editor Preview"
              />
              {selectedElement && <SelectionOverlay />}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 border-l border-terminal-text/20 bg-terminal-bg/50">
        <PropertiesPanel />
      </div>
    </div>
  );
}

export function VisualEditor(props: VisualEditorProps) {
  return (
    <EditorProvider>
      <VisualEditorContent {...props} />
    </EditorProvider>
  );
}
