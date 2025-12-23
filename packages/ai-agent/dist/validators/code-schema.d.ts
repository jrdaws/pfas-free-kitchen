import { z } from "zod";
export declare const FileDefinitionSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const IntegrationCodeSchema: z.ZodObject<{
    integration: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
        overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CodeSchema: z.ZodPipe<z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
        overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
    integrationCode: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        integration: z.ZodString;
        files: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            content: z.ZodString;
            overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>, z.ZodTransform<{
    integrationCode: {
        integration: string;
        files: {
            path: string;
            content: string;
            overwrite: boolean;
        }[];
    }[];
    files: {
        path: string;
        content: string;
        overwrite: boolean;
    }[];
}, {
    files: {
        path: string;
        content: string;
        overwrite: boolean;
    }[];
    integrationCode: {
        integration: string;
        files: {
            path: string;
            content: string;
            overwrite: boolean;
        }[];
    }[];
}>>;
export type CodeSchemaType = z.infer<typeof CodeSchema>;
//# sourceMappingURL=code-schema.d.ts.map