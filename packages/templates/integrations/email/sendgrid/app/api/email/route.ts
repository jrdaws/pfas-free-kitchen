import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendgrid";

/**
 * POST /api/email/send
 * Send an email via SendGrid
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, templateId, data } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient (to) is required" },
        { status: 400 }
      );
    }

    if (!templateId && !html) {
      return NextResponse.json(
        { error: "Either html or templateId is required" },
        { status: 400 }
      );
    }

    const success = await sendEmail({
      to,
      subject: subject || "Notification",
      html: html || "",
      text,
      templateId,
      dynamicTemplateData: data,
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Email API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

