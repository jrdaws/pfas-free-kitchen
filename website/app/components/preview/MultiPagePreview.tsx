"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PreviewPageNav } from "./PreviewPageNav";
import { PreviewMinimap } from "./PreviewMinimap";
import { PreviewFrame } from "./PreviewFrame";
import { PageFlowDiagram } from "./PageFlowDiagram";
import { ComposedPreview } from "./ComposedPreview";
import type { PreviewComposition, DeviceType } from "./types";
import { ChevronLeft, ChevronRight, Map, LayoutGrid } from "lucide-react";

interface MultiPagePreviewProps {
  composition: PreviewComposition;
  initialPath?: string;
  initialDevice?: DeviceType;
  showMinimap?: boolean;
  showFlowDiagram?: boolean;
  className?: string;
}

export function MultiPagePreview({
  composition,
  initialPath = "/",
  initialDevice = "desktop",
  showMinimap = true,
  showFlowDiagram = false,
  className,
}: MultiPagePreviewProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [device, setDevice] = useState<DeviceType>(initialDevice);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sidebarView, setSidebarView] = useState<"minimap" | "flow">("minimap");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = useCallback(
    (path: string) => {
      // Don't navigate to same page
      if (path === currentPath) return;

      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
    },
    [currentPath, history, historyIndex]
  );

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleRefresh = useCallback(() => {
    // Could trigger a re-render or re-fetch
    // For now, just a visual reset
    const current = currentPath;
    setCurrentPath("");
    setTimeout(() => setCurrentPath(current), 100);
  }, [currentPath]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800",
        className
      )}
    >
      {/* Page navigation bar */}
      <PreviewPageNav
        pages={composition.pages}
        currentPath={currentPath}
        onChange={handleNavigate}
      />

      <div className="flex flex-1 min-h-0">
        {/* Main preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          <PreviewFrame
            device={device}
            onDeviceChange={setDevice}
            currentPath={currentPath}
            siteName={composition.projectName}
            onRefresh={handleRefresh}
            onBack={handleBack}
            onForward={handleForward}
            canGoBack={historyIndex > 0}
            canGoForward={historyIndex < history.length - 1}
          >
            <ComposedPreview
              composition={composition}
              currentPath={currentPath}
              onNavigate={handleNavigate}
            />
          </PreviewFrame>
        </div>

        {/* Sidebar */}
        {(showMinimap || showFlowDiagram) && (
          <div
            className={cn(
              "flex flex-col border-l border-slate-800 transition-all duration-300",
              sidebarCollapsed ? "w-10" : "w-56"
            )}
          >
            {/* Sidebar toggle and view selector */}
            <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-1">
                  {showMinimap && (
                    <button
                      onClick={() => setSidebarView("minimap")}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        sidebarView === "minimap"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title="Page thumbnails"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  )}
                  {showFlowDiagram && (
                    <button
                      onClick={() => setSidebarView("flow")}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        sidebarView === "flow"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title="Site structure"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Sidebar content */}
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-auto">
                {sidebarView === "minimap" && showMinimap ? (
                  <PreviewMinimap
                    pages={composition.pages}
                    currentPath={currentPath}
                    onChange={handleNavigate}
                    className="border-0 w-full"
                  />
                ) : sidebarView === "flow" && showFlowDiagram ? (
                  <PageFlowDiagram
                    pages={composition.pages}
                    currentPath={currentPath}
                    onChange={handleNavigate}
                    className="border-0"
                  />
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

