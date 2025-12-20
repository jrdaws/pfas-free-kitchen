import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookProvider } from "../webhooks";
import type { ProviderHealth, WebhookEvent } from "../types";

/**
 * Standard Webhook Provider
 *
 * Implements webhook delivery with HMAC-SHA256 signature verification.
 * Follows common webhook patterns used by Stripe, GitHub, Shopify, etc.
 *
 * Signature format: t=<timestamp>,v1=<signature>
 * Signature input: `${timestamp}.${rawBody}`
 */

// Error utility
class WebhookError extends Error {
  readonly code: string;
  readonly originalError?: unknown;

  constructor(message: string, code: string, originalError?: unknown) {
    super(message);
    this.name = "WebhookError";
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
function generateSignature(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`;
  const hmac = createHmac("sha256", secret);
  hmac.update(signedPayload);
  return hmac.digest("hex");
}

/**
 * Verify webhook signature using timing-safe comparison
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: number,
  toleranceSeconds: number = 300 // 5 minutes
): boolean {
  // Check timestamp is within tolerance
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    return false;
  }

  // Generate expected signature
  const expectedSignature = generateSignature(payload, secret, timestamp);

  // Timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Parse signature header in format: t=<timestamp>,v1=<signature>
 */
function parseSignatureHeader(header: string): { timestamp: number; signature: string } | null {
  const parts = header.split(",");
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") {
      timestamp = parseInt(value, 10);
    } else if (key === "v1") {
      signature = value;
    }
  }

  if (timestamp === null || signature === null || isNaN(timestamp)) {
    return null;
  }

  return { timestamp, signature };
}

const provider: WebhookProvider = {
  name: "webhooks.standard",

  async send(input: {
    url: string;
    secret: string;
    event: WebhookEvent;
    headers?: Record<string, string>;
    timeoutMs?: number;
  }): Promise<{ ok: boolean; status: number; attemptId: string }> {
    try {
      // Serialize event payload
      const payload = JSON.stringify(input.event);
      const timestamp = Math.floor(Date.now() / 1000);

      // Generate signature
      const signature = generateSignature(payload, input.secret, timestamp);
      const signatureHeader = `t=${timestamp},v1=${signature}`;

      // Generate unique attempt ID
      const attemptId = `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Send webhook with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), input.timeoutMs || 5000);

      try {
        const response = await fetch(input.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signatureHeader,
            "X-Webhook-ID": attemptId,
            "X-Webhook-Timestamp": timestamp.toString(),
            "User-Agent": "Dawson-Framework-Webhooks/1.0",
            ...input.headers,
          },
          body: payload,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return {
          ok: response.ok,
          status: response.status,
          attemptId,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === "AbortError") {
          throw new WebhookError("Webhook delivery timed out", "timeout", error);
        }

        throw error;
      }
    } catch (error) {
      if (error instanceof WebhookError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new WebhookError(`Webhook delivery failed: ${message}`, "delivery_error", error);
    }
  },

  async verifyInbound(input: {
    rawBody: string;
    headers: Headers;
    secret: string;
  }): Promise<boolean> {
    try {
      // Get signature header
      const signatureHeader = input.headers.get("x-webhook-signature");
      if (!signatureHeader) {
        return false;
      }

      // Parse signature header
      const parsed = parseSignatureHeader(signatureHeader);
      if (!parsed) {
        return false;
      }

      // Verify signature
      return verifySignature(
        input.rawBody,
        parsed.signature,
        input.secret,
        parsed.timestamp
      );
    } catch {
      return false;
    }
  },

  async health(): Promise<ProviderHealth> {
    // Standard webhook provider is always healthy (no external dependencies)
    return {
      ok: true,
      provider: "webhooks.standard",
      details: {
        configured: true,
        algorithm: "HMAC-SHA256",
        signatureFormat: "t=<timestamp>,v1=<signature>",
      },
    };
  },
};

export default provider;
