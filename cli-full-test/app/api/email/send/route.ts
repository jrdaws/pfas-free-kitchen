import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "../../../../lib/resend";
import { WelcomeEmail } from "../../../../emails/welcome-email";

export async function POST(req: NextRequest) {
  try {
    const { to, template, data } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    let emailComponent;
    let subject = "";

    // Select template based on type
    switch (template) {
      case "welcome":
        emailComponent = WelcomeEmail({
          userName: data?.userName,
          loginUrl: data?.loginUrl,
        });
        subject = "Welcome to Our Platform!";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid email template" },
          { status: 400 }
        );
    }

    // Send email
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      react: emailComponent,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
