import { Resend } from "resend";

// Lazy initialization to allow builds without environment variables
let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set in environment variables. " +
        "Add it to your .env.local file to use Resend email functionality."
      );
    }

    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

// For backwards compatibility
export const resend = new Proxy({} as Resend, {
  get(target, prop) {
    return getResend()[prop as keyof Resend];
  }
});

// Default "from" email (update this to your verified domain)
export const FROM_EMAIL = "onboarding@resend.dev"; // Change to your domain

// Email templates
export const EmailTemplates = {
  welcome: "welcome",
  resetPassword: "reset-password",
  emailVerification: "email-verification",
  invoiceReceipt: "invoice-receipt",
} as const;
