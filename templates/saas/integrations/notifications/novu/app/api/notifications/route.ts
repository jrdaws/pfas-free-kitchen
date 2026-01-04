import { NextRequest, NextResponse } from "next/server";
import { sendNotification, upsertSubscriber } from "@/lib/notifications/novu";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  return NextResponse.json({ notifications: [] });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, templateId, payload, email, firstName, lastName } = await request.json();
    if (!userId || !templateId) {
      return NextResponse.json({ error: "userId and templateId are required" }, { status: 400 });
    }
    await upsertSubscriber({ userId, email, firstName, lastName });
    const result = await sendNotification({ userId, templateId, payload, email, firstName, lastName });
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

