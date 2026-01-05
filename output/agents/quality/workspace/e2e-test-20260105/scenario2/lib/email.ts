/**
 * Email Adapter
 * 
 * Provides a unified interface for sending emails that works with
 * any email provider (Resend, SendGrid, Postmark, etc.)
 * 
 * This file is copied alongside the auth-email-bridge when both
 * auth and email integrations are selected.
 */

// Email sending interface
export interface SendEmailOptions {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Generic email sender.
 * 
 * This uses Resend by default (the most common choice).
 * To use a different provider, update this file after export.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  // If no API key is configured, log to console (development mode)
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Development mode - would send:', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      data: options.data,
    });
    return { success: true, id: `dev-${Date.now()}` };
  }

  try {
    // Dynamic import to avoid requiring the package at build time
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html || generateHtmlFromTemplate(options.template, options.data),
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML from template name and data.
 * You can expand this to use actual template files.
 */
function generateHtmlFromTemplate(
  template?: string,
  data?: Record<string, unknown>
): string {
  const name = (data?.name as string) || 'there';
  
  switch (template) {
    case 'welcome':
      return `
        <h1>Welcome, ${name}!</h1>
        <p>Your account is ready. <a href="${data?.loginUrl}">Log in</a> to get started.</p>
        <p>Questions? Contact us at ${data?.supportEmail}</p>
      `;
    
    case 'password-reset':
      return `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data?.resetUrl}">${data?.resetUrl}</a></p>
        <p>This link expires in ${data?.expiresIn}.</p>
      `;
    
    case 'email-verification':
      return `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${data?.verifyUrl}">${data?.verifyUrl}</a></p>
      `;
    
    case 'security-alert':
      return `
        <h1>Security Alert</h1>
        <p>Hi ${name},</p>
        <p>${data?.message}</p>
        <p>Time: ${data?.timestamp}</p>
        <p>If this wasn't you, <a href="${data?.supportUrl}">contact support</a>.</p>
      `;
    
    default:
      return `<p>Email content</p>`;
  }
}
