/**
 * Auth + Email Bridge
 * 
 * Connects your authentication system with your email provider to:
 * - Send welcome emails on user signup
 * - Send password reset emails
 * - Send account verification emails
 * - Notify users of security events
 */

import { sendEmail } from "@/lib/email";

// Type for user object from your auth provider
interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Send a welcome email to new users.
 * Call this after successful user registration.
 */
export async function sendWelcomeEmail(user: AuthUser) {
  const firstName = user.name?.split(" ")[0] || "there";
  
  return sendEmail({
    to: user.email,
    subject: "Welcome! Your account is ready",
    template: "welcome",
    data: {
      name: firstName,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
    },
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: "Reset your password",
    template: "password-reset",
    data: {
      resetUrl,
      expiresIn: "1 hour",
    },
  });
}

/**
 * Send email verification email.
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: email,
    subject: "Verify your email address",
    template: "email-verification",
    data: {
      verifyUrl,
    },
  });
}

/**
 * Send security alert email (e.g., new device login).
 */
export async function sendSecurityAlertEmail(
  user: AuthUser,
  event: {
    type: "new_device" | "password_changed" | "email_changed";
    details?: string;
    timestamp?: Date;
  }
) {
  const eventMessages = {
    new_device: "A new device was used to sign in to your account",
    password_changed: "Your password was recently changed",
    email_changed: "Your email address was recently updated",
  };

  return sendEmail({
    to: user.email,
    subject: "Security Alert: Account Activity",
    template: "security-alert",
    data: {
      name: user.name?.split(" ")[0] || "there",
      message: eventMessages[event.type],
      details: event.details,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
      supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
    },
  });
}

/**
 * Auth event handler - call this from your auth callbacks.
 * 
 * Example usage in auth callback:
 * ```
 * import { handleAuthEvent } from "@/lib/auth-email-bridge";
 * 
 * // In your signup callback:
 * await handleAuthEvent("user.created", user);
 * ```
 */
export async function handleAuthEvent(
  event: "user.created" | "user.verified" | "password.reset" | "password.changed",
  user: AuthUser,
  data?: Record<string, unknown>
) {
  switch (event) {
    case "user.created":
      await sendWelcomeEmail(user);
      break;
    
    case "password.changed":
      await sendSecurityAlertEmail(user, { type: "password_changed" });
      break;
    
    // Add more event handlers as needed
  }
}

