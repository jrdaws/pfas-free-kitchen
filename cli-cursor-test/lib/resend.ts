import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default "from" email (update this to your verified domain)
export const FROM_EMAIL = "onboarding@resend.dev"; // Change to your domain

// Email templates
export const EmailTemplates = {
  welcome: "welcome",
  resetPassword: "reset-password",
  emailVerification: "email-verification",
  invoiceReceipt: "invoice-receipt",
} as const;
