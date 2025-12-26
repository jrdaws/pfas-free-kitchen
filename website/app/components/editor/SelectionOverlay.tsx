"use client";

import React from "react";
import { useEditor } from "./EditorContext";
import { Copy, Trash2, Type } from "lucide-react";

export function SelectionOverlay() {
  const { selectedElement, deleteElement, duplicateElement, setEditMode } =
    useEditor();

  if (!selectedElement) return null;

  const { position, tagName } = selectedElement;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
    >
      {/* Selection Border */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded-sm">
        {/* Corner Resize Handles */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-auto cursor-nw-resize" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-auto cursor-ne-resize" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-auto cursor-sw-resize" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-auto cursor-se-resize" />

        {/* Element Label & Actions */}
        <div className="absolute -top-7 left-0 flex items-center gap-1">
          {/* Element Type Label */}
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-t font-mono font-medium">
            {tagName.toLowerCase()}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-0.5 bg-card border border-blue-500 rounded shadow-sm pointer-events-auto">
            <button
              onClick={() => setEditMode("text")}
              className="p-1 hover:bg-blue-50 transition-colors"
              title="Edit Text"
            >
              <Type className="h-3 w-3 text-blue-600" />
            </button>
            <button
              onClick={duplicateElement}
              className="p-1 hover:bg-blue-50 transition-colors border-x border-blue-200"
              title="Duplicate"
            >
              <Copy className="h-3 w-3 text-blue-600" />
            </button>
            <button
              onClick={deleteElement}
              className="p-1 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
