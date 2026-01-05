/**
 * Preview Session Store
 * 
 * In-memory storage for preview sessions.
 * In production, replace with Redis or database.
 */

import type { PreviewSession } from "./session-types";
import { createDefaultStateSimulation } from "./session-types";

// In-memory session store
const sessionStore = new Map<string, PreviewSession>();

// Session TTL: 1 hour
export const SESSION_TTL_MS = 60 * 60 * 1000;

export function getSession(sessionId: string): PreviewSession | undefined {
  const session = sessionStore.get(sessionId);
  
  if (session && new Date(session.expiresAt) < new Date()) {
    sessionStore.delete(sessionId);
    return undefined;
  }
  
  return session;
}

export function setSession(sessionId: string, session: PreviewSession): void {
  sessionStore.set(sessionId, session);
}

export function deleteSession(sessionId: string): void {
  sessionStore.delete(sessionId);
}

export function updateSessionCache(
  sessionId: string,
  pagePath: string,
  html: string,
  props: Record<string, unknown>
): void {
  const session = sessionStore.get(sessionId);
  if (session) {
    session.pageCache[pagePath] = {
      html,
      props,
      generatedAt: new Date().toISOString(),
    };
    sessionStore.set(sessionId, session);
  }
}

export function updateSessionState(
  sessionId: string,
  updates: {
    authState?: "logged-out" | "logged-in" | "admin";
    currentPath?: string;
    subscriptionTier?: "free" | "pro" | "enterprise";
  }
): PreviewSession | undefined {
  const session = sessionStore.get(sessionId);
  
  if (!session) return undefined;

  if (updates.authState) {
    session.stateSimulation = createDefaultStateSimulation(updates.authState);
  }

  if (updates.currentPath) {
    session.navigation.currentPath = updates.currentPath;
    session.navigation.pages = session.navigation.pages.map((p) => ({
      ...p,
      isCurrentPage: p.path === updates.currentPath,
    }));

    const currentPage = session.navigation.pages.find(
      (p) => p.path === updates.currentPath
    );
    session.navigation.breadcrumbs = [
      { label: "Home", path: "/" },
      ...(updates.currentPath !== "/" && currentPage
        ? [{ label: currentPage.title, path: updates.currentPath }]
        : []),
    ];
  }

  if (updates.subscriptionTier) {
    session.stateSimulation.subscription.tier = updates.subscriptionTier;
  }

  sessionStore.set(sessionId, session);
  return session;
}

export function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [id, session] of sessionStore.entries()) {
    if (new Date(session.expiresAt) < now) {
      sessionStore.delete(id);
    }
  }
}

// Calculate fidelity score
export function calculateFidelityScore(session: PreviewSession): number {
  let score = 0;
  let maxScore = 0;

  // Branding completeness (30 points)
  maxScore += 30;
  if (session.branding.colors.primary !== "#3b82f6") score += 10;
  if (session.branding.logo) score += 10;
  if (session.branding.fonts?.heading !== "Inter") score += 10;

  // Research context (20 points)
  maxScore += 20;
  if (session.research?.domainInsights) score += 10;
  if (session.research?.competitorAnalysis) score += 10;

  // Vision document (20 points)
  maxScore += 20;
  if (session.vision?.problem) score += 5;
  if (session.vision?.audience) score += 5;
  if (session.vision?.businessModel) score += 5;
  if (session.vision?.designStyle) score += 5;

  // Navigation (15 points)
  maxScore += 15;
  if (session.navigation.pages.length > 1) score += 5;
  if (session.navigation.pages.length > 3) score += 5;
  if (session.navigation.pages.length > 5) score += 5;

  // Integrations (15 points)
  maxScore += 15;
  const integrationCount = Object.keys(session.integrations).filter(
    (k) => session.integrations[k] && session.integrations[k] !== "none"
  ).length;
  score += Math.min(integrationCount * 3, 15);

  return Math.round((score / maxScore) * 100);
}

// Get fidelity breakdown
export function getFidelityDetails(session: PreviewSession): PreviewSession["fidelityDetails"] {
  return [
    {
      category: "Branding",
      score: session.branding.logo ? 100 : session.branding.colors.primary !== "#3b82f6" ? 60 : 30,
      notes: session.branding.logo ? "Complete" : "Add logo for full branding",
    },
    {
      category: "Content",
      score: session.research?.domainInsights ? 90 : session.vision?.problem ? 60 : 30,
      notes: session.research?.domainInsights 
        ? "Research-informed content" 
        : "Run research for better content",
    },
    {
      category: "Structure",
      score: session.navigation.pages.length > 3 ? 100 : session.navigation.pages.length > 1 ? 60 : 30,
      notes: `${session.navigation.pages.length} pages defined`,
    },
    {
      category: "Integrations",
      score: Object.keys(session.integrations).length > 3 ? 100 : Object.keys(session.integrations).length > 1 ? 60 : 30,
      notes: `${Object.keys(session.integrations).length} integrations configured`,
    },
  ];
}

