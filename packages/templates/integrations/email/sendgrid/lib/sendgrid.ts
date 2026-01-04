import sendgrid from "@sendgrid/mail";

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sendgrid.setApiKey(apiKey);
}

export { sendgrid };

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name?: string;
  };
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    content: string; // Base64 encoded
    filename: string;
    type?: string;
    disposition?: "attachment" | "inline";
  }>;
  categories?: string[];
  sendAt?: number; // Unix timestamp
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!apiKey) {
    console.error("SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    const msg = {
      to: options.to,
      from: options.from || {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME || "Your App",
      },
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
      categories: options.categories,
      sendAt: options.sendAt,
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicTemplateData,
    };

    await sendgrid.send(msg);
    return true;
  } catch (error) {
    console.error("[SendGrid Error]", error);
    return false;
  }
}

/**
 * Send multiple emails in a single API call (up to 1000)
 */
export async function sendBulkEmails(
  messages: EmailOptions[]
): Promise<boolean> {
  if (!apiKey) {
    console.error("SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    const formattedMessages = messages.map((msg) => ({
      to: msg.to,
      from: msg.from || {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME || "Your App",
      },
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    }));

    await sendgrid.send(formattedMessages);
    return true;
  } catch (error) {
    console.error("[SendGrid Bulk Error]", error);
    return false;
  }
}

