/**
 * Novu Server Client
 * 
 * Server-side client for sending notifications.
 */

import { Novu } from "@novu/node";

const apiKey = process.env.NOVU_API_KEY;

if (!apiKey) {
  console.warn(`
⚠️  Novu configuration missing

Required environment variables:
  NOVU_API_KEY
  NEXT_PUBLIC_NOVU_APP_ID

Get these from: https://web.novu.co
Add to: .env.local

Notifications will not work until configured.
  `);
}

// Create the Novu client
export const novu = apiKey ? new Novu(apiKey) : null;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Send a notification to a user
 */
export async function sendNotification({
  userId,
  templateId,
  payload,
  email,
  phone,
  firstName,
  lastName,
}: {
  userId: string;
  templateId: string;
  payload?: Record<string, unknown>;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    const response = await novu.trigger(templateId, {
      to: {
        subscriberId: userId,
        email,
        phone,
        firstName,
        lastName,
      },
      payload: payload || {},
    });

    return response.data;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification({
  userIds,
  templateId,
  payload,
}: {
  userIds: string[];
  templateId: string;
  payload?: Record<string, unknown>;
}) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    const response = await novu.bulkTrigger(
      userIds.map((userId) => ({
        name: templateId,
        to: { subscriberId: userId },
        payload: payload || {},
      }))
    );

    return response.data;
  } catch (error) {
    console.error("Failed to send bulk notification:", error);
    throw error;
  }
}

/**
 * Create or update a subscriber
 */
export async function upsertSubscriber({
  userId,
  email,
  phone,
  firstName,
  lastName,
  avatar,
  data,
}: {
  userId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  data?: Record<string, unknown>;
}) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    const response = await novu.subscribers.identify(userId, {
      email,
      phone,
      firstName,
      lastName,
      avatar,
      data,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to upsert subscriber:", error);
    throw error;
  }
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriber(userId: string) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    await novu.subscribers.delete(userId);
    return true;
  } catch (error) {
    console.error("Failed to delete subscriber:", error);
    throw error;
  }
}

/**
 * Get subscriber preferences
 */
export async function getSubscriberPreferences(userId: string) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    const response = await novu.subscribers.getPreference(userId);
    return response.data;
  } catch (error) {
    console.error("Failed to get preferences:", error);
    throw error;
  }
}

/**
 * Update subscriber preferences
 */
export async function updateSubscriberPreference({
  userId,
  templateId,
  channel,
  enabled,
}: {
  userId: string;
  templateId: string;
  channel: "email" | "sms" | "in_app" | "push" | "chat";
  enabled: boolean;
}) {
  if (!novu) {
    console.warn("Novu client not initialized");
    return null;
  }

  try {
    const response = await novu.subscribers.updatePreference(userId, templateId, {
      channel: { type: channel, enabled },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update preference:", error);
    throw error;
  }
}

