import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

test("webhooks.standard: provider has correct name", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  assert.equal(provider.name, "webhooks.standard");
});

test("webhooks.standard: has send method", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  assert.equal(typeof provider.send, "function");
});

test("webhooks.standard: has verifyInbound method", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  assert.equal(typeof provider.verifyInbound, "function");
});

test("webhooks.standard: has health method", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  assert.equal(typeof provider.health, "function");
});

test("webhooks.standard: health returns correct structure", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  const result = await provider.health();

  assert.equal(typeof result.ok, "boolean");
  assert.equal(result.provider, "webhooks.standard");
  assert.equal(typeof result.details, "object");
});

test("webhooks.standard: health shows always configured", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;
  const result = await provider.health();

  assert.equal(result.ok, true);
  assert.equal(result.details?.configured, true);
  assert.equal(result.details?.algorithm, "HMAC-SHA256");
});

test("webhooks.standard: verifyInbound returns false when signature header missing", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const result = await provider.verifyInbound({
    rawBody: JSON.stringify({ type: "test" }),
    headers: new Headers(),
    secret: "test_secret",
  });

  assert.equal(result, false);
});

test("webhooks.standard: verifyInbound returns false for invalid signature", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const result = await provider.verifyInbound({
    rawBody: JSON.stringify({ type: "test" }),
    headers: new Headers({ "x-webhook-signature": "t=123456789,v1=invalidsignature" }),
    secret: "test_secret",
  });

  assert.equal(result, false);
});

test("webhooks.standard: verifyInbound validates correct signature", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const rawBody = JSON.stringify({ type: "test", data: { id: "123" } });
  const secret = "test_secret_key";
  const timestamp = Math.floor(Date.now() / 1000);

  // Generate valid signature
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = createHmac("sha256", secret);
  hmac.update(signedPayload);
  const signature = hmac.digest("hex");

  const signatureHeader = `t=${timestamp},v1=${signature}`;

  const result = await provider.verifyInbound({
    rawBody,
    headers: new Headers({ "x-webhook-signature": signatureHeader }),
    secret,
  });

  assert.equal(result, true);
});

test("webhooks.standard: verifyInbound rejects old timestamps", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const rawBody = JSON.stringify({ type: "test" });
  const secret = "test_secret_key";
  const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago (beyond 5 min tolerance)

  // Generate signature with old timestamp
  const signedPayload = `${oldTimestamp}.${rawBody}`;
  const hmac = createHmac("sha256", secret);
  hmac.update(signedPayload);
  const signature = hmac.digest("hex");

  const signatureHeader = `t=${oldTimestamp},v1=${signature}`;

  const result = await provider.verifyInbound({
    rawBody,
    headers: new Headers({ "x-webhook-signature": signatureHeader }),
    secret,
  });

  assert.equal(result, false);
});

test("webhooks.standard: verifyInbound returns false for malformed signature header", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const result = await provider.verifyInbound({
    rawBody: JSON.stringify({ type: "test" }),
    headers: new Headers({ "x-webhook-signature": "invalid_format" }),
    secret: "test_secret",
  });

  assert.equal(result, false);
});

test("webhooks.standard: verifyInbound returns false for signature with wrong secret", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  const rawBody = JSON.stringify({ type: "test" });
  const wrongSecret = "wrong_secret";
  const correctSecret = "correct_secret";
  const timestamp = Math.floor(Date.now() / 1000);

  // Generate signature with wrong secret
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = createHmac("sha256", wrongSecret);
  hmac.update(signedPayload);
  const signature = hmac.digest("hex");

  const signatureHeader = `t=${timestamp},v1=${signature}`;

  const result = await provider.verifyInbound({
    rawBody,
    headers: new Headers({ "x-webhook-signature": signatureHeader }),
    secret: correctSecret, // Using different secret for verification
  });

  assert.equal(result, false);
});

test("webhooks.standard: provider module structure", async () => {
  const module = await import("../../src/platform/providers/impl/webhooks.standard.ts");

  assert.ok(module.default, "Should have default export");
  assert.equal(typeof module.default.name, "string");
  assert.equal(typeof module.default.send, "function");
  assert.equal(typeof module.default.verifyInbound, "function");
  assert.equal(typeof module.default.health, "function");
});

test("webhooks.standard: send includes required headers", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  // Mock fetch to capture request
  const originalFetch = globalThis.fetch;
  let capturedHeaders = null;

  globalThis.fetch = async (url, options) => {
    capturedHeaders = options.headers;
    return new Response(null, { status: 200 });
  };

  try {
    await provider.send({
      url: "https://example.com/webhook",
      secret: "test_secret",
      event: {
        id: "evt_123",
        type: "test.event",
        createdAt: Date.now(),
        data: { foo: "bar" },
      },
    });

    assert.ok(capturedHeaders["X-Webhook-Signature"]);
    assert.ok(capturedHeaders["X-Webhook-ID"]);
    assert.ok(capturedHeaders["X-Webhook-Timestamp"]);
    assert.equal(capturedHeaders["Content-Type"], "application/json");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("webhooks.standard: send returns attempt details", async () => {
  const provider = (await import("../../src/platform/providers/impl/webhooks.standard.ts")).default;

  // Mock successful response
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 200 });

  try {
    const result = await provider.send({
      url: "https://example.com/webhook",
      secret: "test_secret",
      event: {
        id: "evt_123",
        type: "test.event",
        createdAt: Date.now(),
        data: {},
      },
    });

    assert.equal(typeof result.ok, "boolean");
    assert.equal(typeof result.status, "number");
    assert.equal(typeof result.attemptId, "string");
    assert.ok(result.attemptId.startsWith("wh_"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
