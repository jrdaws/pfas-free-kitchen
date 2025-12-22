import { z } from "zod";
export declare const FileDefinitionSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    overwrite: z.ZodBoolean;
}, z.core.$strip>;
export declare const IntegrationCodeSchema: z.ZodObject<{
    integration: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
        overwrite: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CodeSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
        overwrite: z.ZodBoolean;
    }, z.core.$strip>>;
    integrationCode: z.ZodArray<z.ZodObject<{
        integration: z.ZodString;
        files: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            content: z.ZodString;
            overwrite: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CodeSchemaType = z.infer<typeof CodeSchema>;
//# sourceMappingURL=code-schema.d.ts.map