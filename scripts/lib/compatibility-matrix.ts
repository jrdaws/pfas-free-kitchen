/**
 * Integration Compatibility Matrix
 * 
 * Validates that selected integrations work together without conflicts.
 * Detects known incompatibilities and provides warnings/solutions.
 */

// Types
export interface CompatibilityResult {
  compatible: boolean;
  conflicts: Conflict[];
  warnings: Warning[];
  suggestions: string[];
}

export interface Conflict {
  integrations: [string, string];
  reason: string;
  severity: "error" | "warning";
  solution?: string;
}

export interface Warning {
  integration: string;
  message: string;
  recommendation: string;
}

// Compatibility matrix
// Key format: "category:provider"
type IntegrationKey = string;

interface CompatibilityEntry {
  compatible: boolean;
  note?: string;
  solution?: string;
}

// Known conflicts and special handling requirements
const COMPATIBILITY_MATRIX: Record<string, Record<string, CompatibilityEntry>> = {
  "auth:supabase": {
    "auth:clerk": {
      compatible: false,
      note: "Both provide authentication - choose one",
      solution: "Use either Supabase Auth OR Clerk, not both",
    },
    "database:supabase": {
      compatible: true,
      note: "Recommended: Use Supabase for both auth and database",
    },
    "payments:stripe": {
      compatible: true,
    },
    "email:resend": {
      compatible: true,
    },
    "analytics:posthog": {
      compatible: true,
    },
    "analytics:plausible": {
      compatible: true,
    },
    "ai:openai": {
      compatible: true,
    },
    "ai:anthropic": {
      compatible: true,
    },
    "search:algolia": {
      compatible: true,
    },
    "storage:uploadthing": {
      compatible: true,
    },
    "storage:supabase": {
      compatible: true,
      note: "Recommended: Use Supabase for auth, database, AND storage",
    },
    "cms:sanity": {
      compatible: true,
    },
    "monitoring:sentry": {
      compatible: true,
    },
  },
  "auth:clerk": {
    "auth:supabase": {
      compatible: false,
      note: "Both provide authentication - choose one",
      solution: "Use either Clerk OR Supabase Auth, not both",
    },
    "database:supabase": {
      compatible: true,
      note: "Use Clerk for auth, Supabase for database only",
    },
    "payments:stripe": {
      compatible: true,
    },
    "email:resend": {
      compatible: true,
    },
    "analytics:posthog": {
      compatible: true,
    },
  },
  "payments:stripe": {
    "payments:paddle": {
      compatible: false,
      note: "Both are payment processors - choose one",
      solution: "Use Stripe for global payments OR Paddle for EU/SaaS focus",
    },
  },
  "analytics:posthog": {
    "analytics:plausible": {
      compatible: true,
      note: "Using both is fine - Plausible for privacy-focused, PostHog for product analytics",
    },
  },
  "ai:openai": {
    "ai:anthropic": {
      compatible: true,
      note: "Using multiple AI providers is fine - consider a unified interface",
    },
  },
  "storage:uploadthing": {
    "storage:supabase": {
      compatible: true,
      note: "Both provide file storage - consider using one for simplicity",
    },
  },
};

// Integration dependencies (what each integration requires to work)
const DEPENDENCIES: Record<string, string[]> = {
  "payments:stripe": [],
  "email:resend": [],
  "analytics:posthog": [],
  "analytics:plausible": [],
  "ai:openai": [],
  "ai:anthropic": [],
  "search:algolia": [],
  "storage:uploadthing": [],
  "storage:supabase": ["auth:supabase"],
  "cms:sanity": [],
  "monitoring:sentry": [],
};

// Environment variables required by each integration
export const REQUIRED_ENV_VARS: Record<string, string[]> = {
  "auth:supabase": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  "auth:clerk": [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ],
  "database:supabase": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  "payments:stripe": [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  "payments:paddle": [
    "PADDLE_VENDOR_ID",
    "PADDLE_API_KEY",
    "PADDLE_WEBHOOK_SECRET",
  ],
  "email:resend": [
    "RESEND_API_KEY",
    "EMAIL_FROM",
  ],
  "analytics:posthog": [
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_POSTHOG_HOST",
  ],
  "analytics:plausible": [
    "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
  ],
  "ai:openai": [
    "OPENAI_API_KEY",
  ],
  "ai:anthropic": [
    "ANTHROPIC_API_KEY",
  ],
  "search:algolia": [
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
    "ALGOLIA_ADMIN_KEY",
  ],
  "storage:uploadthing": [
    "UPLOADTHING_SECRET",
    "UPLOADTHING_APP_ID",
  ],
  "storage:supabase": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  "cms:sanity": [
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "SANITY_API_TOKEN",
  ],
  "monitoring:sentry": [
    "NEXT_PUBLIC_SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
  ],
};

/**
 * Check compatibility of selected integrations
 */
export function checkCompatibility(
  integrations: Record<string, string>
): CompatibilityResult {
  const conflicts: Conflict[] = [];
  const warnings: Warning[] = [];
  const suggestions: string[] = [];

  // Convert to array of integration keys
  const selected = Object.entries(integrations)
    .filter(([, value]) => value)
    .map(([category, provider]) => `${category}:${provider}`);

  // Check each pair for conflicts
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i];
      const b = selected[j];

      const entry = COMPATIBILITY_MATRIX[a]?.[b] || COMPATIBILITY_MATRIX[b]?.[a];

      if (entry) {
        if (!entry.compatible) {
          conflicts.push({
            integrations: [a, b],
            reason: entry.note || "Incompatible integrations",
            severity: "error",
            solution: entry.solution,
          });
        } else if (entry.note) {
          // Compatible but with a note
          warnings.push({
            integration: `${a} + ${b}`,
            message: entry.note,
            recommendation: entry.solution || "Consider the implications",
          });
        }
      }
    }
  }

  // Check for missing dependencies
  for (const integration of selected) {
    const deps = DEPENDENCIES[integration] || [];
    for (const dep of deps) {
      if (!selected.includes(dep)) {
        warnings.push({
          integration,
          message: `Requires ${dep}`,
          recommendation: `Add ${dep} to your integrations`,
        });
      }
    }
  }

  // Generate suggestions
  if (integrations.auth === "supabase" && !integrations.database) {
    suggestions.push(
      "Consider using Supabase for database too - it's included with Supabase Auth"
    );
  }

  if (integrations.payments && !integrations.email) {
    suggestions.push(
      "Consider adding email integration for payment receipts and notifications"
    );
  }

  if (integrations.auth && !integrations.analytics) {
    suggestions.push(
      "Consider adding analytics to track user behavior and conversion"
    );
  }

  return {
    compatible: conflicts.filter(c => c.severity === "error").length === 0,
    conflicts,
    warnings,
    suggestions,
  };
}

/**
 * Get all required environment variables for selected integrations
 */
export function getRequiredEnvVars(
  integrations: Record<string, string>
): string[] {
  const envVars = new Set<string>();

  for (const [category, provider] of Object.entries(integrations)) {
    if (!provider) continue;
    
    const key = `${category}:${provider}`;
    const vars = REQUIRED_ENV_VARS[key] || [];
    
    for (const v of vars) {
      envVars.add(v);
    }
  }

  return Array.from(envVars).sort();
}

/**
 * Generate compatibility report as markdown
 */
export function generateCompatibilityReport(
  integrations: Record<string, string>
): string {
  const result = checkCompatibility(integrations);
  const envVars = getRequiredEnvVars(integrations);

  const lines = [
    "# Integration Compatibility Report",
    "",
    `## Status: ${result.compatible ? "✅ Compatible" : "❌ Conflicts Detected"}`,
    "",
    "### Selected Integrations",
    "",
  ];

  for (const [category, provider] of Object.entries(integrations)) {
    if (provider) {
      lines.push(`- **${category}**: ${provider}`);
    }
  }

  if (result.conflicts.length > 0) {
    lines.push("");
    lines.push("### ❌ Conflicts");
    lines.push("");
    
    for (const conflict of result.conflicts) {
      lines.push(`**${conflict.integrations.join(" vs ")}**`);
      lines.push(`- Reason: ${conflict.reason}`);
      if (conflict.solution) {
        lines.push(`- Solution: ${conflict.solution}`);
      }
      lines.push("");
    }
  }

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("### ⚠️ Warnings");
    lines.push("");
    
    for (const warning of result.warnings) {
      lines.push(`**${warning.integration}**`);
      lines.push(`- ${warning.message}`);
      lines.push(`- Recommendation: ${warning.recommendation}`);
      lines.push("");
    }
  }

  if (result.suggestions.length > 0) {
    lines.push("");
    lines.push("### 💡 Suggestions");
    lines.push("");
    
    for (const suggestion of result.suggestions) {
      lines.push(`- ${suggestion}`);
    }
  }

  lines.push("");
  lines.push("### Required Environment Variables");
  lines.push("");
  lines.push("```bash");
  
  for (const envVar of envVars) {
    lines.push(`${envVar}=`);
  }
  
  lines.push("```");

  return lines.join("\n");
}

/**
 * Visual matrix representation for documentation
 */
export function generateVisualMatrix(): string {
  const providers = [
    "auth:supabase",
    "auth:clerk",
    "payments:stripe",
    "payments:paddle",
    "email:resend",
    "analytics:posthog",
    "ai:openai",
    "search:algolia",
  ];

  const shortNames: Record<string, string> = {
    "auth:supabase": "Supa",
    "auth:clerk": "Clerk",
    "payments:stripe": "Stripe",
    "payments:paddle": "Paddle",
    "email:resend": "Resend",
    "analytics:posthog": "PostHog",
    "ai:openai": "OpenAI",
    "search:algolia": "Algolia",
  };

  const lines = [
    "# Integration Compatibility Matrix",
    "",
    "```",
    "           " + providers.map(p => shortNames[p].padEnd(7)).join(" "),
  ];

  for (const row of providers) {
    let line = shortNames[row].padEnd(10) + " ";
    
    for (const col of providers) {
      if (row === col) {
        line += "   -   ";
      } else {
        const entry = COMPATIBILITY_MATRIX[row]?.[col] || COMPATIBILITY_MATRIX[col]?.[row];
        if (entry) {
          line += entry.compatible ? "   ✅  " : "   ❌  ";
        } else {
          line += "   ✅  "; // Default compatible
        }
      }
    }
    
    lines.push(line);
  }

  lines.push("```");
  lines.push("");
  lines.push("Legend: ✅ Compatible | ❌ Conflict | ⚠️ Special handling");

  return lines.join("\n");
}

