/**
 * Stub for @dawson-framework/collaboration package
 * Used when the package is not available (e.g., Vercel build)
 */

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  selectedElement?: string;
  isActive: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  element?: string;
}

export interface CollaborationState {
  users: UserPresence[];
  cursors: Map<string, CursorPosition>;
  isConnected: boolean;
}

interface CollaborationOptions {
  projectId?: string;
  userId?: string;
  userName?: string;
  wsUrl?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

interface CollaborationSession {
  provider: {
    awareness: {
      setLocalStateField: (field: string, value: unknown) => void;
      getStates: () => Map<number, Record<string, unknown>>;
    };
  };
}

// Stub hooks that return empty/default values
export function useCollaboration(_options?: CollaborationOptions) {
  return {
    session: null as CollaborationSession | null,
    users: [] as UserPresence[],
    cursors: new Map<string, CursorPosition>(),
    isConnected: false,
    currentUserId: null,
    connect: () => {},
    disconnect: () => {},
    updateCursor: (_pos: Partial<CursorPosition>) => {},
    updateSelection: (_elementId: string | null) => {},
    clearSelection: () => {},
  };
}

interface CollaborativeDocumentOptions {
  session: CollaborationSession | null;
  filePath?: string;
  onContentChange?: (content: string) => void;
}

export function useCollaborativeDocument(_options?: CollaborativeDocumentOptions) {
  return {
    html: "",
    content: "",
    updateHtml: (_html: string) => {},
    updateContent: (_content: string) => {},
    cursors: new Map<string, CursorPosition>(),
    updateCursor: (_pos: Partial<CursorPosition>) => {},
    isLoading: false,
  };
}

export function useCursors() {
  return {
    cursors: new Map<string, CursorPosition>(),
    updateCursor: () => {},
  };
}

