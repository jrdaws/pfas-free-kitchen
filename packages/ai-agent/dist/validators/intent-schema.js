import { z } from "zod";
export const IntentSchema = z.object({
    category: z.enum(["saas", "landing-page", "dashboard", "blog", "directory", "ecommerce"]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().min(10),
    suggestedTemplate: z.string(),
    features: z.array(z.string()).min(1),
    integrations: z.object({
        auth: z.enum(["supabase", "clerk"]).nullable().optional(),
        payments: z.enum(["stripe", "paddle"]).nullable().optional(),
        email: z.enum(["resend", "sendgrid"]).nullable().optional(),
        db: z.enum(["supabase", "planetscale"]).nullable().optional(),
        ai: z.enum(["openai", "anthropic"]).nullable().optional(),
        analytics: z.enum(["posthog", "plausible"]).nullable().optional(),
    }),
    complexity: z.enum(["simple", "moderate", "complex"]),
    keyEntities: z.array(z.string()).min(1),
});
