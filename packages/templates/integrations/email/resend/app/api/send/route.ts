import { NextResponse } from "next/server";
import { sendWelcomeEmail, sendPasswordResetEmail, sendInvoiceEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, ...data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: "Missing required fields: type, to" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "welcome":
        if (!data.name) {
          return NextResponse.json(
            { error: "Missing required field: name" },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(to, data.name);
        break;

      case "password-reset":
        if (!data.resetLink) {
          return NextResponse.json(
            { error: "Missing required field: resetLink" },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(to, data.resetLink);
        break;

      case "invoice":
        if (!data.invoiceNumber || !data.amount || !data.dueDate || !data.items) {
          return NextResponse.json(
            { error: "Missing required invoice fields" },
            { status: 400 }
          );
        }
        result = await sendInvoiceEmail(to, {
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          dueDate: data.dueDate,
          items: data.items,
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

