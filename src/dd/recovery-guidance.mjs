/**
 * Recovery guidance for common errors
 * Provides actionable steps to resolve failures
 */

export function getRecoveryGuidance(error) {
  const message = error?.message || String(error);
  const guidance = [];

  // Missing environment variables
  if (message.includes("ANTHROPIC_API_KEY")) {
    guidance.push({
      problem: "Missing ANTHROPIC_API_KEY",
      solutions: [
        "Get an API key from https://console.anthropic.com/",
        "Set it in your environment: export ANTHROPIC_API_KEY=sk-ant-...",
        "Or add to .env file: ANTHROPIC_API_KEY=sk-ant-...",
      ],
    });
  }

  if (message.includes("SUPABASE_URL") || message.includes("SUPABASE_ANON_KEY")) {
    guidance.push({
      problem: "Missing Supabase configuration",
      solutions: [
        "Create a Supabase project at https://supabase.com/dashboard",
        "Find your project URL and anon key in Settings > API",
        "Set environment variables:",
        "  export SUPABASE_URL=https://your-project.supabase.co",
        "  export SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Or add to .env file",
      ],
    });
  }

  if (message.includes("STRIPE_SECRET_KEY")) {
    guidance.push({
      problem: "Missing Stripe configuration",
      solutions: [
        "Get API keys from https://dashboard.stripe.com/apikeys",
        "Use test keys for development (sk_test_...)",
        "Set environment variables:",
        "  export STRIPE_SECRET_KEY=sk_test_...",
        "  export STRIPE_PUBLISHABLE_KEY=pk_test_...",
      ],
    });
  }

  // Port in use
  if (message.includes("EADDRINUSE") || message.includes("port") && message.includes("use")) {
    const portMatch = message.match(/port (\d+)/i) || message.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : "3000";
    guidance.push({
      problem: `Port ${port} is already in use`,
      solutions: [
        `Stop the process using port ${port}:`,
        `  lsof -ti:${port} | xargs kill -9`,
        "Or use a different port:",
        `  npm run dev -- -p ${parseInt(port) + 1}`,
        `  PORT=${parseInt(port) + 1} npm run dev`,
      ],
    });
  }

  // Missing dependencies
  if (message.includes("Cannot find module") || message.includes("MODULE_NOT_FOUND")) {
    const moduleMatch = message.match(/Cannot find module '([^']+)'/);
    const moduleName = moduleMatch ? moduleMatch[1] : "dependencies";
    guidance.push({
      problem: `Missing module: ${moduleName}`,
      solutions: [
        "Install dependencies:",
        "  npm install",
        moduleName !== "dependencies" && !moduleName.startsWith(".") ? `Or install specific module: npm install ${moduleName}` : null,
        "Verify package.json exists and is valid",
      ].filter(Boolean),
    });
  }

  // Git not found
  if (message.includes("git") && (message.includes("not found") || message.includes("command not found"))) {
    guidance.push({
      problem: "Git is not installed",
      solutions: [
        "Install Git:",
        "  macOS: brew install git",
        "  Ubuntu/Debian: sudo apt-get install git",
        "  Windows: Download from https://git-scm.com/download/win",
        "Verify installation: git --version",
      ],
    });
  }

  // Directory exists
  if (message.includes("exists") && message.includes("not empty")) {
    guidance.push({
      problem: "Target directory is not empty",
      solutions: [
        "Use --force to overwrite:",
        "  framework export <template> <dir> --force",
        "Or choose a different directory",
        "Or manually remove the directory: rm -rf <dir>",
      ],
    });
  }

  // Permission denied
  if (message.includes("EACCES") || message.includes("EPERM") || message.includes("permission denied")) {
    guidance.push({
      problem: "Permission denied",
      solutions: [
        "Check directory permissions:",
        "  ls -la <directory>",
        "Fix permissions:",
        "  chmod +x <file>  # Make file executable",
        "  chmod 755 <dir>  # Make directory accessible",
        "Run with sudo (use cautiously): sudo <command>",
      ],
    });
  }

  // Network errors
  if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED") || message.includes("network")) {
    guidance.push({
      problem: "Network connection failed",
      solutions: [
        "Check your internet connection",
        "Verify the URL/hostname is correct",
        "Check if a firewall is blocking the connection",
        "Try again in a few moments (might be temporary)",
        "Check service status page if connecting to third-party API",
      ],
    });
  }

  // Authentication errors
  if (message.includes("unauthorized") || message.includes("401") || message.includes("403") || message.includes("authentication")) {
    guidance.push({
      problem: "Authentication failed",
      solutions: [
        "Verify your API key/credentials are correct",
        "Check if the key has expired or been revoked",
        "Ensure you're using the right environment (test vs production)",
        "Regenerate API key if necessary",
      ],
    });
  }

  return guidance;
}

export function printRecoveryGuidance(error) {
  const guidance = getRecoveryGuidance(error);

  if (guidance.length === 0) {
    return; // No specific guidance available
  }

  console.error("\n💡 Recovery Steps:\n");

  guidance.forEach((guide, index) => {
    if (index > 0) console.error("");
    console.error(`   ${guide.problem}:`);
    guide.solutions.forEach((solution) => {
      console.error(`   ${solution}`);
    });
  });

  console.error("");
}
