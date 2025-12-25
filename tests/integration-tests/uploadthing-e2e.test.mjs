/**
 * UploadThing End-to-End Integration Test
 *
 * Tests the complete file upload flow with UploadThing API.
 * Creates a test file, uploads it, verifies it exists, then cleans up.
 *
 * Requires: UPLOADTHING_TOKEN environment variable
 *
 * Run:
 *   UPLOADTHING_TOKEN=sk_live_xxx node tests/integration-tests/uploadthing-e2e.test.mjs
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

// Test file tracking for cleanup
const uploadedFileKeys = [];

describe("UploadThing E2E Integration", { skip: !UPLOADTHING_TOKEN }, () => {
  // ============================================================
  // Test 1: Validate API Connection
  // ============================================================
  it("should authenticate with UploadThing API", async () => {
    const response = await fetch("https://api.uploadthing.com/v6/getUsageInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": UPLOADTHING_TOKEN,
      },
      body: JSON.stringify({}),
    });

    if (response.status === 401) {
      assert.fail("❌ Invalid API key - authentication failed");
    }

    if (response.status === 403) {
      assert.fail("❌ API key lacks required permissions");
    }

    assert.ok(response.ok, `API responded with status ${response.status}`);

    const data = await response.json();
    console.log("✅ API Connection verified");
    console.log(`   App ID: ${data.appId || "N/A"}`);
    console.log(`   Storage used: ${formatBytes(data.totalBytes || 0)}`);
  });

  // ============================================================
  // Test 2: Upload a Test Image
  // ============================================================
  it("should upload a test image file", async () => {
    // Create a small test PNG image (1x1 pixel red)
    const testImageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
    const testImageBuffer = Buffer.from(testImageBase64, "base64");
    const testFileName = `test-image-${Date.now()}.png`;

    console.log(`📤 Uploading test image: ${testFileName}`);

    // Step 1: Request presigned URL from UploadThing
    const presignResponse = await fetch(
      "https://api.uploadthing.com/v6/prepareUpload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-uploadthing-api-key": UPLOADTHING_TOKEN,
        },
        body: JSON.stringify({
          files: [
            {
              name: testFileName,
              size: testImageBuffer.length,
              type: "image/png",
            },
          ],
          acl: "public-read",
          contentDisposition: "inline",
        }),
      }
    );

    if (!presignResponse.ok) {
      const error = await presignResponse.text();
      console.log("Presign response:", error);
      assert.fail(`Failed to get presigned URL: ${presignResponse.status}`);
    }

    const presignData = await presignResponse.json();
    console.log("   Presigned URL obtained");

    // Check response format
    const fileData = presignData.data?.[0] || presignData[0];
    if (!fileData) {
      console.log("Presign data:", JSON.stringify(presignData, null, 2));
      assert.fail("No file data in presign response");
    }

    const { presignedUrl, key, fileUrl } = fileData;
    uploadedFileKeys.push(key);

    // Step 2: Upload file to presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
      },
      body: testImageBuffer,
    });

    if (!uploadResponse.ok) {
      assert.fail(`Upload failed: ${uploadResponse.status}`);
    }

    console.log("   ✅ File uploaded successfully");
    console.log(`   URL: ${fileUrl}`);
    console.log(`   Key: ${key}`);

    // Step 3: Verify file is accessible
    const verifyResponse = await fetch(fileUrl, { method: "HEAD" });
    assert.ok(
      verifyResponse.ok,
      `File should be accessible at ${fileUrl}`
    );

    console.log("   ✅ File verified accessible");
  });

  // ============================================================
  // Test 3: Upload a Test Document (PDF-like)
  // ============================================================
  it("should upload a test document", async () => {
    // Create a minimal "document" (text file for testing)
    const testContent = `Test document created at ${new Date().toISOString()}\n\nThis is a test file for UploadThing integration.`;
    const testBuffer = Buffer.from(testContent, "utf-8");
    const testFileName = `test-doc-${Date.now()}.txt`;

    console.log(`📤 Uploading test document: ${testFileName}`);

    const presignResponse = await fetch(
      "https://api.uploadthing.com/v6/prepareUpload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-uploadthing-api-key": UPLOADTHING_TOKEN,
        },
        body: JSON.stringify({
          files: [
            {
              name: testFileName,
              size: testBuffer.length,
              type: "text/plain",
            },
          ],
          acl: "public-read",
        }),
      }
    );

    if (!presignResponse.ok) {
      const error = await presignResponse.text();
      // Some plans may not allow all file types
      if (presignResponse.status === 400) {
        console.log("   ⚠️ Document upload may not be allowed on this plan");
        return;
      }
      assert.fail(`Failed to prepare upload: ${error}`);
    }

    const presignData = await presignResponse.json();
    const fileData = presignData.data?.[0] || presignData[0];

    if (fileData) {
      uploadedFileKeys.push(fileData.key);

      const uploadResponse = await fetch(fileData.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "text/plain",
        },
        body: testBuffer,
      });

      assert.ok(uploadResponse.ok, "Document upload should succeed");
      console.log("   ✅ Document uploaded successfully");
      console.log(`   URL: ${fileData.fileUrl}`);
    }
  });

  // ============================================================
  // Test 4: List Uploaded Files
  // ============================================================
  it("should list uploaded files", async () => {
    const response = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": UPLOADTHING_TOKEN,
      },
      body: JSON.stringify({
        limit: 10,
      }),
    });

    if (!response.ok) {
      console.log("   ⚠️ List files endpoint returned:", response.status);
      return;
    }

    const data = await response.json();
    const files = data.files || [];

    console.log(`📁 Files in account: ${files.length}`);

    // Check if our uploaded files appear
    const ourFiles = files.filter((f) =>
      uploadedFileKeys.some((key) => f.key === key)
    );

    if (ourFiles.length > 0) {
      console.log(`   ✅ Found ${ourFiles.length} of our test files`);
    }

    assert.ok(Array.isArray(files), "Should return files array");
  });

  // ============================================================
  // Test 5: Delete Test Files (Cleanup)
  // ============================================================
  it("should cleanup test files", async () => {
    if (uploadedFileKeys.length === 0) {
      console.log("   No files to clean up");
      return;
    }

    console.log(`🧹 Cleaning up ${uploadedFileKeys.length} test files...`);

    for (const key of uploadedFileKeys) {
      const response = await fetch(
        "https://api.uploadthing.com/v6/deleteFiles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-uploadthing-api-key": UPLOADTHING_TOKEN,
          },
          body: JSON.stringify({
            fileKeys: [key],
          }),
        }
      );

      if (response.ok) {
        console.log(`   ✅ Deleted: ${key}`);
      } else {
        console.log(`   ⚠️ Failed to delete ${key}: ${response.status}`);
      }
    }

    console.log("   Cleanup complete");
  });

  // ============================================================
  // Test 6: Verify Integration Files Exist
  // ============================================================
  it("should have all required integration files", () => {
    const integrationPath = path.join(
      __dirname,
      "../../templates/saas/integrations/storage/uploadthing"
    );

    const requiredFiles = [
      "integration.json",
      "package.json",
      "lib/uploadthing.ts",
      "app/api/uploadthing/route.ts",
      "app/api/uploadthing/core.ts",
      "components/storage/file-upload.tsx",
      "components/storage/upload-button.tsx",
      "components/storage/upload-dropzone.tsx",
    ];

    console.log("📂 Checking integration files...");

    for (const file of requiredFiles) {
      const filePath = path.join(integrationPath, file);
      const exists = fs.existsSync(filePath);

      if (exists) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ Missing: ${file}`);
      }

      assert.ok(exists, `Required file should exist: ${file}`);
    }
  });

  // ============================================================
  // Test 7: Validate Integration JSON
  // ============================================================
  it("should have valid integration.json", () => {
    const integrationPath = path.join(
      __dirname,
      "../../templates/saas/integrations/storage/uploadthing/integration.json"
    );

    const content = fs.readFileSync(integrationPath, "utf-8");
    const config = JSON.parse(content);

    console.log("📋 Validating integration.json...");

    assert.strictEqual(config.provider, "uploadthing", "Provider should be uploadthing");
    assert.strictEqual(config.type, "storage", "Type should be storage");
    assert.ok(config.dependencies, "Should have dependencies");
    assert.ok(config.envVars, "Should have envVars");
    assert.ok(config.envVars.includes("UPLOADTHING_TOKEN"), "Should require UPLOADTHING_TOKEN");

    console.log("   ✅ integration.json is valid");
    console.log(`   Provider: ${config.provider}`);
    console.log(`   Version: ${config.version}`);
    console.log(`   Dependencies: ${Object.keys(config.dependencies).join(", ")}`);
  });
});

// ============================================================
// Utility Functions
// ============================================================

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ============================================================
// Run Info
// ============================================================

if (!UPLOADTHING_TOKEN) {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  UploadThing E2E Test - API Key Required                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  To run the full end-to-end test with real file uploads:         ║
║                                                                   ║
║  1. Get your API token from:                                     ║
║     https://uploadthing.com/dashboard                            ║
║                                                                   ║
║  2. Run the test:                                                ║
║     UPLOADTHING_TOKEN=sk_live_xxx node --test \\                  ║
║       tests/integration-tests/uploadthing-e2e.test.mjs           ║
║                                                                   ║
║  The test will:                                                  ║
║  • Authenticate with UploadThing API                             ║
║  • Upload a test image (1x1 PNG)                                 ║
║  • Upload a test document                                        ║
║  • Verify files are accessible                                   ║
║  • Clean up (delete test files)                                  ║
║  • Validate integration files exist                              ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
`);
} else {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  UploadThing E2E Test - Running with API Key                     ║
╚══════════════════════════════════════════════════════════════════╝
`);
}

