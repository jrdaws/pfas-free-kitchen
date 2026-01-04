import { Novu } from "@novu/node";

const apiKey = process.env.NOVU_API_KEY;

if (!apiKey) {
  console.warn(`
⚠️  Novu configuration missing

Required environment variables:
  NOVU_API_KEY
  NEXT_PUBLIC_NOVU_APP_ID

Get these from: https://web.novu.co
  `);
}

export const novu = apiKey ? new Novu(apiKey) : null;

export async function sendNotification({
  userId,
  templateId,
  payload,
  email,
  firstName,
  lastName,
}: {
  userId: string;
  templateId: string;
  payload?: Record<string, unknown>;
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!novu) return null;
  try {
    const response = await novu.trigger(templateId, {
      to: { subscriberId: userId, email, firstName, lastName },
      payload: (payload || {}) as Record<string, string | number | boolean>,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

export async function upsertSubscriber({ userId, email, firstName, lastName }: {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!novu) return null;
  try {
    const response = await novu.subscribers.identify(userId, { email, firstName, lastName });
    return response.data;
  } catch (error) {
    console.error("Failed to upsert subscriber:", error);
    throw error;
  }
}

