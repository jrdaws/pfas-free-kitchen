import { z } from "zod";
export declare const IntentSchema: z.ZodObject<{
    category: z.ZodEnum<{
        saas: "saas";
        "landing-page": "landing-page";
        dashboard: "dashboard";
        blog: "blog";
        directory: "directory";
        ecommerce: "ecommerce";
    }>;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    suggestedTemplate: z.ZodString;
    features: z.ZodArray<z.ZodString>;
    integrations: z.ZodObject<{
        auth: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            supabase: "supabase";
            clerk: "clerk";
        }>>>;
        payments: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            stripe: "stripe";
            paddle: "paddle";
        }>>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            resend: "resend";
            sendgrid: "sendgrid";
        }>>>;
        db: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            supabase: "supabase";
            planetscale: "planetscale";
        }>>>;
        ai: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
        }>>>;
        analytics: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            posthog: "posthog";
            plausible: "plausible";
        }>>>;
    }, z.core.$strip>;
    complexity: z.ZodEnum<{
        simple: "simple";
        moderate: "moderate";
        complex: "complex";
    }>;
    keyEntities: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type IntentSchemaType = z.infer<typeof IntentSchema>;
//# sourceMappingURL=intent-schema.d.ts.map