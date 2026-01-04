/**
 * Notifications API Routes
 * 
 * Endpoints for sending and managing notifications.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendNotification, upsertSubscriber } from "@/lib/notifications/novu";

/**
 * GET /api/notifications - Get notifications for a user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  // TODO: Fetch notifications from Novu
  // For now, return empty array
  return NextResponse.json({
    notifications: [],
  });
}

/**
 * POST /api/notifications - Send a notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, templateId, payload, email, firstName, lastName } = body;

    if (!userId || !templateId) {
      return NextResponse.json(
        { error: "userId and templateId are required" },
        { status: 400 }
      );
    }

    // Ensure subscriber exists
    await upsertSubscriber({
      userId,
      email,
      firstName,
      lastName,
    });

    // Send notification
    const result = await sendNotification({
      userId,
      templateId,
      payload,
      email,
      firstName,
      lastName,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

