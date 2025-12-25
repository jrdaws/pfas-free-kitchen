/**
 * Guest Session Management
 * 
 * Handles anonymous/guest user sessions for browsing without authentication.
 */

const GUEST_SESSION_KEY = "guest_session_id";
const GUEST_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface GuestSession {
  id: string;
  createdAt: number;
  expiresAt: number;
  data: Record<string, unknown>;
}

/**
 * Generate a unique guest session ID
 */
function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create guest session
 */
export function getGuestSession(): GuestSession {
  if (typeof window === "undefined") {
    // Server-side: return a temporary session
    return {
      id: generateSessionId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + GUEST_SESSION_EXPIRY,
      data: {},
    };
  }

  const stored = localStorage.getItem(GUEST_SESSION_KEY);

  if (stored) {
    try {
      const session = JSON.parse(stored) as GuestSession;
      
      // Check if session is still valid
      if (session.expiresAt > Date.now()) {
        return session;
      }
    } catch {
      // Invalid session, create new one
    }
  }

  // Create new session
  const session: GuestSession = {
    id: generateSessionId(),
    createdAt: Date.now(),
    expiresAt: Date.now() + GUEST_SESSION_EXPIRY,
    data: {},
  };

  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Update guest session data
 */
export function updateGuestSessionData(data: Partial<GuestSession["data"]>): void {
  if (typeof window === "undefined") return;

  const session = getGuestSession();
  session.data = { ...session.data, ...data };
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear guest session
 */
export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_SESSION_KEY);
}

/**
 * Migrate guest session data to authenticated user
 * Call this after user logs in to preserve cart, preferences, etc.
 */
export async function migrateGuestSession(userId: string): Promise<GuestSession["data"]> {
  const session = getGuestSession();
  const data = session.data;

  // Clear guest session after migration
  clearGuestSession();

  // Here you would typically:
  // 1. Merge cart items with user's cart
  // 2. Save preferences to user profile
  // 3. Transfer any temporary data

  return data;
}

/**
 * Check if current session is a guest
 */
export function isGuestSession(): boolean {
  if (typeof window === "undefined") return true;
  
  const stored = localStorage.getItem(GUEST_SESSION_KEY);
  return !!stored;
}

