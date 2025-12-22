/**
 * Type definitions for the visual editor
 */

export interface ElementInfo {
  id: string;
  tagName: string;
  textContent: string;
  innerHTML: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  path: string; // CSS selector path
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface ElementChanges {
  textContent?: string;
  innerHTML?: string;
  styles?: Record<string, string>;
  attributes?: Record<string, string>;
}

export interface EditorState {
  selectedElement: ElementInfo | null;
  hoveredElement: ElementInfo | null;
  history: string[];
  historyIndex: number;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedElementId?: string | null;
}

export interface EditorMessage {
  type: 'ELEMENT_SELECTED' | 'ELEMENT_HOVERED' | 'ELEMENT_UPDATED' | 'CURSOR_MOVED';
  payload: any;
}
