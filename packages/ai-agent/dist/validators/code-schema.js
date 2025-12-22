import { z } from "zod";
export const FileDefinitionSchema = z.object({
    path: z.string(),
    content: z.string().min(10),
    overwrite: z.boolean(),
});
export const IntegrationCodeSchema = z.object({
    integration: z.string(),
    files: z.array(FileDefinitionSchema),
});
export const CodeSchema = z.object({
    files: z.array(FileDefinitionSchema).min(1),
    integrationCode: z.array(IntegrationCodeSchema),
});
