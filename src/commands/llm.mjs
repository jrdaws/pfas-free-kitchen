/**
 * LLM Provider Test Command
 * Usage: framework llm test
 */

export async function cmdLLM(args) {
  const subcommand = args[0];

  if (subcommand === "test") {
    await cmdLLMTest();
  } else {
    console.log(`
Usage: framework llm <command>

Commands:
  test    Test LLM provider health and run a simple completion

Examples:
  framework llm test    # Test Anthropic LLM provider
`);
  }
}

async function cmdLLMTest() {
  console.log("🧪 Testing LLM Provider (Anthropic)...\n");

  try {
    // Dynamic import to avoid loading provider if not needed
    const provider = (await import("../platform/providers/impl/llm.anthropic.ts")).default;

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

    // 2. Test completion
    console.log("\n2️⃣  Running test completion...");
    const testPrompt = "Say hello in 10 words or less";
    console.log(`   Prompt: "${testPrompt}"`);

    const response = await provider.complete({
      model: "claude-3-haiku-20240307",
      messages: [{ role: "user", content: testPrompt }],
      maxTokens: 100,
    });

    console.log(`✅ Completion successful`);
    console.log(`   Response: "${response.outputText.trim()}"`);
    console.log(`   Model: ${response.model}`);

    if (response.usage) {
      console.log(`   Input tokens: ${response.usage.inputTokens || 0}`);
      console.log(`   Output tokens: ${response.usage.outputTokens || 0}`);
      const totalTokens = (response.usage.inputTokens || 0) + (response.usage.outputTokens || 0);
      console.log(`   Total tokens: ${totalTokens}`);

      if (response.usage.costUsd) {
        console.log(`   Cost: $${response.usage.costUsd.toFixed(6)}`);
      }
    }

    console.log("\n✅ LLM provider test complete!");
  } catch (error) {
    console.error("\n❌ LLM provider test failed:");
    console.error(`   ${error.message}`);

    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }

    if (error.message.includes("ANTHROPIC_API_KEY")) {
      console.error("\n💡 Set ANTHROPIC_API_KEY environment variable:");
      console.error("   export ANTHROPIC_API_KEY=sk-ant-...");
    }

    process.exit(1);
  }
}
