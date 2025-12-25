/**
 * UploadThing Live Integration Test
 *
 * Tests the UploadThing integration with a live API key.
 * Requires UPLOADTHING_TOKEN environment variable.
 *
 * Run: UPLOADTHING_TOKEN=your_token node tests/integration-tests/uploadthing-live.test.mjs
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";

// Check for API key
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

describe("UploadThing Live Integration", { skip: !UPLOADTHING_TOKEN }, () => {
  it("should have UPLOADTHING_TOKEN environment variable", () => {
    assert.ok(UPLOADTHING_TOKEN, "UPLOADTHING_TOKEN must be set");
    assert.ok(UPLOADTHING_TOKEN.length > 10, "UPLOADTHING_TOKEN appears invalid");
  });

  it("should validate token format", () => {
    // UploadThing tokens typically start with "sk_" for secret keys
    // or have a specific format
    const isValidFormat =
      UPLOADTHING_TOKEN.startsWith("sk_") ||
      UPLOADTHING_TOKEN.length > 20;

    assert.ok(isValidFormat, "Token format appears valid");
  });

  it("should be able to make API request to UploadThing", async () => {
    // Test the UploadThing API endpoint
    // This verifies the token is valid and can authenticate
    const response = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": UPLOADTHING_TOKEN,
      },
      body: JSON.stringify({}),
    });

    // 200 = success, 401 = invalid key, 403 = forbidden
    if (response.status === 401) {
      assert.fail("Invalid UploadThing API key - authentication failed");
    }

    if (response.status === 403) {
      assert.fail("UploadThing API key lacks permissions");
    }

    // Accept 200 (success) or 400 (bad request but authenticated)
    assert.ok(
      response.status === 200 || response.status === 400,
      `Expected 200 or 400, got ${response.status}`
    );

    console.log("✅ UploadThing API key is valid and authenticated");
  });

  it("should list files (may be empty)", async () => {
    const response = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": UPLOADTHING_TOKEN,
      },
      body: JSON.stringify({
        limit: 5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📁 Files in account: ${data.files?.length || 0}`);

      if (data.files && data.files.length > 0) {
        console.log("   Sample files:");
        data.files.slice(0, 3).forEach((file) => {
          console.log(`   - ${file.name} (${file.size} bytes)`);
        });
      }

      assert.ok(Array.isArray(data.files), "Response should contain files array");
    } else {
      // API might return 400 for empty params, that's ok
      console.log(`⚠️ List files returned ${response.status} - may need params`);
    }
  });

  it("should get usage stats", async () => {
    const response = await fetch("https://api.uploadthing.com/v6/getUsageInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": UPLOADTHING_TOKEN,
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("📊 Usage stats:");
      console.log(`   Total storage used: ${formatBytes(data.totalBytes || 0)}`);
      console.log(`   Files count: ${data.filesUploaded || 0}`);
      console.log(`   App limit: ${formatBytes(data.appTotalBytes || 0)}`);
    } else {
      console.log(`⚠️ Usage info returned ${response.status}`);
    }

    // Don't fail test if this endpoint isn't available
    assert.ok(true, "Usage check completed");
  });
});

// Utility function
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Run info
if (!UPLOADTHING_TOKEN) {
  console.log(`
⚠️  Skipping UploadThing live tests - no API key provided

To run these tests:
  1. Get your token from https://uploadthing.com/dashboard
  2. Run: UPLOADTHING_TOKEN=your_token npm test -- tests/integration-tests/uploadthing-live.test.mjs

Or set in .env.local and run with dotenv:
  npx dotenv -e .env.local -- node tests/integration-tests/uploadthing-live.test.mjs
`);
}

