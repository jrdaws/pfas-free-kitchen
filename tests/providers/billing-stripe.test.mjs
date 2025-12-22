import { test } from "node:test"
import assert from "node:assert/strict"

// Set test environment variables before importing provider
process.env.STRIPE_SECRET_KEY = "sk_test_fake_key_12345678901234567890123456"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"

test("billing.stripe: provider has correct name", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(provider.name, "billing.stripe")
})

test("billing.stripe: has ensureCustomer method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.ensureCustomer, "function")
})

test("billing.stripe: has createCheckoutSession method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.createCheckoutSession, "function")
})

test("billing.stripe: has getActiveSubscription method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.getActiveSubscription, "function")
})

test("billing.stripe: has cancelSubscription method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.cancelSubscription, "function")
})

test("billing.stripe: has recordUsage method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.recordUsage, "function")
})

test("billing.stripe: has verifyWebhook method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.verifyWebhook, "function")
})

test("billing.stripe: has parseWebhookEvent method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.parseWebhookEvent, "function")
})

test("billing.stripe: has health method", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  assert.equal(typeof provider.health, "function")
})

test("billing.stripe: health returns correct structure", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  const result = await provider.health()

  assert.equal(typeof result.ok, "boolean")
  assert.equal(result.provider, "billing.stripe")
  assert.equal(typeof result.details, "object")
})

test("billing.stripe: health shows configured when API key present", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  const result = await provider.health()

  assert.equal(result.details.configured, true)
})

test("billing.stripe: verifyWebhook returns false when signature header missing", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  const result = await provider.verifyWebhook({
    payload: JSON.stringify({ type: "payment_intent.succeeded" }),
    headers: {},
  })

  assert.equal(result, false)
})

test("billing.stripe: verifyWebhook returns false for invalid signature", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  const result = await provider.verifyWebhook({
    payload: JSON.stringify({ type: "payment_intent.succeeded" }),
    headers: {
      "stripe-signature": "t=1234567890,v1=invalid_signature_here",
    },
  })

  assert.equal(result, false)
})

test("billing.stripe: parseWebhookEvent parses valid Stripe event", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default
  const payload = JSON.stringify({
    id: "evt_test_123",
    type: "payment_intent.succeeded",
    data: { object: {} },
  })

  const result = await provider.parseWebhookEvent({ payload })

  assert.equal(typeof result, "object")
  assert.equal(result.type, "payment_intent.succeeded")
  assert.equal(result.id, "evt_test_123")
})

test("billing.stripe: parseWebhookEvent throws error for malformed JSON", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default

  await assert.rejects(
    async () => {
      await provider.parseWebhookEvent({ payload: "not valid json {" })
    },
    {
      name: "Error",
    }
  )
})

test("billing.stripe: provider module structure", async () => {
  const provider = (await import("../../src/platform/providers/impl/billing.stripe.ts")).default

  assert.equal(typeof provider, "object")
  assert.equal(typeof provider.name, "string")
  assert.equal(typeof provider.ensureCustomer, "function")
  assert.equal(typeof provider.createCheckoutSession, "function")
  assert.equal(typeof provider.getActiveSubscription, "function")
  assert.equal(typeof provider.cancelSubscription, "function")
  assert.equal(typeof provider.recordUsage, "function")
  assert.equal(typeof provider.verifyWebhook, "function")
  assert.equal(typeof provider.parseWebhookEvent, "function")
  assert.equal(typeof provider.health, "function")
})
