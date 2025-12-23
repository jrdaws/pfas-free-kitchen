import { z } from "zod";

export const FileDefinitionSchema = z.object({
  path: z.string(),
  content: z.string().min(10),
  overwrite: z.boolean().optional().default(false),
});

export const IntegrationCodeSchema = z.object({
  integration: z.string(),
  files: z.array(FileDefinitionSchema),
});

export const CodeSchema = z.object({
  files: z.array(FileDefinitionSchema).min(1),
  // integrationCode can be empty array or array of proper objects
  // AI sometimes returns malformed objects, so we filter them out
  integrationCode: z.array(IntegrationCodeSchema).optional().default([]),
}).transform((data) => {
  // Ensure integrationCode is always a valid array
  // Filter out any malformed entries that got past initial parse
  const validIntegrationCode = (data.integrationCode || []).filter(
    (item) => item && typeof item.integration === "string" && Array.isArray(item.files)
  );
  return {
    ...data,
    integrationCode: validIntegrationCode,
  };
});

export type CodeSchemaType = z.infer<typeof CodeSchema>;
