import { sendEmail } from "./sendgrid";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { InvoiceEmail } from "@/emails/InvoiceEmail";

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<boolean> {
  const html = await render(WelcomeEmail({ name }));
  
  return sendEmail({
    to,
    subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "Our App"}!`,
    html,
    categories: ["welcome", "onboarding"],
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  const html = await render(PasswordResetEmail({ resetUrl }));
  
  return sendEmail({
    to,
    subject: "Reset Your Password",
    html,
    categories: ["password-reset", "auth"],
  });
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(
  to: string,
  invoice: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }
): Promise<boolean> {
  const html = await render(InvoiceEmail(invoice));
  
  return sendEmail({
    to,
    subject: `Invoice #${invoice.invoiceNumber}`,
    html,
    categories: ["invoice", "billing"],
  });
}

/**
 * Send a transactional email using a SendGrid template
 */
export async function sendTemplateEmail(
  to: string,
  templateId: string,
  data: Record<string, unknown>,
  subject?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: subject || "Notification",
    html: "", // Template will be used instead
    templateId,
    dynamicTemplateData: data,
  });
}

