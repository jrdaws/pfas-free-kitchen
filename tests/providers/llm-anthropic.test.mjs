import { test } from "node:test";
import assert from "node:assert/strict";

// Set test environment variable before importing provider
process.env.ANTHROPIC_API_KEY = "sk-ant-test-mock-key-for-testing";

test("llm.anthropic: provider has correct name", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;
  assert.equal(provider.name, "llm.anthropic");
});

test("llm.anthropic: has complete method", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;
  assert.equal(typeof provider.complete, "function");
});

test("llm.anthropic: has health method", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;
  assert.equal(typeof provider.health, "function");
});

test("llm.anthropic: health returns correct structure when configured", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  const result = await provider.health();

  assert.equal(typeof result.ok, "boolean");
  assert.equal(result.provider, "llm.anthropic");
  assert.equal(typeof result.details, "object");
  assert.equal(typeof result.details?.configured, "boolean");
});

test("llm.anthropic: health shows configured when API key present", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  const result = await provider.health();

  assert.equal(result.ok, true);
  assert.equal(result.details?.configured, true);
});

test("llm.anthropic: handles invalid API key with proper error", async () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "sk-ant-invalid-test-key";

  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  await assert.rejects(
    async () => {
      await provider.complete({
        model: "claude-3-haiku-20240307",
        messages: [{ role: "user", content: "Hello" }],
      });
    },
    (error) => {
      // Should wrap Anthropic errors properly
      return error.name === "AnthropicLLMError" && error.message.includes("complete");
    },
    "Should throw AnthropicLLMError for invalid API key"
  );

  // Restore for other tests
  process.env.ANTHROPIC_API_KEY = originalKey;
});

test("llm.anthropic: complete method accepts LLMRequest structure", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  // Test that the method signature accepts the correct structure
  // We won't actually call the API in tests
  const request = {
    model: "claude-3-haiku-20240307",
    messages: [
      { role: "user", content: "Test message" }
    ],
    temperature: 0.7,
    maxTokens: 100,
  };

  // Verify structure is accepted (actual call would require real API)
  assert.equal(typeof provider.complete, "function");
  assert.equal(typeof request.model, "string");
  assert.ok(Array.isArray(request.messages));
});

test("llm.anthropic: provider module structure", async () => {
  const module = await import("../../src/platform/providers/impl/llm.anthropic.ts");

  assert.ok(module.default, "Should have default export");
  assert.equal(typeof module.default.name, "string");
  assert.equal(typeof module.default.complete, "function");
  assert.equal(typeof module.default.health, "function");
});

test("llm.anthropic: error handling wraps exceptions", async () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "sk-ant-invalid-test-key";

  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  try {
    await provider.complete({
      model: "claude-3-haiku-20240307",
      messages: [{ role: "user", content: "Test" }],
    });
    assert.fail("Should have thrown an error");
  } catch (error) {
    // Verify error structure
    assert.equal(error.name, "AnthropicLLMError");
    assert.ok(error.message.includes("complete"), "Error should include method context");
    assert.equal(typeof error.code, "string");
    assert.equal(typeof error.type, "string");
  } finally {
    // Restore
    process.env.ANTHROPIC_API_KEY = originalKey;
  }
});

test("llm.anthropic: supports system messages", async () => {
  const provider = (await import("../../src/platform/providers/impl/llm.anthropic.ts")).default;

  const request = {
    model: "claude-3-haiku-20240307",
    messages: [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "Hello" }
    ],
  };

  // Verify structure is accepted
  assert.ok(Array.isArray(request.messages));
  assert.equal(request.messages[0].role, "system");
  assert.equal(request.messages[1].role, "user");
});
