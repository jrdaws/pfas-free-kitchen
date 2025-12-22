import { z } from "zod";
export const PageDefinitionSchema = z.object({
    path: z.string(),
    name: z.string(),
    description: z.string(),
    components: z.array(z.string()),
    layout: z.enum(["default", "auth", "dashboard"]).optional(),
});
export const ComponentDefinitionSchema = z.object({
    name: z.string(),
    type: z.enum(["ui", "feature", "layout"]),
    description: z.string(),
    props: z.record(z.string(), z.string()).optional(),
    template: z.enum(["create-new", "use-existing"]),
});
export const RouteDefinitionSchema = z.object({
    path: z.string(),
    type: z.enum(["page", "api"]),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
    description: z.string(),
});
export const ArchitectureSchema = z.object({
    template: z.string(),
    pages: z.array(PageDefinitionSchema).min(1),
    components: z.array(ComponentDefinitionSchema).min(1),
    routes: z.array(RouteDefinitionSchema),
});
