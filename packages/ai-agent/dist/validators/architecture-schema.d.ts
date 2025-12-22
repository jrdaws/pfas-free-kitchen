import { z } from "zod";
export declare const PageDefinitionSchema: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    components: z.ZodArray<z.ZodString>;
    layout: z.ZodOptional<z.ZodEnum<{
        dashboard: "dashboard";
        default: "default";
        auth: "auth";
    }>>;
}, z.core.$strip>;
export declare const ComponentDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        ui: "ui";
        feature: "feature";
        layout: "layout";
    }>;
    description: z.ZodString;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    template: z.ZodEnum<{
        "create-new": "create-new";
        "use-existing": "use-existing";
    }>;
}, z.core.$strip>;
export declare const RouteDefinitionSchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodEnum<{
        page: "page";
        api: "api";
    }>;
    method: z.ZodOptional<z.ZodEnum<{
        GET: "GET";
        POST: "POST";
        PUT: "PUT";
        DELETE: "DELETE";
    }>>;
    description: z.ZodString;
}, z.core.$strip>;
export declare const ArchitectureSchema: z.ZodObject<{
    template: z.ZodString;
    pages: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        components: z.ZodArray<z.ZodString>;
        layout: z.ZodOptional<z.ZodEnum<{
            dashboard: "dashboard";
            default: "default";
            auth: "auth";
        }>>;
    }, z.core.$strip>>;
    components: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            ui: "ui";
            feature: "feature";
            layout: "layout";
        }>;
        description: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        template: z.ZodEnum<{
            "create-new": "create-new";
            "use-existing": "use-existing";
        }>;
    }, z.core.$strip>>;
    routes: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<{
            page: "page";
            api: "api";
        }>;
        method: z.ZodOptional<z.ZodEnum<{
            GET: "GET";
            POST: "POST";
            PUT: "PUT";
            DELETE: "DELETE";
        }>>;
        description: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ArchitectureSchemaType = z.infer<typeof ArchitectureSchema>;
//# sourceMappingURL=architecture-schema.d.ts.map