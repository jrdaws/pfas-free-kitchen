import { resend, EMAIL_FROM } from "./resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { InvoiceEmail } from "@/emails/InvoiceEmail";

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Welcome to {{projectName}}!",
      react: WelcomeEmail({ name }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Reset your password",
      react: PasswordResetEmail({ resetLink }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send an invoice email
 */
export async function sendInvoiceEmail(
  to: string,
  invoiceData: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    items: { name: string; quantity: number; price: number }[];
  }
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Invoice #${invoiceData.invoiceNumber}`,
      react: InvoiceEmail(invoiceData),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

