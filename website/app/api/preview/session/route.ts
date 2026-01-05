import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  PreviewSession,
  BrandingContext,
  NavigationContext,
} from "@/lib/preview/session-types";
import { createDefaultStateSimulation } from "@/lib/preview/session-types";
import {
  setSession,
  getSession,
  updateSessionState,
  cleanupExpiredSessions,
  calculateFidelityScore,
  getFidelityDetails,
  SESSION_TTL_MS,
} from "@/lib/preview/session-store";

/**
 * POST /api/preview/session
 * Create a new preview session with shared state
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateSessionResponse>> {
  try {
    const body: CreateSessionRequest = await request.json();
    const {
      projectId,
      template,
      projectName,
      branding,
      integrations = {},
      research,
      vision,
      pages = [],
      initialAuthState = "logged-out",
    } = body;

    if (!projectId || !template || !projectName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: projectId, template, projectName" },
        { status: 400 }
      );
    }

    // Create session ID
    const sessionId = nanoid(12);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    // Build branding context with defaults
    const fullBranding: BrandingContext = {
      projectName,
      colors: {
        primary: branding?.colors?.primary || "#3b82f6",
        secondary: branding?.colors?.secondary || "#1e40af",
        accent: branding?.colors?.accent || "#60a5fa",
        background: branding?.colors?.background || "#ffffff",
        foreground: branding?.colors?.foreground || "#0f172a",
      },
      fonts: branding?.fonts || { heading: "Inter", body: "Inter" },
      logo: branding?.logo,
    };

    // Build navigation context from pages
    const defaultPages = [
      { path: "/", title: "Home", description: "Welcome page" },
      { path: "/pricing", title: "Pricing", description: "Pricing plans" },
      { path: "/about", title: "About", description: "About us" },
    ];

    const pageList = pages.length > 0 ? pages : defaultPages;

    const navigation: NavigationContext = {
      pages: pageList.map((p) => ({
        path: p.path,
        title: p.title,
        description: p.description,
        isCurrentPage: p.path === "/",
      })),
      currentPath: "/",
      breadcrumbs: [{ label: "Home", path: "/" }],
    };

    // Create the session
    const session: PreviewSession = {
      id: sessionId,
      projectId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      template,
      branding: fullBranding,
      integrations,
      research,
      vision,
      navigation,
      stateSimulation: createDefaultStateSimulation(initialAuthState),
      pageCache: {},
      fidelityScore: 0,
      fidelityDetails: [],
    };

    // Calculate fidelity score
    session.fidelityScore = calculateFidelityScore(session);
    session.fidelityDetails = getFidelityDetails(session);

    // Store session
    setSession(sessionId, session);

    // Clean up expired sessions periodically
    cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("[Preview Session] Error creating session:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/preview/session?id=xxx
 * Get an existing session
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.nextUrl.searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Session ID required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, session });
}

/**
 * PATCH /api/preview/session
 * Update session state (e.g., change auth state, navigate)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sessionId, updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = updateSessionState(sessionId, updates);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[Preview Session] Error updating session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update session" },
      { status: 500 }
    );
  }
}
