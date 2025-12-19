/**
 * Auth Provider Test Command
 * Usage: framework auth test
 */

export async function cmdAuth(args) {
  const subcommand = args[0];

  if (subcommand === "test") {
    await cmdAuthTest();
  } else {
    console.log(`
Usage: framework auth <command>

Commands:
  test    Test Auth provider health and configuration

Examples:
  framework auth test    # Test Supabase Auth provider
`);
  }
}

async function cmdAuthTest() {
  console.log("🧪 Testing Auth Provider (Supabase)...\n");

  try {
    // Dynamic import to avoid loading provider if not needed
    const provider = (await import("../platform/providers/impl/auth.supabase.ts")).default;

    // 1. Health check
    console.log("1️⃣  Running health check...");
    const health = await provider.health();

    if (health.ok) {
      console.log(`✅ Health: OK`);
      console.log(`   Provider: ${health.provider}`);
      console.log(`   Configured: ${health.details?.configured ? "Yes" : "No"}`);
    } else {
      console.log(`❌ Health: FAILED`);
      console.log(`   Error: ${health.details?.error || "Unknown error"}`);
      process.exit(1);
    }

    // 2. Configuration details
    console.log("\n2️⃣  Configuration status...");
    console.log(`   SUPABASE_URL: ${health.details?.url ? "✅ Set" : "❌ Missing"}`);
    console.log(`   SUPABASE_ANON_KEY: ${health.details?.anonKey ? "✅ Set" : "❌ Missing"}`);
    console.log(`   SUPABASE_SERVICE_KEY: ${health.details?.serviceKey ? "✅ Set" : "⚠️  Not set (optional)"}`);

    // 3. Method availability
    console.log("\n3️⃣  Provider methods...");
    const methods = [
      "getSession",
      "requireSession",
      "signInWithEmail",
      "signInWithOAuth",
      "signOut",
      "getUser",
      "health",
    ];

    methods.forEach((method) => {
      const hasMethod = typeof provider[method] === "function";
      console.log(`   ${method}: ${hasMethod ? "✅" : "❌"}`);
    });

    console.log("\n✅ Auth provider test complete!");
    console.log("\n💡 Note: This test only verifies configuration.");
    console.log("   No actual auth operations were performed.");
  } catch (error) {
    console.error("\n❌ Auth provider test failed:");
    console.error(`   ${error.message}`);

    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }

    if (error.message.includes("SUPABASE_URL") || error.message.includes("SUPABASE_ANON_KEY")) {
      console.error("\n💡 Set required Supabase environment variables:");
      console.error("   export SUPABASE_URL=https://your-project.supabase.co");
      console.error("   export SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
      console.error("   export SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional)");
    }

    process.exit(1);
  }
}
