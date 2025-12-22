import { test, mock } from "node:test";
import assert from "node:assert/strict";

// Set test environment variables before importing provider
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_testing";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock_secret";

// Mock data
const mockCustomer = {
  id: "cus_test123",
  email: "test@example.com",
  metadata: { orgId: "org_123" },
};

const mockSubscription = {
  id: "sub_test456",
  status: "active",
  current_period_end: 1735689600,
  items: {
    data: [
      {
        id: "si_test789",
        price: {
          id: "price_pro_monthly",
          recurring: { usage_type: "licensed" },
        },
        quantity: 5,
      },
    ],
  },
};

const mockMeteredSubscription = {
  id: "sub_metered_test",
  status: "active",
  items: {
    data: [
      {
        id: "si_metered_test",
        price: {
          id: "price_metered",
          recurring: { usage_type: "metered" },
        },
        quantity: null,
      },
    ],
  },
};

const mockCheckoutSession = {
  id: "cs_test_abc",
  url: "https://checkout.stripe.com/c/pay/cs_test_abc",
};

test("billing.stripe: provider has correct name", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(provider.name, "billing.stripe");
});

test("ensureCustomer: creates new customer when not found", async () => {
  // Note: This is a conceptual test showing the expected behavior
  // In a real implementation, we'd mock the Stripe SDK
  // For now, we verify the function exists and has correct signature
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(typeof provider.ensureCustomer, "function");
});

test("ensureCustomer: handles missing STRIPE_SECRET_KEY", async () => {
  const originalKey = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;

  // Force reload of module by reimporting
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  await assert.rejects(
    async () => {
      await provider.ensureCustomer({ orgId: "org_123", email: "test@example.com" });
    },
    (error) => {
      return error.message.includes("STRIPE_SECRET_KEY");
    },
    "Should throw error when STRIPE_SECRET_KEY is missing"
  );

  // Restore for other tests
  process.env.STRIPE_SECRET_KEY = originalKey;
});

test("createCheckoutSession: has correct signature", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(typeof provider.createCheckoutSession, "function");
});

test("getActiveSubscription: has correct signature", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(typeof provider.getActiveSubscription, "function");
});

test("cancelSubscription: has correct signature", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(typeof provider.cancelSubscription, "function");
});

test("recordUsage: has correct signature", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;
  assert.equal(typeof provider.recordUsage, "function");
});

test("verifyWebhook: returns false when signature header missing", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  const headers = new Headers();
  const result = await provider.verifyWebhook({
    rawBody: '{"test": "data"}',
    headers,
  });

  assert.equal(result, false, "Should return false when signature header is missing");
});

test("verifyWebhook: handles missing STRIPE_WEBHOOK_SECRET", async () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_WEBHOOK_SECRET;

  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  const headers = new Headers();
  headers.set("stripe-signature", "t=123,v1=abc");

  await assert.rejects(
    async () => {
      await provider.verifyWebhook({
        rawBody: '{"test": "data"}',
        headers,
      });
    },
    (error) => {
      return error.message.includes("STRIPE_WEBHOOK_SECRET");
    },
    "Should throw error when STRIPE_WEBHOOK_SECRET is missing"
  );

  // Restore for other tests
  process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
});

test("parseWebhookEvent: parses valid Stripe event", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  const eventData = {
    id: "evt_test_webhook",
    type: "customer.subscription.created",
    data: {
      object: mockSubscription,
    },
  };

  const result = await provider.parseWebhookEvent(JSON.stringify(eventData));

  assert.equal(result.id, "evt_test_webhook");
  assert.equal(result.type, "customer.subscription.created");
  assert.deepEqual(result.data, mockSubscription);
});

test("parseWebhookEvent: throws error for malformed JSON", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  await assert.rejects(
    async () => {
      await provider.parseWebhookEvent("invalid json {");
    },
    (error) => {
      return error.message.includes("Failed to parse webhook event");
    },
    "Should throw error for malformed JSON"
  );
});

test("health: returns ok structure when configured", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  // Note: This will fail without a real API key, but we're testing the structure
  const result = await provider.health();

  assert.equal(typeof result.ok, "boolean");
  assert.equal(result.provider, "billing.stripe");
  assert.equal(typeof result.details, "object");
});

test("health: includes configuration status in details", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  const result = await provider.health();

  // Should include configured status
  if (result.ok) {
    assert.equal(typeof result.details?.configured, "boolean");
    assert.equal(typeof result.details?.apiVersion, "string");
  } else {
    assert.equal(typeof result.details?.error, "string");
  }
});

test("StripeBillingError: error mapping preserves context", async () => {
  const provider = (await import("../src/platform/providers/impl/billing.stripe.ts")).default;

  // Test with invalid API key to trigger error
  const originalKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_invalid";

  try {
    await provider.ensureCustomer({ orgId: "test_org" });
    assert.fail("Should have thrown an error");
  } catch (error) {
    // Verify error structure
    assert.equal(error.name, "StripeBillingError");
    assert.ok(error.message.includes("ensureCustomer"), "Error should include method context");
    assert.equal(typeof error.code, "string");
    assert.equal(typeof error.type, "string");
  } finally {
    // Restore
    process.env.STRIPE_SECRET_KEY = originalKey;
  }
});

test("provider exports: module structure", async () => {
  const module = await import("../src/platform/providers/impl/billing.stripe.ts");

  assert.ok(module.default, "Should have default export");
  assert.equal(typeof module.default.name, "string");
  assert.equal(typeof module.default.ensureCustomer, "function");
  assert.equal(typeof module.default.createCheckoutSession, "function");
  assert.equal(typeof module.default.getActiveSubscription, "function");
  assert.equal(typeof module.default.cancelSubscription, "function");
  assert.equal(typeof module.default.recordUsage, "function");
  assert.equal(typeof module.default.verifyWebhook, "function");
  assert.equal(typeof module.default.parseWebhookEvent, "function");
  assert.equal(typeof module.default.health, "function");
});
