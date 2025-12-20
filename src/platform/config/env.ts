import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),

  AUTH_PROVIDER: z.string().optional(),
  BILLING_PROVIDER: z.string().optional(),
  LLM_PROVIDER: z.string().optional(),
  ANALYTICS_PROVIDER: z.string().optional(),

  FIGMA_TOKEN: z.string().optional(),
  FIGMA_FILE_KEY: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(input: Record<string, string | undefined> = process.env): AppEnv {
  const parsed = EnvSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid environment: " + parsed.error.message);
  }
  return parsed.data;
}

export function hasEnv(key: keyof AppEnv): boolean {
  return Boolean(process.env[String(key)]);
}

export function hasAllEnv(keys: (keyof AppEnv)[]): boolean {
  return keys.every((k) => Boolean(process.env[String(k)]));
}
