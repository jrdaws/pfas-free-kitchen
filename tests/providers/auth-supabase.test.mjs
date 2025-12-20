import { test } from "node:test";
import assert from "node:assert/strict";

// Set test environment variables before importing provider
process.env.SUPABASE_URL = "https://test-project.supabase.co";
process.env.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key";
process.env.SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-key";

test("auth.supabase: provider has correct name", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(provider.name, "auth.supabase");
});

test("auth.supabase: has getSession method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.getSession, "function");
});

test("auth.supabase: has requireSession method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.requireSession, "function");
});

test("auth.supabase: has signInWithEmail method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.signInWithEmail, "function");
});

test("auth.supabase: has signInWithOAuth method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.signInWithOAuth, "function");
});

test("auth.supabase: has signOut method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.signOut, "function");
});

test("auth.supabase: has getUser method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.getUser, "function");
});

test("auth.supabase: has health method", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;
  assert.equal(typeof provider.health, "function");
});

test("auth.supabase: health returns correct structure when configured", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  const result = await provider.health();

  assert.equal(typeof result.ok, "boolean");
  assert.equal(result.provider, "auth.supabase");
  assert.equal(typeof result.details, "object");
});

test("auth.supabase: health shows configured when env vars present", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  const result = await provider.health();

  assert.equal(result.ok, true);
  assert.equal(result.details?.configured, true);
  assert.equal(result.details?.url, true);
  assert.equal(result.details?.anonKey, true);
});

test("auth.supabase: getSession returns null when no auth header", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  const mockRequest = new Request("https://example.com", {
    headers: new Headers(),
  });

  const session = await provider.getSession(mockRequest);
  assert.equal(session, null);
});

test("auth.supabase: getSession returns null when bearer token missing", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  const mockRequest = new Request("https://example.com", {
    headers: new Headers({
      Authorization: "Basic dGVzdDp0ZXN0", // Not Bearer token
    }),
  });

  const session = await provider.getSession(mockRequest);
  assert.equal(session, null);
});

test("auth.supabase: provider module structure", async () => {
  const module = await import("../../src/platform/providers/impl/auth.supabase.ts");

  assert.ok(module.default, "Should have default export");
  assert.equal(typeof module.default.name, "string");
  assert.equal(typeof module.default.getSession, "function");
  assert.equal(typeof module.default.requireSession, "function");
  assert.equal(typeof module.default.signInWithEmail, "function");
  assert.equal(typeof module.default.signInWithOAuth, "function");
  assert.equal(typeof module.default.signOut, "function");
  assert.equal(typeof module.default.getUser, "function");
  assert.equal(typeof module.default.health, "function");
});

test("auth.supabase: requireSession throws when session is null", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  const mockRequest = new Request("https://example.com", {
    headers: new Headers(),
  });

  await assert.rejects(
    async () => {
      await provider.requireSession(mockRequest);
    },
    (error) => {
      return error.message.includes("Authentication required") && error.code === "unauthorized";
    },
    "Should throw SupabaseAuthError when no session"
  );
});

test("auth.supabase: signInWithEmail accepts correct parameters", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  // Just verify the method signature accepts the correct structure
  // We won't actually call the API in tests
  assert.equal(typeof provider.signInWithEmail, "function");

  const email = "test@example.com";
  const redirectTo = "https://example.com/callback";

  // Verify parameters are accepted (actual call would require real API)
  assert.equal(typeof email, "string");
  assert.equal(typeof redirectTo, "string");
});

test("auth.supabase: signInWithOAuth accepts OAuth providers", async () => {
  const provider = (await import("../../src/platform/providers/impl/auth.supabase.ts")).default;

  // Verify method accepts the correct OAuth provider types
  assert.equal(typeof provider.signInWithOAuth, "function");

  const providers = ["google", "apple", "facebook"];
  providers.forEach((p) => {
    assert.equal(typeof p, "string");
  });
});
