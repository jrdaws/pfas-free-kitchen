import { z } from "zod";

export const PageDefinitionSchema = z.object({
  path: z.string(),
  name: z.string(),
  description: z.string(),
  components: z.array(z.string()),
  // Allow any layout string - AI may return various layout types
  layout: z.string().optional(),
});

export const ComponentDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(["ui", "feature", "layout"]),
  description: z.string(),
  // Props can be complex objects/arrays, not just string-to-string
  props: z.record(z.string(), z.any()).optional(),
  template: z.enum(["create-new", "use-existing"]),
});

export const RouteDefinitionSchema = z.object({
  path: z.string(),
  type: z.enum(["page", "api"]),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  description: z.string(),
});

export const ArchitectureSchema = z.object({
  template: z.string(),
  pages: z.array(PageDefinitionSchema).min(1),
  components: z.array(ComponentDefinitionSchema).min(1),
  routes: z.array(RouteDefinitionSchema),
});

export type ArchitectureSchemaType = z.infer<typeof ArchitectureSchema>;
