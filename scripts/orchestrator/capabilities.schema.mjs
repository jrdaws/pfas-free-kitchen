import { z } from "zod";

export const CapabilitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  group: z.string().min(1),
  requires: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  provides: z.array(z.string()).default([]),
  filesOwned: z.array(z.string()).default([]),
  templates: z.array(z.string()).default([]),
  env: z
    .array(
      z.object({
        key: z.string(),
        required: z.boolean().default(false),
        runtime: z.enum(["build", "server", "client"]).default("server"),
        secret: z.boolean().default(true),
      })
    )
    .default([]),
  postInstall: z.array(z.string()).default([]),
  tests: z.array(z.string()).default([]),
});

export const CapabilitiesFileSchema = z.object({
  version: z.string().default("1"),
  capabilities: z.array(CapabilitySchema),
});
