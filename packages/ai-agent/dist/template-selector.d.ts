import type { ProjectIntent, TemplateMetadata, IntegrationRequirements } from "./types";
export declare class TemplateSelector {
    private templatesDir;
    constructor(templatesDir?: string);
    /**
     * Load template metadata from template.json
     */
    loadTemplate(templateId: string): Promise<TemplateMetadata>;
    /**
     * Select template based on intent
     */
    selectTemplate(intent: ProjectIntent): Promise<TemplateMetadata>;
    /**
     * Validate and normalize integration requirements against template capabilities
     */
    validateIntegrations(template: TemplateMetadata, requested: IntegrationRequirements): Promise<IntegrationRequirements>;
}
//# sourceMappingURL=template-selector.d.ts.map